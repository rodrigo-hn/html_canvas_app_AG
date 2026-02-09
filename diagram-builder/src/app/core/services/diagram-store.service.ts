import { Injectable, signal } from '@angular/core';
import { DiagramEdge, DiagramNode, Point } from '../models/diagram.model';

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

}
