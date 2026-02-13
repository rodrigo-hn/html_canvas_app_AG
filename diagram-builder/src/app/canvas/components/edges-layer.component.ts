import { Component, ElementRef, HostListener, Input, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramStore } from '../../core/services/diagram-store.service';
import { DiagramCommands } from '../../core/services/diagram-commands.service';
import { DiagramEdge, DiagramNode, Point } from '../../core/models/diagram.model';

type Port = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'app-edges-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      #svgRoot
      class="absolute inset-0 pointer-events-none w-full h-full overflow-visible"
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#333" />
        </marker>
        <marker
          id="open-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M1,1 L9,3 L1,5" fill="none" stroke="#333" stroke-width="1.5" />
        </marker>
        <marker
          id="open-circle"
          markerWidth="10"
          markerHeight="10"
          refX="3"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <circle cx="3" cy="3" r="2" fill="#fff" stroke="#333" stroke-width="1.2" />
        </marker>
      </defs>

      @for (edge of edges(); track edge.id) {
      <path
        class="pointer-events-auto"
        [attr.d]="edgePath(edge)"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.stroke]="edgeStroke(edge)"
        [attr.stroke-width]="edgeStrokeWidth(edge)"
        [attr.stroke-dasharray]="edgeDashArray(edge)"
        [attr.marker-start]="markerStartUrl(edge)"
        [attr.marker-end]="markerEndUrl(edge)"
        (click)="onEdgeClick(edge, $event)"
      />
      @if (selectedEdgeId() === edge.id) {
      <path
        [attr.d]="edgePath(edge)"
        fill="none"
        stroke="#2563eb"
        stroke-width="4"
        stroke-opacity="0.3"
        stroke-linecap="round"
        stroke-linejoin="round"
        pointer-events="none"
      />
      <circle
        [attr.cx]="edgePortPoint(edge, 'source').x"
        [attr.cy]="edgePortPoint(edge, 'source').y"
        r="5"
        fill="#fff"
        stroke="#2563eb"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onEdgeHandleDown(edge, 'source', $event)"
      />
      <circle
        [attr.cx]="edgePortPoint(edge, 'target').x"
        [attr.cy]="edgePortPoint(edge, 'target').y"
        r="5"
        fill="#fff"
        stroke="#2563eb"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onEdgeHandleDown(edge, 'target', $event)"
      />
      <circle
        [attr.cx]="getBendPoint(edge).x"
        [attr.cy]="getBendPoint(edge).y"
        r="5"
        fill="#fff"
        stroke="#10b981"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onBendHandleDown(edge, $event)"
        (dblclick)="clearBend(edge, $event)"
      />
      }
      }

      @if (previewPath()) {
      <path
        [attr.d]="previewPath()!"
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-dasharray="6 4"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.marker-end]="'url(#arrow)'"
      />
      }

      @if (dragPath()) {
      <path
        [attr.d]="dragPath()!"
        fill="none"
        stroke="#2563eb"
        stroke-width="2"
        stroke-dasharray="6 4"
        stroke-linecap="round"
        stroke-linejoin="round"
        [attr.marker-end]="'url(#arrow)'"
      />
      }
    </svg>
  `,
})
export class EdgesLayerComponent {
  @Input() zoom = 1;
  private store = inject(DiagramStore);
  private commands = inject(DiagramCommands);
  @ViewChild('svgRoot', { static: true }) svgRoot!: ElementRef<SVGSVGElement>;
  edges = this.store.edges;
  preview = this.store.edgePreview;
  nodes = this.store.nodes;
  selectedEdgeId = this.store.selectedEdgeId;
  private connectionDrag: {
    edgeId: string;
    end: 'source' | 'target';
    fixedPoint: Point;
    currentPoint: Point;
  } | null = null;
  private bendDrag: { edgeId: string } | null = null;

  previewPath = computed(() => {
    const preview = this.preview();
    if (!preview) return null;
    const sourceNode = this.nodes().find((n) => n.id === preview.sourceId);
    if (!sourceNode) return null;
    const sourcePoint = this.getPortPoint(sourceNode, preview.sourcePort);
    const targetPort = this.guessTargetPort(sourcePoint, preview.targetPoint);
    return this.buildOrthogonalPath(sourcePoint, preview.targetPoint, preview.sourcePort, targetPort, null, 0);
  });

  dragPath = computed(() => {
    if (!this.connectionDrag) return null;
    const start = this.connectionDrag.end === 'source' ? this.connectionDrag.currentPoint : this.connectionDrag.fixedPoint;
    const end = this.connectionDrag.end === 'source' ? this.connectionDrag.fixedPoint : this.connectionDrag.currentPoint;
    const targetPort = this.guessTargetPort(start, end);
    return this.buildOrthogonalPath(start, end, 'right', targetPort, null, 0);
  });

  onEdgeClick(edge: DiagramEdge, event: MouseEvent) {
    event.stopPropagation();
    this.commands.selectEdge(edge.id);
  }

  onEdgeHandleDown(edge: DiagramEdge, end: 'source' | 'target', event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.commands.selectEdge(edge.id);
    const sourcePort = edge.sourcePort || 'right';
    const targetPort = edge.targetPort || 'left';
    const sourceNode = this.nodes().find((n) => n.id === edge.sourceId);
    const targetNode = this.nodes().find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return;
    const sourcePoint = this.getPortPoint(sourceNode, sourcePort);
    const targetPoint = this.getPortPoint(targetNode, targetPort);
    this.connectionDrag = {
      edgeId: edge.id,
      end,
      fixedPoint: end === 'source' ? targetPoint : sourcePoint,
      currentPoint: end === 'source' ? sourcePoint : targetPoint,
    };
  }

  onBendHandleDown(edge: DiagramEdge, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.commands.selectEdge(edge.id);
    this.bendDrag = { edgeId: edge.id };
  }

  clearBend(edge: DiagramEdge, event: MouseEvent) {
    event.stopPropagation();
    this.commands.updateEdge(edge.id, { points: [] });
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    const point = this.toWorldPoint(event.clientX, event.clientY);
    if (this.connectionDrag) {
      this.connectionDrag.currentPoint = point;
      return;
    }
    if (this.bendDrag) {
      this.commands.updateEdge(this.bendDrag.edgeId, { points: [point] });
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    if (this.bendDrag) {
      this.bendDrag = null;
      return;
    }
    if (!this.connectionDrag) return;
    const point = this.toWorldPoint(event.clientX, event.clientY);
    const { edgeId, end } = this.connectionDrag;
    const nearest = this.findNearestPort(point);
    if (nearest) {
      if (end === 'source') {
        this.commands.updateEdge(edgeId, { sourceId: nearest.nodeId, sourcePort: nearest.port });
      } else {
        this.commands.updateEdge(edgeId, { targetId: nearest.nodeId, targetPort: nearest.port });
      }
    }
    this.connectionDrag = null;
  }

  edgePath(edge: DiagramEdge): string {
    const sourceNode = this.nodes().find((n) => n.id === edge.sourceId);
    const targetNode = this.nodes().find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return '';
    const sourcePort = edge.sourcePort || 'right';
    const targetPort = edge.targetPort || 'left';
    const start = this.getPortPoint(sourceNode, sourcePort);
    const end = this.getPortPoint(targetNode, targetPort);
    const manual = edge.points?.[0] || null;
    const radius = edge.style?.cornerRadius ?? this.defaultCornerRadius(edge);
    return this.buildOrthogonalPath(start, end, sourcePort, targetPort, manual, radius);
  }

  edgePortPoint(edge: DiagramEdge, end: 'source' | 'target'): Point {
    const nodeId = end === 'source' ? edge.sourceId : edge.targetId;
    const port = end === 'source' ? edge.sourcePort || 'right' : edge.targetPort || 'left';
    const node = this.nodes().find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return this.getPortPoint(node, port);
  }

  markerEndUrl(edge: DiagramEdge): string | null {
    const markerEnd = edge.markerEnd || this.defaultMarkerEnd(edge);
    if (!markerEnd) return null;
    return `url(#${markerEnd})`;
  }

  markerStartUrl(edge: DiagramEdge): string | null {
    const markerStart = edge.markerStart || this.defaultMarkerStart(edge);
    if (!markerStart) return null;
    return `url(#${markerStart})`;
  }

  edgeStroke(edge: DiagramEdge): string {
    return edge.style?.stroke || '#1f2937';
  }

  edgeStrokeWidth(edge: DiagramEdge): number {
    return edge.style?.strokeWidth || 2;
  }

  edgeDashArray(edge: DiagramEdge): string | null {
    if (edge.style?.dashArray) return edge.style.dashArray;
    if (edge.flowType === 'message') return '6 4';
    if (edge.flowType === 'association') return '3 4';
    return null;
  }

  private getPortPoint(node: DiagramNode, port: Port): Point {
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

  private buildOrthogonalPath(
    start: Point,
    end: Point,
    sourcePort: Port,
    targetPort?: Port,
    manualPoint?: Point | null,
    cornerRadius = 0
  ): string {
    const target = targetPort || this.guessTargetPort(start, end);
    if (manualPoint) {
      const first = this.routePoints(start, manualPoint, sourcePort, this.guessTargetPort(start, manualPoint));
      const second = this.routePoints(manualPoint, end, this.guessTargetPort(manualPoint, end), target);
      const points = this.simplifyPoints(this.trimBacktracks([...first, ...second.slice(1)]));
      return this.pointsToPath(points, cornerRadius);
    }
    const points = this.simplifyPoints(this.trimBacktracks(this.routePoints(start, end, sourcePort, target)));
    return this.pointsToPath(points, cornerRadius);
  }

  private routePoints(start: Point, end: Point, sourcePort: Port, targetPort: Port): Point[] {
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
    start: Point,
    startOut: Point,
    endIn: Point,
    end: Point,
    horizontalFirst: boolean
  ): Point[] {
    const middle = horizontalFirst ? { x: endIn.x, y: startOut.y } : { x: startOut.x, y: endIn.y };
    return [start, startOut, middle, endIn, end];
  }

  private pathScore(points: Point[], targetPort: Port): number {
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

  private pushFromPort(point: Point, port: Port, offset: number, invert = false): Point {
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

  private pointsToPath(points: Point[], cornerRadius = 0): string {
    if (cornerRadius <= 0) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    return this.pointsToRoundedPath(points, cornerRadius);
  }

  private pointsToRoundedPath(points: Point[], radius: number): string {
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

  private simplifyPoints(points: Point[]): Point[] {
    const cleaned: Point[] = [];
    for (const p of points) {
      const last = cleaned[cleaned.length - 1];
      if (!last || last.x !== p.x || last.y !== p.y) {
        cleaned.push(p);
      }
    }
    const result: Point[] = [];
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

  private trimBacktracks(points: Point[]): Point[] {
    if (points.length < 3) return points;
    const result: Point[] = [];
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

  private isTargetDirectionCorrect(points: Point[], targetPort: Port): boolean {
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

  private oppositePort(port: Port): Port {
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

  private guessTargetPort(start: Point, end: Point): Port {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? 'left' : 'right';
    }
    return dy >= 0 ? 'top' : 'bottom';
  }

  private defaultCornerRadius(edge: DiagramEdge): number {
    if (edge.flowType === 'sequence') return 8;
    if (edge.flowType === 'message') return 6;
    return 4;
  }

  private defaultMarkerEnd(edge: DiagramEdge): string | null {
    if (edge.flowType === 'association') return null;
    if (edge.flowType === 'message') return 'open-arrow';
    return 'arrow';
  }

  private defaultMarkerStart(edge: DiagramEdge): string | null {
    if (edge.flowType === 'message') return 'open-circle';
    return null;
  }

  getBendPoint(edge: DiagramEdge): Point {
    if (edge.points?.[0]) return edge.points[0];
    const sourceNode = this.nodes().find((n) => n.id === edge.sourceId);
    const targetNode = this.nodes().find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return { x: 0, y: 0 };
    const start = this.getPortPoint(sourceNode, edge.sourcePort || 'right');
    const end = this.getPortPoint(targetNode, edge.targetPort || 'left');
    return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  }

  private findNearestPort(point: Point): { nodeId: string; port: Port } | null {
    let closest: { nodeId: string; port: Port; distance: number } | null = null;
    for (const node of this.nodes()) {
      const ports: Array<{ port: Port; point: Point }> = [
        { port: 'top', point: { x: node.x + node.width / 2, y: node.y } },
        { port: 'right', point: { x: node.x + node.width, y: node.y + node.height / 2 } },
        { port: 'bottom', point: { x: node.x + node.width / 2, y: node.y + node.height } },
        { port: 'left', point: { x: node.x, y: node.y + node.height / 2 } },
      ];
      for (const p of ports) {
        const dx = p.point.x - point.x;
        const dy = p.point.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (!closest || distance < closest.distance) {
          closest = { nodeId: node.id, port: p.port, distance };
        }
      }
    }
    if (!closest || closest.distance > 30) return null;
    return { nodeId: closest.nodeId, port: closest.port };
  }

  private toWorldPoint(clientX: number, clientY: number): Point {
    const rect = this.svgRoot.nativeElement.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / this.zoom,
      y: (clientY - rect.top) / this.zoom,
    };
  }
}
