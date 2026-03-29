# 4. Implementacion — Codigo de Ejemplo

## 4.1 Entry Point

```typescript
// mcp-server/src/index.ts
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DiagramEngine } from "./engine/diagram-engine.js";
import { registerAllTools } from "./tools/index.js";
import { registerResources } from "./resources/diagram-resources.js";
import { registerPrompts } from "./prompts/diagram-prompts.js";

const server = new McpServer({
  name: "diagram-builder",
  version: "1.0.0",
});

const engine = new DiagramEngine();

registerAllTools(server, engine);
registerResources(server, engine);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Diagram Builder MCP Server running");
}

main().catch(console.error);
```

---

## 4.2 DiagramEngine (Motor Headless)

```typescript
// mcp-server/src/engine/diagram-engine.ts

import { v4 as uuid } from "uuid";

// Tipos copiados de diagram.model.ts (sin deps Angular)
export interface Point { x: number; y: number; }
export interface DiagramNode {
  id: string;
  type: 'shape' | 'web-component';
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
  flowType?: string;
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

export class DiagramEngine {
  private model: DiagramModel = { modelVersion: 2, nodes: [], edges: [] };
  private historyPast: DiagramModel[] = [];
  private historyFuture: DiagramModel[] = [];

  // --- State ---

  getModel(): DiagramModel {
    return structuredClone(this.model);
  }

  getNodes(): DiagramNode[] {
    return this.model.nodes;
  }

  getEdges(): DiagramEdge[] {
    return this.model.edges;
  }

  getNodeById(id: string): DiagramNode | undefined {
    return this.model.nodes.find(n => n.id === id);
  }

  getEdgeById(id: string): DiagramEdge | undefined {
    return this.model.edges.find(e => e.id === id);
  }

  // --- History ---

  private pushHistory(): void {
    this.historyPast.push(structuredClone(this.model));
    if (this.historyPast.length > 120) this.historyPast.shift();
    this.historyFuture = [];
  }

  undo(): boolean {
    const prev = this.historyPast.pop();
    if (!prev) return false;
    this.historyFuture.push(structuredClone(this.model));
    this.model = prev;
    return true;
  }

  redo(): boolean {
    const next = this.historyFuture.pop();
    if (!next) return false;
    this.historyPast.push(structuredClone(this.model));
    this.model = next;
    return true;
  }

  canUndo(): boolean { return this.historyPast.length > 0; }
  canRedo(): boolean { return this.historyFuture.length > 0; }

  // --- Node Operations ---

  addNode(node: Partial<DiagramNode> & { type: string }): DiagramNode {
    this.pushHistory();
    const newNode: DiagramNode = {
      id: node.id || uuid(),
      type: node.type as 'shape' | 'web-component',
      x: node.x ?? 100,
      y: node.y ?? 100,
      width: node.width ?? 160,
      height: node.height ?? 80,
      zIndex: node.zIndex ?? (this.model.nodes.length + 1),
      shapeType: node.shapeType,
      componentType: node.componentType,
      data: node.data ?? {},
      style: node.style,
      rotation: node.rotation,
    };
    this.model.nodes.push(newNode);
    return newNode;
  }

  updateNode(id: string, changes: Partial<DiagramNode>): DiagramNode | null {
    const node = this.model.nodes.find(n => n.id === id);
    if (!node) return null;
    this.pushHistory();
    Object.assign(node, changes);
    return node;
  }

  removeNode(id: string): boolean {
    const idx = this.model.nodes.findIndex(n => n.id === id);
    if (idx === -1) return false;
    this.pushHistory();
    this.model.nodes.splice(idx, 1);
    // Remove connected edges
    this.model.edges = this.model.edges.filter(
      e => e.sourceId !== id && e.targetId !== id
    );
    return true;
  }

  // --- Edge Operations ---

  addEdge(edge: Partial<DiagramEdge> & { sourceId: string; targetId: string }): DiagramEdge {
    this.pushHistory();
    const newEdge: DiagramEdge = {
      id: edge.id || uuid(),
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
      flowType: edge.flowType ?? 'sequence',
      label: edge.label,
      color: edge.color,
      points: edge.points ?? [],
      markerEnd: edge.markerEnd ?? 'arrow',
      markerStart: edge.markerStart,
      style: edge.style,
      zIndex: edge.zIndex ?? 0,
    };
    this.model.edges.push(newEdge);
    return newEdge;
  }

  updateEdge(id: string, changes: Partial<DiagramEdge>): DiagramEdge | null {
    const edge = this.model.edges.find(e => e.id === id);
    if (!edge) return null;
    this.pushHistory();
    Object.assign(edge, changes);
    return edge;
  }

  removeEdge(id: string): boolean {
    const idx = this.model.edges.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.pushHistory();
    this.model.edges.splice(idx, 1);
    return true;
  }

  // --- Layout ---

  alignNodes(ids: string[], mode: string): void {
    const nodes = this.model.nodes.filter(n => ids.includes(n.id));
    if (nodes.length < 2) return;
    this.pushHistory();

    switch (mode) {
      case 'left': {
        const minX = Math.min(...nodes.map(n => n.x));
        nodes.forEach(n => n.x = minX);
        break;
      }
      case 'top': {
        const minY = Math.min(...nodes.map(n => n.y));
        nodes.forEach(n => n.y = minY);
        break;
      }
      case 'right': {
        const maxRight = Math.max(...nodes.map(n => n.x + n.width));
        nodes.forEach(n => n.x = maxRight - n.width);
        break;
      }
      case 'bottom': {
        const maxBottom = Math.max(...nodes.map(n => n.y + n.height));
        nodes.forEach(n => n.y = maxBottom - n.height);
        break;
      }
      case 'center': {
        const avgX = nodes.reduce((s, n) => s + n.x + n.width / 2, 0) / nodes.length;
        nodes.forEach(n => n.x = avgX - n.width / 2);
        break;
      }
      case 'middle': {
        const avgY = nodes.reduce((s, n) => s + n.y + n.height / 2, 0) / nodes.length;
        nodes.forEach(n => n.y = avgY - n.height / 2);
        break;
      }
    }
  }

  distributeNodes(ids: string[], axis: 'horizontal' | 'vertical'): void {
    const nodes = this.model.nodes.filter(n => ids.includes(n.id));
    if (nodes.length < 3) return;
    this.pushHistory();

    if (axis === 'horizontal') {
      nodes.sort((a, b) => a.x - b.x);
      const min = nodes[0].x;
      const max = nodes[nodes.length - 1].x;
      const step = (max - min) / (nodes.length - 1);
      nodes.forEach((n, i) => n.x = min + step * i);
    } else {
      nodes.sort((a, b) => a.y - b.y);
      const min = nodes[0].y;
      const max = nodes[nodes.length - 1].y;
      const step = (max - min) / (nodes.length - 1);
      nodes.forEach((n, i) => n.y = min + step * i);
    }
  }

  // --- Import / Export ---

  loadFromJson(json: string): void {
    this.pushHistory();
    const parsed = JSON.parse(json);
    this.model = {
      modelVersion: parsed.modelVersion ?? 2,
      nodes: parsed.nodes ?? [],
      edges: parsed.edges ?? [],
    };
  }

  exportJson(): string {
    return JSON.stringify(this.model, null, 2);
  }

  clear(): void {
    this.pushHistory();
    this.model = { modelVersion: 2, nodes: [], edges: [] };
  }
}
```

