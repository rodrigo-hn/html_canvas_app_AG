import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Point } from '../../core/models/diagram.model';

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective {
  @Input() dragDisabled = false;
  @Input() snapToGrid = false;
  @Input() gridSize = 10;
  @Input() zoom = 1;
  @Input() startPosition: Point = { x: 0, y: 0 };

  @Output() dragStart = new EventEmitter<void>();
  @Output() dragMove = new EventEmitter<Point>();
  @Output() dragEnd = new EventEmitter<Point>();

  private isDragging = false;
  private initialMouse: Point = { x: 0, y: 0 };
  private initialPos: Point = { x: 0, y: 0 };

  constructor(private el: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.dragDisabled) return;
    if (event.button !== 0) return;
    // Don't drag if clicking on controls/inputs (later)
    if ((event.target as HTMLElement).closest('input, select, textarea, button')) {
      return;
    }

    this.isDragging = true;
    this.initialMouse = { x: event.clientX, y: event.clientY };
    this.initialPos = { ...this.startPosition };

    this.dragStart.emit();
    event.preventDefault(); // Prevent text selection
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const deltaX = (event.clientX - this.initialMouse.x) / this.zoom;
    const deltaY = (event.clientY - this.initialMouse.y) / this.zoom;

    let newX = this.initialPos.x + deltaX;
    let newY = this.initialPos.y + deltaY;

    if (this.snapToGrid) {
      newX = Math.round(newX / this.gridSize) * this.gridSize;
      newY = Math.round(newY / this.gridSize) * this.gridSize;
    }

    this.dragMove.emit({ x: newX, y: newY });
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.dragEnd.emit({ x: this.initialPos.x, y: this.initialPos.y }); // We might want to emit final pos, but move updates it live
  }
}
