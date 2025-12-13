# Implementation Plan: Angular Diagramming App

## Goal Description

Build a web-based diagramming application similar to draw.io but focused on exporting to **functional HTML + Tailwind CSS** and independent SVG stencils. The app will be built with Angular 21 and Tailwind CSS, avoiding external graph libraries like mxGraph.

## Architecture

### Directory Structure

```
/src
  /app
    /core
      /models        # Data models (Diagram, Node, Edge)
      /services      # State management (Signals), Export services
    /canvas
      /components    # functionality for the drawing area
    /stencils
      /shapes        # SVG generators for diagram shapes
    /components-tailwind
      /registry      # Registry of available Tailwind components
      /renderers     # Angular components that render the Tailwind elements
    /ui
      /toolbar       # Sidebar with shapes
      /properties    # Property editor
```

### Data Model

- **DiagramNode**: Base interface for all items on canvas.
  - `id`: string
  - `type`: 'shape' | 'web-component'
  - `x`, `y`, `width`, `height`: geometry
  - `data`: specific properties (text, style, etc.)
- **ShapeNode**: Extends DiagramNode. Reference to specific stencil renderer.
- **WebNode**: Extends DiagramNode. Reference to specific Tailwind component.

### State Management

- **DiagramService**: Uses Angular Signals (`signal`, `computed`) to manage the list of nodes, selection state, and history (undo/redo).
- `ChangeDetectionStrategy.OnPush` used globally.

## Proposed Changes

### Project Initialization

- Create new Angular project with `npx @angular/cli@next new`.
- Install `tailwindcss` via standard PostCSS setup or Angular integration.

### Core Components

#### [NEW] /src/app/core/models/diagram.model.ts

- Interfaces for `DiagramNode`, `Edge`, `Diagram`.

#### [NEW] /src/app/core/services/diagram.service.ts

- Signal-based store for diagram state.

### Canvas System

#### [NEW] /src/app/canvas/canvas.component.ts

- Main drawing area.
- Handles mouse events for drag/drop/select.
- Iterates over nodes signal to render them.

### Stencil System

#### [NEW] /src/app/stencils/stencil.service.ts

- Registry of drawing functions (e.g., `drawDocument`, `drawBpmnTask`).
- Returns SVG strings or TemplateRef-friendly structures.

### Export System

#### [NEW] /src/app/core/services/html-exporter.service.ts

- Generates a standalone HTML string.
- Maps `WebNode` data to actual HTML string with Tailwind classes.
- Maps `ShapeNode` data to SVG paths.

## Verification Plan

### Manual Verification

- Run `npm start`.
- Drag a "Button" component to canvas.
- Drag a "BPMN Task" shape to canvas.
- Click "Export HTML".
- Open generated HTML file in browser and verify:
  - Button looks identical to canvas.
  - Button has hover states (Tailwind classes).
  - SVG shapes are sharp and correct.
