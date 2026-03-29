import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiagramEngine } from "../engine/diagram-engine.js";

const STEP_TYPE_MAP: Record<
  string,
  { type: "shape" | "web-component"; key: string; w: number; h: number }
> = {
  start: { type: "web-component", key: "bpmn-start-event-web", w: 60, h: 60 },
  end: { type: "web-component", key: "bpmn-end-event-web", w: 60, h: 60 },
  "user-task": { type: "web-component", key: "bpmn-user-task-web", w: 180, h: 80 },
  "service-task": { type: "web-component", key: "bpmn-service-task-web", w: 180, h: 80 },
  "manual-task": { type: "web-component", key: "bpmn-manual-task-web", w: 180, h: 80 },
  subprocess: { type: "web-component", key: "bpmn-subprocess-web", w: 180, h: 80 },
  "exclusive-gateway": { type: "web-component", key: "bpmn-exclusive-gateway-web", w: 80, h: 80 },
};

const ConnectionSchema = z.object({
  targetId: z.string(),
  label: z.string().optional(),
  flowType: z.enum(["sequence", "message", "association"]).optional(),
});

const StepSchema = z.object({
  id: z.string(),
  type: z.enum([
    "start",
    "end",
    "user-task",
    "service-task",
    "manual-task",
    "subprocess",
    "exclusive-gateway",
  ]),
  label: z.string().optional(),
  variant: z.enum(["blue", "yellow", "green", "purple", "red"]).optional(),
  connectTo: z.array(ConnectionSchema).optional(),
});

export function registerBatchTools(
  server: McpServer,
  engine: DiagramEngine
) {
  server.registerTool(
    "create_bpmn_process",
    {
      description:
        "Create a complete BPMN process from a list of steps. Automatically positions nodes with branch-aware layout (gateways create visual branches). Clears the current diagram first.",
      inputSchema: {
        name: z.string().describe("Process name"),
        steps: z.array(StepSchema).describe("List of process steps. For gateways, the FIRST connectTo is the main/positive branch (displayed straight), subsequent connectTo entries are alternate branches (displayed below)."),
        direction: z
          .enum(["left-to-right", "top-to-bottom"])
          .default("left-to-right"),
        spacing: z.number().default(80).describe("Spacing between nodes"),
      },
    },
    async ({ name, steps, direction, spacing }) => {
      engine.clear();

      const nodeIds = new Map<string, string>();

      // Phase 1: Create all nodes (positions will be set by layoutBpmn)
      for (const step of steps) {
        const mapping = STEP_TYPE_MAP[step.type];
        if (!mapping) continue;

        const data: Record<string, unknown> = {};
        if (step.label) data.text = step.label;
        if (step.variant) data.variant = step.variant;

        const node = engine.addNode({
          type: mapping.type,
          componentType: mapping.key,
          x: 0,
          y: 0,
          width: mapping.w,
          height: mapping.h,
          data,
        });

        nodeIds.set(step.id, node.id);
      }

      // Phase 2: Create all edges
      let edgeCount = 0;
      for (const step of steps) {
        if (!step.connectTo) continue;
        const sourceId = nodeIds.get(step.id);
        if (!sourceId) continue;

        for (const conn of step.connectTo) {
          const targetId = nodeIds.get(conn.targetId);
          if (!targetId) continue;

          engine.addEdge({
            sourceId,
            targetId,
            flowType: conn.flowType ?? "sequence",
            label: conn.label,
          });
          edgeCount++;
        }
      }

      // Phase 3: Apply BPMN-aware layout (positions nodes + assigns ports)
      engine.layoutBpmn(direction, spacing);

      return {
        content: [
          {
            type: "text" as const,
            text: `Created BPMN process "${name}": ${nodeIds.size} nodes, ${edgeCount} edges (${direction}, branch-aware layout)`,
          },
        ],
      };
    }
  );
}
