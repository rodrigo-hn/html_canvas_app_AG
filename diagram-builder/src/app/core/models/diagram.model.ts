export type NodeType = 'shape' | 'web-component';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DiagramElement {
  id: string;
  selected?: boolean;
  zIndex: number;
}

export interface DiagramNode extends DiagramElement, Point, Size {
  type: NodeType;
  data: any; // Flexible data bag for specific properties
  rotation?: number;
}

export interface ShapeNode extends DiagramNode {
  type: 'shape';
  shapeType: string; // e.g., 'rectangle', 'bpmn-task'
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface WebNode extends DiagramNode {
  type: 'web-component';
  componentType: string; // e.g., 'button', 'card'
}

export interface DiagramEdge extends DiagramElement {
  sourceId: string;
  targetId: string;
  points: Point[];
  markerEnd?: string; // 'arrow'
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
