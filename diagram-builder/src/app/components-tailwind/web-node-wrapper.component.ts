import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebNode } from '../core/models/diagram.model';
import { WebButtonComponent } from './renderers/web-button.component';
import { WebInputComponent } from './renderers/web-input.component';
import { WebCardComponent } from './renderers/web-card.component';

@Component({
  selector: 'app-web-node-wrapper',
  standalone: true,
  imports: [CommonModule, WebButtonComponent, WebInputComponent, WebCardComponent],
  template: `
    <div class="w-full h-full overflow-hidden pointer-events-none">
      @switch (node.componentType) { @case ('button') {
      <app-web-button
        [text]="node.data.text || 'Button'"
        [variant]="node.data.variant || 'primary'"
      >
      </app-web-button>
      } @case ('input') {
      <app-web-input
        [label]="node.data.label"
        [placeholder]="node.data.placeholder"
        [type]="node.data.inputType || 'text'"
      >
      </app-web-input>
      } @case ('card') {
      <app-web-card [title]="node.data.title" [content]="node.data.content"> </app-web-card>
      } @default {
      <div class="text-red-500">Unknown: {{ node.componentType }}</div>
      } }
    </div>
  `,
})
export class WebNodeWrapperComponent {
  @Input({ required: true }) node!: WebNode;
}
