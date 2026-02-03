import { Injectable, signal, computed } from '@angular/core';
import {
  DiagramModel,
  DiagramNode,
  DiagramEdge,
  ShapeNode,
  WebNode,
  Point,
} from '../models/diagram.model';

@Injectable({
  providedIn: 'root',
})
export class DiagramService {
  // Signals for state
  private nodesSignal = signal<DiagramNode[]>([]);
  private edgesSignal = signal<DiagramEdge[]>([]);
  private selectionSignal = signal<Set<string>>(new Set());
  private dragStartPositions = new Map<string, Point>();
  private isDragging = false;
  private lastDragEndAt = 0;
  private snapToGridSignal = signal<boolean>(true);
  private gridSizeSignal = signal<number>(20);
  private edgePreviewSignal = signal<{
    sourceId: string;
    sourcePort: 'top' | 'right' | 'bottom' | 'left';
    targetPoint: Point;
  } | null>(null);
  private selectedEdgeIdSignal = signal<string | null>(null);

  // Computed
  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();
  readonly snapToGrid = this.snapToGridSignal.asReadonly();
  readonly gridSize = this.gridSizeSignal.asReadonly();
  readonly edgePreview = this.edgePreviewSignal.asReadonly();
  readonly selectedEdgeId = this.selectedEdgeIdSignal.asReadonly();

  constructor() {
    // Initialize with some dummy data for now
    this.addNode({
      id: '1',
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      zIndex: 1,
      data: { text: 'Start Process' },
      style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 2 },
    } as ShapeNode);

    this.addNode({
      id: '2',
      type: 'shape',
      shapeType: 'cylinder',
      x: 300,
      y: 150,
      width: 80,
      height: 100,
      zIndex: 1,
      data: { text: 'Database' },
    } as ShapeNode);

    this.addNode({
      id: '3',
      type: 'shape',
      shapeType: 'bpmn-task',
      x: 140,
      y: 300,
      width: 140,
      height: 80,
      zIndex: 1,
      data: { text: 'User Task' },
    } as ShapeNode);

    this.addNode({
      id: '4',
      type: 'web-component',
      componentType: 'button',
      x: 400,
      y: 400,
      width: 100,
      height: 40,
      zIndex: 1,
      data: { text: 'Save', variant: 'success' },
    } as WebNode);

    this.addNode({
      id: '5',
      type: 'web-component',
      componentType: 'card',
      x: 550,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 0,
      data: { title: 'User Profile', content: 'Details regarding the user...' },
    } as WebNode);

