import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { CanvasComponent } from './canvas.component';
import { WebNode } from '../core/models/diagram.model';

describe('CanvasComponent BPMN Web Tasks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasComponent],
    }).compileComponents();
  });

  it('creates each BPMN web task component from palette click with expected defaults', () => {
    const fixture = TestBed.createComponent(CanvasComponent);
    const component = fixture.componentInstance;

    component.addPaletteItem('web-bpmn-user-task');
    component.addPaletteItem('web-bpmn-service-task');
    component.addPaletteItem('web-bpmn-manual-task');
    component.addPaletteItem('web-bpmn-subprocess-task');

    const webNodes = component.store.nodes().filter((node): node is WebNode => node.type === 'web-component');
    const byType = (type: WebNode['componentType']) => webNodes.find((node) => node.componentType === type);

    const user = byType('bpmn-user-task-web');
    const service = byType('bpmn-service-task-web');
    const manual = byType('bpmn-manual-task-web');
    const subprocess = byType('bpmn-subprocess-web');

    expect(user).toBeTruthy();
    expect(user!.width).toBe(160);
    expect(user!.height).toBe(84);
    expect((user!.data as { iconEnabled?: boolean; variant?: string }).iconEnabled).toBe(true);
    expect((user!.data as { iconEnabled?: boolean; variant?: string }).variant).toBe('blue');

    expect(service).toBeTruthy();
    expect(service!.width).toBe(160);
    expect(service!.height).toBe(84);
    expect((service!.data as { iconEnabled?: boolean; variant?: string }).variant).toBe('blue');

    expect(manual).toBeTruthy();
    expect(manual!.width).toBe(160);
    expect(manual!.height).toBe(84);
    expect((manual!.data as { iconEnabled?: boolean; variant?: string }).variant).toBe('yellow');

    expect(subprocess).toBeTruthy();
    expect(subprocess!.width).toBe(180);
    expect(subprocess!.height).toBe(92);
    expect((subprocess!.data as { badgeEnabled?: boolean; variant?: string }).badgeEnabled).toBe(true);
    expect((subprocess!.data as { badgeEnabled?: boolean; variant?: string }).variant).toBe('purple');
  });

  it('creates BPMN web task from drag and drop', () => {
    const fixture = TestBed.createComponent(CanvasComponent);
    const component = fixture.componentInstance;
    (component as any).canvasRoot = {
      nativeElement: {
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
      },
    };
    (component as any).draggedPaletteKey = 'web-bpmn-user-task';

    const event = {
      clientX: 300,
      clientY: 220,
      preventDefault: vi.fn(),
      dataTransfer: null,
    } as unknown as DragEvent;

    component.onCanvasDrop(event);

    const created = component.store
      .nodes()
      .find((node) => node.type === 'web-component' && node.componentType === 'bpmn-user-task-web');

    expect(event.preventDefault).toHaveBeenCalled();
    expect(created).toBeTruthy();
    expect(created!.x).toBe(300);
    expect(created!.y).toBe(220);
  });
});
