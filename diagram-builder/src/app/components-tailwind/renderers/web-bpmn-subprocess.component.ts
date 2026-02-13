import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS, BpmnWebTaskVariant } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-subprocess',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative h-full w-full text-white"
      [ngStyle]="containerStyle()"
    >
      @if (iconEnabled) {
      <div class="absolute" [ngStyle]="iconStyle()">📦</div>
      }
      <div class="flex h-full items-center justify-center text-center leading-tight" [ngStyle]="textStyle()">
        {{ text }}
      </div>
      @if (badgeEnabled) {
      <div
        class="absolute left-1/2 flex -translate-x-1/2 items-center justify-center border bg-slate-900 leading-none"
        [ngStyle]="badgeStyle()"
      >
        +
      </div>
      }
    </div>
  `,
})
export class WebBpmnSubprocessComponent {
  @Input() text = 'Subprocess';
  @Input() iconEnabled = true;
  @Input() badgeEnabled = true;
  @Input() variant: BpmnWebTaskVariant = 'purple';

  containerStyle() {
    const tone = BPMN_WEB_TASK_TOKENS.variants[this.variant];
    return {
      'background-color': BPMN_WEB_TASK_TOKENS.background,
      color: BPMN_WEB_TASK_TOKENS.text,
      'border-color': tone.border,
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.task}px`,
      borderStyle: 'solid',
      'border-radius': BPMN_WEB_TASK_TOKENS.subprocessRadius,
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

  badgeStyle() {
    const tone = BPMN_WEB_TASK_TOKENS.variants[this.variant];
    return {
      color: tone.accent,
      'border-color': tone.border,
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.task}px`,
      width: BPMN_WEB_TASK_TOKENS.badge.size,
      height: BPMN_WEB_TASK_TOKENS.badge.size,
      'font-size': BPMN_WEB_TASK_TOKENS.badge.fontSize,
      'font-weight': 700,
      'border-radius': BPMN_WEB_TASK_TOKENS.badge.radius,
      bottom: BPMN_WEB_TASK_TOKENS.badge.bottom,
    };
  }

  textStyle() {
    return {
      'font-size': BPMN_WEB_TASK_TOKENS.typography.taskSize,
      'font-weight': BPMN_WEB_TASK_TOKENS.typography.taskWeight,
    };
  }
}
