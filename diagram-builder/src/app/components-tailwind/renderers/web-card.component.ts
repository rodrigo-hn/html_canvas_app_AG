import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-sm rounded overflow-hidden shadow-lg bg-white h-full">
      <div class="px-6 py-4">
        <div class="font-bold text-xl mb-2">{{ title }}</div>
        <p class="text-gray-700 text-base">
          {{ content }}
        </p>
      </div>
    </div>
  `,
})
export class WebCardComponent {
  @Input() title = 'Card Title';
  @Input() content = 'Lorem ipsum dolor sit amet.';
}
