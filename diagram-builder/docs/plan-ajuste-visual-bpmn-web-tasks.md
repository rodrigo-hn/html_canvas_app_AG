# Plan de Ajuste Visual — BPMN Web Tasks

## Objetivo
Mejorar nitidez, jerarquía visual y consistencia entre canvas/export para los componentes `BPMN Web Tasks` sin alterar semántica del flujo.

## Hallazgos
- Bordes se perciben gruesos respecto al tamaño de los nodos.
- Iconos emoji se ven inconsistentes entre navegadores/sistemas.
- Saturación de bordes y contraste fondo/borde no está balanceado.
- Tipografía y labels compiten con los elementos de decisión (gateway).

## Fase A (en progreso) — Tokens base
- Definir tokens globales para:
  - `stroke-width` por familia (`task`, `event-start`, `event-end`, `gateway`, `lane`, `pool`).
  - Paleta de variantes menos saturada (azul/amarillo/verde/morado/rojo).
  - Tipografía base para task y labels (tamaño, peso, line-height).
  - Espaciado base (padding, radio, icon-size, badge-size).
- Aplicar tokens a renderers web actuales:
  - `user/service/manual/subprocess`
  - `start/end/gateway`
  - `lane/pool`

### Estado Fase A
- `✅` Tokens base definidos en `bpmn-web-task.tokens.ts`.
- `✅` Aplicación en `user/service/manual/subprocess`.
- `✅` Aplicación en `start/end/gateway`.
- `✅` Aplicación en `lane/pool`.
- `⏳` Validación visual y build final.

## Fase B — Iconografía consistente
- Sustituir emoji por iconos SVG internos:
  - user, service, manual, subprocess.
- Unificar caja de icono (14–16px) y alineación.

## Fase C — Ajuste fino de contraste
- Afinar color de fondo de lane/pool y separadores.
- Reducir ruido visual de labels de gateway.
- Ajustar opacidad de rellenos en eventos.

## Fase D — Validación visual
- Comparativa lado a lado:
  - canvas 100%
  - export HTML 100%
  - export HTML 125%
- Checklist:
  - nitidez de borde,
  - legibilidad de texto,
  - consistencia iconos,
  - no solapamiento de labels.

## Archivos involucrados (implementación)
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/bpmn-web-task.tokens.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-user-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-service-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-manual-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-subprocess.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-start-event.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-end-event.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-exclusive-gateway.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-lane.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-pool.component.ts`
