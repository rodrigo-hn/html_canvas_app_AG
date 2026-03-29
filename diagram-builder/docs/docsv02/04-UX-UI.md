# 4. Usabilidad — Análisis UX/UI

## 4.1 Layout General

La aplicación utiliza un layout de **tres columnas** con canvas central:

```
┌─────────────────────────────────────────────────────────────────┐
│  [Toolbar - Barra de herramientas superior flotante]            │
├──────────┬──────────────────────────────────┬───────────────────┤
│          │                                  │                   │
│  Paleta  │         Canvas Principal         │    Inspector      │
│  (320px) │      (espacio restante)          │    (320px)        │
│          │                                  │                   │
│  - Búsq  │  - Nodos renderizados            │  - Propiedades    │
│  - Grupos│  - Conexiones SVG                │  - Estilos        │
│  - Items │  - Grid visual                   │  - Acciones       │
│          │  - Frames                        │                   │
│          │                                  │                   │
├──────────┴──────────────────────────────────┴───────────────────┤
│                    [Minimap - esquina inferior]                  │
└─────────────────────────────────────────────────────────────────┘
```

### Dimensiones y Responsividad
- **Paleta izquierda**: 320px por defecto, redimensionable por drag
- **Inspector derecho**: 320px por defecto, redimensionable por drag
- **Canvas**: Ocupa el 100% del viewport (`100vw × 100vh`)
- **Toolbar**: Flotante, posición absoluta `top-4 left-4`, con `z-index: 50`
- **Minimap**: Flotante en esquina inferior, se desplaza según el inspector

---

## 4.2 Barra de Herramientas (Toolbar)

### Diseño Visual
- **Fondo**: Blanco semitransparente (`bg-white/90`) con borde sutil y sombra
- **Layout**: Flexbox con `flex-wrap` y `gap-2` para permitir reflow
- **Botones principales** (Export): Fondo indigo (`bg-indigo-600`)
- **Botones secundarios** (acciones): Fondo slate oscuro (`bg-slate-700`)
- **Botones deshabilitados**: Opacidad reducida al 40% (`disabled:opacity-40`)
- **Botones peligrosos** (Delete): Fondo rojo (`bg-red-700`)

### Organización de Controles
```
[Export HTML] [Export SVG] [Export PNG] [Export JSON] [Import JSON]
[Undo] [Redo]
[Templates ▾] [Load]
[-] [100%] [+] [Fit] [Preset]
[Focus] [Show/Hide Components]
[Page Preset ▾] [W: ___] [H: ___]
[Add Frame] [Frames ▾] [Go] [Del]
[Align L] [Align T] [Dist H] [Dist V]
[☑ Snap] [Grid: 20]
[☑ Auto-save]
[Contrast: Claro | Medio | Alto]
[Draw flow mode indicator + Cancel]
```

### Feedback Visual
- Los selectores de contraste usan toggles visuales (`bg-slate-700` cuando activo)
- El modo de dibujo de flujo muestra un badge amber con indicador y botón de cancelación
- Un banner informativo aparece centrado cuando el modo de conexión está activo

---

## 4.3 Paleta de Componentes (Panel Izquierdo)

### Diseño Visual
- **Tema oscuro**: Fondo slate 900 casi opaco (`bg-slate-900/95`)
- **Borde**: Border slate 700, bordes redondeados
- **Texto**: Colores claros (slate-100, slate-300)
- **Posición**: Absoluta, debajo de la toolbar (`top-28 left-4`)
- **Altura máxima**: 70vh con scroll interno

### Estructura
1. **Header**: Título "Libraries" + campo de búsqueda con borde cyan al focus
2. **Grupos colapsables**: Cada categoría usa `<details>/<summary>` nativo
3. **Items**: Grid de 2 columnas con botones que incluyen:
   - Preview SVG (36×36) para formas, o label de texto para web components
   - Nombre del elemento
   - Hover: Borde cyan + fondo más claro

### Interacción
- **Click**: Añade el elemento al canvas
- **Drag**: Inicia drag & drop hacia el canvas
- **Búsqueda**: Filtrado en tiempo real por nombre
- **Collapse/Expand**: Toggle por grupo independiente
- **Resize**: Handle de 1px en borde derecho, cursor `ew-resize`, highlight cyan al hover

---

## 4.4 Inspector (Panel Derecho)

### Diseño Visual
- **Fondo**: Blanco con borde izquierdo slate (`border-l border-slate-200`)
- **Padding**: 16px (`p-4`)
- **Overflow**: Scroll vertical automático

### Estados del Inspector

#### Sin selección
```
Inspector
─────────
No selection
```

#### Edge seleccionado
Muestra secciones colapsables con:
- **ID** del edge (texto informativo)
- **Flow Type**: Select con opciones Sequence/Message/Association
- **Label**: Input de texto
- **Manual label position**: Checkbox toggle + botón Reset
- **Delete Edge**: Botón rojo
- **Reset Bend**: Botón secundario
- **Color**: Color picker nativo + input hex con validación en tiempo real
- **Stroke Width**: Input numérico
- **Rounded Corners**: Checkbox + input de radio
- **Arrow**: Toggle para marcador de flecha
- **Ports**: Selectores para sourcePort y targetPort

#### Nodo seleccionado
- **Position & Size**: Inputs numéricos para X, Y, Width, Height, Z-Index
- **Shape Type**: Selector con todas las formas disponibles
- **Shape Text**: Input de texto para el contenido del nodo
- **Fill/Stroke Colors**: Color pickers + inputs hex
- **Stroke Width**: Input numérico
- **Data Properties**: Campos dinámicos según el tipo de nodo

