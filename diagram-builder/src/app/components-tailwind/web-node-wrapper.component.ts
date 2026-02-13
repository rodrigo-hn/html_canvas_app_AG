import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebNode } from '../core/models/diagram.model';
import { WebButtonComponent } from './renderers/web-button.component';
import { WebInputComponent } from './renderers/web-input.component';
import { WebCardComponent } from './renderers/web-card.component';
import { WebBpmnUserTaskComponent } from './renderers/web-bpmn-user-task.component';
import { WebBpmnServiceTaskComponent } from './renderers/web-bpmn-service-task.component';
import { WebBpmnManualTaskComponent } from './renderers/web-bpmn-manual-task.component';
import { WebBpmnSubprocessComponent } from './renderers/web-bpmn-subprocess.component';
import { WebBpmnStartEventComponent } from './renderers/web-bpmn-start-event.component';
import { WebBpmnExclusiveGatewayComponent } from './renderers/web-bpmn-exclusive-gateway.component';
import { WebBpmnEndEventComponent } from './renderers/web-bpmn-end-event.component';
import { WebBpmnLaneComponent } from './renderers/web-bpmn-lane.component';
import { WebBpmnPoolComponent } from './renderers/web-bpmn-pool.component';

@Component({
  selector: 'app-web-node-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    WebButtonComponent,
    WebInputComponent,
    WebCardComponent,
    WebBpmnUserTaskComponent,
    WebBpmnServiceTaskComponent,
    WebBpmnManualTaskComponent,
    WebBpmnSubprocessComponent,
    WebBpmnStartEventComponent,
    WebBpmnExclusiveGatewayComponent,
    WebBpmnEndEventComponent,
    WebBpmnLaneComponent,
    WebBpmnPoolComponent,
  ],
  template: `
    <div class="w-full h-full overflow-hidden pointer-events-none">
      @switch (node.componentType) { @case ('button') {
      <app-web-button
        [text]="node.data.text || 'Button'"
        [variant]="node.data.variant || 'primary'"
      >
      </app-web-button>
      } @case ('input') {
      <app-web-input
        [label]="node.data.label || ''"
        [placeholder]="node.data.placeholder || ''"
        [type]="node.data.inputType || 'text'"
      >
      </app-web-input>
      } @case ('card') {
      <app-web-card [title]="node.data.title || ''" [content]="node.data.content || ''"> </app-web-card>
      } @case ('bpmn-user-task-web') {
      <app-web-bpmn-user-task
        [text]="bpmnTaskText('User Task')"
        [iconEnabled]="bpmnTaskIconEnabled()"
        [variant]="bpmnTaskVariant('blue')"
      ></app-web-bpmn-user-task>
      } @case ('bpmn-service-task-web') {
      <app-web-bpmn-service-task
        [text]="bpmnTaskText('Service Task')"
        [iconEnabled]="bpmnTaskIconEnabled()"
        [variant]="bpmnTaskVariant('blue')"
      ></app-web-bpmn-service-task>
      } @case ('bpmn-manual-task-web') {
      <app-web-bpmn-manual-task
        [text]="bpmnTaskText('Manual Task')"
        [iconEnabled]="bpmnTaskIconEnabled()"
        [variant]="bpmnTaskVariant('yellow')"
      ></app-web-bpmn-manual-task>
      } @case ('bpmn-subprocess-web') {
      <app-web-bpmn-subprocess
        [text]="bpmnTaskText('Subprocess')"
        [iconEnabled]="bpmnTaskIconEnabled()"
        [badgeEnabled]="bpmnTaskBadgeEnabled()"
        [variant]="bpmnTaskVariant('purple')"
      ></app-web-bpmn-subprocess>
      } @case ('bpmn-start-event-web') {
      <app-web-bpmn-start-event></app-web-bpmn-start-event>
      } @case ('bpmn-exclusive-gateway-web') {
      <app-web-bpmn-exclusive-gateway [label]="bpmnTaskText('')"></app-web-bpmn-exclusive-gateway>
      } @case ('bpmn-end-event-web') {
      <app-web-bpmn-end-event></app-web-bpmn-end-event>
      } @case ('bpmn-lane-web') {
      <app-web-bpmn-lane [label]="bpmnTaskText('Lane')"></app-web-bpmn-lane>
      } @case ('bpmn-pool-web') {
      <app-web-bpmn-pool [label]="bpmnTaskText('Pool')"></app-web-bpmn-pool>
      } @default {
      <div class="text-red-500">Unknown: {{ $any(node).componentType }}</div>
      } }
    </div>
  `,
})
export class WebNodeWrapperComponent {
  @Input({ required: true }) node!: WebNode;

  bpmnTaskText(fallback: string) {
    const data = this.node.data as { text?: string };
    return data.text || fallback;
  }

  bpmnTaskIconEnabled() {
    const data = this.node.data as { iconEnabled?: boolean };
    return data.iconEnabled ?? true;
  }

  bpmnTaskBadgeEnabled() {
    const data = this.node.data as { badgeEnabled?: boolean };
    return data.badgeEnabled ?? true;
  }

  bpmnTaskVariant(fallback: 'blue' | 'yellow' | 'green' | 'purple' | 'red') {
    const data = this.node.data as { variant?: 'blue' | 'yellow' | 'green' | 'purple' | 'red' };
    return data.variant || fallback;
  }
}
