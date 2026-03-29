import { v4 as uuid } from "uuid";
import type {
  DiagramModel,
  DiagramNode,
  DiagramEdge,
  Point,
  BpmnFlowType,
} from "../shared/types.js";

export class DiagramEngine {
  private model: DiagramModel = { modelVersion: 2, nodes: [], edges: [] };
  private historyPast: DiagramModel[] = [];
  private historyFuture: DiagramModel[] = [];

  // ── State ──────────────────────────────────────────────────

  getModel(): DiagramModel {
    return structuredClone(this.model);
  }

  getNodes(): DiagramNode[] {
    return this.model.nodes;
  }

  getEdges(): DiagramEdge[] {
    return this.model.edges;
  }

  getNodeById(id: string): DiagramNode | undefined {
    return this.model.nodes.find((n) => n.id === id);
  }

  getEdgeById(id: string): DiagramEdge | undefined {
    return this.model.edges.find((e) => e.id === id);
  }

  // ── History ────────────────────────────────────────────────

  private pushHistory(): void {
    this.historyPast.push(structuredClone(this.model));
    if (this.historyPast.length > 120) this.historyPast.shift();
    this.historyFuture = [];
  }

  undo(): boolean {
    const prev = this.historyPast.pop();
    if (!prev) return false;
    this.historyFuture.push(structuredClone(this.model));
    this.model = prev;
    return true;
  }

  redo(): boolean {
    const next = this.historyFuture.pop();
    if (!next) return false;
    this.historyPast.push(structuredClone(this.model));
    this.model = next;
    return true;
  }

  canUndo(): boolean {
    return this.historyPast.length > 0;
  }
  canRedo(): boolean {
    return this.historyFuture.length > 0;
  }

  // ── Node Operations ────────────────────────────────────────

  addNode(node: Partial<DiagramNode> & { type: string }): DiagramNode {
    this.pushHistory();
    const newNode: DiagramNode = {
      id: node.id || uuid(),
      type: node.type as DiagramNode["type"],
      x: node.x ?? 100,
      y: node.y ?? 100,
      width: node.width ?? 160,
      height: node.height ?? 80,
      zIndex: node.zIndex ?? this.model.nodes.length + 1,
      shapeType: node.shapeType,
      componentType: node.componentType,
      data: node.data ?? {},
      style: node.style,
      rotation: node.rotation,
    };
    this.model.nodes.push(newNode);
    return newNode;
  }

  updateNode(
    id: string,
    changes: Partial<DiagramNode>
  ): DiagramNode | null {
    const node = this.model.nodes.find((n) => n.id === id);
    if (!node) return null;
    this.pushHistory();
    Object.assign(node, changes);
    return node;
  }

  updateNodeData(
    id: string,
    dataChanges: Record<string, unknown>
  ): DiagramNode | null {
    const node = this.model.nodes.find((n) => n.id === id);
    if (!node) return null;
    this.pushHistory();
    node.data = { ...node.data, ...dataChanges };
    return node;
  }

  removeNode(id: string): boolean {
    const idx = this.model.nodes.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.pushHistory();
    this.model.nodes.splice(idx, 1);
    this.model.edges = this.model.edges.filter(
      (e) => e.sourceId !== id && e.targetId !== id
    );
    return true;
  }

  // ── Edge Operations ────────────────────────────────────────

  addEdge(
    edge: Partial<DiagramEdge> & { sourceId: string; targetId: string }
  ): DiagramEdge {
    this.pushHistory();
    const newEdge: DiagramEdge = {
      id: edge.id || uuid(),
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      sourcePort: edge.sourcePort,
      targetPort: edge.targetPort,
      flowType: (edge.flowType as BpmnFlowType) ?? "sequence",
      label: edge.label,
      color: edge.color,
      points: edge.points ?? [],
      markerEnd: edge.markerEnd ?? "arrow",
      markerStart: edge.markerStart,
      style: edge.style,
      zIndex: edge.zIndex ?? 0,
    };
    this.model.edges.push(newEdge);
    return newEdge;
  }

  updateEdge(
    id: string,
    changes: Partial<DiagramEdge>
  ): DiagramEdge | null {
    const edge = this.model.edges.find((e) => e.id === id);
    if (!edge) return null;
    this.pushHistory();
    Object.assign(edge, changes);
    return edge;
  }

