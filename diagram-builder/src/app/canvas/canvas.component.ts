import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../core/services/diagram.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { EdgeRendererComponent } from './components/edge-renderer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';
import { InspectorComponent } from '../inspector/inspector.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, NodeRendererComponent, EdgeRendererComponent, InspectorComponent],
  template: `
    <div
      #canvasRoot
      class="relative w-full h-full bg-slate-50 overflow-hidden"
      (click)="onBackgroundClick()"
      (mousedown)="onCanvasMouseDown($event)"
    >
      <!-- Toolbar (Simulated) -->
      <div class="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/90 border border-slate-200 rounded px-2 py-1 shadow-sm">
        <button
          (click)="exportHtml()"
          class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export HTML
        </button>
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            [checked]="diagramService.snapToGrid()"
            (change)="onSnapToggle($event)"
          />
          Snap
        </label>
        <label class="flex items-center gap-2 text-sm">
          Grid
          <input
            type="number"
            min="2"
            class="w-16 border rounded px-1 py-0.5 text-sm"
            [value]="diagramService.gridSize()"
            (change)="onGridSizeChange($event)"
          />
        </label>
      </div>

      <!-- Grid (simple css pattern) -->
      @if (diagramService.snapToGrid()) {
      <div
        class="absolute inset-0 pointer-events-none opacity-10"
        [style.background-image]="'radial-gradient(#000 1px, transparent 1px)'"
        [style.background-size]="diagramService.gridSize() + 'px ' + diagramService.gridSize() + 'px'"
      ></div>
      }

      <!-- Edges Layer (Bottom) -->
      <svg class="absolute inset-0 pointer-events-none w-full h-full z-0">
        <!-- We can put global defs here if needed, but EdgeRenderer handles its own for now or we loop inside a single svg -->
      </svg>
      <!-- We accept having multiple SVGs for simplicity in this MVP, or we can project them differently -->
      @for (edge of edges(); track edge.id) {
      <app-edge-renderer [edge]="edge"></app-edge-renderer>
      }

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
  readonly diagramService = inject(DiagramService);
  private htmlExportService = inject(HtmlExportService);
  @ViewChild('canvasRoot', { static: true }) canvasRoot!: ElementRef<HTMLDivElement>;
  nodes = this.diagramService.nodes;
  edges = this.diagramService.edges;
  selectionBox = { visible: false, x: 0, y: 0, width: 0, height: 0 };
  private isSelecting = false;
  private selectionStart = { x: 0, y: 0 };
  private selectionAdditive = false;
  private selectionJustFinishedAt = 0;

  onBackgroundClick() {
    if (Date.now() - this.selectionJustFinishedAt < 200) {
      return;
    }
    if (this.diagramService.shouldIgnoreBackgroundClick()) {
      return;
    }
    this.diagramService.clearSelection();
  }

  onSnapToggle(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.diagramService.setSnapToGrid(checked);
  }

  onGridSizeChange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.diagramService.setGridSize(value);
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

    this.diagramService.setSelection(selected, this.selectionAdditive);
  }

  exportHtml() {
    const html = this.htmlExportService.exportHtml({
      nodes: this.diagramService.nodes(),
      edges: this.diagramService.edges(),
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
}
