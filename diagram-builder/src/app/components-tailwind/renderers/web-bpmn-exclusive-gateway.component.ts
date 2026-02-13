import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-bpmn-exclusive-gateway',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div class="relative h-[72%] w-[72%] rotate-45 border-2 border-yellow-400 bg-slate-900">
        <span class="absolute inset-0 flex items-center justify-center -rotate-45 text-2xl font-bold text-yellow-300">×</span>
      </div>
      @if (label) {
      <div class="absolute -top-5 text-[11px] text-yellow-300 whitespace-nowrap">{{ label }}</div>
      }
    </div>
  `,
})
export class WebBpmnExclusiveGatewayComponent {
  @Input() label = '';
}