  removeEdge(id: string): boolean {
    const idx = this.model.edges.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.pushHistory();
    this.model.edges.splice(idx, 1);
    return true;
  }

  // ── Layout ─────────────────────────────────────────────────

  alignNodes(ids: string[], mode: string): number {
    const nodes = this.model.nodes.filter((n) => ids.includes(n.id));
    if (nodes.length < 2) return 0;
    this.pushHistory();

    switch (mode) {
      case "left": {
        const v = Math.min(...nodes.map((n) => n.x));
        nodes.forEach((n) => (n.x = v));
        break;
      }
      case "top": {
        const v = Math.min(...nodes.map((n) => n.y));
        nodes.forEach((n) => (n.y = v));
        break;
      }
      case "right": {
        const v = Math.max(...nodes.map((n) => n.x + n.width));
        nodes.forEach((n) => (n.x = v - n.width));
        break;
      }
      case "bottom": {
        const v = Math.max(...nodes.map((n) => n.y + n.height));
        nodes.forEach((n) => (n.y = v - n.height));
        break;
      }
      case "center": {
        const avg =
          nodes.reduce((s, n) => s + n.x + n.width / 2, 0) / nodes.length;
        nodes.forEach((n) => (n.x = avg - n.width / 2));
        break;
      }
      case "middle": {
        const avg =
          nodes.reduce((s, n) => s + n.y + n.height / 2, 0) / nodes.length;
        nodes.forEach((n) => (n.y = avg - n.height / 2));
        break;
      }
    }
    return nodes.length;
  }

  distributeNodes(ids: string[], axis: "horizontal" | "vertical"): number {
    const nodes = this.model.nodes.filter((n) => ids.includes(n.id));
    if (nodes.length < 3) return 0;
    this.pushHistory();

    if (axis === "horizontal") {
      nodes.sort((a, b) => a.x - b.x);
      const min = nodes[0].x;
      const max = nodes[nodes.length - 1].x;
      const step = (max - min) / (nodes.length - 1);
      nodes.forEach((n, i) => (n.x = min + step * i));
    } else {
      nodes.sort((a, b) => a.y - b.y);
      const min = nodes[0].y;
      const max = nodes[nodes.length - 1].y;
      const step = (max - min) / (nodes.length - 1);
      nodes.forEach((n, i) => (n.y = min + step * i));
    }
    return nodes.length;
  }

  autoLayout(
    direction: "left-to-right" | "top-to-bottom" = "left-to-right",
    spacing: number = 60
  ): void {
    if (this.model.nodes.length === 0) return;
    this.pushHistory();

    // Build adjacency from edges
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, number>();
    for (const node of this.model.nodes) {
      outgoing.set(node.id, []);
      incoming.set(node.id, 0);
    }
    for (const edge of this.model.edges) {
      outgoing.get(edge.sourceId)?.push(edge.targetId);
      incoming.set(edge.targetId, (incoming.get(edge.targetId) ?? 0) + 1);
    }

    // Topological sort (Kahn's algorithm)
    const queue: string[] = [];
    for (const [id, count] of incoming) {
      if (count === 0) queue.push(id);
    }
    const layers: string[][] = [];
    const visited = new Set<string>();
    while (queue.length > 0) {
      const layer = [...queue];
      layers.push(layer);
      queue.length = 0;
      for (const id of layer) {
        visited.add(id);
        for (const targetId of outgoing.get(id) ?? []) {
          const newCount = (incoming.get(targetId) ?? 1) - 1;
          incoming.set(targetId, newCount);
          if (newCount === 0 && !visited.has(targetId)) queue.push(targetId);
        }
      }
    }

    // Place any unvisited nodes in a final layer
    const remaining = this.model.nodes
      .filter((n) => !visited.has(n.id))
      .map((n) => n.id);
    if (remaining.length > 0) layers.push(remaining);

    // Assign positions
    const isHorizontal = direction === "left-to-right";
    let primaryOffset = 80;

    for (const layer of layers) {
      let maxPrimarySize = 0;
      let secondaryOffset = 80;
      for (const nodeId of layer) {
        const node = this.getNodeById(nodeId);
        if (!node) continue;
        if (isHorizontal) {
          node.x = primaryOffset;
          node.y = secondaryOffset;
          secondaryOffset += node.height + spacing;
          maxPrimarySize = Math.max(maxPrimarySize, node.width);
        } else {
          node.x = secondaryOffset;
          node.y = primaryOffset;
          secondaryOffset += node.width + spacing;
          maxPrimarySize = Math.max(maxPrimarySize, node.height);
        }
      }
      primaryOffset += maxPrimarySize + spacing * 1.5;
    }
  }

