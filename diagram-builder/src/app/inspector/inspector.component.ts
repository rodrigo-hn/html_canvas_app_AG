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

      @if (selectedNodes().length === 0) {
      <div class="text-sm text-slate-500">No selection.</div>
      } @else if (selectedNodes().length > 1) {
      <div class="text-sm text-slate-600">
        {{ selectedNodes().length }} nodes selected.
      </div>
      } @else {
      <div class="space-y-4">
        <div class="text-xs text-slate-500">ID: {{ node()!.id }}</div>
        <div class="text-xs text-slate-500">Type: {{ node()!.type }}</div>

        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('x')">X</label>
          <input
            [id]="fieldId('x')"
            [attr.name]="fieldId('x')"
            type="number"
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
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="node()!.height"
            (ngModelChange)="updateNumber('height', $event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('zIndex')">Z-Index</label>
          <input
            [id]="fieldId('zIndex')"
            [attr.name]="fieldId('zIndex')"
            type="number"
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="node()!.zIndex"
            (ngModelChange)="updateNumber('zIndex', $event)"
          />
        </div>

        @if (isShapeNode()) {
        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('shapeType')">Shape Type</label>
          <input
            [id]="fieldId('shapeType')"
            [attr.name]="fieldId('shapeType')"
            type="text"
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="shapeNode()!.shapeType"
            (ngModelChange)="updateShapeType($event)"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('shapeText')">Text</label>
          <input
            [id]="fieldId('shapeText')"
            [attr.name]="fieldId('shapeText')"
            type="text"
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="node()!.data?.text"
            (ngModelChange)="updateData('text', $event)"
          />
        </div>
        }

        @if (isWebNode()) {
        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('componentType')">Component Type</label>
          <select
            [id]="fieldId('componentType')"
            [attr.name]="fieldId('componentType')"
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="webNode()!.componentType"
            (ngModelChange)="updateComponentType($event)"
          >
            <option value="button">button</option>
            <option value="input">input</option>
            <option value="card">card</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('webText')">Text</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('variant')">Variant</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('label')">Label</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('placeholder')">Placeholder</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('inputType')">Input Type</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('title')">Title</label>
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
          <label class="block text-xs font-semibold mb-1" [attr.for]="fieldId('content')">Content</label>
          <textarea
            [id]="fieldId('content')"
            [attr.name]="fieldId('content')"
            rows="3"
            class="w-full border rounded px-2 py-1 text-sm"
            [ngModel]="node()!.data?.content"
            (ngModelChange)="updateData('content', $event)"
          ></textarea>
        </div>
        }
      </div>
      }
    </div>
  `,
})
export class InspectorComponent {
  private diagramService = inject(DiagramService);

  selectedNodes = computed(() => {
    const selectedIds = this.diagramService.selection();
    return this.diagramService.nodes().filter((node) => selectedIds.has(node.id));
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
    this.diagramService.updateNode(n.id, { [field]: parsed });
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

  fieldId(field: string): string {
    const n = this.node();
    const id = n?.id ?? 'none';
    return `inspector-${id}-${field}`;
  }
}
