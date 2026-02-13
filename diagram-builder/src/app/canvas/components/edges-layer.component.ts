import { Component, ElementRef, HostListener, Input, ViewChild, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramStore } from '../../core/services/diagram-store.service';
import { DiagramCommands } from '../../core/services/diagram-commands.service';
import { DiagramEdge, DiagramNode, Point } from '../../core/models/diagram.model';
import { EDGE_MARKER_TOKENS } from '../../core/styles/bpmn-visual-tokens';

type Port = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'app-edges-layer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      #svgRoot
      class="absolute inset-0 z-[1] pointer-events-none w-full h-full overflow-visible"
    >
      <defs>
        <marker
          id="arrow"
          [attr.markerWidth]="markerTokens.arrow.markerWidth"
          [attr.markerHeight]="markerTokens.arrow.markerHeight"
          [attr.refX]="markerTokens.arrow.refX"
          [attr.refY]="markerTokens.arrow.refY"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
        </marker>
        <marker
          id="open-arrow"
          [attr.markerWidth]="markerTokens.openArrow.markerWidth"
          [attr.markerHeight]="markerTokens.openArrow.markerHeight"
          [attr.refX]="markerTokens.openArrow.refX"
          [attr.refY]="markerTokens.openArrow.refY"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M1,1 L9,3 L1,5" fill="none" stroke="context-stroke" [attr.stroke-width]="markerTokens.openArrow.strokeWidth" />
        </marker>
        <marker
          id="open-circle"
          [attr.markerWidth]="markerTokens.openCircle.markerWidth"
          [attr.markerHeight]="markerTokens.openCircle.markerHeight"
          [attr.refX]="markerTokens.openCircle.refX"
          [attr.refY]="markerTokens.openCircle.refY"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <circle [attr.cx]="markerTokens.openCircle.refX" [attr.cy]="markerTokens.openCircle.refY" [attr.r]="markerTokens.openCircle.radius" fill="#fff" stroke="context-stroke" [attr.stroke-width]="markerTokens.openCircle.strokeWidth" />
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
        (dblclick)="onEdgeDoubleClick(edge, $event)"
      />
      @if (edge.label) {
      <text
        [attr.x]="edgeLabelPoint(edge).x"
        [attr.y]="edgeLabelPoint(edge).y"
        text-anchor="middle"
        dominant-baseline="middle"
        class="pointer-events-none select-none fill-slate-800 text-[11px] font-semibold"
      >
        {{ edge.label }}
      </text>
      }
      @if (selectedEdgeId() === edge.id) {
      <circle
        [attr.cx]="edgePortPoint(edge, 'source').x"
        [attr.cy]="edgePortPoint(edge, 'source').y"
        r="5"
        fill="#fff"
        stroke="#2563eb"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onEdgeHandleDown(edge, 'source', $event)"
      >
        <title>Editar anclaje de origen</title>
      </circle>
      <circle
        [attr.cx]="edgePortPoint(edge, 'target').x"
        [attr.cy]="edgePortPoint(edge, 'target').y"
        r="5"
        fill="#fff"
        stroke="#2563eb"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onEdgeHandleDown(edge, 'target', $event)"
      >
        <title>Editar anclaje de destino</title>
      </circle>
      @for (bend of edgeBendPoints(edge); track bend.index) {
      <circle
        [attr.cx]="bend.point.x"
        [attr.cy]="bend.point.y"
        r="5"
        fill="#fff"
        stroke="#10b981"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onBendHandleDown(edge, bend.index, $event)"
        (dblclick)="removeBendPoint(edge, bend.index, $event)"
      >
        <title>Arrastra para curvar. Doble click para eliminar.</title>
      </circle>
      }
      @if (edge.label) {
      <circle
        [attr.cx]="edgeLabelPoint(edge).x"
        [attr.cy]="edgeLabelPoint(edge).y"
        r="5"
        fill="#fff"
        stroke="#7c3aed"
        stroke-width="2"
        class="pointer-events-auto cursor-grab"
        (mousedown)="onLabelHandleDown(edge, $event)"
      >
        <title>Arrastra para mover etiqueta.</title>
      </circle>
      }
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
  readonly markerTokens = EDGE_MARKER_TOKENS;
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
  private bendDrag: { edgeId: string; pointIndex: number } | null = null;
  private labelDrag: { edgeId: string } | null = null;

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
    if (event.shiftKey) {
      const point = this.toWorldPoint(event.clientX, event.clientY);
      this.addBendPoint(edge, point);
      this.commands.selectEdge(edge.id);
      return;
    }
    this.commands.selectEdge(edge.id);
  }

  onEdgeDoubleClick(edge: DiagramEdge, event: MouseEvent) {
    event.stopPropagation();
    const point = this.toWorldPoint(event.clientX, event.clientY);
    this.addBendPoint(edge, point);
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

  onBendHandleDown(edge: DiagramEdge, pointIndex: number, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.commands.selectEdge(edge.id);
    this.bendDrag = { edgeId: edge.id, pointIndex };
  }

  removeBendPoint(edge: DiagramEdge, pointIndex: number, event: MouseEvent) {
    event.stopPropagation();
    const next = [...(edge.points || [])];
    next.splice(pointIndex, 1);
    this.commands.updateEdge(edge.id, { points: next });
  }

  onLabelHandleDown(edge: DiagramEdge, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.commands.selectEdge(edge.id);
    this.labelDrag = { edgeId: edge.id };
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent) {
    const point = this.toWorldPoint(event.clientX, event.clientY);
    if (this.connectionDrag) {
      this.connectionDrag.currentPoint = point;
      return;
    }
    if (this.bendDrag) {
      const edge = this.edges().find((e) => e.id === this.bendDrag!.edgeId);
      if (!edge) return;
      const current = [...(edge.points || [])];
      const snapped = this.snapBendPoint(edge, this.bendDrag.pointIndex, point);
      current[this.bendDrag.pointIndex] = snapped;
      this.commands.updateEdge(edge.id, { points: current });
      return;
    }
    if (this.labelDrag) {
      const edge = this.edges().find((e) => e.id === this.labelDrag!.edgeId);
      if (!edge) return;
      this.commands.updateEdge(edge.id, { labelPosition: point });
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent) {
    if (this.bendDrag) {
      this.bendDrag = null;
      return;
    }
    if (this.labelDrag) {
      this.labelDrag = null;
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
    const manual = edge.points || [];
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
    return edge.color || edge.style?.stroke || '#1f2937';
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
    manualPoints?: Point[] | null,
    cornerRadius = 0
  ): string {
    const target = targetPort || this.guessTargetPort(start, end);
    if (manualPoints && manualPoints.length > 0) {
      const via = manualPoints;
      let all: Point[] = [];
      let segmentStart = start;
      let segmentStartPort = sourcePort;
      for (const p of via) {
        const segmentEndPort = this.guessTargetPort(segmentStart, p);
        const segment = this.routePoints(segmentStart, p, segmentStartPort, segmentEndPort);
        all = all.length === 0 ? segment : [...all, ...segment.slice(1)];
        segmentStart = p;
        segmentStartPort = this.oppositePort(segmentEndPort);
      }
      const lastSegment = this.routePoints(segmentStart, end, this.guessTargetPort(segmentStart, end), target);
      const points = this.simplifyPoints(this.trimBacktracks([...all, ...lastSegment.slice(1)]));
      return this.pointsToPath(points, cornerRadius);
    }
    const points = this.simplifyPoints(this.trimBacktracks(this.routePoints(start, end, sourcePort, target)));
    return this.pointsToPath(points, cornerRadius);
  }

  private routePoints(start: Point, end: Point, sourcePort: Port, targetPort: Port): Point[] {
    const offset = 24;
    const startOut = this.pushFromPort(start, sourcePort, offset);
    const endIn = this.pushFromPort(end, targetPort, offset);

    const candidateA = this.orthogonalVia(start, startOut, endIn, end, true);
    const candidateB = this.orthogonalVia(start, startOut, endIn, end, false);
    const candidateC = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 2), endIn, end, true);
    const candidateD = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 2), endIn, end, false);
    const candidateE = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 3), endIn, end, true);
    const candidateF = this.orthogonalVia(start, this.pushFromPort(start, sourcePort, offset * 3), endIn, end, false);
    const straightCandidate = this.straightOrSingleBend(start, end, startOut, endIn);
    const candidates = [straightCandidate, candidateA, candidateB, candidateC, candidateD, candidateE, candidateF];
    const best = candidates.sort((a, b) => this.pathScore(a, targetPort, start, end) - this.pathScore(b, targetPort, start, end))[0];
    if (this.isTargetDirectionCorrect(best, targetPort)) {
      return best;
    }
    const flipped = this.oppositePort(targetPort);
    const endInFlipped = this.pushFromPort(end, flipped, offset);
    const altA = this.orthogonalVia(start, startOut, endInFlipped, end, true);
    const altB = this.orthogonalVia(start, startOut, endInFlipped, end, false);
    return [altA, altB].sort((a, b) => this.pathScore(a, targetPort, start, end) - this.pathScore(b, targetPort, start, end))[0];
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

  private pathScore(points: Point[], targetPort: Port, start: Point, end: Point): number {
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
    score += turns * 20;
    score += this.containerCollisionPenalty(points, start, end);
    if (!this.isTargetDirectionCorrect(points, targetPort)) {
      score += 200;
    }
    return score;
  }

  private straightOrSingleBend(start: Point, end: Point, startOut: Point, endIn: Point): Point[] {
    if (startOut.x === endIn.x || startOut.y === endIn.y) {
      return [start, startOut, endIn, end];
    }
    return [start, startOut, { x: endIn.x, y: startOut.y }, endIn, end];
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

  edgeBendPoints(edge: DiagramEdge): Array<{ index: number; point: Point }> {
    const points = edge.points || [];
    return points.map((point, index) => ({ index, point }));
  }

  edgeLabelPoint(edge: DiagramEdge): Point {
    if (edge.labelPosition) return edge.labelPosition;
    const pathPoints = this.edgePathPoints(edge);
    if (pathPoints.length === 0) return { x: 0, y: 0 };
    const mid = Math.floor(pathPoints.length / 2);
    return pathPoints[mid];
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

  private addBendPoint(edge: DiagramEdge, point: Point) {
    const snapped = this.snapToGrid(point);
    const current = [...(edge.points || [])];
    const insertAt = this.findBendInsertIndex(edge, snapped);
    current.splice(insertAt, 0, snapped);
    this.commands.updateEdge(edge.id, { points: current });
  }

  private snapBendPoint(edge: DiagramEdge, pointIndex: number, point: Point): Point {
    const snappedGrid = this.snapToGrid(point);
    const endpoints = this.getEdgeEndpoints(edge);
    if (!endpoints) return snappedGrid;
    const currentBends = [...(edge.points || [])];
    const prev = pointIndex > 0 ? currentBends[pointIndex - 1] : endpoints.start;
    const next = pointIndex < currentBends.length - 1 ? currentBends[pointIndex + 1] : endpoints.end;
    const threshold = 10;
    let x = snappedGrid.x;
    let y = snappedGrid.y;
    if (prev && Math.abs(prev.x - x) <= threshold) x = prev.x;
    if (next && Math.abs(next.x - x) <= threshold) x = next.x;
    if (prev && Math.abs(prev.y - y) <= threshold) y = prev.y;
    if (next && Math.abs(next.y - y) <= threshold) y = next.y;
    return { x, y };
  }

  private snapToGrid(point: Point): Point {
    if (!this.store.snapToGrid()) return point;
    const grid = this.store.gridSize();
    return {
      x: Math.round(point.x / grid) * grid,
      y: Math.round(point.y / grid) * grid,
    };
  }

  private edgePathPoints(edge: DiagramEdge): Point[] {
    const sourceNode = this.nodes().find((n) => n.id === edge.sourceId);
    const targetNode = this.nodes().find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return [];
    const sourcePort = edge.sourcePort || 'right';
    const targetPort = edge.targetPort || 'left';
    const start = this.getPortPoint(sourceNode, sourcePort);
    const end = this.getPortPoint(targetNode, targetPort);
    const manual = edge.points || [];
    const target = targetPort || this.guessTargetPort(start, end);
    if (manual.length > 0) {
      let all: Point[] = [];
      let segmentStart = start;
      let segmentStartPort = sourcePort;
      for (const p of manual) {
        const segmentEndPort = this.guessTargetPort(segmentStart, p);
        const segment = this.routePoints(segmentStart, p, segmentStartPort, segmentEndPort);
        all = all.length === 0 ? segment : [...all, ...segment.slice(1)];
        segmentStart = p;
        segmentStartPort = this.oppositePort(segmentEndPort);
      }
      const lastSegment = this.routePoints(segmentStart, end, this.guessTargetPort(segmentStart, end), target);
      return this.simplifyPoints(this.trimBacktracks([...all, ...lastSegment.slice(1)]));
    }
    return this.simplifyPoints(this.trimBacktracks(this.routePoints(start, end, sourcePort, target)));
  }

  private containerCollisionPenalty(points: Point[], start: Point, end: Point): number {
    if (points.length < 2) return 0;
    const containers = this.nodes().filter(
      (node) => this.isContainerNode(node) && !this.pointInsideNode(start, node) && !this.pointInsideNode(end, node)
    );
    if (containers.length === 0) return 0;
    let penalty = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      for (const c of containers) {
        if (this.segmentIntersectsRect(a, b, c)) {
          penalty += 220;
        }
      }
    }
    return penalty;
  }

  private pointInsideNode(point: Point, node: DiagramNode): boolean {
    return point.x >= node.x && point.x <= node.x + node.width && point.y >= node.y && point.y <= node.y + node.height;
  }

  private isContainerNode(node: DiagramNode): boolean {
    if (node.type === 'shape') {
      return node.shapeType === 'bpmn-lane' || node.shapeType === 'bpmn-pool';
    }
    if (node.type === 'web-component') {
      return node.componentType === 'bpmn-lane-web' || node.componentType === 'bpmn-pool-web';
    }
    return false;
  }

  private segmentIntersectsRect(a: Point, b: Point, node: DiagramNode): boolean {
    const minX = node.x + 1;
    const minY = node.y + 1;
    const maxX = node.x + node.width - 1;
    const maxY = node.y + node.height - 1;
    const isHorizontal = a.y === b.y;
    const isVertical = a.x === b.x;
    if (!isHorizontal && !isVertical) return false;
    if (isHorizontal) {
      if (a.y <= minY || a.y >= maxY) return false;
      const left = Math.min(a.x, b.x);
      const right = Math.max(a.x, b.x);
      return right > minX && left < maxX;
    }
    if (a.x <= minX || a.x >= maxX) return false;
    const top = Math.min(a.y, b.y);
    const bottom = Math.max(a.y, b.y);
    return bottom > minY && top < maxY;
  }

  private findBendInsertIndex(edge: DiagramEdge, point: Point): number {
    const endpoints = this.getEdgeEndpoints(edge);
    if (!endpoints) return (edge.points || []).length;
    const refs = [endpoints.start, ...(edge.points || []), endpoints.end];
    let bestIndex = refs.length - 1;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < refs.length - 1; i++) {
      const distance = this.distancePointToSegment(point, refs[i], refs[i + 1]);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i + 1;
      }
    }
    return Math.max(0, bestIndex - 1);
  }

  private getEdgeEndpoints(edge: DiagramEdge): { start: Point; end: Point } | null {
    const sourceNode = this.nodes().find((n) => n.id === edge.sourceId);
    const targetNode = this.nodes().find((n) => n.id === edge.targetId);
    if (!sourceNode || !targetNode) return null;
    return {
      start: this.getPortPoint(sourceNode, edge.sourcePort || 'right'),
      end: this.getPortPoint(targetNode, edge.targetPort || 'left'),
    };
  }

  private distancePointToSegment(point: Point, a: Point, b: Point): number {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = point.x - a.x;
    const apy = point.y - a.y;
    const lengthSq = abx * abx + aby * aby;
    if (lengthSq === 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / lengthSq));
    const projectionX = a.x + t * abx;
    const projectionY = a.y + t * aby;
    return Math.hypot(point.x - projectionX, point.y - projectionY);
  }
}
