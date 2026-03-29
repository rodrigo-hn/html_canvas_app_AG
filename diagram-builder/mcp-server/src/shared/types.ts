export interface Point {
  x: number;
  y: number;
}

export type NodeType = 'shape' | 'web-component';

export type BpmnFlowType = 'sequence' | 'message' | 'association';

export type BpmnWebTaskVariant = 'blue' | 'yellow' | 'green' | 'purple' | 'red';

export interface DiagramNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  shapeType?: string;
  componentType?: string;
  data?: Record<string, unknown>;
  style?: Record<string, unknown>;
  rotation?: number;
}

export interface DiagramEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: string;
  targetPort?: string;
  flowType?: BpmnFlowType;
  label?: string;
  color?: string;
  points: Point[];
  labelPosition?: Point;
  markerEnd?: string;
  markerStart?: string;
  style?: Record<string, unknown>;
  zIndex: number;
}

export interface DiagramModel {
  modelVersion: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
