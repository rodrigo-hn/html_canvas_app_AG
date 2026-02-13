import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-bpmn-pool',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full w-full rounded-md border-2 border-slate-700 bg-slate-900/20">
      <div class="absolute inset-y-0 left-0 w-10 border-r border-slate-700 bg-orange-600/90 flex items-center justify-center rounded-l-md">
        <div class="text-[10px] font-semibold text-white [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
          {{ label || 'POOL' }}
        </div>
      </div>
    </div>
  `,
})
export class WebBpmnPoolComponent {
  @Input() label = 'POOL';
}

