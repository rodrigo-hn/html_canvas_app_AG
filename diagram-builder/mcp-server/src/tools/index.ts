import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DiagramEngine } from "../engine/diagram-engine.js";
import { registerNodeTools } from "./node-tools.js";
import { registerEdgeTools } from "./edge-tools.js";
import { registerLayoutTools } from "./layout-tools.js";
import { registerExportTools } from "./export-tools.js";
import { registerHistoryTools } from "./history-tools.js";
import { registerBatchTools } from "./batch-tools.js";

export function registerAllTools(server: McpServer, engine: DiagramEngine) {
  registerNodeTools(server, engine);
  registerEdgeTools(server, engine);
  registerLayoutTools(server, engine);
  registerExportTools(server, engine);
  registerHistoryTools(server, engine);
  registerBatchTools(server, engine);
}
