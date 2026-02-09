import { Component, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { DiagramStore } from '../core/services/diagram-store.service';
import { DiagramCommands } from '../core/services/diagram-commands.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { EdgesLayerComponent } from './components/edges-layer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';
import { InspectorComponent } from '../inspector/inspector.component';
import { BpmnFlowType, DiagramNode, ShapeNode, WebNode } from '../core/models/diagram.model';
import { StencilService } from '../stencils/stencil.service';

interface CanvasFrame {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, NodeRendererComponent, EdgesLayerComponent, InspectorComponent],
  template: `
    <div
      #canvasRoot
      id="canvas-root"
      class="relative w-full h-full bg-slate-50 overflow-hidden"
      tabindex="0"
      (click)="onBackgroundClick($event)"
      (mousedown)="onCanvasMouseDown($event)"
      (mousemove)="onCanvasMouseMove($event)"
      (mouseup)="onCanvasMouseUp($event)"
      (mouseleave)="onCanvasMouseUp($event)"
      (dragover)="onCanvasDragOver($event)"
      (drop)="onCanvasDrop($event)"
      (wheel)="onCanvasWheel($event)"
    >
      @if (!presentationMode) {
      <!-- Toolbar (Simulated) -->
      <div class="absolute top-4 left-4 z-50 flex flex-wrap items-center gap-2 bg-white/90 border border-slate-200 rounded px-2 py-1 shadow-sm">
        <button
          (click)="exportHtml()"
          class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export HTML
        </button>
        <button
          (click)="exportSvg()"
          class="bg-indigo-600 text-white px-3 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export SVG
        </button>
        <button
          (click)="exportPng()"
          class="bg-indigo-600 text-white px-3 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export PNG
        </button>
        <button
          (click)="exportJson()"
          class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800"
        >
          Export JSON
        </button>
        <button
          (click)="importJson()"
          class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800"
        >
          Import JSON
        </button>
        <button (click)="zoomOut()" class="bg-slate-700 text-white px-2 py-2 rounded shadow hover:bg-slate-800">-</button>
        <button (click)="setZoom(1)" class="bg-slate-700 text-white px-2 py-2 rounded shadow hover:bg-slate-800">
          {{ (zoomLevel * 100) | number:'1.0-0' }}%
        </button>
        <button (click)="zoomIn()" class="bg-slate-700 text-white px-2 py-2 rounded shadow hover:bg-slate-800">+</button>
        <button (click)="fitToContent()" class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800">Fit</button>
        <button
          (click)="toggleFocusMode()"
          class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800"
        >
          {{ focusMode ? 'Exit Focus' : 'Focus' }}
        </button>
        @if (!focusMode) {
        <button
          (click)="togglePaletteFromToolbar()"
          class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800"
        >
          {{ isPaletteOpen ? 'Hide Components' : 'Show Components' }}
        </button>
        }
        <select
          class="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          [ngModel]="pagePreset"
          (ngModelChange)="onPagePresetChange($event)"
        >
          <option value="Infinite">Infinite</option>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="16:9">16:9</option>
          <option value="Custom">Custom</option>
        </select>
        @if (pagePreset === 'Custom') {
        <label class="flex items-center gap-1 text-xs">
          W
          <input type="number" min="200" class="w-16 rounded border px-1 py-0.5" [ngModel]="pageWidth" (ngModelChange)="onCustomPageWidth($event)" />
        </label>
        <label class="flex items-center gap-1 text-xs">
          H
          <input type="number" min="200" class="w-16 rounded border px-1 py-0.5" [ngModel]="pageHeight" (ngModelChange)="onCustomPageHeight($event)" />
        </label>
        }
        <button class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800" (click)="addFrameFromView()">Add Frame</button>
        <select class="rounded border border-slate-300 bg-white px-2 py-1 text-sm" [ngModel]="selectedFrameId" (ngModelChange)="selectedFrameId = $event">
          <option [ngValue]="null">Frames</option>
          @for (frame of frames; track frame.id) {
          <option [ngValue]="frame.id">{{ frame.name }}</option>
          }
        </select>
        <button class="bg-slate-700 text-white px-3 py-2 rounded shadow hover:bg-slate-800" [disabled]="!selectedFrameId" (click)="goToSelectedFrame()">Go</button>
        <button class="bg-red-700 text-white px-3 py-2 rounded shadow hover:bg-red-800" [disabled]="!selectedFrameId" (click)="deleteSelectedFrame()">Del</button>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" [checked]="store.snapToGrid()" (change)="onSnapToggle($event)" />
          Snap
        </label>
        <label class="flex items-center gap-2 text-sm">
          Grid
          <input
            type="number"
            min="2"
            class="w-16 border rounded px-1 py-0.5 text-sm"
            [value]="store.gridSize()"
            (change)="onGridSizeChange($event)"
          />
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            [checked]="autoSaveEnabled"
            (change)="onAutoSaveToggle($event)"
          />
          Auto-save
        </label>
        @if (activeFlowType) {
        <span class="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
          Draw {{ activeFlowType }} flow
        </span>
        <button class="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700" (click)="clearFlowDrawMode()">
          Cancel
        </button>
        }
      </div>
      }

      @if (!presentationMode && !focusMode && isPaletteOpen) {
      <aside
        data-palette="true"
        class="absolute top-28 left-4 z-40 max-h-[70vh] overflow-hidden rounded border border-slate-700 bg-slate-900/95 text-slate-100 shadow-xl"
        [style.width.px]="leftPanelWidth"
        (click)="$event.stopPropagation()"
      >
        <div class="border-b border-slate-700 px-3 py-2">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-300">Libraries</div>
          <input
            type="text"
            class="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
            placeholder="Search shape..."
            [ngModel]="paletteQuery"
            (ngModelChange)="paletteQuery = $event"
            (click)="$event.stopPropagation()"
          />
        </div>

        <div class="max-h-[68vh] overflow-auto">
          @for (group of paletteGroups; track group.id) {
          <details [open]="group.open" class="border-b border-slate-800 px-3 py-2">
            <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-300">
              {{ group.title }}
            </summary>
            <div class="mt-2 grid grid-cols-2 gap-2">
              @for (item of filteredGroupItems(group.id); track item.key) {
              <button
                class="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-left text-[11px] text-slate-100 hover:border-cyan-500 hover:bg-slate-700"
                (click)="addPaletteItem(item.key)"
                [title]="item.label"
                draggable="true"
                (dragstart)="onPaletteDragStart($event, item.key)"
                (dragend)="onPaletteDragEnd()"
              >
                <div class="flex items-center gap-2">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-600 bg-slate-900">
                    @if (isWebPaletteItem(item.key)) {
                    <span class="text-[10px] font-semibold text-cyan-300">{{ webIconLabel(item.key) }}</span>
                    } @else {
                    <svg class="h-6 w-6" viewBox="0 0 36 36">
                      <g [innerHTML]="shapePreview(item.key)"></g>
                    </svg>
                    }
                  </span>
                  <span class="leading-tight">{{ item.label }}</span>
                </div>
              </button>
              }
            </div>
          </details>
          }
        </div>
      </aside>
      <div
        class="absolute top-28 z-50 h-[70vh] w-1 cursor-ew-resize bg-transparent hover:bg-cyan-500/40"
        [style.left.px]="16 + leftPanelWidth"
        (mousedown)="startPanelResize('left', $event)"
      ></div>
      }

      <div
        class="absolute inset-0 origin-top-left"
        [style.transform]="'translate(' + panX + 'px,' + panY + 'px) scale(' + zoomLevel + ')'"
      >
        @if (pageMode === 'page') {
        <div
          class="absolute bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_6px_24px_rgba(15,23,42,0.12)]"
          [style.left.px]="0"
          [style.top.px]="0"
          [style.width.px]="pageWidth"
          [style.height.px]="pageHeight"
        ></div>
        }
        <!-- Grid (simple css pattern) -->
        @if (store.snapToGrid()) {
        <div
          class="absolute inset-0 pointer-events-none opacity-10"
          [style.background-image]="'radial-gradient(#000 1px, transparent 1px)'"
          [style.background-size]="store.gridSize() + 'px ' + store.gridSize() + 'px'"
        ></div>
        }

        <!-- Edges Layer (Bottom) -->
        <app-edges-layer [zoom]="zoomLevel"></app-edges-layer>

        <!-- Nodes Layer (Top) -->
        @for (node of nodes(); track node.id) {
        <app-node-renderer [node]="node" [zoom]="zoomLevel"></app-node-renderer>
        }

        @for (frame of frames; track frame.id) {
        <div
          data-frame="true"
          class="absolute border-2 border-dashed border-emerald-500/70 bg-emerald-200/10"
          [style.left.px]="frame.x"
          [style.top.px]="frame.y"
          [style.width.px]="frame.width"
          [style.height.px]="frame.height"
        >
          <button
            class="absolute -top-6 left-0 rounded bg-emerald-600 px-2 py-0.5 text-xs text-white"
            (click)="goToFrame(frame.id, $event)"
          >
            {{ frame.name }}
          </button>
        </div>
        }
      </div>

      <!-- Marquee Selection -->
      @if (selectionBox.visible) {
      <div
        class="absolute border-2 border-blue-500 bg-blue-200/20 pointer-events-none"
        [style.left.px]="selectionBox.x"
        [style.top.px]="selectionBox.y"
        [style.width.px]="selectionBox.width"
        [style.height.px]="selectionBox.height"
      ></div>
      }

      @if (!presentationMode) {
      <div class="absolute bottom-4 z-40 rounded border border-slate-300 bg-white/95 p-2 shadow" [style.right.px]="minimapRightOffset()" (click)="$event.stopPropagation()">
        <div class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Minimap</div>
        <svg
          width="200"
          height="130"
          class="cursor-pointer bg-slate-50"
          (click)="onMinimapClick($event)"
        >
          <rect x="0" y="0" width="200" height="130" fill="#f8fafc" stroke="#cbd5e1" />
          @for (node of nodes(); track node.id) {
          <rect
            [attr.x]="minimapNodeRect(node).x"
            [attr.y]="minimapNodeRect(node).y"
            [attr.width]="minimapNodeRect(node).width"
            [attr.height]="minimapNodeRect(node).height"
            fill="#94a3b8"
            fill-opacity="0.7"
            stroke="#475569"
            stroke-width="0.5"
          />
          }
          <rect
            [attr.x]="minimapViewport().x"
            [attr.y]="minimapViewport().y"
            [attr.width]="minimapViewport().width"
            [attr.height]="minimapViewport().height"
            fill="none"
            stroke="#2563eb"
            stroke-width="1.5"
          />
        </svg>
      </div>
      }
    </div>

    @if (!presentationMode && !focusMode && inspectorOpen) {
    <div class="absolute top-0 right-0 h-full z-50" [style.width.px]="rightPanelWidth">
      <app-inspector></app-inspector>
    </div>
    <div
      class="absolute top-0 z-50 h-full w-1 cursor-ew-resize bg-transparent hover:bg-cyan-500/40"
      [style.right.px]="rightPanelWidth"
      (mousedown)="startPanelResize('right', $event)"
    ></div>
    }

    @if (!presentationMode && !focusMode) {
    <button
      class="absolute top-20 right-4 z-50 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50"
      (click)="toggleInspector($event)"
    >
      {{ inspectorOpen ? 'Hide Inspector' : 'Show Inspector' }}
    </button>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }
    `,
  ],
})
export class CanvasComponent implements OnInit {
  readonly store = inject(DiagramStore);
  readonly commands = inject(DiagramCommands);
  private htmlExportService = inject(HtmlExportService);
  private stencilService = inject(StencilService);
  @ViewChild('canvasRoot', { static: true }) canvasRoot!: ElementRef<HTMLDivElement>;
  autoSaveEnabled = false;
  private autoSaveIntervalId: number | null = null;
  nodes = this.store.nodes;
  edges = this.store.edges;
  selectionBox = { visible: false, x: 0, y: 0, width: 0, height: 0 };
  private isSelecting = false;
  private selectionStart = { x: 0, y: 0 };
  private selectionAdditive = false;
  private selectionJustFinishedAt = 0;
  private panJustFinishedAt = 0;
  private insertCount = 0;
  private draggedPaletteKey: string | null = null;
  private resizingPanel: 'left' | 'right' | null = null;
  private spacePressed = false;
  private isPanning = false;
  private panStart = { x: 0, y: 0 };
  private panOrigin = { x: 0, y: 0 };
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  activeFlowType: BpmnFlowType | null = null;
  isPaletteOpen = true;
  inspectorOpen = true;
  focusMode = false;
  presentationMode = false;
  leftPanelWidth = 320;
  rightPanelWidth = 320;
  pageMode: 'infinite' | 'page' = 'infinite';
  pagePreset: 'Infinite' | 'A4' | 'A3' | '16:9' | 'Custom' = 'Infinite';
  pageWidth = 1280;
  pageHeight = 720;
  frames: CanvasFrame[] = [];
  selectedFrameId: string | null = null;
  paletteQuery = '';
  paletteGroups = [
    { id: 'general', title: 'General', open: true },
    { id: 'web', title: 'Web Components', open: false },
    { id: 'bpmn-general', title: 'BPMN 2.0 General', open: true },
    { id: 'bpmn-tasks', title: 'BPMN 2.0 Tasks', open: true },
    { id: 'bpmn-events', title: 'BPMN 2.0 Events', open: true },
    { id: 'bpmn-gateways', title: 'BPMN 2.0 Gateways', open: true },
    { id: 'bpmn-data', title: 'BPMN 2.0 Data & Artifacts', open: true },
    { id: 'bpmn-flows', title: 'BPMN 2.0 Flows', open: true },
    { id: 'bpmn-choreo', title: 'BPMN 2.0 Choreographies', open: true },
  ];