#### Multi-selección
- Muestra cantidad de nodos seleccionados
- Botón de eliminación masiva

### Validación
- Los campos de color validan formato hex (#RGB o #RRGGBB)
- Mensajes de error inline en rojo para valores inválidos
- Los cambios se aplican en tiempo real (two-way binding con ngModel)

---

## 4.5 Canvas Principal

### Renderizado
- **Transform**: Usa CSS `transform: translate(panX, panY) scale(zoom)` para zoom y pan
- **Capas** (de abajo a arriba):
  1. Fondo del canvas (`bg-slate-50`)
  2. Página (si modo page, fondo blanco con sombra)
  3. Grid visual (patrón de puntos radiales, opacidad 10%)
  4. Capa de edges (SVG)
  5. Capa de nodos (HTML/SVG)
  6. Frames (bordes discontinuos esmeralda)
  7. Marquee de selección (borde azul, fondo azul translúcido)
  8. UI flotante (toolbar, paleta, inspector, minimap)

### Nodos en el Canvas
- **Selección**: Anillo azul (`ring-2 ring-blue-500`) alrededor del nodo seleccionado
- **Handles de resize**: 8 puntos blancos con borde azul en esquinas y puntos medios
- **Puertos de conexión**: 4 círculos (top, right, bottom, left) que aparecen al hover
- **Texto editable**: Doble click activa un input inline superpuesto al nodo
- **Iconos BPMN**: SVG inline para user task, service task, manual task, subprocess

### Minimap
- **Dimensiones**: 200 × 130 px, fondo slate 50
- **Representación**: Rectángulos miniatura para cada nodo (fill slate, stroke dark)
- **Viewport**: Rectángulo azul que muestra la vista actual
- **Interacción**: Click para navegar directamente al punto

---

## 4.6 Interacciones de Arrastre

### Drag de Nodos
1. Mouse down en nodo → `dragStart`
2. Mouse move → `dragMove` con cálculo de delta ajustado por zoom
3. Snap to grid: `Math.round(newPos / gridSize) * gridSize`
4. Mouse up → `dragEnd`, commit de transacción en historial
5. Multi-drag: Todos los nodos seleccionados se mueven simultáneamente

### Drag de Edges
1. Mouse down en puerto → Inicia preview de edge
2. Mouse move → Actualiza línea de preview desde puerto origen al cursor
3. Mouse up en nodo destino → Crea edge
4. Mouse up en vacío → Cancela creación

### Marquee Selection
1. Mouse down en fondo del canvas → Inicia selección
2. Mouse move → Dibuja rectángulo azul translúcido
3. Mouse up → Selecciona todos los nodos dentro del rectángulo
4. Con Shift: Añade a la selección existente

---

## 4.7 Esquema de Colores y Tokens Visuales

### Paleta de Colores Principales
| Uso | Color | Clase Tailwind |
|-----|-------|---------------|
| Fondo canvas | `#f8fafc` | `bg-slate-50` |
| Botones primarios | `#4f46e5` | `bg-indigo-600` |
| Botones secundarios | `#334155` | `bg-slate-700` |
| Selección | `#3b82f6` | `ring-blue-500` |
| Danger | `#b91c1c` | `bg-red-700` |
| Frames | `#10b981` | `border-emerald-500` |
| Flow mode | `#f59e0b` | `bg-amber-100/600` |
| Resize handle | `#06b6d4` | `hover:bg-cyan-500` |

### BPMN Visual Tokens (Tema Oscuro)
| Token | Valor |
|-------|-------|
| Background | `#0b0f14` |
| Text | `#f8fafc` |
| Font | DM Sans, sans-serif |
| Task Padding | `0.8rem 1.2rem` |
| Task Radius | `8px` |

### Variantes de Color BPMN Web Tasks
| Variante | Border/Accent | Uso Típico |
|----------|---------------|------------|
| Blue | `#60a5fa` / `#3b82f6` | User Task (default) |
| Yellow | `#facc15` / `#eab308` | Manual Task |
| Green | `#4ade80` / `#22c55e` | Eventos exitosos |
| Purple | `#c084fc` / `#a855f7` | Subprocesses |
| Red | `#f87171` / `#ef4444` | End events, errores |

### SVG Shape Tokens (Tema Claro)
| Token | Valor |
|-------|-------|
| Stroke | `#1f2937` |
| Stroke Muted | `#475569` |
| Fill | `#ffffff` |
| Lane Fill | `#ffffff` |
| Lane Header Fill | `#eef2ff` |
| Stroke Width | 2px |

---

## 4.8 Tipografía

- **Font base**: System font stack de Tailwind (ui-sans-serif, system-ui, sans-serif)
- **BPMN Web**: DM Sans, sans-serif
- **Tamaños**:
  - Toolbar buttons: `text-sm` (14px) a `text-xs` (12px)
  - Palette items: `text-[11px]` (11px)
  - Inspector labels: `text-xs` (12px)
  - BPMN task text: `0.8rem`
  - BPMN labels: `0.75rem`
  - Minimap header: `text-[10px]` (10px)

---

## 4.9 Estados y Feedback

### Estados de Hover
- Botones de toolbar: Variante más oscura del fondo
- Items de paleta: Borde cyan + fondo ligeramente más claro
- Handles de resize de panel: Fondo cyan con 40% opacidad

### Estados Disabled
- Botones con `disabled:opacity-40`
- Select options disabled visualmente deshabilitados

### Estados Activos
- Contraste selector: Fondo slate 700 + texto blanco para opción activa
- Flow mode: Badge amber visible + banner informativo central

### Transiciones
- BPMN interactions: `transition: all 0.2s ease`
- Cursor BPMN: `pointer` para todos los elementos interactivos
