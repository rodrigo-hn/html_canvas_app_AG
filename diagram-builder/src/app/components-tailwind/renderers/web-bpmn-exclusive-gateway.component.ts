import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BPMN_WEB_TASK_TOKENS } from './bpmn-web-task.tokens';

@Component({
  selector: 'app-web-bpmn-exclusive-gateway',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div class="relative h-[72%] w-[72%] rotate-45 bg-slate-900" [ngStyle]="diamondStyle()">
        <span class="absolute inset-0 flex items-center justify-center -rotate-45" [ngStyle]="symbolStyle()">×</span>
      </div>
      @if (label) {
      <div class="absolute -top-5 whitespace-nowrap" [ngStyle]="labelStyle()">{{ label }}</div>
      }
    </div>
  `,
})
export class WebBpmnExclusiveGatewayComponent {
  @Input() label = '';

  diamondStyle() {
    return {
      borderStyle: 'solid',
      'border-width': `${BPMN_WEB_TASK_TOKENS.stroke.gateway}px`,
      'border-color': `var(--bpmn-gateway-border, ${BPMN_WEB_TASK_TOKENS.variants.yellow.border})`,
    };
  }

  symbolStyle() {
    return {
      color: `var(--bpmn-gateway-symbol, ${BPMN_WEB_TASK_TOKENS.variants.yellow.accent})`,
      'font-size': '20px',
      'font-weight': 700,
      'line-height': '1',
    };
  }

  labelStyle() {
    return {
      color: `var(--bpmn-gateway-label, ${BPMN_WEB_TASK_TOKENS.variants.yellow.accent})`,
      'font-size': BPMN_WEB_TASK_TOKENS.typography.labelSize,
      'font-weight': BPMN_WEB_TASK_TOKENS.typography.labelWeight,
      opacity: 0.92,
    };
  }
}
