import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramEngine } from "../engine/diagram-engine.js";

export function registerEdgeTools(server: McpServer, engine: DiagramEngine) {
  server.registerTool(
    "create_edge",
    {
      description:
        "Create a connection (edge) between two nodes. Use flowType to set the visual style.",
      inputSchema: {
        sourceId: z.string().describe("Source node ID"),
        targetId: z.string().describe("Target node ID"),
        flowType: z
          .enum(["sequence", "message", "association"])
          .default("sequence")
          .describe(
            "sequence: solid line with arrow. message: dashed with open arrow. association: dotted, no arrow."
          ),
        label: z.string().optional().describe("Text label on the edge"),
        sourcePort: z
          .enum(["top", "right", "bottom", "left"])
          .optional()
          .describe("Port on source node"),
        targetPort: z
          .enum(["top", "right", "bottom", "left"])
          .optional()
          .describe("Port on target node"),
      },
    },
    async (input) => {
      if (!engine.getNodeById(input.sourceId)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Source node "${input.sourceId}" not found`,
            },
          ],
        };
      }
      if (!engine.getNodeById(input.targetId)) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Target node "${input.targetId}" not found`,
            },
          ],
        };
      }

      const edge = engine.addEdge({
        sourceId: input.sourceId,
        targetId: input.targetId,
        flowType: input.flowType,
        label: input.label,
        sourcePort: input.sourcePort,
        targetPort: input.targetPort,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Created ${input.flowType} edge "${edge.id}" from ${input.sourceId} to ${input.targetId}${input.label ? ` labeled "${input.label}"` : ""}`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "update_edge",
    {
      description: "Update properties of an existing edge",
      inputSchema: {
        edgeId: z.string().describe("ID of the edge to update"),
        label: z.string().optional(),
        flowType: z.enum(["sequence", "message", "association"]).optional(),
        color: z.string().optional().describe("Stroke color (hex)"),
      },
    },
    async (input) => {
      const changes: Record<string, unknown> = {};
      if (input.label !== undefined) changes.label = input.label;
      if (input.flowType !== undefined) changes.flowType = input.flowType;
      if (input.color !== undefined) changes.color = input.color;

      const result = engine.updateEdge(input.edgeId, changes as any);
      if (!result) {
        return {
          content: [
            { type: "text" as const, text: `Edge "${input.edgeId}" not found` },
          ],
        };
      }
      return {
        content: [
          { type: "text" as const, text: `Updated edge "${input.edgeId}"` },
        ],
      };
    }
  );

  server.registerTool(
    "delete_edge",
    {
      description: "Delete an edge from the diagram",
      inputSchema: {
        edgeId: z.string().describe("ID of the edge to delete"),
      },
    },
    async ({ edgeId }) => {
      const success = engine.removeEdge(edgeId);
      return {
        content: [
          {
            type: "text" as const,
            text: success
              ? `Deleted edge "${edgeId}"`
              : `Edge "${edgeId}" not found`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "list_edges",
    {
      description: "Get all edges in the current diagram",
      inputSchema: {},
    },
    async () => {
      const edges = engine.getEdges();
      const summary = edges.map((e) => ({
        id: e.id,
        from: e.sourceId,
        to: e.targetId,
        flowType: e.flowType,
        label: e.label || "",
      }));
      return {
        content: [
          {
            type: "text" as const,
            text:
              edges.length === 0
                ? "No edges in the diagram"
                : JSON.stringify(summary, null, 2),
          },
        ],
      };
    }
  );
}
