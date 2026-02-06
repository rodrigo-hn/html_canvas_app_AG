import { Injectable, signal } from '@angular/core';
import { DiagramEdge, DiagramNode, Point, ShapeNode, WebNode } from '../models/diagram.model';

@Injectable({
  providedIn: 'root',
})
export class DiagramStore {
  private nodesSignal = signal<DiagramNode[]>([]);
  private edgesSignal = signal<DiagramEdge[]>([]);
  private selectionSignal = signal<Set<string>>(new Set());
  private selectedEdgeIdSignal = signal<string | null>(null);
  private snapToGridSignal = signal<boolean>(true);
  private gridSizeSignal = signal<number>(20);
  private edgePreviewSignal = signal<{
    sourceId: string;
    sourcePort: 'top' | 'right' | 'bottom' | 'left';
    targetPoint: Point;
  } | null>(null);

  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();
  readonly selectedEdgeId = this.selectedEdgeIdSignal.asReadonly();
  readonly snapToGrid = this.snapToGridSignal.asReadonly();
  readonly gridSize = this.gridSizeSignal.asReadonly();
  readonly edgePreview = this.edgePreviewSignal.asReadonly();

  constructor() {
    this.seed();
  }

  getNodes() {
    return this.nodesSignal();
  }

  getEdges() {
    return this.edgesSignal();
  }

  getSelection() {
    return this.selectionSignal();
  }

  setNodes(nodes: DiagramNode[]) {
    this.nodesSignal.set(nodes);
  }

  updateNodes(updater: (nodes: DiagramNode[]) => DiagramNode[]) {
    this.nodesSignal.update(updater);
  }

  setEdges(edges: DiagramEdge[]) {
    this.edgesSignal.set(edges);
  }

  updateEdges(updater: (edges: DiagramEdge[]) => DiagramEdge[]) {
    this.edgesSignal.update(updater);
  }

  setSelection(selection: Set<string>) {
    this.selectionSignal.set(selection);
  }

  updateSelection(updater: (selection: Set<string>) => Set<string>) {
    this.selectionSignal.update(updater);
  }

  setSelectedEdgeId(edgeId: string | null) {
    this.selectedEdgeIdSignal.set(edgeId);
  }

  setSnapToGrid(enabled: boolean) {
    this.snapToGridSignal.set(enabled);
  }

  setGridSize(size: number) {
    this.gridSizeSignal.set(size);
  }

  setEdgePreview(preview: {
    sourceId: string;
    sourcePort: 'top' | 'right' | 'bottom' | 'left';
    targetPoint: Point;
  } | null) {
    this.edgePreviewSignal.set(preview);
  }

  private seed() {
    this.updateNodes((nodes) => {
      const next = [...nodes];
      next.push({
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

      next.push({
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

      next.push({
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

      next.push({
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

      next.push({
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

      return next;
    });

    this.updateEdges((edges) => [
      ...edges,
      {
        id: 'e1',
        sourceId: '1',
        targetId: '4',
        sourcePort: 'right',
        targetPort: 'left',
        zIndex: 0,
        points: [],
        markerEnd: 'arrow',
        style: { stroke: '#333', strokeWidth: 2 },
      },
    ]);
  }
}
