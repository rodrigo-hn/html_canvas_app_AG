import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../core/services/diagram.service';
import { DiagramNode, ShapeNode, WebNode } from '../core/models/diagram.model';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full w-72 bg-white border-l border-slate-200 p-4 overflow-auto">
      <h2 class="text-lg font-semibold mb-4">Inspector</h2>

      @if (selectedEdge()) {
      <details open>
        <summary class="cursor-pointer text-sm font-semibold text-slate-700 mb-2">Edge</summary>
        <div class="space-y-3">
          <div class="text-xs text-slate-500">ID: {{ selectedEdge()!.id }}</div>
          <button
            class="w-full bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
            (click)="deleteSelectedEdge()"
          >
            Delete Edge
          </button>
          <div>
            <label class="block text-xs font-semibold mb-1" [attr.for]="edgeFieldId('stroke')"
              >Stroke</label
            >
            <input
              [id]="edgeFieldId('stroke')"
              [attr.name]="edgeFieldId('stroke')"
              type="text"
              class="w-full border rounded px-2 py-1 text-sm"
              [ngModel]="selectedEdge()!.style?.stroke || '#333'"
              (ngModelChange)="updateEdgeStyle({ stroke: $event })"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1" [attr.for]="edgeFieldId('strokeWidth')"
              >Stroke Width</label
            >
            <input
              [id]="edgeFieldId('strokeWidth')"
              [attr.name]="edgeFieldId('strokeWidth')"
              type="number"
              min="1"
              class="w-full border rounded px-2 py-1 text-sm"
              [ngModel]="selectedEdge()!.style?.strokeWidth || 2"
              (ngModelChange)="updateEdgeStyleNumber('strokeWidth', $event)"
            />
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              [checked]="(selectedEdge()!.markerEnd || '') === 'arrow'"
              (change)="updateEdgeMarker($event)"
            />
            Arrow
          </label>
        </div>
      </details>
      } @else if (selectedNodes().length === 0) {
      <div class="text-sm text-slate-500">No selection.</div>
      } @else if (selectedNodes().length > 1) {
      <div class="text-sm text-slate-600">
        {{ selectedNodes().length }} nodes selected.
      </div>
      } @else {
      <div class="space-y-4">
        <div class="text-xs text-slate-500">ID: {{ node()!.id }}</div>
        <div class="text-xs text-slate-500">Type: {{ node()!.type }}</div>

        <details open>
          <summary class="cursor-pointer text-sm font-semibold text-slate-700 mb-2">
            Position & Size
          </summary>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('x')">X</label>
              <input
                [id]="fieldId('x')"
                [attr.name]="fieldId('x')"
                type="number"
                min="0"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.x"
                (ngModelChange)="updateNumber('x', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('y')">Y</label>
              <input
                [id]="fieldId('y')"
                [attr.name]="fieldId('y')"
                type="number"
                min="0"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.y"
                (ngModelChange)="updateNumber('y', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('width')">Width</label>
              <input
                [id]="fieldId('width')"
                [attr.name]="fieldId('width')"
                type="number"
                min="0"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.width"
                (ngModelChange)="updateNumber('width', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('height')">Height</label>
              <input
                [id]="fieldId('height')"
                [attr.name]="fieldId('height')"
                type="number"
                min="0"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.height"
                (ngModelChange)="updateNumber('height', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('zIndex')"
                >Z-Index</label
              >
              <input
                [id]="fieldId('zIndex')"
                [attr.name]="fieldId('zIndex')"
                type="number"
                min="0"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.zIndex"
                (ngModelChange)="updateNumber('zIndex', $event)"
              />
            </div>
          </div>
        </details>

        @if (isShapeNode()) {
        <details open>
          <summary class="cursor-pointer text-sm font-semibold text-slate-700 mb-2">
            Shape
          </summary>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('shapeType')"
                >Shape Type</label
              >
              <select
                [id]="fieldId('shapeType')"
                [attr.name]="fieldId('shapeType')"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="shapeNode()!.shapeType"
                (ngModelChange)="updateShapeType($event)"
              >
                @for (shape of shapeTypes; track shape) {
                <option [value]="shape">{{ shape }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('shapeText')"
                >Text</label
              >
              <input
                [id]="fieldId('shapeText')"
                [attr.name]="fieldId('shapeText')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.text"
                (ngModelChange)="updateData('text', $event)"
              />
            </div>
          </div>
        </details>
        }

        @if (isWebNode()) {
        <details open>
          <summary class="cursor-pointer text-sm font-semibold text-slate-700 mb-2">
            Web Component
          </summary>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('componentType')"
                >Component Type</label
              >
              <select
                [id]="fieldId('componentType')"
                [attr.name]="fieldId('componentType')"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="webNode()!.componentType"
                (ngModelChange)="updateComponentType($event)"
              >
                @for (component of componentTypes; track component) {
                <option [value]="component">{{ component }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('webText')"
                >Text</label
              >
              <input
                [id]="fieldId('webText')"
                [attr.name]="fieldId('webText')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.text"
                (ngModelChange)="updateData('text', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('variant')"
                >Variant</label
              >
              <input
                [id]="fieldId('variant')"
                [attr.name]="fieldId('variant')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.variant"
                (ngModelChange)="updateData('variant', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('label')"
                >Label</label
              >
              <input
                [id]="fieldId('label')"
                [attr.name]="fieldId('label')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.label"
                (ngModelChange)="updateData('label', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('placeholder')"
                >Placeholder</label
              >
              <input
                [id]="fieldId('placeholder')"
                [attr.name]="fieldId('placeholder')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.placeholder"
                (ngModelChange)="updateData('placeholder', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('inputType')"
                >Input Type</label
              >
              <input
                [id]="fieldId('inputType')"
                [attr.name]="fieldId('inputType')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.inputType"
                (ngModelChange)="updateData('inputType', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('title')"
                >Title</label
              >
              <input
                [id]="fieldId('title')"
                [attr.name]="fieldId('title')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.title"
                (ngModelChange)="updateData('title', $event)"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('content')"
                >Content</label
              >
              <textarea
                [id]="fieldId('content')"
                [attr.name]="fieldId('content')"
                rows="3"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="node()!.data?.content"
                (ngModelChange)="updateData('content', $event)"
              ></textarea>
            </div>
          </div>
        </details>
        }
      </div>
      }
    </div>
  `,
})
export class InspectorComponent {
  private diagramService = inject(DiagramService);
  readonly shapeTypes = [
    'rectangle',
    'rounded-rectangle',
    'document',
    'cylinder',
    'diamond',
    'bpmn-task',
    'bpmn-start-event',
    'bpmn-end-event',
    'bpmn-gateway',
    'bpmn-pool',
  ];
  readonly componentTypes = ['button', 'input', 'card'];

  selectedNodes = computed(() => {
    const selectedIds = this.diagramService.selection();
    return this.diagramService.nodes().filter((node) => selectedIds.has(node.id));
  });

  selectedEdge = computed(() => {
    const edgeId = this.diagramService.selectedEdgeId();
    if (!edgeId) return null;
    return this.diagramService.edges().find((edge) => edge.id === edgeId) || null;
  });

  node = computed(() => this.selectedNodes()[0] || null);

  shapeNode(): ShapeNode | null {
    const n = this.node();
    return n && n.type === 'shape' ? (n as ShapeNode) : null;
  }

  webNode(): WebNode | null {
    const n = this.node();
    return n && n.type === 'web-component' ? (n as WebNode) : null;
  }

  isShapeNode(): boolean {
    return this.node()?.type === 'shape';
  }

  isWebNode(): boolean {
    return this.node()?.type === 'web-component';
  }

  updateNumber(field: keyof DiagramNode, value: number) {
    const n = this.node();
    if (!n) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, parsed);
    this.diagramService.updateNode(n.id, { [field]: clamped });
  }

  updateShapeType(value: string) {
    const n = this.shapeNode();
    if (!n) return;
    this.diagramService.updateNode(n.id, { shapeType: value });
  }

  updateComponentType(value: string) {
    const n = this.webNode();
    if (!n) return;
    this.diagramService.updateNode(n.id, { componentType: value });
  }

  updateData(key: string, value: any) {
    const n = this.node();
    if (!n) return;
    this.diagramService.updateNodeData(n.id, { [key]: value });
  }

  updateEdgeStyle(style: { stroke?: string; strokeWidth?: number }) {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.diagramService.setEdgeStyle(edge.id, style);
  }

  updateEdgeStyleNumber(field: 'strokeWidth', value: number) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(1, parsed);
    this.diagramService.setEdgeStyle(edge.id, { [field]: clamped });
  }

  updateEdgeMarker(event: Event) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.diagramService.updateEdge(edge.id, { markerEnd: checked ? 'arrow' : undefined });
  }

  deleteSelectedEdge() {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.diagramService.removeEdge(edge.id);
  }

  fieldId(field: string): string {
    const n = this.node();
    const id = n?.id ?? 'none';
    return `inspector-${id}-${field}`;
  }

  edgeFieldId(field: string): string {
    const edge = this.selectedEdge();
    const id = edge?.id ?? 'none';
    return `inspector-edge-${id}-${field}`;
  }
}
