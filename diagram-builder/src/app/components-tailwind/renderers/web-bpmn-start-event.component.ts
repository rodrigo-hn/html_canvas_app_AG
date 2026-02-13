import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS, bpmnIconSvg } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-start-event',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div class="h-full w-full rounded-full bg-transparent flex items-center justify-center" [ngStyle]="circleStyle()">
        <span [ngStyle]="iconStyle()" [innerHTML]="iconSvg()"></span>
      </div>
    </div>
  `,
})
export class WebBpmnStartEventComponent {
  circleStyle() {
    return {
      borderStyle: 'solid',
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.eventStart}px`,
      'border-color': `var(--bpmn-start-border, ${BPMN_WEB_TASK_TOKENS.variants.green.border})`,
    };
  }

  iconStyle() {
    return {
      'line-height': '1',
    };
  }

  iconSvg(): string {
    return bpmnIconSvg('start', `var(--bpmn-start-icon, ${BPMN_WEB_TASK_TOKENS.variants.green.accent})`, 16);
  }
}
