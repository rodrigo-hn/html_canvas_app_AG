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
        "Create a complete BPMN process from a list of steps. Automatically positions nodes left-to-right or top-to-bottom and creates edges between them. Clears the current diagram first.",
      inputSchema: {
        name: z.string().describe("Process name"),
        steps: z.array(StepSchema).describe("List of process steps"),
        direction: z
          .enum(["left-to-right", "top-to-bottom"])
          .default("left-to-right"),
        spacing: z.number().default(80).describe("Spacing between nodes"),
      },
    },
    async ({ name, steps, direction, spacing }) => {
      engine.clear();

      const isHorizontal = direction === "left-to-right";
      const nodeIds = new Map<string, string>();

      // Create nodes with auto-positioning
      let offset = 80;
      const crossCenter = 200;

      for (const step of steps) {
        const mapping = STEP_TYPE_MAP[step.type];
        if (!mapping) continue;

        const data: Record<string, unknown> = {};
        if (step.label) data.text = step.label;
        if (step.variant) data.variant = step.variant;

        const x = isHorizontal ? offset : crossCenter - mapping.w / 2;
        const y = isHorizontal ? crossCenter - mapping.h / 2 : offset;

        const node = engine.addNode({
          type: mapping.type,
          componentType: mapping.key,
          x,
          y,
          width: mapping.w,
          height: mapping.h,
          data,
        });

        nodeIds.set(step.id, node.id);
        offset += (isHorizontal ? mapping.w : mapping.h) + spacing;
      }

      // Create edges
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
            sourcePort: isHorizontal ? "right" : "bottom",
            targetPort: isHorizontal ? "left" : "top",
          });
          edgeCount++;
        }
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Created BPMN process "${name}": ${nodeIds.size} nodes, ${edgeCount} edges (${direction})`,
          },
        ],
      };
    }
  );
}
