import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramEngine } from "../engine/diagram-engine.js";

export function registerLayoutTools(
  server: McpServer,
  engine: DiagramEngine
) {
  server.registerTool(
    "align_nodes",
    {
      description:
        "Align multiple nodes by a common edge or center. Requires at least 2 node IDs.",
      inputSchema: {
        nodeIds: z
          .array(z.string())
          .describe("IDs of nodes to align"),
        mode: z
          .enum(["left", "center", "right", "top", "middle", "bottom"])
          .describe("Alignment mode"),
      },
    },
    async ({ nodeIds, mode }) => {
      const count = engine.alignNodes(nodeIds, mode);
      return {
        content: [
          {
            type: "text" as const,
            text:
              count > 0
                ? `Aligned ${count} nodes to ${mode}`
                : "Need at least 2 valid nodes to align",
          },
        ],
      };
    }
  );

  server.registerTool(
    "distribute_nodes",
    {
      description:
        "Distribute nodes evenly along an axis. Requires at least 3 node IDs.",
      inputSchema: {
        nodeIds: z.array(z.string()).describe("IDs of nodes to distribute"),
        axis: z
          .enum(["horizontal", "vertical"])
          .describe("Distribution axis"),
      },
    },
    async ({ nodeIds, axis }) => {
      const count = engine.distributeNodes(nodeIds, axis);
      return {
        content: [
          {
            type: "text" as const,
            text:
              count > 0
                ? `Distributed ${count} nodes ${axis}ly`
                : "Need at least 3 valid nodes to distribute",
          },
        ],
      };
    }
  );

  server.registerTool(
    "auto_layout",
    {
      description:
        "Automatically arrange all nodes using topological ordering. Positions nodes in layers based on edge connections.",
      inputSchema: {
        direction: z
          .enum(["left-to-right", "top-to-bottom"])
          .default("left-to-right")
          .describe("Layout direction"),
        spacing: z
          .number()
          .default(60)
          .describe("Spacing between nodes in pixels"),
      },
    },
    async ({ direction, spacing }) => {
      engine.autoLayout(direction, spacing);
      const count = engine.getNodes().length;
      return {
        content: [
          {
            type: "text" as const,
            text: `Auto-layout applied: ${count} nodes arranged ${direction} with ${spacing}px spacing`,
          },
        ],
      };
    }
  );
}
