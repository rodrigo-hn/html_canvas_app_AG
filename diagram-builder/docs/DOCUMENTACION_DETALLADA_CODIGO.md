# Documentación detallada del código — Diagram Builder

## 1. Visión general

La aplicación es un editor visual de diagramas construido con **Angular (standalone components)** y **signals** para el manejo reactivo de estado. El flujo principal permite:

- Insertar nodos (formas generales, BPMN y componentes web).
- Conectar nodos con aristas ortogonales editables.
- Editar propiedades desde un inspector lateral.
- Navegar en canvas con zoom/pan, marcos (frames), minimapa y selección múltiple.
- Exportar a HTML, SVG, PNG y JSON; además de importar JSON.

A nivel de arquitectura, el patrón central es:

1. **Estado global mínimo** en `DiagramStore`.
2. **Mutaciones de estado** encapsuladas en `DiagramCommands`.
3. **Renderizado/UX** en componentes de UI (canvas, nodos, aristas, inspector).

---

## 2. Arquitectura de alto nivel

## 2.1 Entrada de la aplicación

- `main.ts` arranca la app con `bootstrapApplication`.
- `app.config.ts` registra router y listeners globales.
- `app.routes.ts` define una sola ruta (`''`) que carga `CanvasComponent`.

Esto implica una SPA enfocada en un único módulo funcional: el editor.

## 2.2 Capa de dominio (modelos)

El modelo de diagrama está tipado en `diagram.model.ts`:

- **Nodos** (`DiagramNode`) de dos familias:
  - `shape` (formas SVG, incluyendo BPMN).
  - `web-component` (`button`, `input`, `card`).
- **Aristas** (`DiagramEdge`) con:
  - origen/destino por `nodeId` + `port`.
  - estilo visual (`stroke`, `strokeWidth`, `dashArray`, `cornerRadius`).
  - marcadores (`markerStart`, `markerEnd`).
  - punto manual de quiebre (`points`).
- **Modelo completo**: `DiagramModel { nodes, edges }`.

Esta tipificación permite validación estática de interacciones y simplifica exportadores.

## 2.3 Capa de estado

### `DiagramStore` (estado reactivo)

Se apoya en `signal(...)` para almacenar:

- `nodes`, `edges`.
- `selection` (set de ids seleccionados).
- `selectedEdgeId`.
- `snapToGrid`, `gridSize`.
- `edgePreview` (conexión temporal mientras se dibuja una arista).

Expone señales readonly y métodos de actualización (`set*`, `update*`).

### `DiagramCommands` (casos de uso)

`DiagramCommands` centraliza la lógica de negocio:

- CRUD de nodos y aristas.
- Selección simple/múltiple.
- Drag grupal (con snapshot inicial de posiciones).
- Configuración de grid/snap.
- Preview y finalización lógica de conexión.
- Import/export JSON y persistencia en localStorage.

**Beneficio clave:** los componentes de UI no mutan el store directamente (salvo lecturas), sino mediante comandos explícitos.

## 2.4 Capa de presentación

### `CanvasComponent`

Es el orquestador principal. Contiene:

- Toolbar (export, import, zoom, modos, grid, autosave, etc.).
- Panel de paleta con grupos de stencils.
- Lienzo transformable (`translate + scale`) para pan/zoom.
- Capa de aristas (`EdgesLayerComponent`) y capa de nodos (`NodeRendererComponent`).
- Marcos (frames) para navegación por vistas.
- Caja de selección por arrastre y minimapa.
- Inspector lateral (`InspectorComponent`) acoplado a la selección.

### `NodeRendererComponent`

Responsable de cada nodo:

- Render SVG para `shape` (via `StencilService`).
- Render de componente web para `web-component` (wrapper Tailwind).
- Selección y edición de texto (doble click).
- Drag (mediante `DraggableDirective`).
- Resize con 8 manijas.
- Puertos de conexión para iniciar aristas.

