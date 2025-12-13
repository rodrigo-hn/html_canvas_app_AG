import { Injectable, signal, computed } from '@angular/core';
import {
  DiagramModel,
  DiagramNode,
  DiagramEdge,
  ShapeNode,
  WebNode,
} from '../models/diagram.model';

@Injectable({
  providedIn: 'root',
})
export class DiagramService {
  // Signals for state
  private nodesSignal = signal<DiagramNode[]>([]);
  private edgesSignal = signal<DiagramEdge[]>([]);
  private selectionSignal = signal<Set<string>>(new Set());

  // Computed
  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();

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
  }

  // Actions
  addNode(node: DiagramNode) {
    this.nodesSignal.update((nodes) => [...nodes, node]);
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

  updateNode(id: string, changes: Partial<DiagramNode>) {
    this.nodesSignal.update((nodes) => nodes.map((n) => (n.id === id ? { ...n, ...changes } : n)));
  }

  toggleSelection(id: string, multi: boolean) {
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
  }
}
