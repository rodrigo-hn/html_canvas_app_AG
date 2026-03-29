import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DiagramEngine } from "../engine/diagram-engine.js";

const AVAILABLE_SHAPES = {
  basic: [
    "rectangle",
    "rounded-rectangle",
    "document",
    "cylinder",
    "diamond",
  ],
  "bpmn-tasks": [
    "bpmn-task",
    "bpmn-subprocess",
    "bpmn-call-activity",
    "bpmn-transaction",
    "bpmn-event-subprocess",
  ],
  "bpmn-events": [
    "bpmn-start-event",
    "bpmn-end-event",
    "bpmn-intermediate-event",
    "bpmn-boundary-event",
    "bpmn-throwing-event",
    "bpmn-event-message",
    "bpmn-event-timer",
    "bpmn-event-error",
    "bpmn-event-signal",
    "bpmn-event-escalation",
  ],
  "bpmn-gateways": [
    "bpmn-gateway",
    "bpmn-gateway-exclusive",
    "bpmn-gateway-inclusive",
    "bpmn-gateway-parallel",
    "bpmn-gateway-event-based",
  ],
  "bpmn-organizational": ["bpmn-pool", "bpmn-lane", "bpmn-group"],
  "bpmn-data": ["bpmn-data-object", "bpmn-data-store", "bpmn-text-annotation"],
  "web-components": ["button", "input", "card"],
  "bpmn-web": [
    "bpmn-user-task-web",
    "bpmn-service-task-web",
    "bpmn-manual-task-web",
    "bpmn-subprocess-web",
    "bpmn-start-event-web",
    "bpmn-exclusive-gateway-web",
    "bpmn-end-event-web",
    "bpmn-lane-web",
    "bpmn-pool-web",
  ],
};

const FLOW_TYPES = {
  sequence: {
    dashArray: null,
    markerStart: null,
    markerEnd: "arrow",
    cornerRadius: 8,
    description: "Standard flow between activities — solid line with filled arrow",
  },
  message: {
    dashArray: "6 4",
    markerStart: "open-circle",
    markerEnd: "open-arrow",
    cornerRadius: 6,
    description:
      "Communication between participants — dashed line with open circle and open arrow",
  },
  association: {
    dashArray: "3 4",
    markerStart: null,
    markerEnd: null,
    cornerRadius: 4,
    description: "Link to annotations or data — dotted line, no arrows",
  },
};

const SCHEMA_DOC = {
  modelVersion: "number (current: 2)",
  nodes: {
    id: "string (UUID)",
    type: "'shape' | 'web-component'",
    x: "number",
    y: "number",
    width: "number",
    height: "number",
    zIndex: "number",
    shapeType: "string (for type='shape')",
    componentType: "string (for type='web-component')",
    data: {
      text: "string",
      variant: "'blue' | 'yellow' | 'green' | 'purple' | 'red'",
      iconEnabled: "boolean",
      badgeEnabled: "boolean",
    },
  },
  edges: {
    id: "string (UUID)",
    sourceId: "string (node ID)",
    targetId: "string (node ID)",
    sourcePort: "'top' | 'right' | 'bottom' | 'left'",
    targetPort: "'top' | 'right' | 'bottom' | 'left'",
    flowType: "'sequence' | 'message' | 'association'",
    label: "string",
    color: "string (hex)",
    markerEnd: "'arrow' | 'open-arrow' | null",
    markerStart: "'open-circle' | null",
  },
};

export function registerResources(server: McpServer, engine: DiagramEngine) {
  server.resource(
    "shapes",
    "diagram://shapes",
    {
      description:
        "All available shape and component types organized by category. Use these values for shapeType or componentType when creating nodes.",
    },
    async () => ({
      contents: [
        {
          uri: "diagram://shapes",
          mimeType: "application/json",
          text: JSON.stringify(AVAILABLE_SHAPES, null, 2),
        },
      ],
    })
  );

  server.resource(
    "flow-types",
    "diagram://flow-types",
    {
      description:
        "Edge flow types with their visual styles. Use these values for flowType when creating edges.",
    },
    async () => ({
      contents: [
        {
          uri: "diagram://flow-types",
          mimeType: "application/json",
          text: JSON.stringify(FLOW_TYPES, null, 2),
        },
      ],
    })
  );

  server.resource(
    "schema",
    "diagram://schema",
    {
      description:
        "DiagramModel schema documentation with all fields and their types",
    },
    async () => ({
      contents: [
        {
          uri: "diagram://schema",
          mimeType: "application/json",
          text: JSON.stringify(SCHEMA_DOC, null, 2),
        },
      ],
    })
  );

  server.resource(
    "current-diagram",
    "diagram://current",
    { description: "The current diagram model with all nodes and edges" },
    async () => ({
      contents: [
        {
          uri: "diagram://current",
          mimeType: "application/json",
          text: JSON.stringify(engine.getModel(), null, 2),
        },
      ],
    })
  );
}
