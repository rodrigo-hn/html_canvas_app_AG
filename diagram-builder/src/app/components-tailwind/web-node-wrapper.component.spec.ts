import { TestBed } from '@angular/core/testing';
import { WebNodeWrapperComponent } from './web-node-wrapper.component';
import { WebNode } from '../core/models/diagram.model';

function makeNode(componentType: WebNode['componentType'], data: Record<string, unknown>): WebNode {
  return {
    id: 'n-1',
    type: 'web-component',
    componentType,
    x: 0,
    y: 0,
    width: 160,
    height: 84,
    zIndex: 1,
    data: data as any,
  } as WebNode;
}

describe('WebNodeWrapperComponent BPMN Web Tasks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebNodeWrapperComponent],
    }).compileComponents();
  });

  it('renders correct renderer by componentType', () => {
    const fixture = TestBed.createComponent(WebNodeWrapperComponent);

    fixture.componentRef.setInput(
      'node',
      makeNode('bpmn-user-task-web', { text: 'Registrar pedido', iconEnabled: true, variant: 'blue' })
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-web-bpmn-user-task')).toBeTruthy();

    fixture.componentRef.setInput(
      'node',
      makeNode('bpmn-service-task-web', { text: 'Verificar stock', iconEnabled: true, variant: 'blue' })
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-web-bpmn-service-task')).toBeTruthy();

    fixture.componentRef.setInput(
      'node',
      makeNode('bpmn-manual-task-web', { text: 'Empaquetar', iconEnabled: true, variant: 'yellow' })
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-web-bpmn-manual-task')).toBeTruthy();

    fixture.componentRef.setInput(
      'node',
      makeNode('bpmn-subprocess-web', { text: 'Preparar pizza', iconEnabled: true, badgeEnabled: true, variant: 'purple' })
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-web-bpmn-subprocess')).toBeTruthy();
  });

  it('applies defaults and toggle behavior for icon and subprocess badge', () => {
    const fixture = TestBed.createComponent(WebNodeWrapperComponent);

    fixture.componentRef.setInput('node', makeNode('bpmn-user-task-web', { text: 'User Task' }));
    fixture.detectChanges();
    const userText = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(userText).toContain('User Task');

    fixture.componentRef.setInput(
      'node',
      makeNode('bpmn-subprocess-web', { text: 'Subprocess', iconEnabled: false, badgeEnabled: false, variant: 'purple' })
    );
    fixture.detectChanges();
    const subprocessText = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(subprocessText).toContain('Subprocess');
    expect(subprocessText).not.toContain('+');
  });
});

