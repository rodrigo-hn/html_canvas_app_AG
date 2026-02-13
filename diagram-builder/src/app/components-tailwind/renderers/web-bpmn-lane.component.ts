import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-lane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full w-full" [ngStyle]="containerStyle()">
      <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center" [ngStyle]="sidebarStyle()">
        <div class="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap" [ngStyle]="labelStyle()">
          {{ label || 'Lane' }}
        </div>
      </div>
    </div>
  `,
})
export class WebBpmnLaneComponent {
  @Input() label = 'Lane';

  containerStyle() {
    return {
      'border-style': 'solid',
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.lane}px`,
      'border-color': BPMN_WEB_TASK_TOKENS.lane.border,
      'background-color': BPMN_WEB_TASK_TOKENS.lane.background,
    };
  }

  sidebarStyle() {
    return {
      'border-right-style': 'solid',
      'border-right-width': `${BPMN_WEB_TASK_TOKENS.stroke.lane}px`,
      'border-right-color': BPMN_WEB_TASK_TOKENS.lane.border,
      'background-color': BPMN_WEB_TASK_TOKENS.lane.sidebar,
    };
  }

  labelStyle() {
    return {
      color: BPMN_WEB_TASK_TOKENS.lane.sidebarText,
      'font-size': BPMN_WEB_TASK_TOKENS.typography.labelSize,
      'font-weight': BPMN_WEB_TASK_TOKENS.typography.labelWeight,
      'font-family': BPMN_WEB_TASK_TOKENS.fontFamily,
    };
  }
}