  // ── Import / Export ────────────────────────────────────────

  loadFromJson(json: string): void {
    this.pushHistory();
    const parsed = JSON.parse(json);
    this.model = {
      modelVersion: parsed.modelVersion ?? 2,
      nodes: parsed.nodes ?? [],
      edges: parsed.edges ?? [],
    };
  }

  exportJson(): string {
    return JSON.stringify(this.model, null, 2);
  }

  clear(): void {
    this.pushHistory();
    this.model = { modelVersion: 2, nodes: [], edges: [] };
  }

  // ── SVG Export ─────────────────────────────────────────────

  exportSvg(): string {
    const model = this.model;
    if (model.nodes.length === 0) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
    }

    const pad = 40;
    const minX = Math.min(...model.nodes.map((n) => n.x)) - pad;
    const minY = Math.min(...model.nodes.map((n) => n.y)) - pad;
    const maxX = Math.max(...model.nodes.map((n) => n.x + n.width)) + pad;
    const maxY = Math.max(...model.nodes.map((n) => n.y + n.height)) + pad;
    const w = maxX - minX;
    const h = maxY - minY;

    const lines: string[] = [];
    lines.push(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${w} ${h}" width="${w}" height="${h}">`
    );

    // Marker defs
    lines.push("  <defs>");
    lines.push(
      '    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">'
    );
    lines.push(
      '      <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />'
    );
    lines.push("    </marker>");
    lines.push(
      '    <marker id="open-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">'
    );
    lines.push(
      '      <path d="M0,0 L9,3 L0,6" fill="none" stroke="#64748b" stroke-width="1.5" />'
    );
    lines.push("    </marker>");
    lines.push(
      '    <marker id="open-circle" markerWidth="10" markerHeight="10" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">'
    );
    lines.push(
      '      <circle cx="3" cy="3" r="2" fill="none" stroke="#64748b" stroke-width="1" />'
    );
    lines.push("    </marker>");
    lines.push("  </defs>");

    // Edges
    for (const edge of model.edges) {
      const src = model.nodes.find((n) => n.id === edge.sourceId);
      const tgt = model.nodes.find((n) => n.id === edge.targetId);
      if (!src || !tgt) continue;

      const x1 = src.x + src.width / 2;
      const y1 = src.y + src.height / 2;
      const x2 = tgt.x + tgt.width / 2;
      const y2 = tgt.y + tgt.height / 2;

      const stroke = edge.color || "#64748b";
      const sw = (edge.style?.["strokeWidth"] as number) || 2;
      const dash = edge.flowType === "message" ? ' stroke-dasharray="6 4"' : edge.flowType === "association" ? ' stroke-dasharray="3 4"' : "";
      const me = edge.markerEnd ? ` marker-end="url(#${edge.markerEnd})"` : "";
      const ms = edge.markerStart ? ` marker-start="url(#${edge.markerStart})"` : "";

      lines.push(
        `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash}${me}${ms} />`
      );

      if (edge.label) {
        const lx = (x1 + x2) / 2;
        const ly = (y1 + y2) / 2;
        lines.push(
          `  <rect x="${lx - edge.label.length * 3.5 - 4}" y="${ly - 8}" width="${edge.label.length * 7 + 8}" height="16" rx="3" fill="white" fill-opacity="0.85" />`
        );
        lines.push(
          `  <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="600" fill="#334155">${escapeXml(edge.label)}</text>`
        );
      }
    }

    // Nodes
    for (const node of [...model.nodes].sort((a, b) => a.zIndex - b.zIndex)) {
      const label =
        (node.data?.["text"] as string) ||
        node.shapeType ||
        node.componentType ||
        node.id;

      lines.push(
        `  <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2" />`
      );
      lines.push(
        `  <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="600" fill="#f1f5f9">${escapeXml(label)}</text>`
      );
    }

    lines.push("</svg>");
    return lines.join("\n");
  }

  // ── HTML Export ────────────────────────────────────────────

  exportHtml(): string {
    const svg = this.exportSvg();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagram Export</title>
  <style>
    body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; }
    svg { max-width: 95vw; max-height: 95vh; }
  </style>
</head>
<body>
${svg}
</body>
</html>`;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
