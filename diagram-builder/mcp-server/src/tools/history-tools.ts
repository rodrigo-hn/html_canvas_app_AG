import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DiagramEngine } from "../engine/diagram-engine.js";

export function registerHistoryTools(
  server: McpServer,
  engine: DiagramEngine
) {
  server.registerTool(
    "undo",
    {
      description: "Undo the last diagram operation",
      inputSchema: {},
    },
    async () => {
      const success = engine.undo();
      return {
        content: [
          {
            type: "text" as const,
            text: success ? "Undo successful" : "Nothing to undo",
          },
        ],
      };
    }
  );

  server.registerTool(
    "redo",
    {
      description: "Redo the last undone operation",
      inputSchema: {},
    },
    async () => {
      const success = engine.redo();
      return {
        content: [
          {
            type: "text" as const,
            text: success ? "Redo successful" : "Nothing to redo",
          },
        ],
      };
    }
  );
}
