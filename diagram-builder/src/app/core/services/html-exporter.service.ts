import { Injectable, inject } from '@angular/core';
import {
  DiagramEdge,
  DiagramModel,
  DiagramNode,
  Point,
  ShapeNode,
  WebButtonNode,
  WebCardNode,
  WebInputNode,
  WebNode,
} from '../models/diagram.model';
import { BasicShapes } from '../../stencils/shapes/basic.shapes';
import { BpmnShapes } from '../../stencils/shapes/bpmn.shapes';
import { StencilService } from '../../stencils/stencil.service';
import {
  BPMN_VISUAL_TOKENS,
  EDGE_MARKER_TOKENS,
  bpmnIconSvg,
  bpmnTaskTone,
  type BpmnTaskIconKind,
  type BpmnWebTaskVariant,
} from '../styles/bpmn-visual-tokens';

@Injectable({
  providedIn: 'root',
})
export class HtmlExportService {
  private stencilService = inject(StencilService);

  exportHtml(model: DiagramModel): string {
    const bounds = this.getBounds(model);
    const sortedNodes = [...model.nodes].sort((a, b) => a.zIndex - b.zIndex);
    const backgroundNodesHtml = sortedNodes
      .filter((node) => node.zIndex <= 0)
      .map((node) => this.renderNodeHtml(node))
      .join('\n');
    const foregroundNodesHtml = sortedNodes
      .filter((node) => node.zIndex > 0)
      .map((node) => this.renderNodeHtml(node))
      .join('\n');

    const edgesHtml = this.renderEdges(model);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Diagram</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
</html>
    `;
  }

  exportSvg(model: DiagramModel): string {
    const bounds = this.getBounds(model);
    const sortedNodes = [...model.nodes].sort((a, b) => a.zIndex - b.zIndex);
    const backgroundNodesSvg = sortedNodes
      .filter((node) => node.zIndex <= 0)
      .map((node) => this.renderNodeSvg(node))
      .join('\n');
    const edgesSvg = this.renderEdgesSvg(model);
    const foregroundNodesSvg = sortedNodes
      .filter((node) => node.zIndex > 0)
      .map((node) => this.renderNodeSvg(node))
      .join('\n');

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}">
  <defs>
    <marker
      id="arrow"
      markerWidth="${EDGE_MARKER_TOKENS.arrow.markerWidth}"
      markerHeight="${EDGE_MARKER_TOKENS.arrow.markerHeight}"
      refX="${EDGE_MARKER_TOKENS.arrow.refX}"
      refY="${EDGE_MARKER_TOKENS.arrow.refY}"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
    </marker>
    <marker
      id="open-arrow"
      markerWidth="${EDGE_MARKER_TOKENS.openArrow.markerWidth}"
      markerHeight="${EDGE_MARKER_TOKENS.openArrow.markerHeight}"
      refX="${EDGE_MARKER_TOKENS.openArrow.refX}"
      refY="${EDGE_MARKER_TOKENS.openArrow.refY}"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M1,1 L9,3 L1,5" fill="none" stroke="context-stroke" stroke-width="${EDGE_MARKER_TOKENS.openArrow.strokeWidth}" />
    </marker>
    <marker
      id="open-circle"
      markerWidth="${EDGE_MARKER_TOKENS.openCircle.markerWidth}"
      markerHeight="${EDGE_MARKER_TOKENS.openCircle.markerHeight}"
      refX="${EDGE_MARKER_TOKENS.openCircle.refX}"
      refY="${EDGE_MARKER_TOKENS.openCircle.refY}"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <circle cx="${EDGE_MARKER_TOKENS.openCircle.refX}" cy="${EDGE_MARKER_TOKENS.openCircle.refY}" r="${EDGE_MARKER_TOKENS.openCircle.radius}" fill="#fff" stroke="context-stroke" stroke-width="${EDGE_MARKER_TOKENS.openCircle.strokeWidth}" />
    </marker>
  </defs>
  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="#f8fafc" />
  ${backgroundNodesSvg}
  ${edgesSvg}
  ${foregroundNodesSvg}
</svg>
    `;
  }

  private renderNodeHtml(node: DiagramNode): string {
    if (node.type === 'shape') {
      return this.renderShape(node as ShapeNode);
    }
    return this.renderWebComponent(node as WebNode);
  }

