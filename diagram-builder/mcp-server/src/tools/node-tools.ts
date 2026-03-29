import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramEngine } from "../engine/diagram-engine.js";

export function registerNodeTools(server: McpServer, engine: DiagramEngine) {
  server.registerTool(
    "create_node",
    {
      description:
        "Create a new node in the diagram. Use type 'shape' with shapeType for SVG shapes, or type 'web-component' with componentType for BPMN web elements.",
      inputSchema: {
        type: z.enum(["shape", "web-component"]).describe("Node type"),
        shapeType: z
          .string()
          .optional()
          .describe(
            "Shape type: rectangle, rounded-rectangle, document, cylinder, diamond, bpmn-task, bpmn-subprocess, bpmn-gateway-exclusive, bpmn-start-event, bpmn-end-event, etc."
          ),
        componentType: z
          .string()
          .optional()
          .describe(
            "Web component type: bpmn-user-task-web, bpmn-service-task-web, bpmn-manual-task-web, bpmn-subprocess-web, bpmn-start-event-web, bpmn-exclusive-gateway-web, bpmn-end-event-web, bpmn-lane-web, bpmn-pool-web, button, input, card"
          ),
        x: z.number().describe("X position in pixels"),
        y: z.number().describe("Y position in pixels"),
        width: z.number().default(160).describe("Width in pixels"),
        height: z.number().default(80).describe("Height in pixels"),
        text: z.string().optional().describe("Text label for the node"),
        variant: z
          .enum(["blue", "yellow", "green", "purple", "red"])
          .optional()
          .describe("Color variant for BPMN web tasks"),
        zIndex: z.number().optional().describe("Stack order"),
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
        zIndex: input.zIndex,
        data,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Created ${input.type} node "${node.id}" (${input.shapeType || input.componentType || "unknown"}) at (${node.x}, ${node.y}) size ${node.width}x${node.height}`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "update_node",
    {
      description: "Update properties of an existing node",
      inputSchema: {
        nodeId: z.string().describe("ID of the node to update"),
        x: z.number().optional(),
        y: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        text: z.string().optional().describe("Update node text/label"),
        variant: z.enum(["blue", "yellow", "green", "purple", "red"]).optional(),
        zIndex: z.number().optional(),
      },
    },
    async (input) => {
      const { nodeId, text, variant, ...posChanges } = input;

      if (text !== undefined || variant !== undefined) {
        const dataChanges: Record<string, unknown> = {};
        if (text !== undefined) dataChanges.text = text;
        if (variant !== undefined) dataChanges.variant = variant;
        engine.updateNodeData(nodeId, dataChanges);
      }

      const changes: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(posChanges)) {
        if (v !== undefined) changes[k] = v;
      }

      if (Object.keys(changes).length > 0) {
        const result = engine.updateNode(nodeId, changes as any);
        if (!result) {
          return {
            content: [{ type: "text" as const, text: `Node "${nodeId}" not found` }],
          };
        }
      }

      return {
        content: [
          { type: "text" as const, text: `Updated node "${nodeId}"` },
        ],
      };
    }
  );

  server.registerTool(
    "delete_node",
    {
      description:
        "Delete a node and all its connected edges from the diagram",
      inputSchema: {
        nodeId: z.string().describe("ID of the node to delete"),
      },
    },
    async ({ nodeId }) => {
      const success = engine.removeNode(nodeId);
      return {
        content: [
          {
            type: "text" as const,
            text: success
              ? `Deleted node "${nodeId}" and its connections`
              : `Node "${nodeId}" not found`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "list_nodes",
    {
      description: "Get all nodes in the current diagram with their properties",
      inputSchema: {},
    },
    async () => {
      const nodes = engine.getNodes();
      const summary = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        shape: n.shapeType || n.componentType,
        position: `(${n.x}, ${n.y})`,
        size: `${n.width}x${n.height}`,
        text: n.data?.["text"] || "",
      }));
      return {
        content: [
          {
            type: "text" as const,
            text:
              nodes.length === 0
                ? "No nodes in the diagram"
                : JSON.stringify(summary, null, 2),
          },
        ],
      };
    }
  );
}
