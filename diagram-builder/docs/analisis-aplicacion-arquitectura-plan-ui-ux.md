# Análisis integral de la aplicación Diagram Builder

## 1. Resumen ejecutivo
Esta aplicación es un editor visual de diagramas BPMN/UX construido con Angular standalone + Signals. Permite componer nodos (shape y web-component), conectar edges interactivos, editar propiedades en inspector, exportar (HTML/SVG/PNG/JSON) e importar JSON.

Fortalezas actuales:
- Arquitectura modular con separación explícita entre estado (`DiagramStore`) y acciones (`DiagramCommands`).
- Render interactivo robusto (zoom/pan, minimapa, marcos, selección múltiple, resize, edición de edges).
- Cobertura funcional amplia de biblioteca BPMN (shape + web tasks personalizados).

Áreas con mayor potencial:
- Uniformidad visual avanzada (tokens e iconografía SVG coherente entre canvas y export).
- Validaciones de UX en inspector (errores de color/formato y feedback contextual).
- Arquitectura de export y render con menor duplicación de lógica visual.
- Accesibilidad y consistencia de interacción en escenarios densos.

## 2. Alcance funcional actual

### 2.1 Funcionalidades principales
- Creación de nodos desde palette por click y drag&drop.
- Selección simple/múltiple, marquee selection, drag múltiple, resize handles.
- Conexión de nodos por puertos (`top/right/bottom/left`) con preview.
- Edges con tipo de flujo BPMN (`sequence`, `message`, `association`), estilo y edición.
- Inspector contextual para nodo/edge.
- Zoom, pan, fit-to-content, minimapa, modo focus.
- Soporte de frames de navegación y modos de página (`Infinite`, `A4`, `A3`, `16:9`, `Custom`).
- Exportación a HTML/SVG/PNG/JSON e import JSON.

### 2.2 Catálogo de nodos
- Shapes SVG clásicos + BPMN 2.0 (`src/app/stencils/shapes`).
- Web components UI (`button`, `input`, `card`).
- BPMN Web Tasks custom (`user`, `service`, `manual`, `subprocess`, `start event`, `end event`, `gateway`, `lane`, `pool`).

## 3. Arquitectura técnica

### 3.1 Capas y responsabilidades
1. **Modelo de dominio**
   - Define tipos y contratos de nodos/edges.
   - Archivo: `src/app/core/models/diagram.model.ts`.

2. **Estado reactivo**
   - `DiagramStore` encapsula señales de estado global.
   - Archivo: `src/app/core/services/diagram-store.service.ts`.

3. **Comandos/casos de uso**
   - `DiagramCommands` concentra mutaciones y reglas de interacción.
   - Archivo: `src/app/core/services/diagram-commands.service.ts`.

4. **Capa de UI principal**
   - `CanvasComponent` orquesta toolbar, palette, canvas, minimap, import/export.
   - Archivo: `src/app/canvas/canvas.component.ts`.

5. **Renderizado de nodos/edges**
   - `NodeRendererComponent` para nodos.
   - `EdgesLayerComponent` para trazado y edición de edges.
   - Archivos: `src/app/canvas/components/node-renderer.component.ts`, `src/app/canvas/components/edges-layer.component.ts`.

6. **Render web especializado**
   - `WebNodeWrapperComponent` delega a renderers concretos de cada tipo.
   - Archivo: `src/app/components-tailwind/web-node-wrapper.component.ts`.

7. **Motor de stencils SVG**
   - `StencilService` como registry de generadores de formas.
   - Archivo: `src/app/stencils/stencil.service.ts`.

8. **Motor de exportación**
   - `HtmlExportService` genera HTML/SVG/PNG con traducción desde el modelo.
   - Archivo: `src/app/core/services/html-exporter.service.ts`.

### 3.2 Flujo de eventos (alto nivel)
1. Usuario interactúa con canvas/palette/inspector.
2. Componente UI llama a `DiagramCommands`.
3. `DiagramCommands` muta señales del `DiagramStore`.
4. Components que consumen signals se rerenderizan automáticamente.
5. Export transforma el modelo vigente (nodes/edges) a salida serializable.

### 3.3 Decisiones de diseño relevantes
- **Signals** como mecanismo central de estado reactivo.
- **Discriminated unions** para tipado de nodos web/shape.
- **Separación Store vs Commands** para mantener lógica de negocio fuera de templates.
- **Single edges layer** en SVG para edición y visualización de conexiones.

## 4. Modelo de datos

### 4.1 Entidades clave
- `DiagramModel`: `{ nodes: DiagramNode[]; edges: DiagramEdge[] }`.
- `DiagramNode`:
  - Base: `id`, `x`, `y`, `width`, `height`, `zIndex`, `type`.
  - Variantes:
    - `ShapeNode` (`shapeType`, `style`, `data`).
    - `WebNode` (`componentType`, `data` tipada por componente).
- `DiagramEdge`:
  - Conectividad: `sourceId`, `targetId`, `sourcePort`, `targetPort`.
  - Estilo y semántica: `flowType`, `color`, `style.stroke/strokeWidth/cornerRadius/dashArray`, `markerStart/markerEnd`, `points`.

