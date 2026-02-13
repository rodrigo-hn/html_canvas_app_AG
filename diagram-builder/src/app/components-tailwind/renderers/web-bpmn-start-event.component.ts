import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-bpmn-start-event',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full flex items-center justify-center">
      <div
        class="h-full w-full rounded-full border-[3px] border-green-400 bg-transparent flex items-center justify-center"
      >
        <span class="text-base text-green-300">✉</span>
      </div>
    </div>
  `,
})
export class WebBpmnStartEventComponent {}

