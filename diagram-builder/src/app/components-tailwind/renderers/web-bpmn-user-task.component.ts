import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS, BpmnWebTaskVariant } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-user-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative h-full w-full rounded-[8px] border-2 text-white"
      [ngStyle]="containerStyle()"
      style="padding: 0.8rem 1.2rem; font-family: 'DM Sans', sans-serif;"
    >
      @if (iconEnabled) {
      <div class="absolute text-[11px]" style="left: 6px; top: 4px;" [ngStyle]="iconStyle()">👤</div>
      }
      <div class="flex h-full items-center justify-center text-center text-[0.8rem] font-medium leading-tight">
        {{ text }}
      </div>
    </div>
  `,
})
export class WebBpmnUserTaskComponent {
  @Input() text = 'User Task';
  @Input() iconEnabled = true;
  @Input() variant: BpmnWebTaskVariant = 'blue';

  containerStyle() {
    const tone = BPMN_WEB_TASK_TOKENS.variants[this.variant];
    return {
      'background-color': BPMN_WEB_TASK_TOKENS.background,
      color: BPMN_WEB_TASK_TOKENS.text,
      'border-color': tone.border,
    };
  }

  iconStyle() {
    return { color: BPMN_WEB_TASK_TOKENS.variants[this.variant].accent };
  }
}
