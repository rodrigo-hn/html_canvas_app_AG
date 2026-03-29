# 5. Arquitectura del Frontend

## 5.1 Stack Tecnológico

```
Angular 21.1.0-next.0
├── TypeScript 5.9.2
├── Tailwind CSS 3.4.17
├── Vite (via @angular/build)
├── PostCSS + Autoprefixer
├── Vitest 4.0.8 + jsdom
└── RxJS 7.8.0
```

### Decisiones Arquitecturales Clave
- **Standalone Components**: Todos los componentes son standalone (sin NgModules)
- **Angular Signals**: Estado reactivo nativo sin dependencias externas (sin NgRx, Zustand, etc.)
- **SVG nativo**: Renderizado de formas sin librerías de canvas (sin D3.js, Konva, React Flow, etc.)
- **Tailwind CSS inline**: Estilos declarados en las plantillas de componentes
- **Ruta única**: SPA de página única con todo el contenido en el canvas

---

## 5.2 Diagrama de Componentes

```
App (app.ts)
└── RouterOutlet
    └── CanvasComponent (canvas.component.ts) ← COMPONENTE PRINCIPAL
        ├── NodeRendererComponent × N (node-renderer.component.ts)
        │   ├── [ShapeNode] → SVG via StencilService
        │   └── [WebNode] → WebNodeWrapperComponent
        │       ├── WebButtonComponent
        │       ├── WebInputComponent
        │       ├── WebCardComponent
        │       ├── WebBpmnUserTaskComponent
        │       ├── WebBpmnServiceTaskComponent
        │       ├── WebBpmnManualTaskComponent
        │       ├── WebBpmnSubprocessComponent
        │       ├── WebBpmnStartEventComponent
        │       ├── WebBpmnExclusiveGatewayComponent
        │       ├── WebBpmnEndEventComponent
        │       ├── WebBpmnLaneComponent
        │       └── WebBpmnPoolComponent
        ├── EdgesLayerComponent (edges-layer.component.ts)
        │   └── EdgeRendererComponent × N (edge-renderer.component.ts)
        └── InspectorComponent (inspector.component.ts)
```

---

## 5.3 Servicios e Inyección de Dependencias

```
DiagramStore (providedIn: 'root')         ← Estado central con Signals
    ↑ lectura
    ↑ escritura
DiagramCommands (providedIn: 'root')      ← Lógica de negocio + Undo/Redo
    ↑ usa
StencilService (providedIn: 'root')       ← Generadores de formas SVG
HtmlExportService (providedIn: 'root')    ← Exportación multi-formato
```

### DiagramStore — Estado Reactivo

El store es el corazón del estado de la aplicación. Utiliza **Angular Signals** para reactividad:

```typescript
// Signals privados (mutables internamente)
private nodesSignal = signal<DiagramNode[]>([])
private edgesSignal = signal<DiagramEdge[]>([])
private selectionSignal = signal<Set<string>>(new Set())
private selectedEdgeIdSignal = signal<string | null>(null)
private snapToGridSignal = signal<boolean>(true)
private gridSizeSignal = signal<number>(20)
private edgePreviewSignal = signal<EdgePreview | null>(null)

// Accessors públicos (solo lectura)
readonly nodes = this.nodesSignal.asReadonly()
readonly edges = this.edgesSignal.asReadonly()
readonly selection = this.selectionSignal.asReadonly()
```

**Patrón**: Signals inmutables externamente, mutados solo a través del store o commands.

### DiagramCommands — Patrón Command + Undo/Redo

```typescript
// Estructura interna
private historyPast: CommandSnapshot[] = []    // Stack de undo (máx 120)
private historyFuture: CommandSnapshot[] = []  // Stack de redo
private transactionDepth = 0                   // Soporte de transacciones anidadas
private transactionSnapshot: CommandSnapshot   // Snapshot al inicio de transacción

// Operaciones principales
addNode(node)           → pushHistory + store.updateNodes
removeNode(id)          → pushHistory + store.updateNodes + updateEdges
updateNode(id, patch)   → pushHistory + store.updateNodes
addEdge(edge)           → pushHistory + store.updateEdges
removeEdge(id)          → pushHistory + store.updateEdges
undo()                  → restore historyPast.pop()
redo()                  → restore historyFuture.pop()
```

**Transacciones**: Las operaciones complejas (mover múltiples nodos) se envuelven en:
```typescript
beginTransaction()    // Captura snapshot
// ... múltiples operaciones ...
commitTransaction()   // Consolida en una sola entrada de historial
```

### StencilService — Registro de Formas

Registry pattern que mapea strings a funciones generadoras de SVG:

```typescript
private shapes: Record<string, (w: number, h: number) => string> = {
  'rectangle': BasicShapes.rectangle,
  'bpmn-task': BpmnShapes.task,
  'bpmn-gateway-exclusive': BpmnShapes.gatewayExclusive,
  // ... 30+ formas
}

getShapeSVG(type: string, w: number, h: number): SafeHtml
```

