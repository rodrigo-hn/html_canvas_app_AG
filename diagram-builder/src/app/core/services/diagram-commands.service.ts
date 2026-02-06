import { Injectable } from '@angular/core';
import { DiagramEdge, DiagramNode, Point, ShapeNode, WebNode } from '../models/diagram.model';
import { DiagramStore } from './diagram-store.service';

@Injectable({
  providedIn: 'root',
})
export class DiagramCommands {
  private dragStartPositions = new Map<string, Point>();
  private isDragging = false;
  private lastDragEndAt = 0;

  constructor(private store: DiagramStore) {}

  addNode(node: DiagramNode) {
    this.store.updateNodes((nodes) => [...nodes, node]);
  }

  addEdge(edge: DiagramEdge) {
    this.store.updateEdges((edges) => [...edges, edge]);
  }

  removeEdge(edgeId: string) {
    this.store.updateEdges((edges) => edges.filter((e) => e.id !== edgeId));
    if (this.store.selectedEdgeId() === edgeId) {
      this.store.setSelectedEdgeId(null);
    }
  }

  updateEdge(id: string, changes: Partial<DiagramEdge>) {
    this.store.updateEdges((edges) => edges.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  setEdgeStyle(id: string, style: DiagramEdge['style']) {
    this.store.updateEdges((edges) =>
      edges.map((e) => (e.id === id ? { ...e, style: { ...(e.style || {}), ...(style || {}) } } : e))
    );
  }

  removeNode(nodeId: string) {
    this.store.updateNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
    this.store.updateEdges((edges) => edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId));
    this.store.updateSelection((sel) => {
      const next = new Set(sel);
      next.delete(nodeId);
      return next;
    });
  }

  updateNode(id: string, changes: Partial<DiagramNode> & Partial<ShapeNode> & Partial<WebNode>) {
    this.store.updateNodes((nodes) =>
      nodes.map((n) => (n.id === id ? ({ ...n, ...changes } as DiagramNode) : n))
    );
  }

  updateNodeData(id: string, changes: Record<string, unknown>) {
    this.store.updateNodes((nodes) =>
      nodes.map((n) => {
        if (n.id !== id) return n;
        return {
          ...n,
          data: {
            ...(n.data || {}),
            ...changes,
          },
        } as DiagramNode;
      })
    );
  }

  toggleSelection(id: string, multi: boolean) {
    this.store.setSelectedEdgeId(null);
    this.store.updateSelection((sel) => {
      const next = multi ? new Set<string>(sel) : new Set<string>();
      if (sel.has(id) && multi) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  clearSelection() {
    this.store.setSelection(new Set());
    this.store.setSelectedEdgeId(null);
  }

  setSelection(ids: string[], additive: boolean) {
    this.store.setSelectedEdgeId(null);
    if (!additive) {
      this.store.setSelection(new Set(ids));
      return;
    }
    this.store.updateSelection((sel) => {
      const next = new Set(sel);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }

  setSnapToGrid(enabled: boolean) {
    this.store.setSnapToGrid(enabled);
  }

  setGridSize(size: number) {
    const next = Number.isFinite(size) && size > 2 ? Math.round(size) : 2;
    this.store.setGridSize(next);
  }

  beginDrag(activeNodeId: string) {
    this.isDragging = true;
    const currentSelection = this.store.getSelection();
    if (!currentSelection.has(activeNodeId)) {
      this.store.setSelection(new Set([activeNodeId]));
    }

    const selectedIds = new Set(this.store.getSelection());
    this.dragStartPositions.clear();
    this.store.getNodes().forEach((node) => {
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

    this.store.updateNodes((nodes) =>
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
    this.store.setSelection(new Set());
    this.store.setSelectedEdgeId(edgeId);
  }

  startEdgePreview(sourceId: string, sourcePort: 'top' | 'right' | 'bottom' | 'left', point: Point) {
    this.store.setEdgePreview({ sourceId, sourcePort, targetPoint: point });
  }

  updateEdgePreview(point: Point) {
    const preview = this.store.edgePreview();
    if (!preview) return;
    this.store.setEdgePreview({ ...preview, targetPoint: point });
  }

  clearEdgePreview() {
    this.store.setEdgePreview(null);
  }

  exportJson(): string {
    return JSON.stringify({ nodes: this.store.getNodes(), edges: this.store.getEdges() }, null, 2);
  }

  loadFromJson(json: string) {
    const parsed = JSON.parse(json) as { nodes: DiagramNode[]; edges: DiagramEdge[] };
    if (!parsed?.nodes || !parsed?.edges) {
      throw new Error('Invalid diagram JSON');
    }
    this.store.setNodes(parsed.nodes);
    this.store.setEdges(parsed.edges);
    this.store.setSelection(new Set());
    this.store.setSelectedEdgeId(null);
  }

  saveToLocalStorage(key = 'diagram-builder') {
    const model = { nodes: this.store.getNodes(), edges: this.store.getEdges() };
    localStorage.setItem(key, JSON.stringify(model));
  }

  loadFromLocalStorage(key = 'diagram-builder'): boolean {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    this.loadFromJson(raw);
    return true;
  }
}