### `EdgesLayerComponent`

Responsable de aristas y su interacción:

- Dibuja paths SVG ortogonales.
- Renderiza marcadores (`arrow`, `open-arrow`, `open-circle`).
- Soporta selección de arista.
- Re-conexión de extremos por drag.
- Edición de punto de quiebre (bend handle).
- Preview de conexión y de reconexión.

### `InspectorComponent`

Panel contextual que cambia según selección:

- Si hay arista seleccionada: edita flujo BPMN, estilo, marcadores, curvatura, eliminación.
- Si hay nodo único: posición/tamaño/zIndex y propiedades específicas de shape/web component.
- Si hay selección múltiple: acciones masivas (delete).

## 2.5 Capa de stencils y render

### `StencilService`

Mantiene un registro `key -> generator(w,h)` con shapes de:

- básicos (`BasicShapes`),
- BPMN (`BpmnShapes`).

Entrega `SafeHtml` para incrustación directa en `<g [innerHTML]>`.

### Bibliotecas de formas

- `basic.shapes.ts`: rectángulo, rectángulo redondeado, documento, cilindro, rombo.
- `bpmn.shapes.ts`: tareas, eventos, gateways, pools/lanes, data/artifacts, flows, etc.

## 2.6 Capa de exportación

### `HtmlExportService`

Implementa exportación en 3 formatos:

- **HTML**: documento completo con Tailwind CDN + nodos/aristas posicionados absolutamante.
- **SVG**: composición vectorial con `viewBox` calculado por bounds del diagrama.
- **PNG**: render de SVG en `<canvas>` y serialización a blob.

La exportación reconstruye la geometría de aristas (path ortogonal) para conservar el layout visual.

---

## 3. Interacción entre componentes (flujo de eventos)

## 3.1 Inserción de nodos

1. Usuario hace click o drag desde paleta en `CanvasComponent`.
2. Canvas crea objeto de nodo (id, tipo, posición, tamaño, zIndex, data).
3. Llama `commands.addNode(node)`.
4. `DiagramStore.nodes` emite nuevo estado.
5. `@for (node of nodes())` en canvas renderiza `NodeRendererComponent`.

## 3.2 Selección y edición

1. Click en nodo llama `NodeRenderer.onSelect`.
2. Se invoca `commands.toggleSelection(...)`.
3. `InspectorComponent` observa `store.selection()` y cambia su UI.
4. Ediciones del inspector llaman `updateNode`, `updateNodeData`, etc.
5. Los cambios se reflejan en tiempo real en canvas.

## 3.3 Drag de nodos (incluyendo multiselección)

1. `DraggableDirective` emite `dragStart`.
2. `NodeRenderer` delega a `commands.beginDrag(activeNodeId)`.
3. Commands snapshot de posiciones de nodos seleccionados.
4. En cada `dragMove`, aplica deltas a todos los nodos del grupo.
5. `dragEnd` limpia estado temporal (`endDrag`).

## 3.4 Creación y edición de aristas

1. Usuario arrastra desde puerto de nodo (`NodeRenderer.startEdge`).
2. `commands.startEdgePreview(...)` guarda preview.
3. `EdgesLayer` dibuja `previewPath` computado.
4. En mouseup, canvas decide target y crea arista final.
5. Arista puede reajustarse desde sus handles (source/target/bend).

## 3.5 Zoom, pan y coordenadas

- `CanvasComponent` mantiene `zoomLevel`, `panX`, `panY`.
- Contenido real del diagrama se dibuja en coordenadas de mundo.
- Conversión screen/world se usa para selección, edges y drop.
- `DraggableDirective` divide delta por zoom para conservar movimiento lógico.

---

## 4. Manejo de estado en detalle

## 4.1 Estado global (reactivo)

- Persistente durante la sesión del editor.
- Centralizado en store para nodos/aristas/selección.
- Consumido por componentes vía signals readonly.

## 4.2 Estado local de UI (Canvas)

