# Technical Documentation: Angular Diagramming App

## 1. Architecture Overview

The application is a client-side Angular 21 application designed to create diagrammatic layouts and export them as standalone, functional HTML files using Tailwind CSS. It avoids heavy drawing libraries (like mxGraph) in favor of a native Angular + SVG approach.

### Key Technologies

- **Angular 21**: Core framework, utilizing Signals and Standalone Components.
- **Tailwind CSS**: Utility-first styling for the UI and the exported components.
- **SVG**: Used for rendering geometric shapes (BPMN, Flowcharts).
- **TypeScript**: Strict typing for diagram models.

### Directory Structure

```
src/app/
├── canvas/           # The interactive drawing board
│   ├── components/   # NodeRenderer (handles both Shapes and WebNodes)
│   └── directives/   # Drag & Drop behavior
├── components-tailwind/ # "WebNodes" - Real Angular components mirroring HTML output
│   ├── registry/     # (Future) Metadata for available components
│   └── renderers/    # WebButton, WebInput, WebCard, etc.
├── core/
│   ├── models/       # DiagramNode, ShapeNode, WebNode interfaces
│   └── services/     # DiagramService (State), HtmlExportService
├── stencils/         # SVG Path generators
│   └── shapes/       # Basic and BPMN shape logic
└── ui/               # (Future) Toolbars and property editors
```

## 2. Core Concepts

### Data Model (`diagram.model.ts`)

The entire diagram is described by a serializable JSON model.

- **`DiagramNode`**: Base interface.
- **`ShapeNode`**: Represents SVG shapes. Has a `shapeType` (e.g., 'rect', 'bpmn-task').
- **`WebNode`**: Represents HTML/Tailwind components. Has a `componentType` (e.g., 'button', 'card').

### State Management (`diagram.service.ts`)

State is managed using **Angular Signals**.

- `nodesSignal`: Writable signal holding the array of nodes.
- `selectionSignal`: Set of currently selected node IDs.
- `computed` signals are exposed for the UI to consume efficiently.
- `OnPush` change detection is used everywhere for performance.

## 3. Rendering Engine

### The Canvas (`canvas.component.ts`)

Iterates over the `nodes` signal and renders an `app-node-renderer` for each. It handles background clicks for clearing selection.

### Node Renderer (`node-renderer.component.ts`)

A generic wrapper that decides how to paint a node:

1. **If ShapeNode**: calls `StencilService` to get an SVG string and renders it inside an `<svg>` element.
2. **If WebNode**: instantiates `WebNodeWrapperComponent` which dynamically picks the correct Tailwind component (Button, Card, etc.).

It also attaches the `appDraggable` directive to enable interaction.

### Draggable Directive

Handles native DOM mouse events (`mousedown`, `mousemove`, `mouseup`) to translate user gestures into coordinate updates in the `DiagramService`. Implements a grid-snapping logic (default 20px).

## 4. Stencil System (`stencils/`)

A lightweight, function-based registry.

- **`StencilService`**: Central facade.
- **`BasicShapes` / `BpmnShapes`**: Pure functions that take `(width, height)` and return an SVG string.
  This decoupling ensures that the rendering logic is identical between the live Canvas and the Export engine.

## 5. Export Engine (`html-exporter.service.ts`)

The unique selling point of this app. It generates a single HTML file string.

### Process

1. Receives the current `DiagramModel`.
2. Iterates through all nodes.
3. **For WebNodes**: Reconstructs the HTML string manually (e.g., `<button class="p-2 bg-blue-500...">`) to ensure it matches the visual output of the Angular components.
4. **For ShapeNodes**: Reuses the SVG logic from the Stencils system to embed inline SVGs.
5. Wraps everything in a standardized HTML5 boilerplate with a Tailwind CDN link for immediate rendering utility.

## 6. Setup & Development

### Prerequisites

- Node.js v18+
- npm

### Commands

- `npm start`: Runs dev server on port 4200.
- `npm run build`: Compiles production bundle to `dist/`.

### Extending the App

- **Add new Shape**: Add a function to `stencils/shapes/`, register in `StencilService`, and add mapping in `HtmlExportService`.
- **Add new Component**: Create Angular component in `components-tailwind/`, add to `WebNodeWrapper`, and implement string generation in `HtmlExportService`.
