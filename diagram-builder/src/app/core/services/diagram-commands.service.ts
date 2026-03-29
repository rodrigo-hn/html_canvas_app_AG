import { Injectable } from '@angular/core';
import { DiagramEdge, DiagramNode, Point, ShapeNode, WebNode } from '../models/diagram.model';
import { DiagramStore } from './diagram-store.service';
import { CURRENT_DIAGRAM_MODEL_VERSION } from '../models/diagram-schema';
import { migrateDiagramModel } from './diagram-migrations';

type CommandSnapshot = {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  selection: Set<string>;
  selectedEdgeId: string | null;
};

type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

@Injectable({
  providedIn: 'root',
})
export class DiagramCommands {
  private dragStartPositions = new Map<string, Point>();
  private isDragging = false;
  private lastDragEndAt = 0;
  private historyPast: CommandSnapshot[] = [];
  private historyFuture: CommandSnapshot[] = [];
  private maxHistory = 120;
  private isRestoringHistory = false;
  private transactionDepth = 0;
  private transactionSnapshot: CommandSnapshot | null = null;
  private transactionDirty = false;

  constructor(private store: DiagramStore) {}

  addNode(node: DiagramNode) {
    this.markMutation();
    this.store.updateNodes((nodes) => [...nodes, node]);
  }

  addEdge(edge: DiagramEdge) {
    this.markMutation();
    this.store.updateEdges((edges) => [...edges, edge]);
  }

  removeEdge(edgeId: string) {
    this.markMutation();
    this.store.updateEdges((edges) => edges.filter((e) => e.id !== edgeId));
    if (this.store.selectedEdgeId() === edgeId) {
      this.store.setSelectedEdgeId(null);
    }
  }

