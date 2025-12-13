import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col">
      <label *ngIf="label" class="mb-1 text-sm font-bold text-gray-700">{{ label }}</label>
      <input
        [type]="type"
        [placeholder]="placeholder"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  `,
})
export class WebInputComponent {
  @Input() label = '';
  @Input() placeholder = 'Input text';
  @Input() type = 'text';
}
