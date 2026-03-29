# 6. Descripción Detallada de Componentes

## 6.1 CanvasComponent

**Archivo**: `src/app/canvas/canvas.component.ts` (~2000 líneas)
**Selector**: `app-canvas`
**Rol**: Componente orquestador principal — contiene toda la lógica de la interfaz de edición.

### Responsabilidades
1. Renderizado del canvas con zoom/pan
2. Gestión de toolbar y controles
3. Paleta de componentes con drag & drop
4. Creación y gestión de nodos
5. Dibujo de edges entre nodos
6. Alineación y distribución
7. Frames para navegación
8. Exportación e importación
9. Persistencia en localStorage
10. Atajos de teclado
11. Minimap de navegación
12. Modos de visualización (presentación, focus, contraste)

### Servicios Inyectados
- `DiagramStore` — Lectura del estado
- `DiagramCommands` — Mutación del estado
- `HtmlExportService` — Exportación
- `StencilService` — Generación de previews SVG

### Estado Local
```typescript
zoomLevel = 1                   // Nivel de zoom
panX = 0, panY = 0             // Offset de pan
isPaletteOpen = true            // Visibilidad de paleta
inspectorOpen = true            // Visibilidad del inspector
focusMode = false               // Modo sin paneles
presentationMode = false        // Modo solo vista
leftPanelWidth = 320            // Ancho paleta
rightPanelWidth = 320           // Ancho inspector
pageMode = 'infinite' | 'page' // Modo de canvas
pagePreset = 'Infinite'         // Preset de página
contrastPreset = 'medium'       // Nivel de contraste
autoSaveEnabled = false         // Auto-guardado
activeFlowType = null           // Tipo de flujo activo para dibujar
frames: CanvasFrame[] = []      // Frames de navegación
paletteQuery = ''               // Búsqueda en paleta
```

### Métodos Clave

| Método | Descripción |
|--------|-------------|
| `onBackgroundClick()` | Deselecciona todo al hacer click en fondo vacío |
| `onCanvasMouseDown/Move/Up()` | Gestiona marquee selection y panning |
| `onCanvasDragOver/Drop()` | Drag & drop desde paleta |
| `onCanvasWheel()` | Zoom con rueda del mouse |
| `addPaletteItem(key)` | Añade un elemento al canvas |
| `exportHtml/Svg/Png/Json()` | Exportación en diferentes formatos |
| `importJson()` | Importación de archivo JSON |
| `undo() / redo()` | Deshacer/Rehacer |
| `zoomIn/Out/setZoom()` | Control de zoom |
| `fitToContent()` | Ajustar vista a contenido |
| `alignSelection(mode)` | Alinear nodos seleccionados |
| `distributeSelection(axis)` | Distribuir nodos |
| `toggleFocusMode()` | Alternar modo focus |
| `applyContrastPreset(preset)` | Aplicar preset de contraste |
| `addFrameFromView()` | Capturar frame del viewport actual |
| `goToFrame(id)` | Navegar a un frame |
| `loadStartupExample()` | Cargar ejemplo inicial |
| `saveUiSettings/loadUiSettings()` | Persistir configuración de UI |

---

## 6.2 NodeRendererComponent

**Archivo**: `src/app/canvas/components/node-renderer.component.ts` (~398 líneas)
**Selector**: `app-node-renderer`
**Rol**: Renderiza un nodo individual con interacciones.

### Inputs
- `node: DiagramNode` — Nodo a renderizar
- `zoom: number` — Nivel de zoom actual

### Funcionalidades
- Renderizado condicional: SVG shapes vs Web components
- Selección con click (simple y multi-select con Ctrl)
- Drag para mover (delegado a `DraggableDirective`)
- 8 handles de resize visibles cuando seleccionado
- Puertos de conexión (4 puntos cardinales)
- Edición de texto inline con doble click
- Iconos BPMN según `taskKind` del nodo