    this.addEdge({
      id: 'e1',
      sourceId: '1',
      targetId: '4',
      sourcePort: 'right',
      targetPort: 'left',
      zIndex: 0,
      points: [],
      markerEnd: 'arrow',
      style: { stroke: '#333', strokeWidth: 2 },
    });
  }

  // Actions
  // Actions
  addNode(node: DiagramNode) {
    this.nodesSignal.update((nodes) => [...nodes, node]);
  }

  addEdge(edge: DiagramEdge) {
    this.edgesSignal.update((edges) => [...edges, edge]);
  }

  removeEdge(edgeId: string) {
    this.edgesSignal.update((edges) => edges.filter((e) => e.id !== edgeId));
    if (this.selectedEdgeIdSignal() === edgeId) {
      this.selectedEdgeIdSignal.set(null);
    }
  }

  updateEdge(id: string, changes: Partial<DiagramEdge>) {
    this.edgesSignal.update((edges) => edges.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  setEdgeStyle(id: string, style: DiagramEdge['style']) {
    this.edgesSignal.update((edges) =>
      edges.map((e) => (e.id === id ? { ...e, style: { ...(e.style || {}), ...(style || {}) } } : e))
    );
  }

  removeNode(nodeId: string) {
    this.nodesSignal.update((nodes) => nodes.filter((n) => n.id !== nodeId));
    this.edgesSignal.update((edges) =>
      edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId)
    );
    this.selectionSignal.update((sel) => {
      const newSel = new Set(sel);
      newSel.delete(nodeId);
      return newSel;
    });
  }

  updateNode(id: string, changes: Partial<DiagramNode> & Partial<ShapeNode> & Partial<WebNode>) {
    this.nodesSignal.update((nodes) => nodes.map((n) => (n.id === id ? { ...n, ...changes } : n)));
  }

  updateNodeData(id: string, changes: Record<string, any>) {
    this.nodesSignal.update((nodes) =>
      nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...(n.data || {}),
                ...changes,
              },
            }
          : n
      )
    );
  }

  toggleSelection(id: string, multi: boolean) {
    this.selectedEdgeIdSignal.set(null);
    this.selectionSignal.update((sel) => {
      const newSel = multi ? new Set<string>(sel) : new Set<string>();
      if (sel.has(id) && multi) {
        newSel.delete(id);
      } else {
        newSel.add(id);
      }
      return newSel;
    });
  }

  clearSelection() {
    this.selectionSignal.set(new Set());
    this.selectedEdgeIdSignal.set(null);
  }

  setSnapToGrid(enabled: boolean) {
    this.snapToGridSignal.set(enabled);
  }

  setGridSize(size: number) {
    const next = Number.isFinite(size) && size > 2 ? Math.round(size) : 2;
    this.gridSizeSignal.set(next);
  }

  setSelection(ids: string[], additive: boolean) {
    this.selectedEdgeIdSignal.set(null);
    if (!additive) {
      this.selectionSignal.set(new Set(ids));
      return;
    }
    this.selectionSignal.update((sel) => {
      const next = new Set(sel);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  exportJson(): string {
    const model = { nodes: this.nodesSignal(), edges: this.edgesSignal() };
    return JSON.stringify(model, null, 2);
  }

  loadFromJson(json: string) {
    const parsed = JSON.parse(json) as { nodes: DiagramNode[]; edges: DiagramEdge[] };
    if (!parsed?.nodes || !parsed?.edges) {
      throw new Error('Invalid diagram JSON');
    }
    this.nodesSignal.set(parsed.nodes);
    this.edgesSignal.set(parsed.edges);
    this.selectionSignal.set(new Set());
    this.selectedEdgeIdSignal.set(null);
  }

  saveToLocalStorage(key = 'diagram-builder') {
    const model = { nodes: this.nodesSignal(), edges: this.edgesSignal() };
    localStorage.setItem(key, JSON.stringify(model));
  }

  loadFromLocalStorage(key = 'diagram-builder'): boolean {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    this.loadFromJson(raw);
    return true;
  }

  beginDrag(activeNodeId: string) {
    this.isDragging = true;
    const currentSelection = this.selectionSignal();
    if (!currentSelection.has(activeNodeId)) {
      this.selectionSignal.set(new Set([activeNodeId]));
    }

    const selectedIds = new Set(this.selectionSignal());
    this.dragStartPositions.clear();
    this.nodesSignal().forEach((node) => {
      if (selectedIds.has(node.id)) {
        this.dragStartPositions.set(node.id, { x: node.x, y: node.y });
      }
    });
  }

  dragMove(activeNodeId: string, position: Point) {
    const activeStart = this.dragStartPositions.get(activeNodeId);
    if (!activeStart) {
      this.updateNode(activeNodeId, { x: position.x, y: position.y });
      return;
    }

    const deltaX = position.x - activeStart.x;
    const deltaY = position.y - activeStart.y;

    this.nodesSignal.update((nodes) =>
      nodes.map((node) => {
        const start = this.dragStartPositions.get(node.id);
        if (!start) return node;
        return {
          ...node,
          x: start.x + deltaX,
          y: start.y + deltaY,
        };
      })
    );
  }

  endDrag() {
    this.isDragging = false;
    this.lastDragEndAt = Date.now();
    this.dragStartPositions.clear();
  }

  shouldIgnoreBackgroundClick(): boolean {
    if (this.isDragging) return true;
    return Date.now() - this.lastDragEndAt < 200;
  }

  selectEdge(edgeId: string | null) {
    this.selectionSignal.set(new Set());
    this.selectedEdgeIdSignal.set(edgeId);
  }

  startEdgePreview(sourceId: string, sourcePort: 'top' | 'right' | 'bottom' | 'left', point: Point) {
    this.edgePreviewSignal.set({ sourceId, sourcePort, targetPoint: point });
  }

  updateEdgePreview(point: Point) {
    const preview = this.edgePreviewSignal();
    if (!preview) return;
    this.edgePreviewSignal.set({ ...preview, targetPoint: point });
  }

  clearEdgePreview() {
    this.edgePreviewSignal.set(null);
  }
}