### HtmlExportService — Exportación Multi-formato

```typescript
exportHtml(model: DiagramModel): string     // HTML completo con Tailwind inline
exportSvg(model: DiagramModel): string      // SVG con markers y defs
async exportPng(model: DiagramModel): Blob  // PNG via Canvas API
```

---

## 5.4 Modelo de Datos

### Jerarquía de Tipos

```typescript
// Base
interface DiagramElement { id: string; selected?: boolean; zIndex?: number }
interface Point { x: number; y: number }
interface Size { width: number; height: number }

// Nodos
interface DiagramNodeBase extends DiagramElement, Point, Size {
  type: NodeType;        // 'shape' | 'web-component'
  rotation?: number;
}

interface ShapeNode extends DiagramNodeBase {
  type: 'shape';
  shapeType: string;     // 'rectangle', 'bpmn-task', etc.
  data: ShapeData;       // { text?, taskKind?, eventMarker? }
  style?: { fill?, stroke?, strokeWidth? }
}

interface WebNode extends DiagramNodeBase {
  type: 'web-component';
  componentType: WebComponentType;  // 'button', 'bpmn-user-task-web', etc.
  data: WebButtonData | WebInputData | WebCardData | WebBpmnTaskData | ...
}

type DiagramNode = ShapeNode | WebNode;

// Edges
interface DiagramEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort?: 'top' | 'right' | 'bottom' | 'left';
  targetPort?: 'top' | 'right' | 'bottom' | 'left';
  label?: string;
  labelPosition?: Point;
  flowType?: BpmnFlowType;  // 'sequence' | 'message' | 'association'
  points?: Point[];
  style?: { stroke?, strokeWidth?, cornerRadius?, dashArray? }
  markerEnd?: string;
  markerStart?: string;
}

// Modelo completo
interface DiagramModel {
  modelVersion: number;    // Actualmente 2
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
```

### Versionado y Migración

El sistema soporta migración automática de modelos:

```
V1 (Legacy) → migrateEdgeToV2() → V2 (Actual)
                                    ↓
                              sanitizeNodes()
                              sanitizeEdges()
```

- **V1 → V2**: Normaliza edge points y labelPosition
- **Sanitización**: Filtra nodos/edges inválidos, asegura campos requeridos

---

## 5.5 Directivas

### DraggableDirective

Directiva standalone que habilita drag & drop en nodos:

```typescript
@Directive({ selector: '[appDraggable]', standalone: true })
export class DraggableDirective {
  @Input() dragDisabled: boolean;
  @Input() snapToGrid: boolean;
  @Input() gridSize: number;
  @Input() zoom: number;
  @Input() startPosition: Point;

  @Output() dragStart = new EventEmitter<void>();
  @Output() dragMove = new EventEmitter<Point>();
  @Output() dragEnd = new EventEmitter<Point>();
}
```

**Comportamiento**:
- Calcula delta del mouse ajustado por nivel de zoom
- Aplica snap-to-grid: `Math.round(pos / gridSize) * gridSize`
- Previene drag en inputs/selects/buttons
- Bloquea text selection durante drag

---

## 5.6 Edge Styling Pipeline

Las conexiones se estilizan mediante un pipeline de resolución:

```
DiagramEdge
    ↓
resolveEdgeStyle(edge)         ← edge-style.mapper.ts
    ↓
ResolvedEdgeStyle {
  stroke, strokeWidth,
  dashArray, markerStart,
  markerEnd, cornerRadius
}
    ↓
Renderizado SVG en EdgesLayerComponent
```

Los defaults se determinan por `flowType`:
- `sequence` → Línea sólida + flecha
- `message` → Discontinua + círculo + flecha abierta
- `association` → Punteada sin marcadores

Las propiedades del edge pueden sobreescribir los defaults (color, grosor, etc.).

---

## 5.7 Rendering Pipeline

### Nodos Shape (SVG)
```
ShapeNode.shapeType
    ↓
StencilService.getShapeSVG(type, w, h)
    ↓
BasicShapes / BpmnShapes (generadores SVG)
    ↓
DomSanitizer.bypassSecurityTrustHtml()
    ↓
[innerHTML] en SVG container del NodeRendererComponent
```

### Nodos Web (Tailwind)
```
WebNode.componentType
    ↓
WebNodeWrapperComponent (router por @switch)
    ↓
Componente específico (WebBpmnUserTaskComponent, etc.)
    ↓
HTML renderizado con clases Tailwind + tokens BPMN
```

### Edges
```
DiagramEdge
    ↓
EdgesLayerComponent
    ↓
Calcula puntos de origen/destino desde puertos de nodos
    ↓
Genera SVG path con curvas bezier
    ↓
Aplica estilos (stroke, dash, markers)
    ↓
Renderiza label posicionado en el punto medio
```

---

## 5.8 Estructura de Archivos por Capa

