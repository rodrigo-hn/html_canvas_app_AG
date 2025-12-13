# Walkthrough: Angular Diagramming App

I have successfully generated the diagramming application based on your prompt. The application is built with Angular 21, Tailwind CSS, and uses a custom SVG stencil engine.

## Features Implemented

- **Canvas**: Interactive drawing area with grid.
- **Drag & Drop**: Move nodes freely with snapping (20px grid).
- **Stencils**: Custom SVG renderers for:
  - Basic Shapes (Rectangle, Cylinder, Diamond, Document)
  - BPMN Shapes (Task, Events, Gateway, Pools)
- **Web Components**: Functional Tailwind components rendered on canvas:
  - Buttons (variants included)
  - Inputs (with labels)
  - Cards (with content)
- **HTML Export**: Generates a strictly standalone HTML file with:
  - Embedded SVG stencils.
  - Actual HTML + Tailwind classes for Web Components.
  - No external JS dependencies (viewer-less).

## How to Run

1.  Navigate to the project directory:

    ```bash
    cd diagram-builder
    ```

2.  Start the development server:

    ```bash
    npm start
    ```

3.  Open [http://localhost:4200](http://localhost:4200).

## How to Use

1.  **Interact**: You will see pre-loaded components (Button, Card, BPMN Task, etc.) on the canvas.
2.  **Move**: Drag them around. They snap to the grid.
3.  **Select**: Click to select (blue ring appears). CMD/Shift+Click to multi-select.
4.  **Export**: Click the **"Export HTML"** button in the top-right corner.
    - A file `diagram-export.html` will download.
    - Open it in any browser to verify it looks identical to the canvas but uses real HTML elements.

## Architecture Highlights

- `Core`: Signals-based state management (`DiagramService`).
- `Stencils`: `StencilService` generates pure SVG paths.
- `Components`: `NodeRendererComponent` handles the switch between Shape and WebNode.
- `Exporter`: `HtmlExportService` reconstructs the DOM for export.
