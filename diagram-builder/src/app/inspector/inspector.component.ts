import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramStore } from '../core/services/diagram-store.service';
import { DiagramCommands } from '../core/services/diagram-commands.service';
import { DiagramNode, ShapeNode, WebComponentType, WebNode } from '../core/models/diagram.model';

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
          <button
            class="w-full bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded hover:bg-slate-300"
            (click)="resetEdgeBend()"
          >
            Reset Bend
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
              [checked]="(selectedEdge()!.style?.cornerRadius || 0) > 0"
              (change)="toggleEdgeCurves($event)"
            />
            Rounded corners
          </label>
          <div>
            <label class="block text-xs font-semibold mb-1" [attr.for]="edgeFieldId('cornerRadius')"
              >Corner Radius</label
            >
            <input
              [id]="edgeFieldId('cornerRadius')"
              [attr.name]="edgeFieldId('cornerRadius')"
              type="number"
              min="0"
              class="w-full border rounded px-2 py-1 text-sm"
              [ngModel]="selectedEdge()!.style?.cornerRadius || 0"
              (ngModelChange)="updateEdgeCornerRadius($event)"
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
      <button
        class="mt-3 w-full bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
        (click)="deleteSelectedNodes()"
      >
        Delete Selected Nodes
      </button>
      } @else {
      <div class="space-y-4">
        <div class="text-xs text-slate-500">ID: {{ node()!.id }}</div>
        <div class="text-xs text-slate-500">Type: {{ node()!.type }}</div>
        <button
          class="w-full bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
          (click)="deleteCurrentNode()"
        >
          Delete Node
        </button>

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
                [ngModel]="shapeNode()!.data?.text"
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
            @if (isButtonNode()) {
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('webText')"
                >Text</label
              >
              <input
                [id]="fieldId('webText')"
                [attr.name]="fieldId('webText')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="buttonNode()!.data?.text"
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
                [ngModel]="buttonNode()!.data?.variant"
                (ngModelChange)="updateData('variant', $event)"
              />
            </div>
            }

            @if (isInputNode()) {
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('label')"
                >Label</label
              >
              <input
                [id]="fieldId('label')"
                [attr.name]="fieldId('label')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="inputNode()!.data?.label"
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
                [ngModel]="inputNode()!.data?.placeholder"
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
                [ngModel]="inputNode()!.data?.inputType"
                (ngModelChange)="updateData('inputType', $event)"
              />
            </div>
            }

            @if (isCardNode()) {
            <div>
              <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('title')"
                >Title</label
              >
              <input
                [id]="fieldId('title')"
                [attr.name]="fieldId('title')"
                type="text"
                class="w-full border rounded px-2 py-1 text-sm"
                [ngModel]="cardNode()!.data?.title"
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
                [ngModel]="cardNode()!.data?.content"
                (ngModelChange)="updateData('content', $event)"
              ></textarea>
            </div>
            }
          </div>
        </details>
        }
      </div>
      }
    </div>
  `,
})
export class InspectorComponent {
  private store = inject(DiagramStore);
  private commands = inject(DiagramCommands);
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
    const selectedIds = this.store.selection();
    return this.store.nodes().filter((node) => selectedIds.has(node.id));
  });

  selectedEdge = computed(() => {
    const edgeId = this.store.selectedEdgeId();
    if (!edgeId) return null;
    return this.store.edges().find((edge) => edge.id === edgeId) || null;
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

  buttonNode() {
    const n = this.webNode();
    return n && n.componentType === 'button' ? n : null;
  }

  inputNode() {
    const n = this.webNode();
    return n && n.componentType === 'input' ? n : null;
  }

  cardNode() {
    const n = this.webNode();
    return n && n.componentType === 'card' ? n : null;
  }

  isShapeNode(): boolean {
    return this.node()?.type === 'shape';
  }

  isWebNode(): boolean {
    return this.node()?.type === 'web-component';
  }

  isButtonNode(): boolean {
    return this.webNode()?.componentType === 'button';
  }

  isInputNode(): boolean {
    return this.webNode()?.componentType === 'input';
  }

  isCardNode(): boolean {
    return this.webNode()?.componentType === 'card';
  }

  updateNumber(field: keyof DiagramNode, value: number) {
    const n = this.node();
    if (!n) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, parsed);
    this.commands.updateNode(n.id, { [field]: clamped });
  }

  updateShapeType(value: string) {
    const n = this.shapeNode();
    if (!n) return;
    this.commands.updateNode(n.id, { shapeType: value });
  }

  updateComponentType(value: string) {
    const n = this.webNode();
    if (!n) return;
    this.commands.updateNode(n.id, { componentType: value as WebComponentType });
  }

  updateData(key: string, value: any) {
    const n = this.node();
    if (!n) return;
    this.commands.updateNodeData(n.id, { [key]: value });
  }

  updateEdgeStyle(style: { stroke?: string; strokeWidth?: number; cornerRadius?: number }) {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.commands.setEdgeStyle(edge.id, style);
  }

  updateEdgeStyleNumber(field: 'strokeWidth', value: number) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(1, parsed);
    this.commands.setEdgeStyle(edge.id, { [field]: clamped });
  }

  updateEdgeCornerRadius(value: number) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    const clamped = Math.max(0, parsed);
    this.commands.setEdgeStyle(edge.id, { cornerRadius: clamped });
  }

  toggleEdgeCurves(event: Event) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const checked = (event.target as HTMLInputElement).checked;
    const current = edge.style?.cornerRadius || 0;
    this.commands.setEdgeStyle(edge.id, { cornerRadius: checked ? Math.max(12, current) : 0 });
  }

  updateEdgeMarker(event: Event) {
    const edge = this.selectedEdge();
    if (!edge) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.commands.updateEdge(edge.id, { markerEnd: checked ? 'arrow' : undefined });
  }

  deleteSelectedEdge() {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.commands.removeEdge(edge.id);
  }

  deleteCurrentNode() {
    const n = this.node();
    if (!n) return;
    this.commands.removeNode(n.id);
  }

  deleteSelectedNodes() {
    const nodes = this.selectedNodes();
    if (nodes.length === 0) return;
    nodes.forEach((n) => this.commands.removeNode(n.id));
  }

  resetEdgeBend() {
    const edge = this.selectedEdge();
    if (!edge) return;
    this.commands.updateEdge(edge.id, { points: [] });
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