### 4.2 Persistencia
- JSON de diagrama (import/export manual).
- Auto-save opcional en `localStorage`.
- Ejemplo inicial desde `public/examples/pizzeria-proceso-bpmn-default.json`.

## 5. Interfaz y experiencia de usuario

### 5.1 Estructura de pantalla
- Toolbar superior con acciones globales.
- Palette lateral izquierda (colapsable y redimensionable).
- Canvas central con grilla, nodos y edges.
- Inspector lateral derecho (colapsable y contextual).
- Minimap flotante para navegación.

### 5.2 Patrones UX implementados
- Edición directa y visual (WYSIWYG).
- Interacción incremental: seleccionar -> editar propiedades.
- Controles de navegación espacial (zoom/pan/fit/minimap).
- Modo focus/presentación para reducir distracciones.

### 5.3 Observaciones UX actuales
- En escenarios complejos, la jerarquía visual puede degradarse por contraste/capas.
- Falta feedback explícito de validación en ciertos campos (ej. color inválido en hex).
- Algunas interacciones avanzadas no son autoexplicativas (ej. edición de bends/puertos).

## 6. Riesgos técnicos y deuda
- Duplicación parcial de reglas visuales entre render canvas y export.
- Dependencia de valores hardcoded en ciertos renderers/export.
- Cobertura E2E focalizada, pero aún limitada para regresiones visuales complejas.
- Warnings de plantilla Angular (`NG8107`) pendientes de limpieza semántica.

## 7. Propuesta de mejoras funcionales y UI/UX

## 7.1 Objetivo
Mejorar consistencia visual, previsibilidad de interacción y mantenibilidad técnica sin frenar evolución funcional.

## 7.2 Plan propuesto (roadmap)

### Fase 1 — Robustez UX inmediata (1-2 semanas)
- Validación de campos en inspector con feedback inline:
  - Hex color válido/inválido.
  - Números con límites y mensajes claros.
- Guías de interacción en canvas:
  - Tooltips de puertos/bend handles.
  - Estado visible de modo draw-edge.
- Ajustes de contraste por tema oscuro (edges/labels/events) con presets rápidos.

**Entregables:**
- Validación visual + mensajes de error.
- Mejora de discoverability en edición de edges.
- Presets de color de conexión (claro/medio/alto contraste).

### Fase 2 — Consistencia visual unificada (1-2 semanas)
- Centralizar tokens visuales de BPMN Web Tasks + lane/pool + edge markers.
- Migrar iconografía emoji a SVG interno para consistencia cross-browser/export.
- Unificar reglas de tamaños tipografía/espaciado en canvas y export.

**Entregables:**
- Catálogo de tokens único.
- Render visual equivalente canvas/export.
- Guía rápida de estilos (documento técnico).

### Fase 3 — Calidad de interacción de edges (2-3 semanas)
- Mejorar routing con heurísticas de legibilidad:
  - Evitar colisiones simples con contenedores.
  - Menos quiebres innecesarios.
- Modo edición avanzado de edge:
  - Múltiples bend points.
  - Snapping de segmentos.
- Etiquetas de edge con posicionamiento manual opcional.

**Entregables:**
- Routing más estable.
- Editor de edges más controlable y predecible.

### Fase 4 — Arquitectura y mantenibilidad (2-3 semanas)
- Reducir duplicación de render/export mediante mapeadores compartidos de estilo.
- Añadir versionado de schema JSON (`modelVersion`) y migraciones.
- Fortalecer pruebas:
  - Unitarias (store/commands/export).
  - E2E visuales con `playwright-cli` para casos BPMN complejos.

**Entregables:**
- Menos regresiones por cambios visuales.
- Base lista para crecimiento de librerías/componentes.

### Fase 5 — Productividad y experiencia avanzada (opcional)
- Undo/redo transaccional.
- Atajos de teclado contextualizados (multi-select, alignment, distribute).
- Alineación/distribución automática de nodos.
- Plantillas BPMN preconfiguradas por dominio (ventas, soporte, logística).

## 8. Priorización recomendada
1. Fase 1 (impacto usuario inmediato, bajo riesgo).
2. Fase 2 (consistencia visual y export fiable).
3. Fase 4 (base técnica para escalar sin deuda).
4. Fase 3 (mejora fuerte de edges una vez estabilizada la base).
5. Fase 5 (productividad avanzada).

## 9. Métricas de éxito sugeridas
- Reducción de incidencias visuales canvas/export.
- Menos correcciones manuales de edge por diagrama.
- Tiempo promedio de edición de flujo BPMN (task + edge) más bajo.
- Disminución de bugs de regresión en releases.

## 10. Conclusión
La aplicación ya tiene una base sólida y funcionalmente madura para modelado BPMN interactivo. El mayor retorno en el corto plazo está en consolidar consistencia visual, validaciones UX y reducir duplicación entre render y export. Con ese ajuste, el producto queda mejor preparado para capacidades avanzadas (routing inteligente, undo/redo y plantillas de negocio).
