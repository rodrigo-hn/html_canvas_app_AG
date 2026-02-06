import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramStore } from '../core/services/diagram-store.service';
import { DiagramCommands } from '../core/services/diagram-commands.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { EdgesLayerComponent } from './components/edges-layer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';
import { InspectorComponent } from '../inspector/inspector.component';

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
