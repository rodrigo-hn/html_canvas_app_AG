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
  description:
    "Create and manipulate BPMN diagrams programmatically. Supports creating nodes, edges, layout operations, and exporting to JSON/SVG/HTML.",
});

const engine = new DiagramEngine();

registerAllTools(server, engine);
registerResources(server, engine);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Diagram Builder MCP Server v1.0.0 running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
