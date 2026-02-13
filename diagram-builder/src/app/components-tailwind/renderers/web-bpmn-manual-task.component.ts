import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS, BpmnWebTaskVariant } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-manual-task',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative h-full w-full text-white"
      [ngStyle]="containerStyle()"
    >
      @if (iconEnabled) {
      <div class="absolute" [ngStyle]="iconStyle()">✋</div>
      }
      <div class="flex h-full items-center justify-center text-center leading-tight" [ngStyle]="textStyle()">
        {{ text }}
      </div>
    </div>
  `,
})
export class WebBpmnManualTaskComponent {
  @Input() text = 'Manual Task';
  @Input() iconEnabled = true;
  @Input() variant: BpmnWebTaskVariant = 'yellow';

  containerStyle() {
    const tone = BPMN_WEB_TASK_TOKENS.variants[this.variant];
    return {
      'background-color': BPMN_WEB_TASK_TOKENS.background,
      color: BPMN_WEB_TASK_TOKENS.text,
      'border-color': tone.border,
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.task}px`,
      borderStyle: 'solid',
      'border-radius': BPMN_WEB_TASK_TOKENS.taskRadius,
      padding: BPMN_WEB_TASK_TOKENS.taskPadding,
      'font-family': BPMN_WEB_TASK_TOKENS.fontFamily,
      'min-width': BPMN_WEB_TASK_TOKENS.taskMinWidth,
      'flex-shrink': 0,
      cursor: BPMN_WEB_TASK_TOKENS.interaction.cursor,
      transition: BPMN_WEB_TASK_TOKENS.interaction.transition,
    };
  }

  iconStyle() {
    return {
      color: BPMN_WEB_TASK_TOKENS.variants[this.variant].accent,
      left: BPMN_WEB_TASK_TOKENS.icon.left,
      top: BPMN_WEB_TASK_TOKENS.icon.top,
      'font-size': BPMN_WEB_TASK_TOKENS.icon.size,
      'line-height': '1',
    };
  }

  textStyle() {
    return {
      'font-size': BPMN_WEB_TASK_TOKENS.typography.taskSize,
      'font-weight': BPMN_WEB_TASK_TOKENS.typography.taskWeight,
    };
  }
}
