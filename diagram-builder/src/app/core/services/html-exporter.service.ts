import { Injectable, inject } from '@angular/core';
import { DiagramModel, ShapeNode, WebNode } from '../models/diagram.model';
import { BasicShapes } from '../../stencils/shapes/basic.shapes';
import { BpmnShapes } from '../../stencils/shapes/bpmn.shapes';
import { StencilService } from '../../stencils/stencil.service';

@Injectable({
  providedIn: 'root',
})
export class HtmlExportService {
  private stencilService = inject(StencilService);

  exportHtml(model: DiagramModel): string {
    const nodesHtml = model.nodes
      .map((node) => {
        if (node.type === 'shape') {
          return this.renderShape(node as ShapeNode);
        } else {
          return this.renderWebComponent(node as WebNode);
        }
      })
      .join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Diagram</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; padding: 0; background-color: #f8fafc; overflow: auto; }
      .diagram-container { position: relative; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div class="diagram-container">
${nodesHtml}
    </div>
</body>
</html>
    `;
  }

  private renderShape(node: ShapeNode): string {
    // We need to extract the inner HTML from the StencilService or generator
    // StencilService returns SafeHtml, so strictly we should access the generator directly or sanitized string.
    // For export, we need the raw string. StencilService wraps in sanitization.
    // I should probably expose the raw string generator in StencilService or access BasicShapes directly.
    // Ideally StencilService should have a getRawShapeSVG method.
    // For now, I will bypass and use the registry logic if possible, or cast/string manips.

    // Better approach: StencilService should expose 'getShapeSVGString'.
    // I will assume I can access the generator logic or duplicate for now.
    // Actually, I can just use the StencilService.shapes if I make it public or similar.
    // But since I can't easily change StencilService visibility without another generic tool call...
    // I will use a simple workaround: access the raw generators if imported?
    // I imported them in StencilService. I can import them here too.

    // Let's import BasicShapes and BpmnShapes directly here.
    return this.generateSvgWrapper(node, this.getSvgContent(node));
  }

  private getSvgContent(node: ShapeNode): string {
    const shapes: Record<string, (w: number, h: number) => string> = {
      rectangle: BasicShapes.rectangle,
      'rounded-rectangle': BasicShapes.roundedRectangle,
      document: BasicShapes.document,
      cylinder: BasicShapes.cylinder,
      diamond: BasicShapes.diamond,
      'bpmn-task': BpmnShapes.task,
      'bpmn-start-event': BpmnShapes.eventStart,
      'bpmn-end-event': BpmnShapes.eventEnd,
      'bpmn-gateway': BpmnShapes.gateway,
      'bpmn-pool': BpmnShapes.pool,
    };
    const generator = shapes[node.shapeType];
    if (generator) {
      return generator(node.width, node.height);
    }
    return `<rect width="${node.width}" height="${node.height}" fill="red"/>`;
  }

  private generateSvgWrapper(node: ShapeNode, innerContent: string): string {
    return `
      <div style="position: absolute; left: ${node.x}px; top: ${node.y}px; width: ${
      node.width
    }px; height: ${node.height}px; z-index: ${node.zIndex}; pointer-events: none;">
        <svg viewBox="0 0 ${node.width} ${
      node.height
    }" style="width: 100%; height: 100%; overflow: visible;">
           ${innerContent}
        </svg>
        ${
          node.data?.text
            ? `
        <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; font-size: 0.875rem;">
            ${node.data.text}
        </div>`
            : ''
        }
      </div>`;
  }

  private renderWebComponent(node: WebNode): string {
    const style = `position: absolute; left: ${node.x}px; top: ${node.y}px; z-index: ${node.zIndex};`;

    switch (node.componentType) {
      case 'button':
        return this.renderButton(node, style);
      case 'input':
        return this.renderInput(node, style);
      case 'card':
        return this.renderCard(node, style);
      default:
        return `<!-- Unknown component: ${node.componentType} -->`;
    }
  }

  private renderButton(node: WebNode, style: string): string {
    const variant = node.data.variant || 'primary';
    const variants: any = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const cls = `px-4 py-2 rounded font-semibold focus:outline-none focus:shadow-outline ${variants[variant]}`;
    return `<button style="${style}" class="${cls}">${node.data.text || 'Button'}</button>`;
  }

  private renderInput(node: WebNode, style: string): string {
    const widthStyle = `width: ${node.width}px;`; /* Inputs usually need width */
    return `
     <div style="${style} ${widthStyle}" class="flex flex-col">
       ${
         node.data.label
           ? `<label class="mb-1 text-sm font-bold text-gray-700">${node.data.label}</label>`
           : ''
       }
       <input type="${node.data.inputType || 'text'}" 
              placeholder="${node.data.placeholder || ''}" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
     </div>`;
  }

  private renderCard(node: WebNode, style: string): string {
    const widthStyle = `width: ${node.width}px; height: ${node.height}px;`;
    return `
      <div style="${style} ${widthStyle}" class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
        <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2">${node.data.title || 'Card'}</div>
            <p class="text-gray-700 text-base">
                ${node.data.content || ''}
            </p>
        </div>
      </div>`;
  }
}