### Renderizado SVG (ShapeNode)
```html
<svg [attr.viewBox]="'0 0 ' + node.width + ' ' + node.height">
  <g [innerHTML]="getShapeContent()"></g>
  <!-- Texto centrado -->
  <text>{{ node.data.text }}</text>
  <!-- Icono BPMN si aplica -->
  <g [innerHTML]="taskIconSvg()"></g>
</svg>
```

### Renderizado Web (WebNode)
```html
<app-web-node-wrapper [node]="node"></app-web-node-wrapper>
```

---

## 6.3 EdgesLayerComponent

**Archivo**: `src/app/canvas/components/edges-layer.component.ts` (~806 líneas)
**Selector**: `app-edges-layer`
**Rol**: Renderiza todas las conexiones como SVG.

### Inputs
- `zoom: number` — Nivel de zoom

### SVG Markers Definidos
| ID | Tipo | Descripción |
|----|------|-------------|
| `arrow` | Filled triangle | Flecha cerrada estándar |
| `open-arrow` | Open triangle | Flecha abierta |
| `open-circle` | Open circle | Círculo vacío |
| `closed-circle` | Filled circle | Círculo relleno |
| `dash` | Line | Guión |
| `cross` | Cross | Cruz |

### Cálculo de Paths
- Determina puntos de conexión desde los puertos de los nodos
- Genera paths SVG con curvas bezier para rutas suaves
- Soporta puntos de inflexión personalizados
- Labels posicionados en el punto medio del path

### Interacciones
- Click para seleccionar edge
- Doble click para editar label
- Drag de handles para reshape
- Hover para highlight visual

---

## 6.4 EdgeRendererComponent

**Archivo**: `src/app/canvas/components/edge-renderer.component.ts`
**Selector**: `app-edge-renderer`
**Rol**: Sub-componente para renderizar un edge individual.

### Input
- `edge: DiagramEdge` — Edge a renderizar

### Computed
- `pathData` — SVG path string calculado reactivamente basado en posiciones de nodos

---

## 6.5 InspectorComponent

**Archivo**: `src/app/inspector/inspector.component.ts` (~980 líneas)
**Selector**: `app-inspector`
**Rol**: Panel lateral de edición de propiedades.

### Estados
1. **Sin selección**: Mensaje "No selection"
2. **Edge seleccionado**: Editor de propiedades del edge
3. **Nodo seleccionado**: Editor de propiedades del nodo
4. **Multi-selección**: Opciones de grupo (eliminar masivo)

### Propiedades Editables — Edge
| Propiedad | Control | Descripción |
|-----------|---------|-------------|
| Flow Type | Select | sequence, message, association |
| Label | Text input | Texto de la etiqueta |
| Label Position | Checkbox + Reset | Posición manual |
| Color | Color picker + Hex input | Color del trazo |
| Stroke Width | Number input | Grosor del trazo |
| Corner Radius | Checkbox + Number | Esquinas redondeadas |
| Arrow | Toggle | Marcador de flecha |
| Ports | Select × 2 | Source y target port |

### Propiedades Editables — Node
| Propiedad | Control | Descripción |
|-----------|---------|-------------|
| X, Y | Number inputs | Posición |
| Width, Height | Number inputs | Dimensiones |
| Z-Index | Number input | Orden de apilamiento |
| Shape Type | Select | Tipo de forma |
| Text | Text input | Contenido de texto |
| Fill Color | Color picker | Color de relleno |
| Stroke Color | Color picker | Color de borde |
| Stroke Width | Number | Grosor de borde |
| Data fields | Dinámico | Según tipo de nodo |

---

## 6.6 WebNodeWrapperComponent

**Archivo**: `src/app/components-tailwind/web-node-wrapper.component.ts` (~115 líneas)
**Selector**: `app-web-node-wrapper`
**Rol**: Router que despacha al componente web apropiado.

### Input
- `node: WebNode` — Nodo web a renderizar

### Routing por componentType
```typescript
@switch (node.componentType) {
  @case ('button')               → WebButtonComponent
  @case ('input')                → WebInputComponent
  @case ('card')                 → WebCardComponent
  @case ('bpmn-user-task-web')   → WebBpmnUserTaskComponent
  @case ('bpmn-service-task-web') → WebBpmnServiceTaskComponent
  // ... 9 tipos BPMN más
}
```

