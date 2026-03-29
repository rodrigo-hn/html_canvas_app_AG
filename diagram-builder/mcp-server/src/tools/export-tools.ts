import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramEngine } from "../engine/diagram-engine.js";

export function registerExportTools(
  server: McpServer,
  engine: DiagramEngine
) {
  server.registerTool(
    "export_diagram",
    {
      description:
        "Export the current diagram in the specified format. Returns the content as text.",
      inputSchema: {
        format: z
          .enum(["json", "html", "svg"])
          .describe("Export format"),
      },
    },
    async ({ format }) => {
      let content: string;
      switch (format) {
        case "json":
          content = engine.exportJson();
          break;
        case "svg":
          content = engine.exportSvg();
          break;
        case "html":
          content = engine.exportHtml();
          break;
      }
      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );

  server.registerTool(
    "import_diagram",
    {
      description:
        "Import a diagram from JSON. Replaces the current diagram. Supports undo.",
      inputSchema: {
        json: z.string().describe("JSON string of a DiagramModel"),
      },
    },
    async ({ json }) => {
      try {
        engine.loadFromJson(json);
        const model = engine.getModel();
        return {
          content: [
            {
              type: "text" as const,
              text: `Imported diagram: ${model.nodes.length} nodes, ${model.edges.length} edges (v${model.modelVersion})`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Import failed: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "get_diagram",
    {
      description:
        "Get the complete current diagram model as JSON with all node and edge details",
      inputSchema: {},
    },
    async () => {
      return {
        content: [{ type: "text" as const, text: engine.exportJson() }],
      };
    }
  );

  server.registerTool(
    "clear_diagram",
    {
      description:
        "Remove all nodes and edges from the diagram. Supports undo.",
      inputSchema: {},
    },
    async () => {
      const prev = engine.getNodes().length;
      engine.clear();
      return {
        content: [
          {
            type: "text" as const,
            text: `Cleared diagram (removed ${prev} nodes and their edges)`,
          },
        ],
      };
    }
  );
}
