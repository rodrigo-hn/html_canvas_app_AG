import { describe, expect, it } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { HtmlExportService } from './html-exporter.service';
import { StencilService } from '../../stencils/stencil.service';

function createService(): HtmlExportService {
  const injector = createEnvironmentInjector([
    {
      provide: StencilService,
      useValue: {},
    },
  ]);
  return runInInjectionContext(injector, () => new HtmlExportService());
}

describe('HtmlExportService', () => {
  it('exports SVG with edges and markers', () => {
    const service = createService();
    const svg = service.exportSvg({
      modelVersion: 2,
      nodes: [
        {
          id: '1',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 100,
          height: 60,
          zIndex: 0,
          data: { text: 'A' },
        },
        {
          id: '2',
          type: 'shape',
          shapeType: 'rectangle',
          x: 200,
          y: 0,
          width: 100,
          height: 60,
          zIndex: 0,
          data: { text: 'B' },
        },
      ],
      edges: [
        {
          id: 'e1',
          sourceId: '1',
          targetId: '2',
          sourcePort: 'right',
          targetPort: 'left',
          zIndex: 0,
          points: [],
          markerEnd: 'arrow',
          style: { stroke: '#333', strokeWidth: 2 },
        },
      ],
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('marker');
    expect(svg).toContain('<path');
  });

  it('exports message-flow markers and dashed style', () => {
    const service = createService();
    const svg = service.exportSvg({
      modelVersion: 2,
      nodes: [
        {
          id: '1',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 100,
          height: 60,
          zIndex: 0,
          data: { text: 'Source' },
        },
        {
          id: '2',
          type: 'shape',
          shapeType: 'rectangle',
          x: 240,
          y: 0,
          width: 100,
          height: 60,
          zIndex: 0,
          data: { text: 'Target' },
        },
      ],
      edges: [
        {
          id: 'msg',
          sourceId: '1',
          targetId: '2',
          sourcePort: 'right',
          targetPort: 'left',
          flowType: 'message',
          zIndex: 0,
          points: [],
          markerEnd: 'open-arrow',
          markerStart: 'open-circle',
          style: { stroke: '#1f2937', strokeWidth: 2, dashArray: '6 4' },
        },
      ],
    });

    expect(svg).toContain('marker-start="url(#open-circle)"');
    expect(svg).toContain('marker-end="url(#open-arrow)"');
    expect(svg).toContain('stroke-dasharray="6 4"');
  });

  it('exports HTML including classic web components even with negative coordinates', () => {
    const service = createService();
    const html = service.exportHtml({
      modelVersion: 2,
      nodes: [
        {
          id: 'btn-1',
          type: 'web-component',
          componentType: 'button',
          x: 640,
          y: -80,
          width: 110,
          height: 42,
          zIndex: 1,
          data: { text: 'Button', variant: 'primary' },
        },
        {
          id: 'card-1',
          type: 'web-component',
          componentType: 'card',
          x: 260,
          y: -160,
          width: 260,
          height: 140,
          zIndex: 1,
          data: { title: 'Card', content: 'Card content' },
        },
      ],
      edges: [],
    });

    expect(html).toContain('diagram-canvas');
    expect(html).toContain('transform: translate(');
    expect(html).toContain('>Button<');
    expect(html).toContain('>Card<');
    expect(html).toContain('Card content');
  });

  it('exports SVG multi-bend edge with label and manual label position', () => {
    const service = createService();
    const svg = service.exportSvg({
      modelVersion: 2,
      nodes: [
        {
          id: 'n1',
          type: 'shape',
          shapeType: 'rectangle',
          x: 0,
          y: 0,
          width: 120,
          height: 70,
          zIndex: 0,
          data: { text: 'A' },
        },
        {
          id: 'n2',
          type: 'shape',
          shapeType: 'rectangle',
          x: 320,
          y: 220,
          width: 120,
          height: 70,
          zIndex: 0,
          data: { text: 'B' },
        },
      ],
      edges: [
        {
          id: 'e-multi',
          sourceId: 'n1',
          targetId: 'n2',
          sourcePort: 'right',
          targetPort: 'left',
          zIndex: 0,
          points: [
            { x: 180, y: 35 },
            { x: 180, y: 255 },
          ],
          label: 'A->B',
          labelPosition: { x: 200, y: 120 },
          markerEnd: 'arrow',
        },
      ],
    });

    expect(svg).toContain('A-&gt;B');
    expect(svg).toContain('x="200" y="120"');
    expect(svg).toContain('marker-end="url(#arrow)"');
    expect(svg).toContain('<path d="M ');
  });
});