```
src/app/
├── core/                          # CAPA DE DATOS Y LÓGICA
│   ├── models/
│   │   ├── diagram.model.ts       # Interfaces TypeScript
│   │   └── diagram-schema.ts      # Versionado del modelo
│   ├── services/
│   │   ├── diagram-store.service.ts    # Estado reactivo (Signals)
│   │   ├── diagram-commands.service.ts # Comandos + Undo/Redo
│   │   ├── diagram-migrations.ts       # Migración de modelos
│   │   └── html-exporter.service.ts    # Exportación
│   ├── edges/
│   │   └── edge-style.mapper.ts   # Resolución de estilos de edges
│   └── styles/
│       └── bpmn-visual-tokens.ts  # Tokens de diseño BPMN
│
├── canvas/                        # CAPA DE PRESENTACIÓN PRINCIPAL
│   ├── canvas.component.ts        # Componente orquestador (~2000 líneas)
│   ├── components/
│   │   ├── node-renderer.component.ts   # Renderizado de nodos
│   │   ├── edges-layer.component.ts     # Capa de conexiones
│   │   └── edge-renderer.component.ts   # Renderizado individual de edge
│   └── directives/
│       └── draggable.directive.ts # Directiva drag & drop
│
├── stencils/                      # CAPA DE GENERACIÓN SVG
│   ├── stencil.service.ts         # Registry de formas
│   ├── visual-tokens.ts           # Tokens de diseño básicos
│   └── shapes/
│       ├── basic.shapes.ts        # Formas geométricas
│       └── bpmn.shapes.ts         # Formas BPMN (~25 formas)
│
├── components-tailwind/           # COMPONENTES WEB RENDERIZADOS
│   ├── web-node-wrapper.component.ts  # Router de componentes
│   └── renderers/
│       ├── web-button.component.ts
│       ├── web-input.component.ts
│       ├── web-card.component.ts
│       ├── web-bpmn-*.component.ts    # 9 componentes BPMN web
│       └── bpmn-web-task.tokens.ts    # Re-export de tokens
│
├── inspector/                     # PANEL DE PROPIEDADES
│   └── inspector.component.ts     # Editor de propiedades (~980 líneas)
│
├── app.ts                         # Componente raíz
├── app.routes.ts                  # Ruta única: '' → Canvas
├── app.config.ts                  # Providers de Angular
└── app.config.server.ts           # Configuración SSR (si aplica)
```

---

## 5.9 Dependencias

### Producción
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@angular/core` | ^21.1.0-next.0 | Framework principal |
| `@angular/common` | ^21.1.0-next.0 | Directivas comunes (NgIf, NgFor, etc.) |
| `@angular/forms` | ^21.1.0-next.0 | FormsModule para two-way binding |
| `@angular/platform-browser` | ^21.1.0-next.0 | DomSanitizer, bootstrap |
| `@angular/router` | ^21.1.0-next.0 | Routing de SPA |
| `rxjs` | ~7.8.0 | Programación reactiva |
| `tslib` | ^2.3.0 | Helpers de TypeScript |

### Desarrollo
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@angular/build` | ^21.1.0-next.2 | Build con Vite |
| `@angular/cli` | ^21.1.0-next.2 | Angular CLI |
| `tailwindcss` | ^3.4.17 | Framework CSS utility-first |
| `typescript` | ~5.9.2 | Compilador TypeScript |
| `vitest` | ^4.0.8 | Test runner |
| `jsdom` | ^27.1.0 | DOM para tests |
| `postcss` | ^8.5.6 | Post-procesamiento CSS |
| `autoprefixer` | ^10.4.22 | Prefijos CSS automáticos |

---

## 5.10 Testing

### Framework: Vitest + jsdom

```
src/app/
├── app.spec.ts                              # Test del componente raíz
├── canvas/canvas.component.spec.ts          # Test del canvas
├── core/services/
│   ├── diagram-store.service.spec.ts        # Test del store
│   ├── diagram-commands.spec.ts             # Test de comandos + undo/redo
│   └── html-exporter.service.spec.ts        # Test de exportación
└── components-tailwind/
    └── web-node-wrapper.component.spec.ts   # Test del wrapper de web components
```

### E2E: Playwright CLI
```
scripts/
├── playwright-cli-validate.sh              # Validación básica
├── playwright-cli-bpmn-complex.sh          # Test BPMN complejo
└── playwright-cli-productividad.sh         # Test de productividad
```

---

## 5.11 Build y Deployment

### Scripts npm
```json
{
  "start": "ng serve",              // Dev server con hot reload
  "build": "ng build",              // Build de producción
  "watch": "ng build --watch --configuration development",
  "test": "ng test"                 // Ejecutar tests
}
```

### Configuración de Build (angular.json)
- **Builder**: `@angular/build:application` (Vite-based)
- **Output**: `dist/diagram-builder`
- **Assets**: `public/` folder
- **Styles**: `src/styles.css`
- **Budgets de producción**:
  - Initial: 500kB warning, 1MB error
  - Component styles: 4kB warning, 8kB error
