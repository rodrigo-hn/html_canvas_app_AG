import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../core/services/diagram.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { EdgeRendererComponent } from './components/edge-renderer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';
import { InspectorComponent } from '../inspector/inspector.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, NodeRendererComponent, EdgeRendererComponent, InspectorComponent],
  template: `
    <div class="relative w-full h-full bg-slate-50 overflow-hidden" (click)="onBackgroundClick()">
      <!-- Toolbar (Simulated) -->
      <div class="absolute top-4 left-4 z-50 flex gap-2">
        <button
          (click)="exportHtml()"
          class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export HTML
        </button>
      </div>

      <!-- Grid (simple css pattern) -->
      <div
        class="absolute inset-0 pointer-events-none opacity-10"
        style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"
      ></div>

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
  private diagramService = inject(DiagramService);
  private htmlExportService = inject(HtmlExportService);
  nodes = this.diagramService.nodes;
  edges = this.diagramService.edges;

  onBackgroundClick() {
    if (this.diagramService.shouldIgnoreBackgroundClick()) {
      return;
    }
    this.diagramService.clearSelection();
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
