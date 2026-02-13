import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-bpmn-end-event',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div
        class="h-full w-full rounded-full border-[4px] border-red-400 bg-red-500/30 flex items-center justify-center"
      >
        <span class="text-sm text-red-200">●</span>
      </div>
    </div>
  `,
})
export class WebBpmnEndEventComponent {}

