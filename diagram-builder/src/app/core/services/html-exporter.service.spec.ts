import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { HtmlExportService } from './html-exporter.service';

describe('HtmlExportService', () => {
  it('exports SVG with edges and markers', () => {
    TestBed.configureTestingModule({
      providers: [
        HtmlExportService,
        {
          provide: DomSanitizer,
          useValue: { bypassSecurityTrustHtml: (v: string) => v },
        },
      ],
    });

    const service = TestBed.inject(HtmlExportService);
    const svg = service.exportSvg({
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
});