  async exportPng(model: DiagramModel): Promise<Blob> {
    const svg = this.exportSvg(model);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1200;
        canvas.height = img.height || 800;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('PNG export failed'));
            return;
          }
          resolve(blob);
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG image load failed'));
      };
      img.src = url;
    });
  }

  private renderShape(node: ShapeNode): string {
    // We need to extract the inner HTML from the StencilService or generator
    // StencilService returns SafeHtml, so strictly we should access the generator directly or sanitized string.
    // For export, we need the raw string. StencilService wraps in sanitization.
    // I should probably expose the raw string generator in StencilService or access BasicShapes directly.
    // Ideally StencilService should have a getRawShapeSVG method.
    // For now, I will bypass and use the registry logic if possible, or cast/string manips.

    // Better approach: StencilService should expose 'getShapeSVGString'.
    // I will assume I can access the generator logic or duplicate for now.
    // Actually, I can just use the StencilService.shapes if I make it public or similar.
    // But since I can't easily change StencilService visibility without another generic tool call...
    // I will use a simple workaround: access the raw generators if imported?
    // I imported them in StencilService. I can import them here too.

    // Let's import BasicShapes and BpmnShapes directly here.
    return this.generateSvgWrapper(node, this.getSvgContent(node));
  }

  private getSvgContent(node: ShapeNode): string {
    const shapes: Record<string, (w: number, h: number) => string> = {
      rectangle: BasicShapes.rectangle,
      'rounded-rectangle': BasicShapes.roundedRectangle,
      document: BasicShapes.document,
      cylinder: BasicShapes.cylinder,
      diamond: BasicShapes.diamond,
      'bpmn-task': BpmnShapes.task,
      'bpmn-subprocess': BpmnShapes.subprocess,
      'bpmn-call-activity': BpmnShapes.callActivity,
      'bpmn-transaction': BpmnShapes.transaction,
      'bpmn-event-subprocess': BpmnShapes.eventSubprocess,
      'bpmn-start-event': BpmnShapes.eventStart,
      'bpmn-intermediate-event': BpmnShapes.eventIntermediate,
      'bpmn-boundary-event': BpmnShapes.eventBoundary,
      'bpmn-throwing-event': BpmnShapes.eventThrowing,
      'bpmn-event-message': BpmnShapes.eventMessage,
      'bpmn-event-timer': BpmnShapes.eventTimer,
      'bpmn-event-error': BpmnShapes.eventError,
      'bpmn-event-signal': BpmnShapes.eventSignal,
      'bpmn-event-escalation': BpmnShapes.eventEscalation,
      'bpmn-end-event': BpmnShapes.eventEnd,
      'bpmn-gateway': BpmnShapes.gateway,
      'bpmn-gateway-exclusive': BpmnShapes.gatewayExclusive,
      'bpmn-gateway-inclusive': BpmnShapes.gatewayInclusive,
      'bpmn-gateway-parallel': BpmnShapes.gatewayParallel,
      'bpmn-gateway-event-based': BpmnShapes.gatewayEventBased,
      'bpmn-pool': BpmnShapes.pool,
      'bpmn-lane': BpmnShapes.lane,
      'bpmn-data-object': BpmnShapes.dataObject,
      'bpmn-data-store': BpmnShapes.dataStore,
      'bpmn-group': BpmnShapes.group,
      'bpmn-text-annotation': BpmnShapes.textAnnotation,
      'bpmn-choreography-task': BpmnShapes.choreoTask,
      'bpmn-choreography-subprocess': BpmnShapes.choreoSubprocess,
      'bpmn-conversation': BpmnShapes.conversation,
      'bpmn-sequence-flow': BpmnShapes.sequenceFlow,
      'bpmn-message-flow': BpmnShapes.messageFlow,
      'bpmn-association': BpmnShapes.association,
    };
    const generator = shapes[node.shapeType];
    if (generator) {
      return generator(node.width, node.height);
    }
    return `<rect width="${node.width}" height="${node.height}" fill="white" stroke="#111" stroke-width="2" stroke-dasharray="6 4"/>`;
  }

  private generateSvgWrapper(node: ShapeNode, innerContent: string): string {
    return `
      <div style="position: absolute; left: ${node.x}px; top: ${node.y}px; width: ${
      node.width
    }px; height: ${node.height}px; z-index: ${node.zIndex}; pointer-events: none;">
        <svg viewBox="0 0 ${node.width} ${
      node.height
    }" style="width: 100%; height: 100%; overflow: visible;">
           ${innerContent}
        </svg>
        ${
          node.data?.text
            ? `
        <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; font-size: 0.875rem;">
            ${node.data.text}
        </div>`
            : ''
        }
      </div>`;
  }

  private renderWebComponent(node: WebNode): string {
    const style = `position: absolute; left: ${node.x}px; top: ${node.y}px; z-index: ${node.zIndex};`;

    switch (node.componentType) {
      case 'button':
        return this.renderButton(node as WebButtonNode, style);
      case 'input':
        return this.renderInput(node as WebInputNode, style);
      case 'card':
        return this.renderCard(node as WebCardNode, style);
      case 'bpmn-user-task-web':
        return this.renderBpmnWebTask(node, style, 'user', 'blue', false);
      case 'bpmn-service-task-web':
        return this.renderBpmnWebTask(node, style, 'service', 'blue', false);
      case 'bpmn-manual-task-web':
        return this.renderBpmnWebTask(node, style, 'manual', 'yellow', false);
      case 'bpmn-subprocess-web':
        return this.renderBpmnWebTask(node, style, 'subprocess', 'purple', true);
      case 'bpmn-start-event-web':
        return this.renderBpmnStartEventWeb(node, style);
      case 'bpmn-exclusive-gateway-web':
        return this.renderBpmnExclusiveGatewayWeb(node, style);
      case 'bpmn-end-event-web':
        return this.renderBpmnEndEventWeb(node, style);
      case 'bpmn-lane-web':
        return this.renderBpmnLaneWeb(node, style, false);
      case 'bpmn-pool-web':
        return this.renderBpmnLaneWeb(node, style, true);
      default:
        return `<!-- Unknown component -->`;
    }
  }

  private renderEdges(model: DiagramModel): string {
    if (!model.edges || model.edges.length === 0) return '';

    const paths = model.edges
      .map((edge) => {
        const start = this.getPortPoint(model, edge.sourceId, edge.sourcePort || 'right');
        const end = this.getPortPoint(model, edge.targetId, edge.targetPort || 'left');
        if (!start || !end) return '';
        const stroke = edge.color || edge.style?.stroke || '#1f2937';
        const strokeWidth = edge.style?.strokeWidth || 2;
        const markerEndId = edge.markerEnd || this.defaultMarkerEnd(edge);
        const markerStartId = edge.markerStart || this.defaultMarkerStart(edge);
        const markerEnd = markerEndId ? `url(#${markerEndId})` : '';
        const markerStart = markerStartId ? `url(#${markerStartId})` : '';
        const dashArray = edge.style?.dashArray || this.defaultDashArray(edge);
        const points = this.buildOrthogonalPoints(
          start,
          end,
          edge.sourcePort || 'right',
          edge.targetPort || 'left',
          edge.points || []
        );
        const d = this.pointsToPath(points, edge.style?.cornerRadius ?? this.defaultCornerRadius(edge));
        const labelPoint = this.edgeLabelPoint(edge, points);
        const label = edge.label
          ? `<text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-size="11" font-weight="600">${this.escapeText(edge.label)}</text>`
          : '';
        return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dashArray}" marker-start="${markerStart}" marker-end="${markerEnd}" />${label}`;
      })
      .filter(Boolean)
      .join('\n');

    return `
      <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow: visible;">
        <defs>
          <marker
            id="arrow"
            markerWidth="${EDGE_MARKER_TOKENS.arrow.markerWidth}"
            markerHeight="${EDGE_MARKER_TOKENS.arrow.markerHeight}"
            refX="${EDGE_MARKER_TOKENS.arrow.refX}"
            refY="${EDGE_MARKER_TOKENS.arrow.refY}"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
          </marker>
          <marker
            id="open-arrow"
            markerWidth="${EDGE_MARKER_TOKENS.openArrow.markerWidth}"
            markerHeight="${EDGE_MARKER_TOKENS.openArrow.markerHeight}"
            refX="${EDGE_MARKER_TOKENS.openArrow.refX}"
            refY="${EDGE_MARKER_TOKENS.openArrow.refY}"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M1,1 L9,3 L1,5" fill="none" stroke="context-stroke" stroke-width="${EDGE_MARKER_TOKENS.openArrow.strokeWidth}" />
          </marker>
          <marker
            id="open-circle"
            markerWidth="${EDGE_MARKER_TOKENS.openCircle.markerWidth}"
            markerHeight="${EDGE_MARKER_TOKENS.openCircle.markerHeight}"
            refX="${EDGE_MARKER_TOKENS.openCircle.refX}"
            refY="${EDGE_MARKER_TOKENS.openCircle.refY}"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <circle cx="${EDGE_MARKER_TOKENS.openCircle.refX}" cy="${EDGE_MARKER_TOKENS.openCircle.refY}" r="${EDGE_MARKER_TOKENS.openCircle.radius}" fill="#fff" stroke="context-stroke" stroke-width="${EDGE_MARKER_TOKENS.openCircle.strokeWidth}" />
          </marker>
        </defs>
        ${paths}
      </svg>
    `;
  }

  private renderEdgesSvg(model: DiagramModel): string {
    if (!model.edges || model.edges.length === 0) return '';
    return model.edges
      .map((edge) => {
        const start = this.getPortPoint(model, edge.sourceId, edge.sourcePort || 'right');
        const end = this.getPortPoint(model, edge.targetId, edge.targetPort || 'left');
        if (!start || !end) return '';
        const stroke = edge.color || edge.style?.stroke || '#1f2937';
        const strokeWidth = edge.style?.strokeWidth || 2;
        const markerEndId = edge.markerEnd || this.defaultMarkerEnd(edge);
        const markerStartId = edge.markerStart || this.defaultMarkerStart(edge);
        const markerEnd = markerEndId ? `url(#${markerEndId})` : '';
        const markerStart = markerStartId ? `url(#${markerStartId})` : '';
        const dashArray = edge.style?.dashArray || this.defaultDashArray(edge);
        const points = this.buildOrthogonalPoints(
          start,
          end,
          edge.sourcePort || 'right',
          edge.targetPort || 'left',
          edge.points || []
        );
        const d = this.pointsToPath(points, edge.style?.cornerRadius ?? this.defaultCornerRadius(edge));
        const labelPoint = this.edgeLabelPoint(edge, points);
        const label = edge.label
          ? `<text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" dominant-baseline="middle" fill="#334155" font-size="11" font-weight="600">${this.escapeText(edge.label)}</text>`
          : '';
        return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dashArray}" marker-start="${markerStart}" marker-end="${markerEnd}" />${label}`;
      })
      .filter(Boolean)
      .join('\n');
  }

  private renderNodeSvg(node: DiagramNode): string {
    if (node.type === 'shape') {
      const shapeNode = node as ShapeNode;
      const content = this.getSvgContent(shapeNode);
      const text = shapeNode.data?.text ? this.escapeText(shapeNode.data.text) : '';
      return `
        <g transform="translate(${shapeNode.x} ${shapeNode.y})">
          ${content}
          ${
            text
              ? `<text x="${shapeNode.width / 2}" y="${shapeNode.height / 2}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#111">${text}</text>`
              : ''
          }
        </g>
      `;
    }

    const web = node as WebNode;
    const x = web.x;
    const y = web.y;
    const w = web.width;
    const h = web.height;
    let text = '';
    switch (web.componentType) {
      case 'button':
        text = (web.data as WebButtonNode['data']).text || 'Button';
        break;
      case 'card':
        text = (web.data as WebCardNode['data']).title || 'Card';
        break;
      case 'input':
        text = (web.data as WebInputNode['data']).label || 'Input';
        break;
      case 'bpmn-user-task-web':
      case 'bpmn-service-task-web':
      case 'bpmn-manual-task-web':
      case 'bpmn-subprocess-web':
      case 'bpmn-start-event-web':
      case 'bpmn-exclusive-gateway-web':
      case 'bpmn-end-event-web':
      case 'bpmn-lane-web':
      case 'bpmn-pool-web':
        text = (web.data as { text?: string }).text || 'Task';
        break;
    }
    text = this.escapeText(text.toString());
    return `
      <g>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" stroke="#333" />
        <text x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="#111">
          ${text}
        </text>
      </g>
    `;
  }

  private getBounds(model: DiagramModel) {
    const padding = 40;
    if (!model.nodes || model.nodes.length === 0) {
      return { minX: 0, minY: 0, width: 1200, height: 800 };
    }
    const xs = model.nodes.map((n) => [n.x, n.x + n.width]).flat();
    const ys = model.nodes.map((n) => [n.y, n.y + n.height]).flat();
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }

  private escapeText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  private getPortPoint(
    model: DiagramModel,
    nodeId: string,
    port: 'top' | 'right' | 'bottom' | 'left'
  ) {
    const node = model.nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    switch (port) {
      case 'top':
        return { x: node.x + node.width / 2, y: node.y };
      case 'right':
        return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom':
        return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left':
        return { x: node.x, y: node.y + node.height / 2 };
    }
  }

  private buildOrthogonalPoints(
    start: { x: number; y: number },
    end: { x: number; y: number },
    sourcePort: 'top' | 'right' | 'bottom' | 'left',
    targetPort: 'top' | 'right' | 'bottom' | 'left',
    manualPoints: Array<{ x: number; y: number }>
  ): Array<{ x: number; y: number }> {
    const target = targetPort || this.guessTargetPort(start, end);
    if (manualPoints.length > 0) {
      let all: Array<{ x: number; y: number }> = [];
      let segmentStart = start;
      let segmentStartPort = sourcePort;
      for (const manualPoint of manualPoints) {
        const segmentEndPort = this.guessTargetPort(segmentStart, manualPoint);
        const segment = this.routePoints(segmentStart, manualPoint, segmentStartPort, segmentEndPort);
        all = all.length === 0 ? segment : [...all, ...segment.slice(1)];
        segmentStart = manualPoint;
        segmentStartPort = this.oppositePort(segmentEndPort);
      }
      const lastSegment = this.routePoints(segmentStart, end, this.guessTargetPort(segmentStart, end), target);
      return this.simplifyPoints(this.trimBacktracks([...all, ...lastSegment.slice(1)]));
    }
    return this.simplifyPoints(this.trimBacktracks(this.routePoints(start, end, sourcePort, target)));
  }

  private routePoints(
    start: { x: number; y: number },
    end: { x: number; y: number },
    sourcePort: 'top' | 'right' | 'bottom' | 'left',
    targetPort: 'top' | 'right' | 'bottom' | 'left'
  ) {
    const offset = 20;
    const startOut = this.pushFromPort(start, sourcePort, offset);
    const endIn = this.pushFromPort(end, targetPort, offset);
    const candidateA = this.orthogonalVia(start, startOut, endIn, end, true);
    const candidateB = this.orthogonalVia(start, startOut, endIn, end, false);
    const candidateC = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 2), endIn, end, true);
    const candidateD = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 2), endIn, end, false);
    const candidates = [candidateA, candidateB, candidateC, candidateD];
    const best = candidates.sort((a, b) => this.pathScore(a, targetPort) - this.pathScore(b, targetPort))[0];
    if (this.isTargetDirectionCorrect(best, targetPort)) {
      return best;
    }
    const flipped = this.oppositePort(targetPort);
    const endInFlipped = this.pushFromPort(end, flipped, offset);
    const altA = this.orthogonalVia(start, startOut, endInFlipped, end, true);
    const altB = this.orthogonalVia(start, startOut, endInFlipped, end, false);
    return [altA, altB].sort((a, b) => this.pathScore(a, targetPort) - this.pathScore(b, targetPort))[0];
  }

  private orthogonalVia(
    start: { x: number; y: number },
    startOut: { x: number; y: number },
    endIn: { x: number; y: number },
    end: { x: number; y: number },
    horizontalFirst: boolean
  ) {
    const middle = horizontalFirst ? { x: endIn.x, y: startOut.y } : { x: startOut.x, y: endIn.y };
    return [start, startOut, middle, endIn, end];
  }

  private pathScore(points: Array<{ x: number; y: number }>, targetPort: 'top' | 'right' | 'bottom' | 'left') {
    let score = 0;
    for (let i = 1; i < points.length; i++) {
      score += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y);
    }
    let turns = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const a = points[i - 1];
      const b = points[i];
      const c = points[i + 1];
      const horizontalThenVertical = a.y === b.y && b.x === c.x;
      const verticalThenHorizontal = a.x === b.x && b.y === c.y;
      if (horizontalThenVertical || verticalThenHorizontal) turns++;
    }
    score += turns * 8;
    if (!this.isTargetDirectionCorrect(points, targetPort)) {
      score += 200;
    }
    return score;
  }

  private pushFromPort(
    point: { x: number; y: number },
    port: 'top' | 'right' | 'bottom' | 'left',
    offset: number,
    invert = false
  ) {
    const dir = invert ? -1 : 1;
    switch (port) {
      case 'top':
        return { x: point.x, y: point.y - offset * dir };
      case 'right':
        return { x: point.x + offset * dir, y: point.y };
      case 'bottom':
        return { x: point.x, y: point.y + offset * dir };
      case 'left':
        return { x: point.x - offset * dir, y: point.y };
    }
  }

  private pointsToPath(points: Array<{ x: number; y: number }>, cornerRadius = 0) {
    if (cornerRadius <= 0) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    return this.pointsToRoundedPath(points, cornerRadius);
  }

  private pointsToRoundedPath(points: Array<{ x: number; y: number }>, radius: number) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
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
      const r = Math.min(radius, len1 / 2, len2 / 2);
      const p1 = { x: curr.x - (v1.x / len1) * r, y: curr.y - (v1.y / len1) * r };
      const p2 = { x: curr.x + (v2.x / len2) * r, y: curr.y + (v2.y / len2) * r };
      d += ` L ${p1.x} ${p1.y}`;
      const cross = v1.x * v2.y - v1.y * v2.x;
      const sweep = cross > 0 ? 1 : 0;
      d += ` A ${r} ${r} 0 0 ${sweep} ${p2.x} ${p2.y}`;
    }
    return d;
  }

  private simplifyPoints(points: Array<{ x: number; y: number }>) {
    const cleaned: Array<{ x: number; y: number }> = [];
    for (const p of points) {
      const last = cleaned[cleaned.length - 1];
      if (!last || last.x !== p.x || last.y !== p.y) {
        cleaned.push(p);
      }
    }
    const result: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < cleaned.length; i++) {
      const prev = result[result.length - 1];
      const curr = cleaned[i];
      const next = cleaned[i + 1];
      if (!prev || !next) {
        result.push(curr);
        continue;
      }
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;
      const colinear = (dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0);
      const reverseHorizontal = dy1 === 0 && dy2 === 0 && Math.sign(dx1) !== 0 && Math.sign(dx2) !== 0 && Math.sign(dx1) !== Math.sign(dx2);
      const reverseVertical = dx1 === 0 && dx2 === 0 && Math.sign(dy1) !== 0 && Math.sign(dy2) !== 0 && Math.sign(dy1) !== Math.sign(dy2);
      if (colinear || reverseHorizontal || reverseVertical) {
        continue;
      }
      result.push(curr);
    }
    return result;
  }

  private trimBacktracks(points: Array<{ x: number; y: number }>) {
    if (points.length < 3) return points;
    const result: Array<{ x: number; y: number }> = [];
    for (const p of points) {
      result.push(p);
      while (result.length >= 3) {
        const a = result[result.length - 3];
        const b = result[result.length - 2];
        const c = result[result.length - 1];
        const dx1 = b.x - a.x;
        const dy1 = b.y - a.y;
        const dx2 = c.x - b.x;
        const dy2 = c.y - b.y;
        const reverseHorizontal =
          dy1 === 0 && dy2 === 0 && Math.sign(dx1) !== 0 && Math.sign(dx2) !== 0 && Math.sign(dx1) !== Math.sign(dx2);
        const reverseVertical =
          dx1 === 0 && dx2 === 0 && Math.sign(dy1) !== 0 && Math.sign(dy2) !== 0 && Math.sign(dy1) !== Math.sign(dy2);
        if (reverseHorizontal || reverseVertical) {
          result.splice(result.length - 2, 1);
          continue;
        }
        break;
      }
    }
    return result;
  }

  private isTargetDirectionCorrect(points: Array<{ x: number; y: number }>, targetPort: 'top' | 'right' | 'bottom' | 'left') {
    if (points.length < 2) return true;
    const end = points[points.length - 1];
    const prev = points[points.length - 2];
    const dx = end.x - prev.x;
    const dy = end.y - prev.y;
    const direction = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'down' : 'up');
    const expected =
      targetPort === 'top' ? 'down' : targetPort === 'bottom' ? 'up' : targetPort === 'left' ? 'right' : 'left';
    return direction === expected;
  }

  private oppositePort(port: 'top' | 'right' | 'bottom' | 'left') {
    switch (port) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
    }
  }

  private guessTargetPort(start: { x: number; y: number }, end: { x: number; y: number }) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? 'left' : 'right';
    }
    return dy >= 0 ? 'top' : 'bottom';
  }

  private defaultCornerRadius(edge: DiagramModel['edges'][number]): number {
    if (edge.flowType === 'sequence') return 8;
    if (edge.flowType === 'message') return 6;
    return 4;
  }

  private defaultMarkerEnd(edge: DiagramModel['edges'][number]): string | null {
    if (edge.flowType === 'association') return null;
    if (edge.flowType === 'message') return 'open-arrow';
    return 'arrow';
  }

  private defaultMarkerStart(edge: DiagramModel['edges'][number]): string | null {
    if (edge.flowType === 'message') return 'open-circle';
    return null;
  }

  private defaultDashArray(edge: DiagramModel['edges'][number]): string {
    if (edge.flowType === 'message') return '6 4';
    if (edge.flowType === 'association') return '3 4';
    return '';
  }

  private edgeLabelPoint(edge: DiagramEdge, points: Point[]): Point {
    if (edge.labelPosition) return edge.labelPosition;
    if (points.length === 0) return { x: 0, y: 0 };
    if (points.length === 1) return points[0];
    return this.polylineMidpoint(points);
  }

  private polylineMidpoint(points: Point[]): Point {
    let totalLength = 0;
    const segments: Array<{ from: Point; to: Point; length: number }> = [];
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      segments.push({ from, to, length });
      totalLength += length;
    }
    if (totalLength <= 0) return points[Math.floor(points.length / 2)];
    const half = totalLength / 2;
    let traveled = 0;
    for (const segment of segments) {
      if (traveled + segment.length >= half) {
        const local = (half - traveled) / segment.length;
        return {
          x: segment.from.x + (segment.to.x - segment.from.x) * local,
          y: segment.from.y + (segment.to.y - segment.from.y) * local,
        };
      }
      traveled += segment.length;
    }
    return points[points.length - 1];
  }

  private renderButton(node: WebButtonNode, style: string): string {
    const variant = node.data.variant || 'primary';
    const variants: any = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const cls = `px-4 py-2 rounded font-semibold focus:outline-none focus:shadow-outline ${variants[variant]}`;
    return `<button style="${style}" class="${cls}">${node.data.text || 'Button'}</button>`;
  }

  private renderInput(node: WebInputNode, style: string): string {
    const widthStyle = `width: ${node.width}px;`; /* Inputs usually need width */
    return `
     <div style="${style} ${widthStyle}" class="flex flex-col">
       ${
         node.data.label
           ? `<label class="mb-1 text-sm font-bold text-gray-700">${node.data.label}</label>`
           : ''
       }
       <input type="${node.data.inputType || 'text'}"
              placeholder="${node.data.placeholder || ''}"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
     </div>`;
  }

  private renderCard(node: WebCardNode, style: string): string {
    const widthStyle = `width: ${node.width}px; height: ${node.height}px;`;
    return `
      <div style="${style} ${widthStyle}" class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
        <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2">${node.data.title || 'Card'}</div>
            <p class="text-gray-700 text-base">
                ${node.data.content || ''}
            </p>
        </div>
      </div>`;
  }

  private renderBpmnWebTask(
    node: WebNode,
    style: string,
    iconKind: BpmnTaskIconKind,
    defaultVariant: BpmnWebTaskVariant,
    supportsBadge: boolean
  ): string {
    const data = node.data as {
      text?: string;
      iconEnabled?: boolean;
      badgeEnabled?: boolean;
      variant?: BpmnWebTaskVariant;
    };
    const variant = data.variant || defaultVariant;
    const tone = bpmnTaskTone(variant, defaultVariant);
    const iconSizePx = BPMN_VISUAL_TOKENS.icon.sizePx;
    const iconHtmlSvg = bpmnIconSvg(iconKind, tone.accent, iconSizePx);
    const iconHtml =
      data.iconEnabled === false
        ? ''
        : `<div style="position:absolute;left:${BPMN_VISUAL_TOKENS.icon.left};top:${BPMN_VISUAL_TOKENS.icon.top};line-height:1;">${iconHtmlSvg}</div>`;
    const badgeHtml =
      supportsBadge && data.badgeEnabled !== false
        ? `<div style="position:absolute;left:50%;transform:translateX(-50%);bottom:${BPMN_VISUAL_TOKENS.badge.bottom};width:${BPMN_VISUAL_TOKENS.badge.sizePx}px;height:${BPMN_VISUAL_TOKENS.badge.sizePx}px;border:${BPMN_VISUAL_TOKENS.stroke.task}px solid ${tone.border};border-radius:${BPMN_VISUAL_TOKENS.badge.radius};background:${BPMN_VISUAL_TOKENS.background};color:${tone.accent};display:flex;align-items:center;justify-content:center;font-size:${BPMN_VISUAL_TOKENS.badge.fontSizePx}px;font-weight:700;line-height:1;">+</div>`
        : '';

    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:${BPMN_VISUAL_TOKENS.stroke.task}px solid ${tone.border};border-radius:${supportsBadge ? BPMN_VISUAL_TOKENS.subprocessRadius : BPMN_VISUAL_TOKENS.taskRadius};background:${BPMN_VISUAL_TOKENS.background};color:${BPMN_VISUAL_TOKENS.text};padding:${BPMN_VISUAL_TOKENS.taskPadding};font-family:${BPMN_VISUAL_TOKENS.fontFamily};position:absolute;box-sizing:border-box;min-width:${BPMN_VISUAL_TOKENS.taskMinWidth};">
        ${iconHtml}
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:${BPMN_VISUAL_TOKENS.typography.taskSize};font-weight:${BPMN_VISUAL_TOKENS.typography.taskWeight};line-height:1.2;">
          ${this.escapeText(data.text || 'Task')}
        </div>
        ${badgeHtml}
      </div>
    `;
  }

  private renderBpmnStartEventWeb(node: WebNode, style: string): string {
    const data = node.data as { iconEnabled?: boolean };
    const iconHtml =
      data.iconEnabled === false
        ? ''
        : `<span style="line-height:1;">${bpmnIconSvg('start', 'var(--bpmn-start-icon, #6ee7b7)', 16)}</span>`;
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:${BPMN_VISUAL_TOKENS.stroke.eventStart}px solid var(--bpmn-start-border, ${BPMN_VISUAL_TOKENS.variants.green.border});border-radius:9999px;background:transparent;display:flex;align-items:center;justify-content:center;position:absolute;box-sizing:border-box;">
        ${iconHtml}
      </div>
    `;
  }

  private renderBpmnExclusiveGatewayWeb(node: WebNode, style: string): string {
    const data = node.data as { text?: string };
    const label = data.text ? `<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:${BPMN_VISUAL_TOKENS.typography.labelSize};font-weight:${BPMN_VISUAL_TOKENS.typography.labelWeight};color:var(--bpmn-gateway-label, ${BPMN_VISUAL_TOKENS.variants.yellow.accent});white-space:nowrap;">${this.escapeText(data.text)}</div>` : '';
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;position:absolute;box-sizing:border-box;">
        ${label}
        <div style="position:absolute;left:50%;top:50%;width:72%;height:72%;transform:translate(-50%,-50%) rotate(45deg);border:${BPMN_VISUAL_TOKENS.stroke.gateway}px solid var(--bpmn-gateway-border, ${BPMN_VISUAL_TOKENS.variants.yellow.border});background:${BPMN_VISUAL_TOKENS.background};"></div>
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:700;color:var(--bpmn-gateway-symbol, ${BPMN_VISUAL_TOKENS.variants.yellow.accent});line-height:1;">×</div>
      </div>
    `;
  }

  private renderBpmnEndEventWeb(node: WebNode, style: string): string {
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:${BPMN_VISUAL_TOKENS.stroke.eventEnd}px solid var(--bpmn-end-border, ${BPMN_VISUAL_TOKENS.variants.red.border});border-radius:9999px;background:var(--bpmn-end-fill, rgba(248,113,113,0.20));display:flex;align-items:center;justify-content:center;position:absolute;box-sizing:border-box;">
        <span style="font-size:10px;color:var(--bpmn-end-icon, ${BPMN_VISUAL_TOKENS.variants.red.accent});line-height:1;">●</span>
      </div>
    `;
  }

  private renderBpmnLaneWeb(node: WebNode, style: string, isPool: boolean): string {
    const label = this.escapeText(((node.data as { text?: string }).text || (isPool ? 'Pool' : 'Lane')));
    const barBg = isPool ? BPMN_VISUAL_TOKENS.pool.sidebar : BPMN_VISUAL_TOKENS.lane.sidebar;
    const border = isPool ? BPMN_VISUAL_TOKENS.pool.border : BPMN_VISUAL_TOKENS.lane.border;
    const bg = isPool ? BPMN_VISUAL_TOKENS.pool.background : BPMN_VISUAL_TOKENS.lane.background;
    const textColor = isPool ? BPMN_VISUAL_TOKENS.pool.sidebarText : BPMN_VISUAL_TOKENS.lane.sidebarText;
    const textWeight = isPool ? 700 : BPMN_VISUAL_TOKENS.typography.labelWeight;
    return `
      <div style="${style} width:${node.width}px;height:${node.height}px;border:${isPool ? BPMN_VISUAL_TOKENS.stroke.pool : BPMN_VISUAL_TOKENS.stroke.lane}px solid ${border};${isPool ? 'border-radius:6px;' : ''}background:${bg};position:absolute;box-sizing:border-box;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:40px;border-right:${BPMN_VISUAL_TOKENS.stroke.lane}px solid ${border};background:${barBg};display:flex;align-items:center;justify-content:center;${isPool ? 'border-radius:6px 0 0 6px;' : ''}">
          <div style="font-size:${BPMN_VISUAL_TOKENS.typography.labelSize};font-weight:${textWeight};color:${textColor};font-family:${BPMN_VISUAL_TOKENS.fontFamily};writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;">${label}</div>
        </div>
      </div>
    `;
  }
}
