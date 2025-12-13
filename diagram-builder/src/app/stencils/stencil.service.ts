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
    'bpmn-start-event': BpmnShapes.eventStart,
    'bpmn-end-event': BpmnShapes.eventEnd,
    'bpmn-gateway': BpmnShapes.gateway,
    'bpmn-pool': BpmnShapes.pool,
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
