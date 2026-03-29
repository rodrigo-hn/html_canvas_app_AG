import { DiagramEdge, DiagramModel, DiagramNode } from './diagram.model';

export const CURRENT_DIAGRAM_MODEL_VERSION = 2;

export interface PersistedDiagramModelV2 {
  modelVersion: 2;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface PersistedDiagramModelLegacy {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  modelVersion?: undefined;
}

export type AnyPersistedDiagramModel = PersistedDiagramModelLegacy | PersistedDiagramModelV2;

export interface DiagramMigrationResult {
  model: DiagramModel;
  fromVersion: number;
  toVersion: number;
}
