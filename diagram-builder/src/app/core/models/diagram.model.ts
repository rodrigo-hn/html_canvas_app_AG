export type NodeType = 'shape' | 'web-component';
export type WebComponentType =
  | 'button'
  | 'input'
  | 'card'
  | 'bpmn-user-task-web'
  | 'bpmn-service-task-web'
  | 'bpmn-manual-task-web'
  | 'bpmn-subprocess-web'
  | 'bpmn-start-event-web'
  | 'bpmn-exclusive-gateway-web'
  | 'bpmn-end-event-web'
  | 'bpmn-lane-web'
  | 'bpmn-pool-web';
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

export interface WebBpmnTaskData {
  text?: string;
  iconEnabled?: boolean;
  badgeEnabled?: boolean;
  variant?: 'blue' | 'yellow' | 'green' | 'purple' | 'red';
}

export interface WebBpmnUserTaskNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-user-task-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnServiceTaskNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-service-task-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnManualTaskNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-manual-task-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnSubprocessNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-subprocess-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnStartEventNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-start-event-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnExclusiveGatewayNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-exclusive-gateway-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnEndEventNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-end-event-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnLaneNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-lane-web';
  data: WebBpmnTaskData;
}

export interface WebBpmnPoolNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: 'bpmn-pool-web';
  data: WebBpmnTaskData;
}

export type WebNode =
  | WebButtonNode
  | WebInputNode
  | WebCardNode
  | WebBpmnUserTaskNode
  | WebBpmnServiceTaskNode
  | WebBpmnManualTaskNode
  | WebBpmnSubprocessNode
  | WebBpmnStartEventNode
  | WebBpmnExclusiveGatewayNode
  | WebBpmnEndEventNode
  | WebBpmnLaneNode
  | WebBpmnPoolNode;

export type DiagramNode = ShapeNode | WebNode;

export interface DiagramEdge extends DiagramElement {
  sourceId: string;
  targetId: string;
  color?: string;
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
