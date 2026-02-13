export type NodeType = 'shape' | 'web-component';
export type WebComponentType = 'button' | 'input' | 'card';
export type BpmnFlowType = 'sequence' | 'message' | 'association';

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

export interface DiagramNodeBase extends DiagramElement, Point, Size {
  type: NodeType;
  rotation?: number;
}

export interface ShapeData {
  text?: string;
  taskKind?: 'receive' | 'prepare' | 'bake' | 'pack' | 'deliver' | 'pickup' | string;
  eventMarker?: 'check' | 'cross' | 'message' | 'timer' | 'signal' | string;
}

export interface ShapeNode extends DiagramNodeBase {
  type: 'shape';
  shapeType: string; // e.g., 'rectangle', 'bpmn-task'
  data: ShapeData;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface WebButtonData {
  text?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

export interface WebInputData {
  label?: string;
  placeholder?: string;
  inputType?: string;
}

export interface WebCardData {
  title?: string;
  content?: string;
}

export interface WebButtonNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'button';
  data: WebButtonData;
}

export interface WebInputNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'input';
  data: WebInputData;
}

export interface WebCardNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'card';
  data: WebCardData;
}

export type WebNode = WebButtonNode | WebInputNode | WebCardNode;

export type DiagramNode = ShapeNode | WebNode;

export interface DiagramEdge extends DiagramElement {
  sourceId: string;
  targetId: string;
  sourcePort?: 'top' | 'right' | 'bottom' | 'left';
  targetPort?: 'top' | 'right' | 'bottom' | 'left';
  flowType?: BpmnFlowType;
  label?: string;
  points: Point[];
  markerEnd?: string; // 'arrow'
  markerStart?: string;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    cornerRadius?: number;
    dashArray?: string;
  };
}

export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