  paletteItems: Array<{ group: string; key: string; label: string }> = [
    { group: 'general', key: 'rectangle', label: 'Rectangle' },
    { group: 'general', key: 'rounded-rectangle', label: 'Rounded Rectangle' },
    { group: 'general', key: 'diamond', label: 'Diamond' },
    { group: 'general', key: 'document', label: 'Document' },
    { group: 'general', key: 'cylinder', label: 'Cylinder' },

    { group: 'web', key: 'web-button', label: 'Button' },
    { group: 'web', key: 'web-input', label: 'Input' },
    { group: 'web', key: 'web-card', label: 'Card' },

    { group: 'bpmn-general', key: 'bpmn-pool', label: 'Pool' },
    { group: 'bpmn-general', key: 'bpmn-lane', label: 'Lane' },
    { group: 'bpmn-general', key: 'bpmn-group', label: 'Group' },
    { group: 'bpmn-general', key: 'bpmn-conversation', label: 'Conversation' },

    { group: 'bpmn-tasks', key: 'bpmn-task', label: 'Task' },
    { group: 'bpmn-tasks', key: 'bpmn-subprocess', label: 'Subprocess' },
    { group: 'bpmn-tasks', key: 'bpmn-event-subprocess', label: 'Event Subprocess' },
    { group: 'bpmn-tasks', key: 'bpmn-call-activity', label: 'Call Activity' },
    { group: 'bpmn-tasks', key: 'bpmn-transaction', label: 'Transaction' },

    { group: 'bpmn-events', key: 'bpmn-start-event', label: 'Start Event' },
    { group: 'bpmn-events', key: 'bpmn-intermediate-event', label: 'Intermediate Event' },
    { group: 'bpmn-events', key: 'bpmn-boundary-event', label: 'Boundary Event' },
    { group: 'bpmn-events', key: 'bpmn-throwing-event', label: 'Throwing Event' },
    { group: 'bpmn-events', key: 'bpmn-end-event', label: 'End Event' },
    { group: 'bpmn-events', key: 'bpmn-event-message', label: 'Message Event' },
    { group: 'bpmn-events', key: 'bpmn-event-timer', label: 'Timer Event' },
    { group: 'bpmn-events', key: 'bpmn-event-error', label: 'Error Event' },
    { group: 'bpmn-events', key: 'bpmn-event-signal', label: 'Signal Event' },
    { group: 'bpmn-events', key: 'bpmn-event-escalation', label: 'Escalation Event' },

    { group: 'bpmn-gateways', key: 'bpmn-gateway', label: 'Gateway' },
    { group: 'bpmn-gateways', key: 'bpmn-gateway-exclusive', label: 'Exclusive Gateway' },
    { group: 'bpmn-gateways', key: 'bpmn-gateway-inclusive', label: 'Inclusive Gateway' },
    { group: 'bpmn-gateways', key: 'bpmn-gateway-parallel', label: 'Parallel Gateway' },
    { group: 'bpmn-gateways', key: 'bpmn-gateway-event-based', label: 'Event-Based Gateway' },

    { group: 'bpmn-data', key: 'bpmn-data-object', label: 'Data Object' },
    { group: 'bpmn-data', key: 'bpmn-data-store', label: 'Data Store' },
    { group: 'bpmn-data', key: 'bpmn-text-annotation', label: 'Text Annotation' },

    { group: 'bpmn-flows', key: 'bpmn-sequence-flow', label: 'Sequence Flow Shape' },
    { group: 'bpmn-flows', key: 'bpmn-message-flow', label: 'Message Flow Shape' },
    { group: 'bpmn-flows', key: 'bpmn-association', label: 'Association Shape' },

    { group: 'bpmn-choreo', key: 'bpmn-choreography-task', label: 'Choreography Task' },
    { group: 'bpmn-choreo', key: 'bpmn-choreography-subprocess', label: 'Choreography Subprocess' },
  ];
  private readonly startupExampleUrl = '/examples/pizzeria-confirmacion-entrega.json';
  private readonly startupPresentationExampleUrl = '/examples/pizzeria-confirmacion-entrega-presentation.json';

