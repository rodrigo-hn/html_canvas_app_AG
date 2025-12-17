import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramEdge, DiagramNode } from '../../core/models/diagram.model';
import { DiagramService } from '../../core/services/diagram.service';

@Component({
  selector: 'app-edge-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg class="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#333" />
        </marker>
      </defs>
      <path
        [attr.d]="pathData()"
        fill="none"
        [attr.stroke]="edge.style?.stroke || 'black'"
        [attr.stroke-width]="edge.style?.strokeWidth || 1"
        [attr.marker-end]="edge.markerEnd ? 'url(#arrow)' : null"
      />
    </svg>
  `,
})
export class EdgeRendererComponent {
  @Input({ required: true }) edge!: DiagramEdge;

  private diagramService = inject(DiagramService);

  // Compute path based on source/target node positions
  pathData = computed(() => {
    const nodes = this.diagramService.nodes();
    const sourceNode = nodes.find((n) => n.id === this.edge.sourceId);
    const targetNode = nodes.find((n) => n.id === this.edge.targetId);

    if (!sourceNode || !targetNode) return '';

    // Simple center-to-center for now
    const startX = sourceNode.x + sourceNode.width / 2;
    const startY = sourceNode.y + sourceNode.height / 2;
    const endX = targetNode.x + targetNode.width / 2;
    const endY = targetNode.y + targetNode.height / 2;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  });
}