---

## 4.3 Registro de Tools

```typescript
// mcp-server/src/tools/node-tools.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DiagramEngine } from "../engine/diagram-engine.js";

export function registerNodeTools(server: McpServer, engine: DiagramEngine) {

  server.registerTool(
    "create_node",
    {
      description: "Create a new node in the diagram",
      inputSchema: {
        type: z.enum(["shape", "web-component"]).describe("Node type"),
        shapeType: z.string().optional().describe("Shape type (rectangle, bpmn-task, bpmn-gateway-exclusive, etc.)"),
        componentType: z.string().optional().describe("Web component type (bpmn-user-task-web, bpmn-start-event-web, etc.)"),
        x: z.number().describe("X position"),
        y: z.number().describe("Y position"),
        width: z.number().default(160).describe("Width in pixels"),
        height: z.number().default(80).describe("Height in pixels"),
        text: z.string().optional().describe("Text content"),
        variant: z.enum(["blue", "yellow", "green", "purple", "red"]).optional(),
      },
    },
    async (input) => {
      const data: Record<string, unknown> = {};
      if (input.text) data.text = input.text;
      if (input.variant) data.variant = input.variant;

      const node = engine.addNode({
        type: input.type,
        shapeType: input.shapeType,
        componentType: input.componentType,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        data,
      });

      return {
        content: [{
          type: "text",
          text: `Created node "${node.id}" at (${node.x}, ${node.y})`,
        }],
      };
    }
  );

  server.registerTool(
    "delete_node",
    {
      description: "Delete a node and its connections",
      inputSchema: {
        nodeId: z.string().describe("ID of the node to delete"),
      },
    },
    async ({ nodeId }) => {
      const success = engine.removeNode(nodeId);
      return {
        content: [{
          type: "text",
          text: success ? `Deleted node "${nodeId}"` : `Node "${nodeId}" not found`,
        }],
      };
    }
  );

  server.registerTool(
    "list_nodes",
    {
      description: "Get all nodes in the current diagram",
      inputSchema: {},
    },
    async () => {
      const nodes = engine.getNodes();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(nodes, null, 2),
        }],
      };
    }
  );
}
```

