import { DiagramEdge } from '../models/diagram.model';

export interface ResolvedEdgeStyle {
  stroke: string;
  strokeWidth: number;
  dashArray: string | null;
  markerStart: string | null;
  markerEnd: string | null;
  cornerRadius: number;
}

export function defaultEdgeCornerRadius(edge: DiagramEdge): number {
  if (edge.flowType === 'sequence') return 8;
  if (edge.flowType === 'message') return 6;
  return 4;
}

export function defaultEdgeMarkerEnd(edge: DiagramEdge): string | null {
  if (edge.flowType === 'association') return null;
  if (edge.flowType === 'message') return 'open-arrow';
  return 'arrow';
}

export function defaultEdgeMarkerStart(edge: DiagramEdge): string | null {
  if (edge.flowType === 'message') return 'open-circle';
  return null;
}

export function defaultEdgeDashArray(edge: DiagramEdge): string | null {
  if (edge.flowType === 'message') return '6 4';
  if (edge.flowType === 'association') return '3 4';
  return null;
}

export function resolveEdgeStyle(edge: DiagramEdge): ResolvedEdgeStyle {
  const stroke = edge.color || edge.style?.stroke || '#1f2937';
  return {
    stroke,
    strokeWidth: edge.style?.strokeWidth || 2,
    dashArray: edge.style?.dashArray || defaultEdgeDashArray(edge),
    markerStart: edge.markerStart || defaultEdgeMarkerStart(edge),
    markerEnd: edge.markerEnd || defaultEdgeMarkerEnd(edge),
    cornerRadius: edge.style?.cornerRadius ?? defaultEdgeCornerRadius(edge),
  };
}
