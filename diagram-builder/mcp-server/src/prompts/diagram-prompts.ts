import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  server.registerPrompt(
    "create-process",
    {
      description:
        "Guide the creation of a BPMN process diagram for a specific business domain",
      argsSchema: {
        domain: z
          .string()
          .describe(
            "Business domain (e.g., sales, support, logistics, hr, onboarding)"
          ),
        complexity: z
          .string()
          .optional()
          .describe("simple (3-5 steps), medium (5-10), complex (10+)"),
      },
    },
    async ({ domain, complexity }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Create a BPMN process diagram for the "${domain}" domain with ${complexity || "medium"} complexity.

Use the create_bpmn_process tool to create the entire process at once.

Follow BPMN 2.0 conventions:
- Start with a "start" step
- Use "user-task" for human activities
- Use "service-task" for automated/system activities
- Use "manual-task" for physical activities
- Use "exclusive-gateway" for decision points (connect to multiple targets with labels like "Yes"/"No")
- Use "subprocess" for complex sub-activities
- End with an "end" step
- Every step must have connectTo edges to the next step(s)
- Gateway outputs should have descriptive labels

First check available shapes with the diagram://shapes resource, then create the process.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "explain-diagram",
    {
      description:
        "Read and explain the current diagram in human-readable format",
      argsSchema: {
        format: z
          .string()
          .optional()
          .describe("Output format: text, markdown, or bullet-points"),
      },
    },
    async ({ format }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Read the current diagram from the diagram://current resource and provide a ${format || "markdown"} description including:
1. High-level summary of the process
2. Number of nodes and edges
3. The flow from start to end, step by step
4. Decision points (gateways) and their branches
5. Any potential improvements or issues with the process design`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "optimize-layout",
    {
      description:
        "Analyze the current diagram layout and apply automatic improvements",
    },
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Analyze the current diagram from diagram://current resource.
1. Check if nodes are well-organized
2. Apply auto_layout tool if nodes seem disorganized
3. Use align_nodes and distribute_nodes to fine-tune positioning
4. Report what changes were made`,
          },
        },
      ],
    })
  );
}