```typescript
// mcp-server/src/tools/edge-tools.ts

export function registerEdgeTools(server: McpServer, engine: DiagramEngine) {

  server.registerTool(
    "create_edge",
    {
      description: "Create a connection between two nodes",
      inputSchema: {
        sourceId: z.string().describe("Source node ID"),
        targetId: z.string().describe("Target node ID"),
        flowType: z.enum(["sequence", "message", "association"]).default("sequence"),
        label: z.string().optional().describe("Edge label text"),
        sourcePort: z.enum(["top", "right", "bottom", "left"]).optional(),
        targetPort: z.enum(["top", "right", "bottom", "left"]).optional(),
      },
    },
    async (input) => {
      const edge = engine.addEdge({
        sourceId: input.sourceId,
        targetId: input.targetId,
        flowType: input.flowType,
        label: input.label,
        sourcePort: input.sourcePort,
        targetPort: input.targetPort,
      });

      return {
        content: [{
          type: "text",
          text: `Created ${input.flowType} edge "${edge.id}" from ${input.sourceId} to ${input.targetId}`,
        }],
      };
    }
  );
}
```

---

## 4.4 Registro de Resources

```typescript
// mcp-server/src/resources/diagram-resources.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DiagramEngine } from "../engine/diagram-engine.js";

const AVAILABLE_SHAPES = {
  basic: ["rectangle", "rounded-rectangle", "document", "cylinder", "diamond"],
  "bpmn-tasks": ["bpmn-task", "bpmn-subprocess", "bpmn-call-activity", "bpmn-transaction", "bpmn-event-subprocess"],
  "bpmn-events": ["bpmn-start-event", "bpmn-end-event", "bpmn-intermediate-event", "bpmn-boundary-event", "bpmn-throwing-event"],
  "bpmn-gateways": ["bpmn-gateway", "bpmn-gateway-exclusive", "bpmn-gateway-inclusive", "bpmn-gateway-parallel", "bpmn-gateway-event-based"],
  "bpmn-organizational": ["bpmn-pool", "bpmn-lane", "bpmn-group"],
  "web-components": ["button", "input", "card"],
  "bpmn-web": [
    "bpmn-user-task-web", "bpmn-service-task-web", "bpmn-manual-task-web",
    "bpmn-subprocess-web", "bpmn-start-event-web", "bpmn-exclusive-gateway-web",
    "bpmn-end-event-web", "bpmn-lane-web", "bpmn-pool-web"
  ],
};

const FLOW_TYPES = {
  sequence: { dashArray: null, markerStart: null, markerEnd: "arrow", cornerRadius: 8, description: "Standard flow between activities" },
  message: { dashArray: "6 4", markerStart: "open-circle", markerEnd: "open-arrow", cornerRadius: 6, description: "Communication between participants" },
  association: { dashArray: "3 4", markerStart: null, markerEnd: null, cornerRadius: 4, description: "Link to annotations or data" },
};

export function registerResources(server: McpServer, engine: DiagramEngine) {

  server.resource(
    "shapes",
    "diagram://shapes",
    { description: "All available shape and component types for creating nodes" },
    async () => ({
      contents: [{
        uri: "diagram://shapes",
        mimeType: "application/json",
        text: JSON.stringify(AVAILABLE_SHAPES, null, 2),
      }],
    })
  );

  server.resource(
    "flow-types",
    "diagram://flow-types",
    { description: "Edge flow types with default styling" },
    async () => ({
      contents: [{
        uri: "diagram://flow-types",
        mimeType: "application/json",
        text: JSON.stringify(FLOW_TYPES, null, 2),
      }],
    })
  );

  server.resource(
    "current-diagram",
    "diagram://current",
    { description: "The current diagram model" },
    async () => ({
      contents: [{
        uri: "diagram://current",
        mimeType: "application/json",
        text: JSON.stringify(engine.getModel(), null, 2),
      }],
    })
  );
}
```