  updateEdge(id: string, changes: Partial<DiagramEdge>) {
    this.markMutation();
    this.store.updateEdges((edges) => edges.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  setEdgeStyle(id: string, style: DiagramEdge['style']) {
    this.markMutation();
    this.store.updateEdges((edges) =>
      edges.map((e) => (e.id === id ? { ...e, style: { ...(e.style || {}), ...(style || {}) } } : e))
    );
  }

  removeNode(nodeId: string) {
    this.markMutation();
    this.store.updateNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
    this.store.updateEdges((edges) => edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId));
    this.store.updateSelection((sel) => {
      const next = new Set(sel);
      next.delete(nodeId);
      return next;
    });
  }

  updateNode(id: string, changes: Partial<DiagramNode> & Partial<ShapeNode> & Partial<WebNode>) {
    this.markMutation();
    this.store.updateNodes((nodes) =>
      nodes.map((n) => (n.id === id ? ({ ...n, ...changes } as DiagramNode) : n))
    );
  }

  updateNodeData(id: string, changes: Record<string, unknown>) {
    this.markMutation();
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
    this.markMutation();
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
    this.markMutation();
    this.store.setSelection(new Set());
    this.store.setSelectedEdgeId(null);
  }

  setSelection(ids: string[], additive: boolean) {
    this.markMutation();
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
    this.beginTransaction();
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
    this.commitTransaction();
    this.lastDragEndAt = Date.now();
    this.dragStartPositions.clear();
  }

  shouldIgnoreBackgroundClick(): boolean {
    if (this.isDragging) return true;
    return Date.now() - this.lastDragEndAt < 200;
  }

  selectEdge(edgeId: string | null) {
    this.markMutation();
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
    return JSON.stringify(
      {
        modelVersion: CURRENT_DIAGRAM_MODEL_VERSION,
        nodes: this.store.getNodes(),
        edges: this.store.getEdges(),
      },
      null,
      2
    );
  }

  loadFromJson(json: string) {
    this.markMutation();
    const parsed = JSON.parse(json) as unknown;
    const migrated = migrateDiagramModel(parsed);
    this.store.setNodes(migrated.model.nodes);
    this.store.setEdges(migrated.model.edges);
    this.store.setSelection(new Set());
    this.store.setSelectedEdgeId(null);
  }

  saveToLocalStorage(key = 'diagram-builder') {
    const model = {
      modelVersion: CURRENT_DIAGRAM_MODEL_VERSION,
      nodes: this.store.getNodes(),
      edges: this.store.getEdges(),
    };
    localStorage.setItem(key, JSON.stringify(model));
  }

  loadFromLocalStorage(key = 'diagram-builder'): boolean {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    this.loadFromJson(raw);
    return true;
  }

  beginTransaction() {
    if (this.isRestoringHistory) return;
    if (this.transactionDepth === 0) {
      this.transactionSnapshot = this.createSnapshot();
      this.transactionDirty = false;
    }
    this.transactionDepth += 1;
  }

  commitTransaction() {
    if (this.isRestoringHistory || this.transactionDepth === 0) return;
    this.transactionDepth -= 1;
    if (this.transactionDepth > 0) return;
    if (this.transactionDirty && this.transactionSnapshot) {
      this.pushHistory(this.transactionSnapshot);
      this.historyFuture = [];
    }
    this.transactionSnapshot = null;
    this.transactionDirty = false;
  }

  undo(): boolean {
    if (this.historyPast.length === 0) return false;
    const previous = this.historyPast.pop()!;
    const current = this.createSnapshot();
    this.historyFuture.push(current);
    this.restoreSnapshot(previous);
    return true;
  }

  redo(): boolean {
    if (this.historyFuture.length === 0) return false;
    const next = this.historyFuture.pop()!;
    const current = this.createSnapshot();
    this.historyPast.push(current);
    this.restoreSnapshot(next);
    return true;
  }

  canUndo(): boolean {
    return this.historyPast.length > 0;
  }

  canRedo(): boolean {
    return this.historyFuture.length > 0;
  }

  moveSelectionBy(deltaX: number, deltaY: number) {
    const selectedIds = this.store.getSelection();
    if (selectedIds.size === 0) return;
    this.beginTransaction();
    this.store.updateNodes((nodes) =>
      nodes.map((node) => {
        if (!selectedIds.has(node.id)) return node;
        return {
          ...node,
          x: node.x + deltaX,
          y: node.y + deltaY,
        };
      })
    );
    this.transactionDirty = true;
    this.commitTransaction();
  }

  alignSelection(mode: AlignMode) {
    const selectedIds = this.store.getSelection();
    if (selectedIds.size < 2) return;
    const selected = this.store.getNodes().filter((n) => selectedIds.has(n.id));
    const left = Math.min(...selected.map((n) => n.x));
    const right = Math.max(...selected.map((n) => n.x + n.width));
    const top = Math.min(...selected.map((n) => n.y));
    const bottom = Math.max(...selected.map((n) => n.y + n.height));
    const center = (left + right) / 2;
    const middle = (top + bottom) / 2;
    this.beginTransaction();
    this.store.updateNodes((nodes) =>
      nodes.map((node) => {
        if (!selectedIds.has(node.id)) return node;
        if (mode === 'left') return { ...node, x: left };
        if (mode === 'right') return { ...node, x: right - node.width };
        if (mode === 'center') return { ...node, x: center - node.width / 2 };
        if (mode === 'top') return { ...node, y: top };
        if (mode === 'bottom') return { ...node, y: bottom - node.height };
        return { ...node, y: middle - node.height / 2 };
      })
    );
    this.transactionDirty = true;
    this.commitTransaction();
  }

  distributeSelection(axis: 'horizontal' | 'vertical') {
    const selectedIds = this.store.getSelection();
    if (selectedIds.size < 3) return;
    const selected = this.store
      .getNodes()
      .filter((n) => selectedIds.has(n.id))
      .sort((a, b) => (axis === 'horizontal' ? a.x - b.x : a.y - b.y));
    const first = selected[0];
    const last = selected[selected.length - 1];
    const start = axis === 'horizontal' ? first.x : first.y;
    const end = axis === 'horizontal' ? last.x : last.y;
    const span = end - start;
    if (span <= 0) return;
    const gap = span / (selected.length - 1);
    const targetById = new Map<string, number>();
    selected.forEach((node, index) => {
      targetById.set(node.id, start + gap * index);
    });
    this.beginTransaction();
    this.store.updateNodes((nodes) =>
      nodes.map((node) => {
        if (!targetById.has(node.id)) return node;
        const value = targetById.get(node.id)!;
        return axis === 'horizontal' ? { ...node, x: value } : { ...node, y: value };
      })
    );
    this.transactionDirty = true;
    this.commitTransaction();
  }

  private markMutation() {
    if (this.isRestoringHistory) return;
    if (this.transactionDepth > 0) {
      this.transactionDirty = true;
      return;
    }
    this.pushHistory(this.createSnapshot());
    this.historyFuture = [];
  }

  private pushHistory(snapshot: CommandSnapshot) {
    this.historyPast.push(snapshot);
    if (this.historyPast.length > this.maxHistory) {
      this.historyPast.shift();
    }
  }

  private createSnapshot(): CommandSnapshot {
    return {
      nodes: structuredClone(this.store.getNodes()),
      edges: structuredClone(this.store.getEdges()),
      selection: new Set(this.store.getSelection()),
      selectedEdgeId: this.store.selectedEdgeId(),
    };
  }

  private restoreSnapshot(snapshot: CommandSnapshot) {
    this.isRestoringHistory = true;
    try {
      this.store.setNodes(structuredClone(snapshot.nodes));
      this.store.setEdges(structuredClone(snapshot.edges));
      this.store.setSelection(new Set(snapshot.selection));
      this.store.setSelectedEdgeId(snapshot.selectedEdgeId);
    } finally {
      this.isRestoringHistory = false;
    }
  }
}
