import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../core/services/diagram.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, NodeRendererComponent],
  template: `
    <div class="relative w-full h-full bg-slate-50 overflow-hidden" (click)="onBackgroundClick()">
      <!-- Toolbar (Simulated) -->
      <div class="absolute top-4 right-4 z-50 flex gap-2">
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

      <!-- Nodes -->
      @for (node of nodes(); track node.id) {
      <app-node-renderer [node]="node"></app-node-renderer>
      }
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

  onBackgroundClick() {
    this.diagramService.clearSelection();
  }

  exportHtml() {
    const html = this.htmlExportService.exportHtml({
      nodes: this.diagramService.nodes(),
      edges: [], // Edges not implemented yet
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