---

## 4.5 Registro de Prompts

```typescript
// mcp-server/src/prompts/diagram-prompts.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer) {

  server.prompt(
    "create-process",
    {
      description: "Guide the creation of a BPMN process diagram",
      arguments: [
        { name: "domain", description: "Business domain (sales, support, logistics, hr, etc.)", required: true },
        { name: "complexity", description: "simple (3-5 steps), medium (5-10), complex (10+)", required: false },
      ],
    },
    async ({ domain, complexity }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Create a BPMN process diagram for the "${domain}" domain with ${complexity || 'medium'} complexity.

Use the create_bpmn_process tool or individual create_node and create_edge tools.

Follow BPMN 2.0 conventions:
- Start with a bpmn-start-event-web node
- Use bpmn-user-task-web for human tasks
- Use bpmn-service-task-web for automated tasks
- Use bpmn-exclusive-gateway-web for decisions
- End with bpmn-end-event-web
- Connect with sequence flow edges
- Add labels to edges from gateways (e.g., "Yes", "No")
- Position nodes left-to-right with ~200px horizontal spacing

First check available shapes with the diagram://shapes resource.`,
        },
      }],
    })
  );

  server.prompt(
    "explain-diagram",
    {
      description: "Generate a description of the current diagram",
      arguments: [],
    },
    async () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Read the current diagram from diagram://current resource and provide:
1. A high-level summary of the process
2. The number of nodes and edges
3. The flow from start to end
4. Any decision points (gateways) and their branches
5. Potential improvements or issues`,
        },
      }],
    })
  );
}
```

---

## 4.6 Testing con MCP Inspector

```bash
cd mcp-server
npm run build
npx @modelcontextprotocol/inspector node build/index.js
```

El Inspector abre una UI web donde se puede:
- Ver todos los tools, resources y prompts registrados
- Invocar tools manualmente con parametros
- Ver las respuestas JSON-RPC
- Depurar el protocolo en tiempo real
