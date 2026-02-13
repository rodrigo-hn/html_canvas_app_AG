import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-pool',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full w-full rounded-md" [ngStyle]="containerStyle()">
      <div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center rounded-l-md" [ngStyle]="sidebarStyle()">
        <div class="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap" [ngStyle]="labelStyle()">
          {{ label || 'POOL' }}
        </div>
      </div>
    </div>
  `,
})
export class WebBpmnPoolComponent {
  @Input() label = 'POOL';

  containerStyle() {
    return {
      'border-style': 'solid',
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.pool}px`,
      'border-color': BPMN_WEB_TASK_TOKENS.pool.border,
      'background-color': BPMN_WEB_TASK_TOKENS.pool.background,
    };
  }

  sidebarStyle() {
    return {
      'border-right-style': 'solid',
      'border-right-width': `${BPMN_WEB_TASK_TOKENS.stroke.lane}px`,
      'border-right-color': BPMN_WEB_TASK_TOKENS.pool.border,
      'background-color': BPMN_WEB_TASK_TOKENS.pool.sidebar,
    };
  }

  labelStyle() {
    return {
      color: BPMN_WEB_TASK_TOKENS.pool.sidebarText,
      'font-size': BPMN_WEB_TASK_TOKENS.typography.taskSize,
      'font-weight': 700,
      'font-family': BPMN_WEB_TASK_TOKENS.fontFamily,
      'letter-spacing': '0.02em',
    };
  }
}
