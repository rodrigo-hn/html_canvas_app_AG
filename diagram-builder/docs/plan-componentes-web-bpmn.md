# Plan: Nuevo Apartado de Biblioteca para Componentes Web BPMN

## Objetivo
Agregar un nuevo apartado en la biblioteca de componentes para tareas BPMN con apariencia web (por ejemplo: `User Task`, `Service Task`, `Manual Task`, `Subprocess`), tomando como referencia visual `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/ejemplo/pizzeria-bpmn-v2.html`.

Este plan **no considera edges** (según lo solicitado) y se enfoca en componentes/nodos, estilos, tamaños e iconografía.

## 1) Análisis del HTML de referencia (solo componentes)

### Elementos detectados
- `task user`
- `task service`
- `task manual`
- `subprocess`
- `gateway exclusive` (como referencia de estilo de nodo)
- `start-event message` y `end-event filled` (como referencia de estilo de evento)
- `lane-label` vertical y `pool-header` vertical (referencia de encabezados de lane/pool)

### Tokens visuales clave del HTML
- Colores base:
  - Fondo dark: `#0f0f0f`
  - Card: `#1a1a1a`
  - Azul tarea: `#60a5fa`
  - Morado subprocess: `#a78bfa`
  - Amarillo gateway: `#ffc233`
  - Verde start: `#4ade80`
  - Rojo end: `#f87171`
  - Texto secundario: `#a0a0a0`
- Tareas (`.task`):
  - `border: 2px`
  - `border-radius: 8px`
  - `padding: 0.8rem 1.2rem`
  - `min-width: 110px`
  - Icono posicionado arriba/izquierda vía `::before` (emoji en referencia)
- Subprocess (`.subprocess`):
  - Similar a task, borde morado
  - `min-width: 130px`
  - Indicador `+` en caja pequeña al borde inferior central
- Gateway:
  - Diamante `44x44`
  - Marca interior `×` o `+`
- Eventos:
  - `40x40`, círculos con diferencias de trazo/relleno según tipo

### Implicación para la app actual
- La app hoy mezcla:
  - `shape` BPMN (SVG stencils)
  - `web-component` genérico (`button`, `input`, `card`)
- Para lograr paridad visual con la referencia en tareas BPMN “web”, conviene agregar una familia nueva, no reciclar `button/input/card`.

## 2) Propuesta técnica

### Decisión de modelado recomendada
Crear un **nuevo tipo de componentes web BPMN de tarea** dentro de `web-component`:
- `bpmn-user-task-web`
- `bpmn-service-task-web`
- `bpmn-manual-task-web`
- `bpmn-subprocess-web`
- (opcional Fase 2) `bpmn-script-task-web`, `bpmn-business-rule-task-web`, `bpmn-send-task-web`, `bpmn-receive-task-web`

Razón:
- Se mantiene el patrón existente de renderers Angular para componentes web.
- No rompe los stencils SVG existentes.
- Permite estilos y comportamientos propios (hover, icon slot, badge `+`) sin “hackear” `shapeType`.

## 3) Diseño de biblioteca (nuevo apartado)

Nuevo grupo en palette:
- ID: `bpmn-web-tasks`
- Título: `BPMN Web Tasks`

Items iniciales:
- `User Task (Web)`
- `Service Task (Web)`
- `Manual Task (Web)`
- `Subprocess (Web)`

Preview en palette:
- Mini tarjeta con borde/color por tipo
- Icono semántico (SVG inline)
- Sin dependencia de emoji para consistencia cross-platform

## 4) Especificación visual propuesta (normalizada)

### Base task web
- Tamaño default nodo: `160x84` (equivalente visual al HTML con margen interno de canvas)
- Border: `2px solid`
- Radius: `8px`
- Padding interna: `10px 12px`
- Font: `13px`/`14px`, peso `500`
- Icono: `14-16px` en esquina superior izquierda

### Variantes
- User Task:
  - Borde/ícono azul (`#60a5fa`)
  - Icono usuario
- Service Task:
  - Borde/ícono cian/azul técnico
  - Icono engranaje
- Manual Task:
  - Borde/ícono ámbar
  - Icono mano
- Subprocess:
  - Borde/ícono morado (`#a78bfa`)
  - Badge `+` colapsado en borde inferior
  - Tamaño default: `180x92`

## 5) Archivos a modificar

### Modelo y tipado
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/core/models/diagram.model.ts`
  - Extender `WebComponentType`
  - Agregar interfaces de data para tareas BPMN web

### Canvas + biblioteca
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/canvas/canvas.component.ts`
  - Agregar `paletteGroup` nuevo
  - Agregar `paletteItems` nuevos
  - Extender `buildPaletteNode()` para nuevos tipos
  - Ajustar `webIconLabel()` o reemplazar por preview SVG específico

### Render web nodes
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/web-node-wrapper.component.ts`
  - Soportar nuevos `componentType`
  - Enrutar a nuevos renderers

### Inspector
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/inspector/inspector.component.ts`
  - Incluir nuevos `componentTypes`
  - Campos editables: texto, variante visual, icono, badge subprocess

## 6) Archivos nuevos a crear

### Renderers BPMN web
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-user-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-service-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-manual-task.component.ts`
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-subprocess.component.ts`

### Estilos/tokens comunes
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-task.tokens.ts`
  - Paleta de color, radios, bordes, spacing
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/src/app/components-tailwind/renderers/web-bpmn-task-icons.ts`
  - SVG paths para iconos (usuario, engranaje, mano, subprocess)

### Documentación
- `/Users/rodrigoherrera/code/canvas/html_canvas_app_AG/diagram-builder/docs/bpmn-web-components-guidelines.md`
  - Guía de uso y convenciones de estilo

## 7) Plan por fases

### Fase 1 (MVP visual)
- Crear grupo `BPMN Web Tasks` en palette.
- Crear 4 renderers (`user/service/manual/subprocess`).
- Soportar creación de nodos desde biblioteca (click + drag&drop).
- Mostrar en inspector `componentType` y `text`.

### Fase 2 (edición y consistencia)
- Exponer en inspector:
  - Icon on/off
  - Subprocess badge on/off
  - Variant de color
- Unificar tokens para que coincidan con HTML referencia.

### Fase 3 (calidad)
- Tests unitarios:
  - creación de cada componente desde palette
  - render correcto por `componentType`
  - defaults de tamaño/estilo
- Ajuste final de spacing y tipografía comparando con screenshot de referencia.

## 8) Riesgos y mitigaciones
- Riesgo: mezclar semántica BPMN en `web-component` y `shape`.
  - Mitigación: prefijar todos los nuevos tipos con `bpmn-*-web`.
- Riesgo: inconsistencia visual entre export HTML/SVG.
  - Mitigación: definir fallback de export para `web-component` (bloque HTML equivalente).
- Riesgo: crecimiento del `switch` en wrapper.
  - Mitigación: migrar a mapa de renderers por tipo en fase posterior.

## 9) Criterios de aceptación
- Existe nueva sección `BPMN Web Tasks` en la biblioteca.
- Se pueden agregar al lienzo los 4 componentes web BPMN base.
- Cada componente respeta icono, borde, color y tamaño objetivo.
- Inspector permite editar texto sin romper tipado.
- Drag & drop desde palette funciona para los nuevos componentes.

