import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { DiagramStore } from '../core/services/diagram-store.service';
import { DiagramCommands } from '../core/services/diagram-commands.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { EdgesLayerComponent } from './components/edges-layer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';
import { InspectorComponent } from '../inspector/inspector.component';
import { DiagramNode, ShapeNode, WebNode } from '../core/models/diagram.model';
import { StencilService } from '../stencils/stencil.service';

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
      (click)="onBackgroundClick()"
      (mousedown)="onCanvasMouseDown($event)"
    >
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
      </div>

      <button
        class="absolute top-20 left-4 z-50 rounded border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow hover:bg-slate-800"
        (click)="togglePalette($event)"
      >
        {{ isPaletteOpen ? 'Hide Components' : 'Show Components' }}
      </button>

      @if (isPaletteOpen) {
      <aside
        data-palette="true"
        class="absolute top-28 left-4 z-40 w-72 max-h-[70vh] overflow-hidden rounded border border-slate-700 bg-slate-900/95 text-slate-100 shadow-xl"
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
      <app-edges-layer></app-edges-layer>

      <!-- Nodes Layer (Top) -->
      @for (node of nodes(); track node.id) {
      <app-node-renderer [node]="node"></app-node-renderer>
      }

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
    </div>

    <div class="absolute top-0 right-0 h-full z-50">
      <app-inspector></app-inspector>
    </div>
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
export class CanvasComponent {
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
  private insertCount = 0;
  isPaletteOpen = true;
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

  onBackgroundClick() {
    this.canvasRoot.nativeElement.focus();
    if (Date.now() - this.selectionJustFinishedAt < 200) {
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

  togglePalette(event: MouseEvent) {
    event.stopPropagation();
    this.isPaletteOpen = !this.isPaletteOpen;
  }

  addPaletteItem(key: string) {
    const position = this.nextInsertPosition();
    const node = this.buildPaletteNode(key, position.x, position.y);
    if (!node) return;
    this.commands.addNode(node);
    this.commands.setSelection([node.id], false);
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
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('[appdraggable]')) {
      return;
    }
    if ((event.target as HTMLElement).closest('[data-palette="true"]')) {
      return;
    }
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    this.isSelecting = true;
    this.selectionAdditive = event.metaKey || event.shiftKey;
    this.selectionStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    this.selectionBox = { visible: true, x: this.selectionStart.x, y: this.selectionStart.y, width: 0, height: 0 };
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
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
    if (this.store.edgePreview()) {
      const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
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

    const selected = this.nodes()
      .filter((node) => {
        const nodeLeft = node.x;
        const nodeTop = node.y;
        const nodeRight = node.x + node.width;
        const nodeBottom = node.y + node.height;
        const rectRight = x + width;
        const rectBottom = y + height;
        return nodeLeft < rectRight && nodeRight > x && nodeTop < rectBottom && nodeBottom > y;
      })
      .map((node) => node.id);

    this.commands.setSelection(selected, this.selectionAdditive);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.handleArrowMove(event)) {
      return;
    }
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    const edgeId = this.store.selectedEdgeId();
    if (!edgeId) return;
    event.preventDefault();
    this.commands.removeEdge(edgeId);
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
    const rect = this.canvasRoot.nativeElement.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    this.commands.addEdge({
      id: edgeId,
      sourceId: preview.sourceId,
      targetId: nearest.nodeId,
      sourcePort: preview.sourcePort,
      targetPort: nearest.port,
      zIndex: 0,
      points: [],
      markerEnd: 'arrow',
      style: { stroke: '#333', strokeWidth: 2 },
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
      case 'bpmn-sequence-flow':
      case 'bpmn-message-flow':
      case 'bpmn-association':
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
      'bpmn-sequence-flow': '',
      'bpmn-message-flow': '',
      'bpmn-association': '',
      'bpmn-choreography-task': 'Choreography',
      'bpmn-choreography-subprocess': 'Choreo Subprocess',
      document: 'Document',
      cylinder: 'Database',
    };
    if (labels[shapeType] !== undefined) return labels[shapeType];
    if (isGateway) return '';
    return 'Shape';
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
