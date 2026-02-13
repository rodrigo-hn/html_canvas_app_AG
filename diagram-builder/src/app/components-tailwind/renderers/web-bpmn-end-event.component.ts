import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-end-event',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div class="h-full w-full rounded-full flex items-center justify-center" [ngStyle]="circleStyle()">
        <span [ngStyle]="iconStyle()">●</span>
      </div>
    </div>
  `,
})
export class WebBpmnEndEventComponent {
  circleStyle() {
    return {
      borderStyle: 'solid',
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.eventEnd}px`,
      'border-color': `var(--bpmn-end-border, ${BPMN_WEB_TASK_TOKENS.variants.red.border})`,
      background: `var(--bpmn-end-fill, rgba(248,113,113,0.20))`,
    };
  }

  iconStyle() {
    return {
      'font-size': '10px',
      color: `var(--bpmn-end-icon, ${BPMN_WEB_TASK_TOKENS.variants.red.accent})`,
      'line-height': '1',
    };
  }
}
