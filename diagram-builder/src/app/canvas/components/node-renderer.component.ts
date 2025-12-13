import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramNode, Point, ShapeNode, WebNode } from '../../core/models/diagram.model';
import { DiagramService } from '../../core/services/diagram.service';
import { DraggableDirective } from '../directives/draggable.directive';
import { StencilService } from '../../stencils/stencil.service';
import { WebNodeWrapperComponent } from '../../components-tailwind/web-node-wrapper.component';

@Component({
  selector: 'app-node-renderer',
  standalone: true,
  imports: [CommonModule, DraggableDirective, WebNodeWrapperComponent],
  template: `
    <div
      class="absolute select-none hover:ring-2 hover:ring-blue-400 group"
      appDraggable
      [snapToGrid]="true"
      [gridSize]="20"
      [startPosition]="{ x: node.x, y: node.y }"
      (dragMove)="onDragMove($event)"
      [class.ring-2]="isSelected()"
      [class.ring-blue-600]="isSelected()"
      [style.left.px]="node.x"
      [style.top.px]="node.y"
      [style.width.px]="node.width"
      [style.height.px]="node.height"
      [style.z-index]="node.zIndex"
      (click)="onSelect($event)"
    >
      <!-- SVG Shapes -->
      <svg
        *ngIf="node.type === 'shape'"
        class="w-full h-full pointer-events-none"
        [attr.viewBox]="'0 0 ' + node.width + ' ' + node.height"
        style="overflow: visible;"
      >
        <g [innerHTML]="getShapeContent()"></g>

        <!-- Text Overlay -->
        <foreignObject
          *ngIf="node.data?.text"
          x="0"
          y="0"
          [attr.width]="node.width"
          [attr.height]="node.height"
        >
          <div
            class="w-full h-full flex items-center justify-center text-center p-1 text-sm pointer-events-none"
          >
            {{ node.data.text }}
          </div>
        </foreignObject>
      </svg>

      <!-- Web Components -->
      <div *ngIf="node.type === 'web-component'" class="w-full h-full">
        <app-web-node-wrapper [node]="asWebNode(node)"></app-web-node-wrapper>
      </div>
    </div>
  `,
  styles: [],
})
export class NodeRendererComponent {
  @Input({ required: true }) node!: DiagramNode;

  private diagramService = inject(DiagramService);
  private stencilService = inject(StencilService);

  isSelected = computed(() => this.diagramService.selection().has(this.node.id));

  onSelect(event: MouseEvent) {
    event.stopPropagation();
    const meta = event.metaKey || event.shiftKey;
    this.diagramService.toggleSelection(this.node.id, meta);
  }

  onDragMove(pos: Point) {
    this.diagramService.updateNode(this.node.id, { x: pos.x, y: pos.y });
  }

  getShapeContent() {
    if (this.node.type !== 'shape') return '';
    const shapeNode = this.node as ShapeNode;
    return this.stencilService.getShapeSVG(shapeNode.shapeType, this.node.width, this.node.height);
  }

  asWebNode(node: DiagramNode): WebNode {
    return node as WebNode;
  }
}
