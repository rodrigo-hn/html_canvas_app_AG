import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BasicShapes } from './shapes/basic.shapes';
import { BpmnShapes } from './shapes/bpmn.shapes';

export type ShapeGenerator = (w: number, h: number) => string;

@Injectable({
  providedIn: 'root',
})
export class StencilService {
  private shapes: Record<string, ShapeGenerator> = {
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

  constructor(private sanitizer: DomSanitizer) {}

  getShapeSVG(type: string, width: number, height: number): SafeHtml {
    const generator = this.shapes[type];
    if (generator) {
      return this.sanitizer.bypassSecurityTrustHtml(generator(width, height));
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      `<rect width="${width}" height="${height}" fill="red"/>`
    );
  }
}
