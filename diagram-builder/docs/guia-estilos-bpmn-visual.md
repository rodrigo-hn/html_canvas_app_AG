# Guía rápida de estilos BPMN visuales

## Objetivo
Definir una única referencia visual para render de BPMN Web Tasks en canvas y exportación (HTML/SVG/PNG).

## Catálogo único de tokens
Archivo fuente:
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/core/styles/bpmn-visual-tokens.ts`

Tokens incluidos:
- Base: `background`, `text`, `textMuted`, `fontFamily`.
- Tipografía: `typography.taskSize`, `typography.taskWeight`, `typography.labelSize`, `typography.labelWeight`.
- Espaciado: `taskPadding`, `taskMinWidth`, `taskRadius`, `subprocessRadius`.
- Trazos: `stroke.task`, `stroke.gateway`, `stroke.eventStart`, `stroke.eventEnd`, `stroke.lane`, `stroke.pool`.
- Iconografía: `icon.sizePx`, `icon.left`, `icon.top`.
- Badge subprocess: `badge.sizePx`, `badge.fontSizePx`, `badge.radius`, `badge.bottom`.
- Paleta por variante: `variants.blue/yellow/green/purple/red`.
- Contenedores: `lane.*` y `pool.*`.
- Edge markers: `EDGE_MARKER_TOKENS` (`arrow`, `openArrow`, `openCircle`).

## Iconografía SVG interna
Se reemplazaron emojis por SVG inline con API compartida:
- `bpmnIconSvg('user' | 'service' | 'manual' | 'subprocess' | 'start', color, sizePx)`

Ventajas:
- Consistencia cross-browser/cross-OS.
- Mejor control de trazo y contraste.
- Paridad entre canvas y export.

## Regla de paridad canvas/export
Para cualquier ajuste visual BPMN:
1. Cambiar token en `bpmn-visual-tokens.ts`.
2. Usar ese token en renderers Angular.
3. Usar el mismo token en `HtmlExportService`.
4. Validar export en HTML/SVG y canvas al 100%.

## Archivos que consumen tokens
- Canvas renderers:
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-user-task.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-service-task.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-manual-task.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-subprocess.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-start-event.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-exclusive-gateway.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-end-event.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-lane.component.ts`
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-pool.component.ts`

- Edges:
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/canvas/components/edges-layer.component.ts`

- Export:
  - `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/core/services/html-exporter.service.ts`

## Convenciones operativas
- No hardcodear tamaños/colores de BPMN fuera de tokens.
- Si se agrega variante visual nueva, primero extender `variants` y luego renderers/export.
- Para cambios de markers, ajustar `EDGE_MARKER_TOKENS` y validar flechas en tema oscuro.
