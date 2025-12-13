import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="getClasses()">
      {{ text }}
    </button>
  `,
})
export class WebButtonComponent {
  @Input() text = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';

  getClasses() {
    const base = 'px-4 py-2 rounded font-semibold focus:outline-none focus:shadow-outline';
    const variants = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    return `${base} ${variants[this.variant]}`;
  }
}
