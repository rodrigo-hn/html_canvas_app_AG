import { Component, HostListener, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramNode, Point, ShapeNode, WebNode } from '../../core/models/diagram.model';
import { DiagramStore } from '../../core/services/diagram-store.service';
import { DiagramCommands } from '../../core/services/diagram-commands.service';
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
      [dragDisabled]="isResizing || isEditingText"
      [snapToGrid]="store.snapToGrid()"
      [gridSize]="store.gridSize()"
      [zoom]="zoom"
      [startPosition]="{ x: node.x, y: node.y }"
      (dragStart)="onDragStart()"
      (dragMove)="onDragMove($event)"
      (dragEnd)="onDragEnd()"
      [class.ring-2]="isSelected()"
      [class.ring-blue-600]="isSelected()"
      [style.left.px]="node.x"
      [style.top.px]="node.y"
      [style.width.px]="node.width"
      [style.height.px]="node.height"
      [style.z-index]="node.zIndex"
      (click)="onSelect($event)"
      (dblclick)="onDoubleClick($event)"
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
          *ngIf="shapeNode()?.data?.text && !isEditingText"
          x="0"
          y="0"
          [attr.width]="node.width"
          [attr.height]="node.height"
        >
          @if (isTaskTemplateNode()) {
          <div class="w-full h-full flex items-center gap-2 px-3 text-sm pointer-events-none">
            <div class="shrink-0 w-7 h-7 text-slate-700" [innerHTML]="taskIconSvg()"></div>
            <div class="leading-tight">{{ shapeNode()!.data.text }}</div>
          </div>
          } @else {
          <div
            class="w-full h-full flex items-center justify-center text-center p-1 text-sm pointer-events-none"
          >
            {{ shapeNode()!.data.text }}
          </div>
          }
        </foreignObject>
      </svg>

      <!-- Web Components -->
      <div *ngIf="node.type === 'web-component'" class="w-full h-full">
        <app-web-node-wrapper [node]="asWebNode(node)"></app-web-node-wrapper>
      </div>

      @if (isEditingText) {
      <input
        class="absolute inset-0 w-full h-full bg-white/90 border border-blue-400 px-2 text-sm"
        [value]="editTextValue"
        (input)="onEditTextInput($event)"
        (blur)="onEditTextCommit()"
        (keydown)="onEditTextKeydown($event)"
      />
      }

      <!-- Resize Handles (only when selected) -->
      @if (isSelected()) {
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -top-1 -left-1 cursor-nwse-resize"
        (mousedown)="startResize('nw', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -top-1 -right-1 cursor-nesw-resize"
        (mousedown)="startResize('ne', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -bottom-1 -left-1 cursor-nesw-resize"
        (mousedown)="startResize('sw', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -bottom-1 -right-1 cursor-nwse-resize"
        (mousedown)="startResize('se', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -top-1 left-1/2 -translate-x-1/2 cursor-ns-resize"
        (mousedown)="startResize('n', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize"
        (mousedown)="startResize('s', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -left-1 top-1/2 -translate-y-1/2 cursor-ew-resize"
        (mousedown)="startResize('w', $event)"
        (click)="onResizeClick($event)"
      ></div>
      <div
        class="absolute w-2 h-2 bg-white border border-blue-600 -right-1 top-1/2 -translate-y-1/2 cursor-ew-resize"
        (mousedown)="startResize('e', $event)"
        (click)="onResizeClick($event)"
      ></div>
      }

      <!-- Connection Ports (only when selected) -->
      @if (isSelected()) {
      <div
        class="absolute w-3 h-3 rounded-full bg-white border border-indigo-500 -top-2 left-1/2 -translate-x-1/2 cursor-crosshair"
        title="Conectar desde puerto superior"
        (mousedown)="startEdge('top', $event)"
      ></div>
      <div
        class="absolute w-3 h-3 rounded-full bg-white border border-indigo-500 -right-2 top-1/2 -translate-y-1/2 cursor-crosshair"
        title="Conectar desde puerto derecho"
        (mousedown)="startEdge('right', $event)"
      ></div>
      <div
        class="absolute w-3 h-3 rounded-full bg-white border border-indigo-500 -bottom-2 left-1/2 -translate-x-1/2 cursor-crosshair"
        title="Conectar desde puerto inferior"
        (mousedown)="startEdge('bottom', $event)"
      ></div>
      <div
        class="absolute w-3 h-3 rounded-full bg-white border border-indigo-500 -left-2 top-1/2 -translate-y-1/2 cursor-crosshair"
        title="Conectar desde puerto izquierdo"
        (mousedown)="startEdge('left', $event)"
      ></div>
      }
    </div>
  `,
  styles: [],
})
export class NodeRendererComponent {
  @Input({ required: true }) node!: DiagramNode;
  @Input() zoom = 1;

  readonly store = inject(DiagramStore);
  readonly commands = inject(DiagramCommands);
  private stencilService = inject(StencilService);
  private lastDragMoveAt = 0;
  private lastResizeEndAt = 0;
  private resizeState: {
    handle: string;
    startMouse: Point;
    startNode: { x: number; y: number; width: number; height: number };
  } | null = null;
  isResizing = false;

  isSelected = computed(() => this.store.selection().has(this.node.id));
  isEditingText = false;
  editTextValue = '';

  shapeNode(): ShapeNode | null {
    return this.node.type === 'shape' ? (this.node as ShapeNode) : null;
  }

  isTaskTemplateNode(): boolean {
    if (this.node.type !== 'shape') return false;
    const taskLike = new Set([
      'bpmn-task',
      'bpmn-subprocess',
      'bpmn-call-activity',
      'bpmn-transaction',
      'bpmn-event-subprocess',
    ]);
    return taskLike.has(this.node.shapeType);
  }

  taskIconSvg(): string {
    const shape = this.shapeNode();
    const kind = String((shape?.data as { taskKind?: string } | undefined)?.taskKind || '').toLowerCase();
    if (kind === 'receive') return this.iconEnvelope();
    if (kind === 'prepare') return this.iconChef();
    if (kind === 'bake') return this.iconOven();
    if (kind === 'pack') return this.iconBox();
    if (kind === 'deliver') return this.iconScooter();
    if (kind === 'pickup') return this.iconScooter();
    return this.iconTask();
  }

  private iconTask(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h10"/></svg>`;
  }

  private iconEnvelope(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>`;
  }

  private iconChef(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 13h12v6H6z"/><path d="M7 13a3 3 0 116 0 3 3 0 116 0"/></svg>`;
  }

  private iconOven(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><rect x="7" y="11" width="10" height="6" rx="1"/></svg>`;
  }

  private iconBox(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/></svg>`;
  }

  private iconScooter(): string {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M7 17h6l2-5h3"/><path d="M11 7h3l2 5"/><path d="M10 7h1"/></svg>`;
  }

  onSelect(event: MouseEvent) {
    if (Date.now() - this.lastDragMoveAt < 200) {
      return;
    }
    if (Date.now() - this.lastResizeEndAt < 200) {
      return;
    }
    event.stopPropagation();
    const meta = event.metaKey || event.shiftKey;
    this.commands.toggleSelection(this.node.id, meta);

    if (!this.isEditingText) {
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
        active.blur();
      }
      const canvasRoot = document.getElementById('canvas-root') as HTMLElement | null;
      canvasRoot?.focus();
    }
  }

  onDragStart() {
    if (this.isResizing) return;
    this.commands.beginDrag(this.node.id);
  }

  onDragMove(pos: Point) {
    if (this.isResizing) return;
    this.lastDragMoveAt = Date.now();
    this.commands.dragMove(this.node.id, pos);
  }

  onDragEnd() {
    if (this.isResizing) return;
    this.commands.endDrag();
  }

  onDoubleClick(event: MouseEvent) {
    if (!this.canEditText()) return;
    event.stopPropagation();
    this.isEditingText = true;
    this.editTextValue = this.shapeNode()?.data?.text ?? '';
  }

  onEditTextCommit() {
    if (!this.isEditingText) return;
    const node = this.shapeNode();
    if (node) {
      this.commands.updateNodeData(this.node.id, { text: this.editTextValue });
    }
    this.isEditingText = false;
  }

  onEditTextInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    this.editTextValue = target.value;
  }

  onEditTextCancel() {
    this.isEditingText = false;
  }

  onEditTextKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onEditTextCommit();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onEditTextCancel();
    }
  }

  startResize(handle: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.isResizing = true;
    this.resizeState = {
      handle,
      startMouse: { x: event.clientX, y: event.clientY },
      startNode: { x: this.node.x, y: this.node.y, width: this.node.width, height: this.node.height },
    };
  }

  onResizeClick(event: MouseEvent) {
    event.stopPropagation();
  }

  startEdge(port: 'top' | 'right' | 'bottom' | 'left', event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    const point = this.getPortPoint(port);
    this.commands.startEdgePreview(this.node.id, port, point);
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent) {
    if (!this.isResizing || !this.resizeState) return;
    const { handle, startMouse, startNode } = this.resizeState;
    const deltaX = (event.clientX - startMouse.x) / this.zoom;
    const deltaY = (event.clientY - startMouse.y) / this.zoom;
    const minWidth = 20;
    const minHeight = 20;

    let nextX = startNode.x;
    let nextY = startNode.y;
    let nextWidth = startNode.width;
    let nextHeight = startNode.height;

    if (handle.includes('e')) {
      nextWidth = Math.max(minWidth, startNode.width + deltaX);
    }
    if (handle.includes('s')) {
      nextHeight = Math.max(minHeight, startNode.height + deltaY);
    }
    if (handle.includes('w')) {
      nextWidth = Math.max(minWidth, startNode.width - deltaX);
      nextX = startNode.x + (startNode.width - nextWidth);
    }
    if (handle.includes('n')) {
      nextHeight = Math.max(minHeight, startNode.height - deltaY);
      nextY = startNode.y + (startNode.height - nextHeight);
    }

    this.commands.updateNode(this.node.id, {
      x: nextX,
      y: nextY,
      width: nextWidth,
      height: nextHeight,
    });
  }

  @HostListener('document:mouseup')
  onResizeEnd() {
    if (!this.isResizing) return;
    this.isResizing = false;
    this.resizeState = null;
    this.lastResizeEndAt = Date.now();
  }

  getShapeContent() {
    if (this.node.type !== 'shape') return '';
    const shapeNode = this.node as ShapeNode;
    return this.stencilService.getShapeSVG(shapeNode.shapeType, this.node.width, this.node.height);
  }

  asWebNode(node: DiagramNode): WebNode {
    return node as WebNode;
  }

  private getPortPoint(port: 'top' | 'right' | 'bottom' | 'left'): Point {
    switch (port) {
      case 'top':
        return { x: this.node.x + this.node.width / 2, y: this.node.y };
      case 'right':
        return { x: this.node.x + this.node.width, y: this.node.y + this.node.height / 2 };
      case 'bottom':
        return { x: this.node.x + this.node.width / 2, y: this.node.y + this.node.height };
      case 'left':
        return { x: this.node.x, y: this.node.y + this.node.height / 2 };
    }
  }

  canEditText(): boolean {
    if (this.node.type === 'shape') return true;
    if (this.node.type === 'web-component') {
      const web = this.node as WebNode;
      return web.componentType === 'button';
    }
    return false;
  }
}
