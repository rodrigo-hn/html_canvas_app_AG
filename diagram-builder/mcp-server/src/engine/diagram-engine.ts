import { v4 as uuid } from "uuid";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
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
  private tailwindCss: string;

  constructor() {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      this.tailwindCss = readFileSync(join(__dirname, '..', 'tailwind.css'), 'utf-8');
    } catch {
      this.tailwindCss = '';
    }
  }

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

  // ── BPMN-aware Layout (3-level semantic) ────────────────────

  layoutBpmn(
    direction: "left-to-right" | "top-to-bottom" = "left-to-right",
    spacing: number = 80
  ): void {
    if (this.model.nodes.length === 0) return;
    this.pushHistory();

    const isHorizontal = direction === "left-to-right";
    const LEVEL_OFFSET = 180;

    // Build adjacency
    const outgoing = new Map<string, Array<{ targetId: string; edgeId: string; label?: string }>>();
    const incomingCount = new Map<string, number>();
    for (const node of this.model.nodes) {
      outgoing.set(node.id, []);
      incomingCount.set(node.id, 0);
    }
    for (const edge of this.model.edges) {
      outgoing.get(edge.sourceId)?.push({ targetId: edge.targetId, edgeId: edge.id, label: edge.label });
      incomingCount.set(edge.targetId, (incomingCount.get(edge.targetId) ?? 0) + 1);
    }

    const isGateway = (id: string): boolean => (outgoing.get(id)?.length ?? 0) >= 2;

    // Classify branch semantics
    const classifyBranch = (edgeLabel: string | undefined, targetId: string): 'main' | 'retry' | 'error' => {
      const label = (edgeLabel || '').toLowerCase().trim();
      const targetNode = this.getNodeById(targetId);
      const targetText = ((targetNode?.data?.['text'] as string) || '').toLowerCase();
      const targetType = targetNode?.componentType || '';

      if (label === 'sí' || label === 'si' || label === 'yes' || label === 'ok' || label === 'aprobado') return 'main';
      if (targetText.includes('rechaz') || targetText.includes('cancel') || targetText.includes('error') ||
          targetText.includes('notificar rechazo') || targetType.includes('end-event')) return 'error';
      if (targetText.includes('backorder') || targetText.includes('espera') || targetText.includes('nuevo m') ||
          targetText.includes('reinten') || targetText.includes('solicitar')) return 'retry';
      if (label === 'no') return 'error';
      return 'main';
    };

    // ── Phase 1: BFS to assign columns and semantic levels ──

    const nodeCol = new Map<string, number>();
    const nodeLevel = new Map<string, number>();
    const visited = new Set<string>();

    const startNodes: string[] = [];
    for (const [id, count] of incomingCount) {
      if (count === 0) startNodes.push(id);
    }
    if (startNodes.length === 0 && this.model.nodes.length > 0) {
      startNodes.push(this.model.nodes[0].id);
    }

    interface QueueItem { id: string; col: number; level: number; }
    const queue: QueueItem[] = startNodes.map((id) => ({ id, col: 0, level: 0 }));

    let maxCol = 0;
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (visited.has(item.id)) {
        const existing = nodeCol.get(item.id) ?? 0;
        if (item.col > existing) nodeCol.set(item.id, item.col);
        continue;
      }
      visited.add(item.id);
      nodeCol.set(item.id, item.col);
      nodeLevel.set(item.id, item.level);
      maxCol = Math.max(maxCol, item.col);

      const edges = outgoing.get(item.id) ?? [];
      if (edges.length === 0) continue;

      if (isGateway(item.id) && edges.length >= 2) {
        for (let idx = 0; idx < edges.length; idx++) {
          const edge = edges[idx];
          const branchType = idx === 0 ? 'main' : classifyBranch(edge.label, edge.targetId);
          let targetLevel: number;
          switch (branchType) {
            case 'retry': targetLevel = item.level - 1; break;
            case 'error': targetLevel = item.level + 1; break;
            default:      targetLevel = item.level;     break;
          }
          if (!visited.has(edge.targetId)) {
            queue.push({ id: edge.targetId, col: item.col + 1, level: targetLevel });
          } else {
            const tc = nodeCol.get(edge.targetId) ?? 0;
            nodeCol.set(edge.targetId, Math.max(tc, item.col + 1));
          }
        }
      } else {
        for (const edge of edges) {
          if (!visited.has(edge.targetId)) {
            queue.push({ id: edge.targetId, col: item.col + 1, level: item.level });
          } else {
            const tc = nodeCol.get(edge.targetId) ?? 0;
            nodeCol.set(edge.targetId, Math.max(tc, item.col + 1));
          }
        }
      }
    }

    for (const node of this.model.nodes) {
      if (!visited.has(node.id)) {
        maxCol++;
        nodeCol.set(node.id, maxCol);
        nodeLevel.set(node.id, 0);
      }
    }

    // ── Phase 2: Detect gateways with loops → push below main flow ──

    for (const node of this.model.nodes) {
      if (!isGateway(node.id)) continue;
      const edges = outgoing.get(node.id) ?? [];
      const srcCol = nodeCol.get(node.id) ?? 0;
      const hasLoop = edges.some(e => (nodeCol.get(e.targetId) ?? Infinity) <= srcCol);
      if (hasLoop && (nodeLevel.get(node.id) ?? 0) === 0) {
        nodeLevel.set(node.id, 1);
      }
    }

    // ── Phase 3: Compute positions ──

    const colWidths = new Map<number, number>();
    for (const node of this.model.nodes) {
      const col = nodeCol.get(node.id) ?? 0;
      const current = colWidths.get(col) ?? 0;
      colWidths.set(col, Math.max(current, isHorizontal ? node.width : node.height));
    }

    const startX = 80;
    const mainY = 200;

    const colOffsets = new Map<number, number>();
    let xAccum = startX;
    for (let c = 0; c <= maxCol; c++) {
      colOffsets.set(c, xAccum);
      xAccum += (colWidths.get(c) ?? 160) + spacing;
    }

    for (const node of this.model.nodes) {
      const col = nodeCol.get(node.id) ?? 0;
      const level = nodeLevel.get(node.id) ?? 0;
      if (isHorizontal) {
        node.x = colOffsets.get(col) ?? startX;
        node.y = mainY + level * LEVEL_OFFSET;
      } else {
        node.x = mainY + level * LEVEL_OFFSET;
        node.y = colOffsets.get(col) ?? startX;
      }
    }

    // ── Phase 4: Anti-overlap pass ──

    const margin = 30;
    const nodesByCol = new Map<number, DiagramNode[]>();
    for (const node of this.model.nodes) {
      const col = nodeCol.get(node.id) ?? 0;
      if (!nodesByCol.has(col)) nodesByCol.set(col, []);
      nodesByCol.get(col)!.push(node);
    }
    for (const [, nodes] of nodesByCol) {
      if (nodes.length < 2) continue;
      nodes.sort((a, b) => a.y - b.y);
      for (let i = 1; i < nodes.length; i++) {
        const prev = nodes[i - 1];
        const curr = nodes[i];
        const overlap = (prev.y + prev.height + margin) - curr.y;
        if (overlap > 0) curr.y += overlap;
      }
    }

    // ── Phase 5: Assign semantic edge ports ──

    for (const edge of this.model.edges) {
      const src = this.getNodeById(edge.sourceId);
      const tgt = this.getNodeById(edge.targetId);
      if (!src || !tgt) continue;

      const srcLevel = nodeLevel.get(edge.sourceId) ?? 0;
      const tgtLevel = nodeLevel.get(edge.targetId) ?? 0;
      const srcCol = nodeCol.get(edge.sourceId) ?? 0;
      const tgtCol = nodeCol.get(edge.targetId) ?? 0;

      if (tgtCol <= srcCol) {
        // Back-edge (loop)
        if (tgtLevel < srcLevel) {
          edge.sourcePort = 'top';
          edge.targetPort = 'bottom';
        } else {
          edge.sourcePort = 'bottom';
          edge.targetPort = 'bottom';
        }
      } else if (tgtLevel < srcLevel) {
        // Re-entry upward
        edge.sourcePort = 'right';
        edge.targetPort = 'top';
      } else if (tgtLevel > srcLevel) {
        // Branching downward
        edge.sourcePort = 'bottom';
        edge.targetPort = isHorizontal ? 'left' : 'top';
      } else {
        // Same level forward
        edge.sourcePort = isHorizontal ? 'right' : 'bottom';
        edge.targetPort = isHorizontal ? 'left' : 'top';
      }
    }
  }

  selectPorts(source: DiagramNode, target: DiagramNode): { sourcePort: string; targetPort: string } {
    const srcCx = source.x + source.width / 2;
    const srcCy = source.y + source.height / 2;
    const tgtCx = target.x + target.width / 2;
    const tgtCy = target.y + target.height / 2;
    const dx = tgtCx - srcCx;
    const dy = tgtCy - srcCy;

    if (dx > 0 && Math.abs(dx) > Math.abs(dy) * 0.5) {
      return { sourcePort: 'right', targetPort: 'left' };
    }
    if (dy > 0 && Math.abs(dy) >= Math.abs(dx) * 0.5) {
      return { sourcePort: 'bottom', targetPort: 'top' };
    }
    if (dx < 0 && Math.abs(dx) > Math.abs(dy) * 0.5) {
      return { sourcePort: 'bottom', targetPort: 'bottom' };
    }
    return { sourcePort: 'top', targetPort: 'bottom' };
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

  // ── HTML Export (full BPMN rendering) ─────────────────────

  exportHtml(): string {
    const model = this.model;
    const bounds = this.getBounds();
    const sortedNodes = [...model.nodes].sort((a, b) => a.zIndex - b.zIndex);
    const backgroundNodesHtml = sortedNodes
      .filter((node) => node.zIndex <= 0)
      .map((node) => this.renderNodeHtml(node))
      .join('\n');
    const foregroundNodesHtml = sortedNodes
      .filter((node) => node.zIndex > 0)
      .map((node) => this.renderNodeHtml(node))
      .join('\n');
    const edgesHtml = this.renderEdgesHtml();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Diagram</title>
    <style>${this.tailwindCss}</style>
    <style>
      body { margin: 0; padding: 0; background-color: #f8fafc; overflow: auto; }
      .diagram-container { position: relative; width: ${bounds.width}px; height: ${bounds.height}px; }
      .diagram-canvas { position: relative; width: 100%; height: 100%; transform: translate(${-bounds.minX}px, ${-bounds.minY}px); transform-origin: top left; }
    </style>
</head>
<body>
    <div class="diagram-container">
      <div class="diagram-canvas">
${backgroundNodesHtml}
${edgesHtml}
${foregroundNodesHtml}
      </div>
    </div>
</body>
</html>`;
  }

  // ── SVG Export ─────────────────────────────────────────────

  exportSvg(): string {
    const model = this.model;
    if (model.nodes.length === 0) {
      return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
    }
    const bounds = this.getBounds();
    const sortedNodes = [...model.nodes].sort((a, b) => a.zIndex - b.zIndex);
    const nodesSvg = sortedNodes.map((node) => this.renderNodeSvg(node)).join('\n');
    const edgesSvg = this.renderEdgesSvg();

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
    </marker>
    <marker id="open-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M1,1 L9,3 L1,5" fill="none" stroke="context-stroke" stroke-width="1.5" />
    </marker>
    <marker id="open-circle" markerWidth="10" markerHeight="10" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
      <circle cx="3" cy="3" r="2" fill="#fff" stroke="context-stroke" stroke-width="1" />
    </marker>
  </defs>
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="#f8fafc" />
  ${edgesSvg}
  ${nodesSvg}
</svg>`;
  }

  // ── Private rendering helpers ─────────────────────────────

  private getBounds() {
    const padding = 40;
    const model = this.model;
    if (model.nodes.length === 0) {
      return { minX: 0, minY: 0, width: 1200, height: 800 };
    }
    const xs = model.nodes.flatMap((n) => [n.x, n.x + n.width]);
    const ys = model.nodes.flatMap((n) => [n.y, n.y + n.height]);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }

  private renderNodeHtml(node: DiagramNode): string {
    if (node.type === 'shape') return this.renderShapeHtml(node);
    return this.renderWebComponentHtml(node);
  }

  private renderShapeHtml(node: DiagramNode): string {
    const text = (node.data?.['text'] as string) || '';
    return `
      <div style="position:absolute;left:${node.x}px;top:${node.y}px;width:${node.width}px;height:${node.height}px;z-index:${node.zIndex};pointer-events:none;">
        <svg viewBox="0 0 ${node.width} ${node.height}" style="width:100%;height:100%;overflow:visible;">
          <rect width="${node.width}" height="${node.height}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2" />
        </svg>
        ${text ? `<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px;font-size:0.875rem;color:#f1f5f9;">${escapeXml(text)}</div>` : ''}
      </div>`;
  }

  private renderWebComponentHtml(node: DiagramNode): string {
    const style = `position:absolute;left:${node.x}px;top:${node.y}px;z-index:${node.zIndex};`;
    const ct = node.componentType;

    switch (ct) {
      case 'button': return this.renderButtonHtml(node, style);
      case 'input': return this.renderInputHtml(node, style);
      case 'card': return this.renderCardHtml(node, style);
      case 'bpmn-user-task-web': return this.renderBpmnTaskHtml(node, style, 'user', 'blue', false);
      case 'bpmn-service-task-web': return this.renderBpmnTaskHtml(node, style, 'service', 'blue', false);
      case 'bpmn-manual-task-web': return this.renderBpmnTaskHtml(node, style, 'manual', 'yellow', false);
      case 'bpmn-subprocess-web': return this.renderBpmnTaskHtml(node, style, 'subprocess', 'purple', true);
      case 'bpmn-start-event-web': return this.renderStartEventHtml(node, style);
      case 'bpmn-exclusive-gateway-web': return this.renderGatewayHtml(node, style);
      case 'bpmn-end-event-web': return this.renderEndEventHtml(node, style);
      case 'bpmn-lane-web': return this.renderLaneHtml(node, style, false);
      case 'bpmn-pool-web': return this.renderLaneHtml(node, style, true);
      default: return this.renderShapeHtml(node);
    }
  }

  private renderButtonHtml(node: DiagramNode, style: string): string {
    const text = (node.data?.['text'] as string) || 'Button';
    const variant = (node.data?.['variant'] as string) || 'primary';
    const colors: Record<string, string> = {
      primary: 'bg-blue-500 text-white', secondary: 'bg-gray-500 text-white',
      success: 'bg-green-500 text-white', danger: 'bg-red-500 text-white',
    };
    return `<button style="${style}" class="px-4 py-2 rounded font-semibold ${colors[variant] || colors.primary}">${escapeXml(text)}</button>`;
  }

  private renderInputHtml(node: DiagramNode, style: string): string {
    const label = (node.data?.['label'] as string) || '';
    const placeholder = (node.data?.['placeholder'] as string) || '';
    return `<div style="${style} width:${node.width}px;" class="flex flex-col">
      ${label ? `<label class="mb-1 text-sm font-bold text-gray-700">${escapeXml(label)}</label>` : ''}
      <input type="text" placeholder="${escapeXml(placeholder)}" class="shadow border rounded w-full py-2 px-3 text-gray-700">
    </div>`;
  }

  private renderCardHtml(node: DiagramNode, style: string): string {
    const title = (node.data?.['title'] as string) || 'Card';
    const content = (node.data?.['content'] as string) || '';
    return `<div style="${style} width:${node.width}px;height:${node.height}px;" class="rounded overflow-hidden shadow-lg bg-white">
      <div class="px-6 py-4"><div class="font-bold text-xl mb-2">${escapeXml(title)}</div><p class="text-gray-700 text-base">${escapeXml(content)}</p></div>
    </div>`;
  }

  private renderBpmnTaskHtml(node: DiagramNode, style: string, iconKind: string, defaultVariant: string, supportsBadge: boolean): string {
    const data = node.data || {};
    const variant = (data['variant'] as string) || defaultVariant;
    const text = (data['text'] as string) || 'Task';
    const iconEnabled = data['iconEnabled'] !== false;
    const badgeEnabled = data['badgeEnabled'] !== false;
    const tone = BPMN_TONES[variant] || BPMN_TONES.blue;
    const radius = supportsBadge ? '10px' : '8px';

    const iconSvg = iconEnabled ? BPMN_ICONS[iconKind]?.(tone.accent, 16) || '' : '';
    const iconHtml = iconSvg ? `<div style="position:absolute;left:7px;top:5px;line-height:1;">${iconSvg}</div>` : '';

    const badgeHtml = supportsBadge && badgeEnabled
      ? `<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:3px;width:14px;height:14px;border:2px solid ${tone.border};border-radius:2px;background:#0b0f14;color:${tone.accent};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;line-height:1;">+</div>`
      : '';

    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:2px solid ${tone.border};border-radius:${radius};background:#0b0f14;color:#f8fafc;padding:0.8rem 1.2rem;font-family:'DM Sans',sans-serif;position:absolute;box-sizing:border-box;">
        ${iconHtml}
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:0.8rem;font-weight:600;line-height:1.2;">
          ${escapeXml(text)}
        </div>
        ${badgeHtml}
      </div>`;
  }

  private renderStartEventHtml(node: DiagramNode, style: string): string {
    const iconSvg = BPMN_ICONS.start?.('#6ee7b7', 16) || '';
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:1.5px solid #4ade80;border-radius:9999px;background:transparent;display:flex;align-items:center;justify-content:center;position:absolute;box-sizing:border-box;">
        <span style="line-height:1;">${iconSvg}</span>
      </div>`;
  }

  private renderGatewayHtml(node: DiagramNode, style: string): string {
    const text = (node.data?.['text'] as string) || '';
    const labelHtml = text
      ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:0.75rem;font-weight:500;color:#eab308;white-space:nowrap;">${escapeXml(text)}</div>`
      : '';
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;position:absolute;box-sizing:border-box;">
        ${labelHtml}
        <div style="position:absolute;left:50%;top:50%;width:72%;height:72%;transform:translate(-50%,-50%) rotate(45deg);border:1.5px solid #facc15;background:#0b0f14;"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:700;color:#eab308;line-height:1;">&times;</div>
      </div>`;
  }

  private renderEndEventHtml(node: DiagramNode, style: string): string {
    const variant = (node.data?.['variant'] as string) || 'red';
    const colors: Record<string, { border: string; fill: string; dot: string }> = {
      red: { border: '#f87171', fill: 'rgba(248,113,113,0.20)', dot: '#ef4444' },
      green: { border: '#4ade80', fill: 'rgba(74,222,128,0.20)', dot: '#22c55e' },
    };
    const c = colors[variant] || colors.red;
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:2.5px solid ${c.border};border-radius:9999px;background:${c.fill};display:flex;align-items:center;justify-content:center;position:absolute;box-sizing:border-box;">
        <span style="font-size:10px;color:${c.dot};line-height:1;">&#9679;</span>
      </div>`;
  }

  private renderLaneHtml(node: DiagramNode, style: string, isPool: boolean): string {
    const label = escapeXml((node.data?.['text'] as string) || (isPool ? 'Pool' : 'Lane'));
    const barBg = isPool ? '#ea580c' : '#312e81';
    const border = isPool ? '#c2410c' : '#4338ca';
    const bg = isPool ? 'rgba(234,88,12,0.05)' : 'rgba(49,46,129,0.05)';
    const textColor = isPool ? '#fff7ed' : '#e0e7ff';
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:${isPool ? 1.5 : 1}px solid ${border};${isPool ? 'border-radius:6px;' : ''}background:${bg};position:absolute;box-sizing:border-box;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:40px;border-right:1px solid ${border};background:${barBg};display:flex;align-items:center;justify-content:center;${isPool ? 'border-radius:6px 0 0 6px;' : ''}">
          <div style="font-size:0.75rem;font-weight:${isPool ? 700 : 500};color:${textColor};font-family:'DM Sans',sans-serif;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;">${label}</div>
        </div>
      </div>`;
  }

  private renderNodeSvg(node: DiagramNode): string {
    const label = escapeXml((node.data?.['text'] as string) || node.shapeType || node.componentType || node.id);
    return `<g>
      <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="8" fill="#1e293b" stroke="#475569" stroke-width="2" />
      <text x="${node.x + node.width / 2}" y="${node.y + node.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="13" font-weight="600" fill="#f1f5f9">${label}</text>
    </g>`;
  }

  // ── Edge rendering ────────────────────────────────────────

  private renderEdgesHtml(): string {
    const model = this.model;
    if (!model.edges || model.edges.length === 0) return '';
    const paths = model.edges.map((edge) => this.renderSingleEdge(edge)).filter(Boolean).join('\n');
    return `
      <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow:visible;">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
          </marker>
          <marker id="open-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M1,1 L9,3 L1,5" fill="none" stroke="context-stroke" stroke-width="1.5" />
          </marker>
          <marker id="open-circle" markerWidth="10" markerHeight="10" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
            <circle cx="3" cy="3" r="2" fill="#fff" stroke="context-stroke" stroke-width="1" />
          </marker>
        </defs>
        ${paths}
      </svg>`;
  }

  private renderEdgesSvg(): string {
    const model = this.model;
    if (!model.edges || model.edges.length === 0) return '';
    return model.edges.map((edge) => this.renderSingleEdge(edge)).filter(Boolean).join('\n');
  }

  private renderSingleEdge(edge: DiagramEdge): string {
    const start = this.getPortPoint(edge.sourceId, (edge.sourcePort || 'right') as any);
    const end = this.getPortPoint(edge.targetId, (edge.targetPort || 'left') as any);
    if (!start || !end) return '';

    const flowType = edge.flowType || 'sequence';
    const stroke = edge.color || '#64748b';
    const strokeWidth = (edge.style?.['strokeWidth'] as number) || 2;
    const dashArray = flowType === 'message' ? '6 4' : flowType === 'association' ? '3 4' : '';
    const markerEnd = flowType === 'association' ? '' : flowType === 'message' ? 'url(#open-arrow)' : 'url(#arrow)';
    const markerStart = flowType === 'message' ? 'url(#open-circle)' : '';
    const cornerRadius = flowType === 'message' ? 6 : flowType === 'association' ? 4 : 8;

    const points = this.buildOrthogonalPoints(start, end, (edge.sourcePort || 'right') as any, (edge.targetPort || 'left') as any, edge.points || []);
    const d = this.pointsToPath(points, cornerRadius);
    const labelRatio = (edge.label && edge.label.length <= 3) ? 0.25 : 0.5;
    const labelPoint = this.polylineMidpoint(points, labelRatio);

    let labelSvg = '';
    if (edge.label) {
      const lw = edge.label.length * 6.5 + 8;
      labelSvg = `<rect x="${labelPoint.x - lw / 2}" y="${labelPoint.y - 8}" width="${lw}" height="16" rx="3" fill="white" fill-opacity="0.85" />` +
        `<text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-size="11" font-weight="600">${escapeXml(edge.label)}</text>`;
    }

    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${dashArray ? ` stroke-dasharray="${dashArray}"` : ''}${markerStart ? ` marker-start="${markerStart}"` : ''}${markerEnd ? ` marker-end="${markerEnd}"` : ''} />${labelSvg}`;
  }

  private getPortPoint(nodeId: string, port: 'top' | 'right' | 'bottom' | 'left'): Point | null {
    const node = this.model.nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    switch (port) {
      case 'top': return { x: node.x + node.width / 2, y: node.y };
      case 'right': return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom': return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left': return { x: node.x, y: node.y + node.height / 2 };
    }
  }

  private buildOrthogonalPoints(start: Point, end: Point, sourcePort: string, targetPort: string, manualPoints: Point[]): Point[] {
    const offset = 25;
    const pushFromPort = (point: Point, port: string, dist: number): Point => {
      switch (port) {
        case 'top': return { x: point.x, y: point.y - dist };
        case 'right': return { x: point.x + dist, y: point.y };
        case 'bottom': return { x: point.x, y: point.y + dist };
        case 'left': return { x: point.x - dist, y: point.y };
        default: return point;
      }
    };
    const guessPort = (s: Point, e: Point): string => {
      const dx = e.x - s.x;
      const dy = e.y - s.y;
      return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'left' : 'right') : (dy >= 0 ? 'top' : 'bottom');
    };
    const oppositePort = (p: string): string => {
      const map: Record<string, string> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
      return map[p] || p;
    };

    // Back-edge detection: both ports are bottom (loop routing)
    if (sourcePort === 'bottom' && targetPort === 'bottom') {
      const so = pushFromPort(start, 'bottom', offset);
      const ei = pushFromPort(end, 'bottom', offset);
      const loopY = Math.max(so.y, ei.y) + offset * 2;
      return this.simplifyPoints([start, so, { x: so.x, y: loopY }, { x: ei.x, y: loopY }, ei, end]);
    }

    const routeSimple = (s: Point, e: Point, sp: string, tp: string): Point[] => {
      const so = pushFromPort(s, sp, offset);
      const ei = pushFromPort(e, tp, offset);

      // If source is right and target is to the left of source (needs L-routing)
      if (sp === 'right' && ei.x < so.x) {
        const detourY = Math.max(so.y, ei.y) + offset * 3;
        return this.simplifyPoints([s, so, { x: so.x, y: detourY }, { x: ei.x, y: detourY }, ei, e]);
      }

      // If source is bottom, route down then across
      if (sp === 'bottom') {
        return this.simplifyPoints([s, so, { x: so.x, y: so.y + offset }, { x: ei.x, y: so.y + offset }, ei, e]);
      }

      const mid = { x: ei.x, y: so.y };
      return this.simplifyPoints([s, so, mid, ei, e]);
    };

    const target = targetPort || guessPort(start, end);
    if (manualPoints.length > 0) {
      let all: Point[] = [];
      let segStart = start;
      let segPort = sourcePort;
      for (const mp of manualPoints) {
        const segEndPort = guessPort(segStart, mp);
        const seg = routeSimple(segStart, mp, segPort, segEndPort);
        all = all.length === 0 ? seg : [...all, ...seg.slice(1)];
        segStart = mp;
        segPort = oppositePort(segEndPort);
      }
      const lastSeg = routeSimple(segStart, end, guessPort(segStart, end), target);
      return this.simplifyPoints([...all, ...lastSeg.slice(1)]);
    }
    return routeSimple(start, end, sourcePort, target);
  }

  private pointsToPath(points: Point[], cornerRadius = 0): string {
    if (points.length === 0) return '';
    if (cornerRadius <= 0 || points.length < 3) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      if (i === points.length - 1) {
        d += ` L ${points[i].x} ${points[i].y}`;
        continue;
      }
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
      const v2 = { x: next.x - curr.x, y: next.y - curr.y };
      if ((v1.x === 0 && v2.x === 0) || (v1.y === 0 && v2.y === 0)) {
        d += ` L ${curr.x} ${curr.y}`;
        continue;
      }
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      if (len1 === 0 || len2 === 0) {
        d += ` L ${curr.x} ${curr.y}`;
        continue;
      }
      const r = Math.min(cornerRadius, len1 / 2, len2 / 2);
      const p1 = { x: curr.x - (v1.x / len1) * r, y: curr.y - (v1.y / len1) * r };
      const p2 = { x: curr.x + (v2.x / len2) * r, y: curr.y + (v2.y / len2) * r };
      d += ` L ${p1.x} ${p1.y}`;
      const cross = v1.x * v2.y - v1.y * v2.x;
      const sweep = cross > 0 ? 1 : 0;
      d += ` A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`;
    }
    return d;
  }

  private simplifyPoints(points: Point[]): Point[] {
    const cleaned: Point[] = [];
    for (const p of points) {
      const last = cleaned[cleaned.length - 1];
      if (!last || last.x !== p.x || last.y !== p.y) cleaned.push(p);
    }
    const result: Point[] = [];
    for (let i = 0; i < cleaned.length; i++) {
      const prev = result[result.length - 1];
      const curr = cleaned[i];
      const next = cleaned[i + 1];
      if (!prev || !next) { result.push(curr); continue; }
      const colinear = (curr.x - prev.x === 0 && next.x - curr.x === 0) || (curr.y - prev.y === 0 && next.y - curr.y === 0);
      if (!colinear) result.push(curr);
    }
    return result;
  }

  private polylineMidpoint(points: Point[], ratio: number = 0.5): Point {
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return points[0];
    let totalLength = 0;
    const segments: Array<{ from: Point; to: Point; length: number }> = [];
    for (let i = 1; i < points.length; i++) {
      const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      segments.push({ from: points[i - 1], to: points[i], length: len });
      totalLength += len;
    }
    if (totalLength <= 0) return points[Math.floor(points.length / 2)];
    const target = totalLength * ratio;
    let traveled = 0;
    for (const seg of segments) {
      if (traveled + seg.length >= target) {
        const t = (target - traveled) / seg.length;
        return { x: seg.from.x + (seg.to.x - seg.from.x) * t, y: seg.from.y + (seg.to.y - seg.from.y) * t };
      }
      traveled += seg.length;
    }
    return points[points.length - 1];
  }
}

// ── BPMN visual constants (outside class) ─────────────────

const BPMN_TONES: Record<string, { border: string; accent: string }> = {
  blue: { border: '#60a5fa', accent: '#3b82f6' },
  yellow: { border: '#facc15', accent: '#eab308' },
  green: { border: '#4ade80', accent: '#22c55e' },
  purple: { border: '#c084fc', accent: '#a855f7' },
  red: { border: '#f87171', accent: '#ef4444' },
};

const BPMN_ICONS: Record<string, (color: string, size: number) => string> = {
  user: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  service: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  manual: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.7-2.4L3.4 16a2 2 0 1 1 3.2-2.4L8 16"/></svg>`,
  subprocess: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>`,
  start: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
};

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
