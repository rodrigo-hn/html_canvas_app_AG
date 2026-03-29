import { DiagramEdge, DiagramModel, DiagramNode, Point } from '../models/diagram.model';
import { AnyPersistedDiagramModel, CURRENT_DIAGRAM_MODEL_VERSION, DiagramMigrationResult } from '../models/diagram-schema';

function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['x'] === 'number' &&
    Number.isFinite(candidate['x']) &&
    typeof candidate['y'] === 'number' &&
    Number.isFinite(candidate['y'])
  );
}

function sanitizeNodes(nodes: unknown): DiagramNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((node): node is DiagramNode => !!node && typeof node === 'object') as DiagramNode[];
}

function migrateEdgeToV2(edge: DiagramEdge): DiagramEdge {
  const points = Array.isArray(edge.points) ? edge.points.filter(isPoint) : [];
  return {
    ...edge,
    points,
    labelPosition: edge.labelPosition && isPoint(edge.labelPosition) ? edge.labelPosition : undefined,
  };
}

function sanitizeEdges(edges: unknown): DiagramEdge[] {
  if (!Array.isArray(edges)) return [];
  return (edges.filter((edge): edge is DiagramEdge => !!edge && typeof edge === 'object') as DiagramEdge[]).map(migrateEdgeToV2);
}

function migrateLegacyToV2(input: AnyPersistedDiagramModel): DiagramModel {
  return {
    modelVersion: CURRENT_DIAGRAM_MODEL_VERSION,
    nodes: sanitizeNodes(input.nodes),
    edges: sanitizeEdges(input.edges),
  };
}

export function migrateDiagramModel(input: unknown): DiagramMigrationResult {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid diagram JSON');
  }
  const parsed = input as AnyPersistedDiagramModel;
  if (!('nodes' in parsed) || !('edges' in parsed)) {
    throw new Error('Invalid diagram JSON');
  }

  const fromVersion = typeof parsed.modelVersion === 'number' ? parsed.modelVersion : 1;
  if (fromVersion > CURRENT_DIAGRAM_MODEL_VERSION) {
    throw new Error(`Unsupported diagram modelVersion: ${fromVersion}`);
  }

  if (fromVersion === CURRENT_DIAGRAM_MODEL_VERSION) {
    return {
      fromVersion,
      toVersion: CURRENT_DIAGRAM_MODEL_VERSION,
      model: {
        modelVersion: CURRENT_DIAGRAM_MODEL_VERSION,
        nodes: sanitizeNodes(parsed.nodes),
        edges: sanitizeEdges(parsed.edges),
      },
    };
  }

  return {
    fromVersion,
    toVersion: CURRENT_DIAGRAM_MODEL_VERSION,
    model: migrateLegacyToV2(parsed),
  };
}