---

## 6.7 Componentes Web BPMN

Todos los componentes BPMN web comparten un patrón similar:

### Estructura Común
```html
<div [style]="containerStyles">
  <span [innerHTML]="icon" *ngIf="iconEnabled"></span>
  <span class="text">{{ text }}</span>
  <span class="badge" *ngIf="badgeEnabled">+</span>
</div>
```

### Tokens Compartidos (BPMN_VISUAL_TOKENS)
- Background oscuro (`#0b0f14`)
- Texto claro (`#f8fafc`)
- Font: DM Sans
- Bordes coloreados por variante
- Padding, radius y tipografía consistentes

### Tabla de Componentes BPMN Web

| Componente | Selector | Props | Descripción Visual |
|------------|----------|-------|-------------------|
| UserTask | `app-web-bpmn-user-task` | text, iconEnabled, variant | Rectángulo con ícono de persona |
| ServiceTask | `app-web-bpmn-service-task` | text, iconEnabled, variant | Rectángulo con ícono de engranaje |
| ManualTask | `app-web-bpmn-manual-task` | text, iconEnabled, variant | Rectángulo con ícono de mano |
| Subprocess | `app-web-bpmn-subprocess` | text, iconEnabled, badgeEnabled, variant | Rectángulo con badge "+" |
| StartEvent | `app-web-bpmn-start-event` | — | Círculo verde con ícono |
| EndEvent | `app-web-bpmn-end-event` | — | Círculo rojo con punto |
| ExclusiveGateway | `app-web-bpmn-exclusive-gateway` | label | Diamante con "×" |
| Lane | `app-web-bpmn-lane` | label | Contenedor horizontal con sidebar |
| Pool | `app-web-bpmn-pool` | label | Contenedor con sidebar naranja |

### Variantes de Color
| Variante | Borde | Acento | Componente Default |
|----------|-------|--------|-------------------|
| blue | `#60a5fa` | `#3b82f6` | User Task |
| yellow | `#facc15` | `#eab308` | Manual Task |
| green | `#4ade80` | `#22c55e` | Service Task |
| purple | `#c084fc` | `#a855f7` | Subprocess |
| red | `#f87171` | `#ef4444` | — |

---

## 6.8 Componentes Web Básicos

### WebButtonComponent
- **Props**: `text` (default: "Button"), `variant` (primary/secondary/success/danger)
- **Estilos**: Botón Tailwind con fondo según variante

### WebInputComponent
- **Props**: `label`, `placeholder`, `type`
- **Estilos**: Layout flex-column con label y input Tailwind

### WebCardComponent
- **Props**: `title`, `content`
- **Estilos**: Card blanca con sombra, título bold, contenido regular

---

## 6.9 DraggableDirective

**Archivo**: `src/app/canvas/directives/draggable.directive.ts` (~66 líneas)
**Selector**: `[appDraggable]`
**Tipo**: Directive standalone

### Inputs
| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `dragDisabled` | boolean | false | Deshabilitar drag |
| `snapToGrid` | boolean | false | Activar snap a grid |
| `gridSize` | number | 20 | Tamaño del grid |
| `zoom` | number | 1 | Nivel de zoom actual |
| `startPosition` | Point | — | Posición inicial del nodo |

### Outputs
| Output | Payload | Cuándo |
|--------|---------|--------|
| `dragStart` | void | Al iniciar drag |
| `dragMove` | Point | Durante movimiento (posición nueva) |
| `dragEnd` | Point | Al soltar (posición final) |

### Algoritmo de Snap
```typescript
const newX = startPosition.x + deltaX / zoom;
const newY = startPosition.y + deltaY / zoom;
if (snapToGrid) {
  return {
    x: Math.round(newX / gridSize) * gridSize,
    y: Math.round(newY / gridSize) * gridSize
  };
}
```