  constructor() {
    this.loadUiSettings();
    this.validatePaletteCoverage();
  }

  ngOnInit() {
    this.initializeViewMode();
    void this.loadStartupExample();
  }

  onBackgroundClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('button,input,textarea,select,option,summary,details,[data-palette="true"],[appdraggable],[data-frame="true"]')) {
      return;
    }
    this.canvasRoot.nativeElement.focus();
    if (Date.now() - this.selectionJustFinishedAt < 200) {
      return;
    }
    if (Date.now() - this.panJustFinishedAt < 200) {
      return;
    }
    if (this.store.edgePreview()) {
      return;
    }
    if (this.commands.shouldIgnoreBackgroundClick()) {
      return;
    }
    this.commands.clearSelection();
  }

  togglePaletteFromToolbar() {
    this.isPaletteOpen = !this.isPaletteOpen;
    this.saveUiSettings();
  }

  toggleInspector(event: MouseEvent) {
    event.stopPropagation();
    this.inspectorOpen = !this.inspectorOpen;
    this.saveUiSettings();
  }

  toggleFocusMode() {
    this.focusMode = !this.focusMode;
    if (this.focusMode) {
      this.isPaletteOpen = false;
      this.inspectorOpen = false;
    } else {
      this.isPaletteOpen = true;
      this.inspectorOpen = true;
    }
    this.saveUiSettings();
  }

  addPaletteItem(key: string) {
    if (this.isFlowPaletteKey(key)) {
      this.activeFlowType = this.flowTypeFromPaletteKey(key);
      return;
    }
    const position = this.nextInsertPosition();
    const node = this.buildPaletteNode(key, position.x, position.y);
    if (!node) return;
    this.commands.addNode(node);
    this.commands.setSelection([node.id], false);
  }

  onPaletteDragStart(event: DragEvent, key: string) {
    this.draggedPaletteKey = key;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('application/x-diagram-component', key);
      event.dataTransfer.setData('text/plain', key);
    }
  }

  onPaletteDragEnd() {
    this.draggedPaletteKey = null;
  }

  onCanvasDragOver(event: DragEvent) {
    const key = this.readDraggedPaletteKey(event);
    if (!key) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onCanvasDrop(event: DragEvent) {
    const key = this.readDraggedPaletteKey(event);
    if (!key) return;
    event.preventDefault();
    if (this.isFlowPaletteKey(key)) {
      this.activeFlowType = this.flowTypeFromPaletteKey(key);
      this.draggedPaletteKey = null;
      return;
    }
    const worldPoint = this.screenToWorld(event.clientX, event.clientY);
    const x = worldPoint.x;
    const y = worldPoint.y;
    const node = this.buildPaletteNode(key, x, y);
    if (!node) return;
    this.commands.addNode(node);
    this.commands.setSelection([node.id], false);
    this.draggedPaletteKey = null;
  }

  filteredGroupItems(groupId: string) {
    const q = this.paletteQuery.trim().toLowerCase();
    const items = this.paletteItems.filter((item) => item.group === groupId);
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }

  isWebPaletteItem(key: string) {
    return key.startsWith('web-');
  }

  isFlowPaletteKey(key: string) {
    return key === 'bpmn-sequence-flow' || key === 'bpmn-message-flow' || key === 'bpmn-association';
  }

  webIconLabel(key: string) {
    switch (key) {
      case 'web-button':
        return 'BTN';
      case 'web-input':
        return 'IN';
      case 'web-card':
        return 'CARD';
      default:
        return 'WEB';
    }
  }

  shapePreview(key: string): SafeHtml {
    return this.stencilService.getShapeSVG(key, 32, 32);
  }

  private readDraggedPaletteKey(event: DragEvent): string | null {
    const transferKey = event.dataTransfer?.getData('application/x-diagram-component')
      || event.dataTransfer?.getData('text/plain')
      || null;
    return transferKey || this.draggedPaletteKey;
  }

  onSnapToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.commands.setSnapToGrid(checked);
  }

  onGridSizeChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.commands.setGridSize(value);
  }

  onAutoSaveToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.autoSaveEnabled = checked;
    if (checked) {
      this.commands.saveToLocalStorage();
      this.autoSaveIntervalId = window.setInterval(() => {
        this.commands.saveToLocalStorage();
      }, 2000);
    } else if (this.autoSaveIntervalId) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }
  }

  onCanvasMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.shouldSkipCanvasMouseDown(target)) {
      return;
    }

    if (event.button === 1) {
      event.preventDefault();
      this.startPan(event.clientX, event.clientY);
      return;
    }
    if (event.button !== 0) return;
    if (this.spacePressed) {
      this.isPanning = true;
      this.panStart = { x: event.clientX, y: event.clientY };
      this.panOrigin = { x: this.panX, y: this.panY };
      return;
    }
    if (!event.shiftKey) {
      event.preventDefault();
      this.startPan(event.clientX, event.clientY);
      return;
    }
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    this.isSelecting = true;
    this.selectionAdditive = event.metaKey || event.shiftKey;
    this.selectionStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.selectionBox = { visible: true, x: this.selectionStart.x, y: this.selectionStart.y, width: 0, height: 0 };
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent) {
    if (!this.isTargetInsideCanvas(event.target)) return;
    const target = event.target as HTMLElement;
    if (event.button === 1) {
      if (target.closest('input,textarea,select,button,[data-palette="true"]')) return;
      event.preventDefault();
      this.startPan(event.clientX, event.clientY);
      return;
    }
    if (event.button !== 0) return;
    if (event.shiftKey) return;
    if (this.spacePressed) return;
    if (this.shouldSkipCanvasMouseDown(target)) return;
    event.preventDefault();
    this.startPan(event.clientX, event.clientY);
  }

  @HostListener('document:auxclick', ['$event'])
  onDocumentAuxClick(event: MouseEvent) {
    if (event.button !== 1) return;
    if (!this.isTargetInsideCanvas(event.target)) return;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    this.handleMouseMove(event);
  }

  onCanvasMouseMove(event: MouseEvent) {
    this.handleMouseMove(event);
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.resizingPanel) {
      this.resizePanel(event.clientX);
      return;
    }
    if (this.isPanning) {
      this.panX = this.panOrigin.x + (event.clientX - this.panStart.x);
      this.panY = this.panOrigin.y + (event.clientY - this.panStart.y);
      return;
    }
    if (!this.isSelecting) return;
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const x = Math.min(this.selectionStart.x, current.x);
    const y = Math.min(this.selectionStart.y, current.y);
    const width = Math.abs(this.selectionStart.x - current.x);
    const height = Math.abs(this.selectionStart.y - current.y);
    this.selectionBox = { visible: true, x, y, width, height };
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    this.handleMouseUp(event);
  }

  onCanvasMouseUp(event: MouseEvent) {
    this.handleMouseUp(event);
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.resizingPanel) {
      this.resizingPanel = null;
      this.saveUiSettings();
      return;
    }
    if (this.isPanning) {
      this.isPanning = false;
      this.panJustFinishedAt = Date.now();
      return;
    }
    if (this.store.edgePreview()) {
      const point = this.screenToWorld(event.clientX, event.clientY);
      this.completeEdge(point);
      return;
    }
    if (!this.isSelecting) return;
    this.isSelecting = false;
    const { width, height, x, y } = this.selectionBox;
    this.selectionBox = { visible: false, x: 0, y: 0, width: 0, height: 0 };
    this.selectionJustFinishedAt = Date.now();

    if (width < 3 && height < 3) {
      return;
    }

    const worldRect = this.screenRectToWorldRect({ x, y, width, height });
    const selected = this.nodes()
      .filter((node) => {
        const nodeLeft = node.x;
        const nodeTop = node.y;
        const nodeRight = node.x + node.width;
        const nodeBottom = node.y + node.height;
        const rectRight = worldRect.x + worldRect.width;
        const rectBottom = worldRect.y + worldRect.height;
        return (
          nodeLeft < rectRight &&
          nodeRight > worldRect.x &&
          nodeTop < rectBottom &&
          nodeBottom > worldRect.y
        );
      })
      .map((node) => node.id);

    this.commands.setSelection(selected, this.selectionAdditive);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.spacePressed = true;
      return;
    }
    if (this.handleArrowMove(event)) {
      return;
    }
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    event.preventDefault();
    const edgeId = this.store.selectedEdgeId();
    if (edgeId) {
      this.commands.removeEdge(edgeId);
      return;
    }
    const selectedNodes = Array.from(this.store.selection());
    if (selectedNodes.length === 0) return;
    selectedNodes.forEach((id) => this.commands.removeNode(id));
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.spacePressed = false;
      this.isPanning = false;
    }
  }

  startPanelResize(side: 'left' | 'right', event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.resizingPanel = side;
  }

  onPagePresetChange(value: 'Infinite' | 'A4' | 'A3' | '16:9' | 'Custom') {
    this.pagePreset = value;
    if (value === 'Infinite') {
      this.pageMode = 'infinite';
    } else {
      this.pageMode = 'page';
      if (value === 'A4') {
        this.pageWidth = 1123;
        this.pageHeight = 794;
      } else if (value === 'A3') {
        this.pageWidth = 1587;
        this.pageHeight = 1123;
      } else if (value === '16:9') {
        this.pageWidth = 1600;
        this.pageHeight = 900;
      }
    }
    this.saveUiSettings();
  }

  onCustomPageWidth(value: number) {
    this.pagePreset = 'Custom';
    this.pageMode = 'page';
    this.pageWidth = Math.max(200, Number(value) || 200);
    this.saveUiSettings();
  }

  onCustomPageHeight(value: number) {
    this.pagePreset = 'Custom';
    this.pageMode = 'page';
    this.pageHeight = Math.max(200, Number(value) || 200);
    this.saveUiSettings();
  }

  addFrameFromView() {
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const frame: CanvasFrame = {
      id: `frame-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `Frame ${this.frames.length + 1}`,
      x: -this.panX / this.zoomLevel,
      y: -this.panY / this.zoomLevel,
      width: rect.width / this.zoomLevel,
      height: rect.height / this.zoomLevel,
    };
    this.frames = [...this.frames, frame];
    this.selectedFrameId = frame.id;
    this.saveUiSettings();
  }

  goToFrame(frameId: string, event?: Event) {
    event?.stopPropagation();
    const frame = this.frames.find((f) => f.id === frameId);
    if (!frame) return;
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    this.panX = rect.width / 2 - (frame.x + frame.width / 2) * this.zoomLevel;
    this.panY = rect.height / 2 - (frame.y + frame.height / 2) * this.zoomLevel;
    this.selectedFrameId = frame.id;
  }

  goToSelectedFrame() {
    if (!this.selectedFrameId) return;
    this.goToFrame(this.selectedFrameId);
  }

  deleteSelectedFrame() {
    if (!this.selectedFrameId) return;
    this.frames = this.frames.filter((f) => f.id !== this.selectedFrameId);
    this.selectedFrameId = this.frames.length > 0 ? this.frames[0].id : null;
    this.saveUiSettings();
  }

  private handleArrowMove(event: KeyboardEvent): boolean {
    const active = document.activeElement as HTMLElement | null;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
      return false;
    }
    const arrowKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    if (!arrowKeys.has(event.key)) return false;

    const selectedIds = this.store.selection();
    if (selectedIds.size === 0) return false;

    event.preventDefault();

    const baseStep = this.store.snapToGrid() ? this.store.gridSize() : 1;
    const step = event.shiftKey ? baseStep * 5 : baseStep;

    let dx = 0;
    let dy = 0;
    switch (event.key) {
      case 'ArrowUp':
        dy = -step;
        break;
      case 'ArrowDown':
        dy = step;
        break;
      case 'ArrowLeft':
        dx = -step;
        break;
      case 'ArrowRight':
        dx = step;
        break;
    }

    const nodes = this.store.nodes();
    for (const node of nodes) {
      if (!selectedIds.has(node.id)) continue;
      this.commands.updateNode(node.id, { x: node.x + dx, y: node.y + dy });
    }

    return true;
  }

  @HostListener('document:mousemove', ['$event'])
  onEdgePreviewMove(event: MouseEvent) {
    const preview = this.store.edgePreview();
    if (!preview) return;
    const point = this.screenToWorld(event.clientX, event.clientY);
    const nearest = this.findNearestPort(point, preview.sourceId);
    if (nearest && nearest.distance <= 20) {
      this.commands.updateEdgePreview(nearest.point);
      return;
    }
    this.commands.updateEdgePreview(point);
  }

  private completeEdge(point: { x: number; y: number }) {
    const preview = this.store.edgePreview();
    if (!preview) return;
    const nearest = this.findNearestPort(point, preview.sourceId);
    if (!nearest) {
      this.commands.clearEdgePreview();
      return;
    }
    const edgeId = `e-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const flowType = this.activeFlowType || 'sequence';
    const defaults = this.flowStyleDefaults(flowType);
    this.commands.addEdge({
      id: edgeId,
      sourceId: preview.sourceId,
      targetId: nearest.nodeId,
      sourcePort: preview.sourcePort,
      targetPort: nearest.port,
      flowType,
      zIndex: 0,
      points: [],
      markerEnd: defaults.markerEnd,
      markerStart: defaults.markerStart,
      style: defaults.style,
    });
    this.commands.clearEdgePreview();
  }

  private findNearestPort(
    point: { x: number; y: number },
    excludeNodeId: string
  ): { nodeId: string; port: 'top' | 'right' | 'bottom' | 'left'; point: { x: number; y: number }; distance: number } | null {
    const nodes = this.nodes();
    let closest: { nodeId: string; port: 'top' | 'right' | 'bottom' | 'left'; point: { x: number; y: number }; distance: number } | null =
      null;
    for (const node of nodes) {
      if (node.id === excludeNodeId) continue;
      const ports: Array<{ port: 'top' | 'right' | 'bottom' | 'left'; point: { x: number; y: number } }> = [
        { port: 'top', point: { x: node.x + node.width / 2, y: node.y } },
        { port: 'right', point: { x: node.x + node.width, y: node.y + node.height / 2 } },
        { port: 'bottom', point: { x: node.x + node.width / 2, y: node.y + node.height } },
        { port: 'left', point: { x: node.x, y: node.y + node.height / 2 } },
      ];
      for (const p of ports) {
        const dx = p.point.x - point.x;
        const dy = p.point.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (!closest || distance < closest.distance) {
          closest = { nodeId: node.id, port: p.port, point: p.point, distance };
        }
      }
    }
    return closest;
  }

  private nextInsertPosition() {
    const baseX = 320;
    const baseY = 120;
    const spacing = 24;
    const value = { x: baseX + this.insertCount * spacing, y: baseY + this.insertCount * spacing };
    this.insertCount = (this.insertCount + 1) % 12;
    return value;
  }

  private createNodeId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  private buildPaletteNode(key: string, x: number, y: number): DiagramNode | null {
    switch (key) {
      case 'web-button':
        return {
          id: this.createNodeId('n'),
          type: 'web-component',
          componentType: 'button',
          x,
          y,
          width: 110,
          height: 42,
          zIndex: 1,
          data: { text: 'Button', variant: 'primary' },
        } as WebNode;
      case 'web-input':
        return {
          id: this.createNodeId('n'),
          type: 'web-component',
          componentType: 'input',
          x,
          y,
          width: 220,
          height: 72,
          zIndex: 1,
          data: { label: 'Label', placeholder: 'Type here...', inputType: 'text' },
        } as WebNode;
      case 'web-card':
        return {
          id: this.createNodeId('n'),
          type: 'web-component',
          componentType: 'card',
          x,
          y,
          width: 260,
          height: 140,
          zIndex: 1,
          data: { title: 'Card', content: 'Card content' },
        } as WebNode;
      case 'bpmn-task':
      case 'bpmn-subprocess':
      case 'bpmn-call-activity':
      case 'bpmn-transaction':
      case 'bpmn-event-subprocess':
      case 'bpmn-start-event':
      case 'bpmn-intermediate-event':
      case 'bpmn-boundary-event':
      case 'bpmn-throwing-event':
      case 'bpmn-event-message':
      case 'bpmn-event-timer':
      case 'bpmn-event-error':
      case 'bpmn-event-signal':
      case 'bpmn-event-escalation':
      case 'bpmn-end-event':
      case 'bpmn-gateway':
      case 'bpmn-gateway-exclusive':
      case 'bpmn-gateway-inclusive':
      case 'bpmn-gateway-parallel':
      case 'bpmn-gateway-event-based':
      case 'bpmn-pool':
      case 'bpmn-lane':
      case 'bpmn-group':
      case 'bpmn-conversation':
      case 'bpmn-data-object':
      case 'bpmn-data-store':
      case 'bpmn-text-annotation':
      case 'bpmn-choreography-task':
      case 'bpmn-choreography-subprocess':
      case 'rectangle':
      case 'rounded-rectangle':
      case 'diamond':
      case 'document':
      case 'cylinder':
        return this.buildShapeNode(key, x, y);
      default:
        return null;
    }
  }

  private buildShapeNode(shapeType: string, x: number, y: number): ShapeNode {
    const isEvent =
      shapeType === 'bpmn-start-event' ||
      shapeType === 'bpmn-intermediate-event' ||
      shapeType === 'bpmn-boundary-event' ||
      shapeType === 'bpmn-throwing-event' ||
      shapeType === 'bpmn-end-event' ||
      shapeType === 'bpmn-event-message' ||
      shapeType === 'bpmn-event-timer' ||
      shapeType === 'bpmn-event-error' ||
      shapeType === 'bpmn-event-signal' ||
      shapeType === 'bpmn-event-escalation';
    const isGateway =
      shapeType === 'bpmn-gateway' ||
      shapeType === 'bpmn-gateway-exclusive' ||
      shapeType === 'bpmn-gateway-inclusive' ||
      shapeType === 'bpmn-gateway-parallel' ||
      shapeType === 'bpmn-gateway-event-based' ||
      shapeType === 'diamond';
    const isFlowShape =
      shapeType === 'bpmn-sequence-flow' || shapeType === 'bpmn-message-flow' || shapeType === 'bpmn-association';
    const width =
      shapeType === 'bpmn-pool'
        ? 320
        : shapeType === 'bpmn-lane'
        ? 320
        : shapeType === 'bpmn-data-store'
        ? 110
        : shapeType === 'bpmn-data-object'
        ? 90
        : shapeType === 'bpmn-text-annotation'
        ? 120
        : shapeType === 'bpmn-group'
        ? 220
        : shapeType === 'bpmn-conversation'
        ? 120
        : shapeType === 'bpmn-choreography-task' || shapeType === 'bpmn-choreography-subprocess'
        ? 180
        : isFlowShape
        ? 160
        : isEvent
        ? 70
        : isGateway
        ? 90
        : 140;
    const height =
      shapeType === 'bpmn-pool'
        ? 140
        : shapeType === 'bpmn-lane'
        ? 120
        : shapeType === 'bpmn-data-store'
        ? 100
        : shapeType === 'bpmn-data-object'
        ? 110
        : shapeType === 'bpmn-text-annotation'
        ? 70
        : shapeType === 'bpmn-group'
        ? 120
        : shapeType === 'bpmn-conversation'
        ? 90
        : shapeType === 'bpmn-choreography-task' || shapeType === 'bpmn-choreography-subprocess'
        ? 110
        : isFlowShape
        ? 30
        : isEvent
        ? 70
        : isGateway
        ? 90
        : 80;

    return {
      id: this.createNodeId('n'),
      type: 'shape',
      shapeType,
      x,
      y,
      width,
      height,
      zIndex: 1,
      data: {
        text: this.defaultShapeLabel(shapeType, isGateway),
      },
      style: { fill: '#ffffff', stroke: '#111111', strokeWidth: 2 },
    };
  }

  private defaultShapeLabel(shapeType: string, isGateway: boolean) {
    const labels: Record<string, string> = {
      'bpmn-task': 'Task',
      'bpmn-subprocess': 'Subprocess',
      'bpmn-call-activity': 'Call Activity',
      'bpmn-transaction': 'Transaction',
      'bpmn-event-subprocess': 'Event Subprocess',
      'bpmn-start-event': '',
      'bpmn-intermediate-event': '',
      'bpmn-boundary-event': '',
      'bpmn-throwing-event': '',
      'bpmn-end-event': '',
      'bpmn-event-message': '',
      'bpmn-event-timer': '',
      'bpmn-event-error': '',
      'bpmn-event-signal': '',
      'bpmn-event-escalation': '',
      'bpmn-pool': 'Pool',
      'bpmn-lane': 'Lane',
      'bpmn-group': '',
      'bpmn-conversation': 'Conversation',
      'bpmn-data-object': '',
      'bpmn-data-store': 'Data Store',
      'bpmn-text-annotation': 'Text',
      'bpmn-choreography-task': 'Choreography',
      'bpmn-choreography-subprocess': 'Choreo Subprocess',
      document: 'Document',
      cylinder: 'Database',
    };
    if (labels[shapeType] !== undefined) return labels[shapeType];
    if (isGateway) return '';
    return 'Shape';
  }

  private validatePaletteCoverage() {
    const missing: string[] = [];
    const keys = Array.from(new Set(this.paletteItems.map((i) => i.key)));
    for (const key of keys) {
      if (this.isFlowPaletteKey(key)) {
        continue;
      }
      if (!this.buildPaletteNode(key, 0, 0)) {
        missing.push(key);
      }
    }
    if (missing.length > 0) {
      console.warn('Palette items without node builder:', missing);
    }
  }

  clearFlowDrawMode() {
    this.activeFlowType = null;
  }

  onCanvasWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    const oldZoom = this.zoomLevel;
    const nextZoom = Math.max(0.3, Math.min(2.5, oldZoom * factor));
    const worldBefore = this.screenToWorld(event.clientX, event.clientY);
    this.zoomLevel = nextZoom;
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    this.panX = screenX - worldBefore.x * this.zoomLevel;
    this.panY = screenY - worldBefore.y * this.zoomLevel;
  }

  zoomIn() {
    this.setZoom(this.zoomLevel * 1.1);
  }

  zoomOut() {
    this.setZoom(this.zoomLevel * 0.9);
  }

  setZoom(value: number) {
    this.zoomLevel = Math.max(0.3, Math.min(2.5, value));
  }

  fitToContent() {
    const bounds = this.computeContentBounds();
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const padding = 40;
    const fitX = (rect.width - padding * 2) / bounds.width;
    const fitY = (rect.height - padding * 2) / bounds.height;
    this.zoomLevel = Math.max(0.3, Math.min(2.5, Math.min(fitX, fitY)));
    this.panX = padding - bounds.minX * this.zoomLevel;
    this.panY = padding - bounds.minY * this.zoomLevel;
  }

  minimapNodeRect(node: DiagramNode) {
    const bounds = this.computeContentBounds();
    const scale = this.minimapScale(bounds);
    return {
      x: (node.x - bounds.minX) * scale,
      y: (node.y - bounds.minY) * scale,
      width: Math.max(2, node.width * scale),
      height: Math.max(2, node.height * scale),
    };
  }

  minimapViewport() {
    const bounds = this.computeContentBounds();
    const scale = this.minimapScale(bounds);
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const viewX = (-this.panX / this.zoomLevel - bounds.minX) * scale;
    const viewY = (-this.panY / this.zoomLevel - bounds.minY) * scale;
    const viewW = (rect.width / this.zoomLevel) * scale;
    const viewH = (rect.height / this.zoomLevel) * scale;
    return { x: viewX, y: viewY, width: viewW, height: viewH };
  }

  onMinimapClick(event: MouseEvent) {
    const target = event.currentTarget as SVGElement;
    const rect = target.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const bounds = this.computeContentBounds();
    const scale = this.minimapScale(bounds);
    const worldX = bounds.minX + localX / scale;
    const worldY = bounds.minY + localY / scale;
    const canvasRect = this.canvasRoot.nativeElement.getBoundingClientRect();
    this.panX = canvasRect.width / 2 - worldX * this.zoomLevel;
    this.panY = canvasRect.height / 2 - worldY * this.zoomLevel;
  }

  minimapRightOffset() {
    if (!this.focusMode && this.inspectorOpen) {
      return this.rightPanelWidth + 16;
    }
    return 16;
  }

  private flowTypeFromPaletteKey(key: string): BpmnFlowType {
    if (key === 'bpmn-message-flow') return 'message';
    if (key === 'bpmn-association') return 'association';
    return 'sequence';
  }

  private flowStyleDefaults(flowType: BpmnFlowType) {
    if (flowType === 'message') {
      return {
        markerEnd: 'open-arrow',
        markerStart: 'open-circle',
        style: { stroke: '#1f2937', strokeWidth: 2, dashArray: '6 4', cornerRadius: 0 },
      };
    }
    if (flowType === 'association') {
      return {
        markerEnd: undefined,
        markerStart: undefined,
        style: { stroke: '#374151', strokeWidth: 2, dashArray: '3 4', cornerRadius: 0 },
      };
    }
    return {
      markerEnd: 'arrow',
      markerStart: undefined,
      style: { stroke: '#333', strokeWidth: 2, dashArray: undefined, cornerRadius: 0 },
    };
  }

  private screenToWorld(clientX: number, clientY: number) {
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.panX) / this.zoomLevel,
      y: (clientY - rect.top - this.panY) / this.zoomLevel,
    };
  }

  private screenRectToWorldRect(rect: { x: number; y: number; width: number; height: number }) {
    const x1 = (rect.x - this.panX) / this.zoomLevel;
    const y1 = (rect.y - this.panY) / this.zoomLevel;
    const x2 = (rect.x + rect.width - this.panX) / this.zoomLevel;
    const y2 = (rect.y + rect.height - this.panY) / this.zoomLevel;
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  }

  private computeContentBounds() {
    const nodes = this.nodes();
    const padding = 80;
    const baseMinX = nodes.length > 0 ? Math.min(...nodes.map((n) => n.x)) : 0;
    const baseMinY = nodes.length > 0 ? Math.min(...nodes.map((n) => n.y)) : 0;
    const baseMaxX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x + n.width)) : 1200;
    const baseMaxY = nodes.length > 0 ? Math.max(...nodes.map((n) => n.y + n.height)) : 800;
    const frameMinX = this.frames.length > 0 ? Math.min(...this.frames.map((f) => f.x)) : baseMinX;
    const frameMinY = this.frames.length > 0 ? Math.min(...this.frames.map((f) => f.y)) : baseMinY;
    const frameMaxX = this.frames.length > 0 ? Math.max(...this.frames.map((f) => f.x + f.width)) : baseMaxX;
    const frameMaxY = this.frames.length > 0 ? Math.max(...this.frames.map((f) => f.y + f.height)) : baseMaxY;
    const pageMaxX = this.pageMode === 'page' ? this.pageWidth : frameMaxX;
    const pageMaxY = this.pageMode === 'page' ? this.pageHeight : frameMaxY;
    const minX = Math.min(baseMinX, frameMinX, 0) - padding;
    const minY = Math.min(baseMinY, frameMinY, 0) - padding;
    const maxX = Math.max(baseMaxX, frameMaxX, pageMaxX) + padding;
    const maxY = Math.max(baseMaxY, frameMaxY, pageMaxY) + padding;
    return { minX, minY, width: Math.max(400, maxX - minX), height: Math.max(300, maxY - minY) };
  }

  private minimapScale(bounds: { width: number; height: number }) {
    return Math.min(200 / bounds.width, 130 / bounds.height);
  }

  private resizePanel(clientX: number) {
    const min = 240;
    const max = 540;
    if (this.resizingPanel === 'left') {
      const next = clientX - 16;
      this.leftPanelWidth = Math.max(min, Math.min(max, next));
      return;
    }
    if (this.resizingPanel === 'right') {
      const next = window.innerWidth - clientX;
      this.rightPanelWidth = Math.max(min, Math.min(max, next));
    }
  }

  private startPan(clientX: number, clientY: number) {
    this.isPanning = true;
    this.panStart = { x: clientX, y: clientY };
    this.panOrigin = { x: this.panX, y: this.panY };
  }

  private shouldSkipCanvasMouseDown(target: HTMLElement): boolean {
    return !!target.closest(
      '[appdraggable], [data-palette="true"], [data-frame="true"], input, textarea, select, button, summary, details'
    );
  }

  private isTargetInsideCanvas(target: EventTarget | null) {
    const element = target as HTMLElement | null;
    if (!element) return false;
    return !!element.closest('#canvas-root');
  }

  private loadUiSettings() {
    try {
      const raw = localStorage.getItem('diagram-ui-settings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        leftPanelWidth: number;
        rightPanelWidth: number;
        pageMode: 'infinite' | 'page';
        pagePreset: 'Infinite' | 'A4' | 'A3' | '16:9' | 'Custom';
        pageWidth: number;
        pageHeight: number;
        frames: CanvasFrame[];
        isPaletteOpen: boolean;
        inspectorOpen: boolean;
      }>;
      if (typeof parsed.leftPanelWidth === 'number') this.leftPanelWidth = parsed.leftPanelWidth;
      if (typeof parsed.rightPanelWidth === 'number') this.rightPanelWidth = parsed.rightPanelWidth;
      if (parsed.pageMode) this.pageMode = parsed.pageMode;
      if (parsed.pagePreset) this.pagePreset = parsed.pagePreset;
      if (typeof parsed.pageWidth === 'number') this.pageWidth = parsed.pageWidth;
      if (typeof parsed.pageHeight === 'number') this.pageHeight = parsed.pageHeight;
      if (Array.isArray(parsed.frames)) this.frames = parsed.frames;
      if (typeof parsed.isPaletteOpen === 'boolean') this.isPaletteOpen = parsed.isPaletteOpen;
      if (typeof parsed.inspectorOpen === 'boolean') this.inspectorOpen = parsed.inspectorOpen;
      this.selectedFrameId = this.frames.length > 0 ? this.frames[0].id : null;
    } catch {
      // ignore malformed settings
    }
  }

  private saveUiSettings() {
    const payload = {
      leftPanelWidth: this.leftPanelWidth,
      rightPanelWidth: this.rightPanelWidth,
      pageMode: this.pageMode,
      pagePreset: this.pagePreset,
      pageWidth: this.pageWidth,
      pageHeight: this.pageHeight,
      frames: this.frames,
      isPaletteOpen: this.isPaletteOpen,
      inspectorOpen: this.inspectorOpen,
    };
    localStorage.setItem('diagram-ui-settings', JSON.stringify(payload));
  }

  private async loadStartupExample() {
    try {
      const url = this.presentationMode ? this.startupPresentationExampleUrl : this.startupExampleUrl;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        console.warn(`Startup example not loaded: ${response.status} ${response.statusText}`);
        return;
      }
      const json = await response.text();
      this.commands.loadFromJson(json);
    } catch (error) {
      console.warn('Startup example could not be loaded', error);
    }
  }

  private initializeViewMode() {
    const params = new URLSearchParams(window.location.search);
    this.presentationMode = params.get('presentation') === '1';
    if (!this.presentationMode) return;
    this.focusMode = true;
    this.isPaletteOpen = false;
    this.inspectorOpen = false;
    this.commands.setSnapToGrid(false);
  }

  exportHtml() {
    const html = this.htmlExportService.exportHtml({
      nodes: this.store.nodes(),
      edges: this.store.edges(),
    });

    // Download logic
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram-export.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportSvg() {
    const svg = this.htmlExportService.exportSvg({
      nodes: this.store.nodes(),
      edges: this.store.edges(),
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram-export.svg';
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportPng() {
    const blob = await this.htmlExportService.exportPng({
      nodes: this.store.nodes(),
      edges: this.store.edges(),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram-export.png';
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJson() {
    const json = this.commands.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        this.commands.loadFromJson(text);
      } catch (err) {
        alert('Invalid diagram JSON');
      }
    };
    input.click();
  }
}