No forma parte del modelo del diagrama, pero sí de la experiencia:

- Visibilidad de paneles (`isPaletteOpen`, `inspectorOpen`, `focusMode`, `presentationMode`).
- Geometría de paneles (`leftPanelWidth`, `rightPanelWidth`).
- Navegación (`zoomLevel`, `panX`, `panY`, `frames`).
- Interacciones transitorias (`isSelecting`, `selectionBox`, panning flags, etc.).

Este diseño evita “ensuciar” el dominio con concerns puramente visuales.

## 4.3 Estados efímeros de interacción

- Preview de arista: `store.edgePreview`.
- Drag de reconexión de arista: estado interno en `EdgesLayer`.
- Resize de nodo: estado interno en `NodeRenderer`.

Son estados de corta vida y scope específico, por eso viven en el componente/directiva correspondiente.

---

## 5. Persistencia y serialización

## 5.1 JSON

- `DiagramCommands.exportJson()` serializa `nodes` + `edges`.
- `loadFromJson()` valida estructura mínima y reemplaza estado.

## 5.2 LocalStorage

- `saveToLocalStorage()` guarda bajo key configurable (`diagram-builder` por defecto).
- `loadFromLocalStorage()` intenta recuperar snapshot.
- Canvas añade opción de autosave periódico.

## 5.3 Export visual

- `HtmlExportService` crea representaciones portables del diagrama.
- Mantiene markers y estilo de edges para fidelidad visual.

---

## 6. Convenciones y patrones usados

- **Standalone components** (Angular moderno).
- **Signals + computed** para reactividad fina.
- **Command pattern ligero** (`DiagramCommands`) para mutaciones trazables.
- **Separación de concerns**:
  - Store (estado),
  - Commands (reglas),
  - Components (render/interacción),
  - Services auxiliares (stencils/export).

---

## 7. Mapa rápido de archivos clave

- Entrada/ruteo:
  - `src/main.ts`
  - `src/app/app.config.ts`
  - `src/app/app.routes.ts`
- Dominio:
  - `src/app/core/models/diagram.model.ts`
- Estado y lógica:
  - `src/app/core/services/diagram-store.service.ts`
  - `src/app/core/services/diagram-commands.service.ts`
- UI principal:
  - `src/app/canvas/canvas.component.ts`
  - `src/app/canvas/components/node-renderer.component.ts`
  - `src/app/canvas/components/edges-layer.component.ts`
  - `src/app/inspector/inspector.component.ts`
  - `src/app/canvas/directives/draggable.directive.ts`
- Stencils y export:
  - `src/app/stencils/stencil.service.ts`
  - `src/app/stencils/shapes/basic.shapes.ts`
  - `src/app/stencils/shapes/bpmn.shapes.ts`
  - `src/app/core/services/html-exporter.service.ts`

---

## 8. Recomendaciones de evolución técnica

1. **Undo/Redo**: registrar acciones de `DiagramCommands` para historial reversible.
2. **Tests de integración de interacción**: drag, selección múltiple, reconexión de edges.
3. **Modularizar `CanvasComponent`**: extraer toolbar/palette/minimap para reducir tamaño.
4. **Schema versioning de JSON**: agregar `version` al modelo exportado.
5. **Accesibilidad**: atajos documentados y mejoras ARIA en inspector/paleta.
6. **Persistencia de UI settings**: centralizar en un servicio dedicado para paneles/modos.

---

## 9. Resumen ejecutivo

El proyecto implementa una arquitectura clara y pragmática para un editor visual:

- **Estado de dominio simple y explícito**.
- **Mutaciones centralizadas en comandos**.
- **Componentes especializados por responsabilidad**.
- **Sistema de stencils extensible**.
- **Exportación robusta en varios formatos**.

Con una futura capa de historial de comandos y mayor cobertura de tests de interacción, la base actual está bien posicionada para escalar en funcionalidad.
