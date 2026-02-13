import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-bpmn-lane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full w-full border border-slate-700 bg-slate-900/30">
      <div class="absolute inset-y-0 left-0 w-10 border-r border-slate-700 bg-slate-800/80 flex items-center justify-center">
        <div class="text-[10px] text-slate-300 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
          {{ label || 'Lane' }}
        </div>
      </div>
    </div>
  `,
})
export class WebBpmnLaneComponent {
  @Input() label = 'Lane';
}

