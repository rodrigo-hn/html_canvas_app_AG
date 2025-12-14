# 📘 Tutorial Completo: DiagramBuilder - Aplicación Angular 21

## Análisis Detallado de Arquitectura y Características

Este documento explica la aplicación DiagramBuilder como un tutorial avanzado, desde los fundamentos de Angular 21 hasta la implementación completa de esta aplicación de diagramación.

---

## 🎯 **PARTE 1: Características de Angular 21 Utilizadas**

### 1. **Standalone Components (Componentes Autónomos)**

La aplicación utiliza **100% Standalone Components**, una característica fundamental de Angular moderno que elimina la necesidad de NgModules.

**Ejemplo en `app.ts`:**
```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],  // ← Importación directa de dependencias
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('diagram-builder');
}
```

**¿Qué aprender aquí?**
- `imports: [RouterOutlet]` - Los componentes standalone declaran sus dependencias directamente
- No hay `@NgModule` en ninguna parte de la aplicación
- Cada componente es autosuficiente y reutilizable

---

### 2. **Signals - Nueva Gestión de Estado Reactivo**

Angular 21 introduce **Signals** como mecanismo principal de reactividad, reemplazando RxJS en muchos casos.

**Ejemplo en `diagram.service.ts`:**
```typescript
export class DiagramService {
  // Signals privados para estado mutable
  private nodesSignal = signal<DiagramNode[]>([]);
  private edgesSignal = signal<DiagramEdge[]>([]);
  private selectionSignal = signal<Set<string>>(new Set());

  // Signals de solo lectura expuestos públicamente
  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();
}
```

**Conceptos clave:**
- `signal()` - Crea un valor reactivo que notifica cambios automáticamente
- `asReadonly()` - Expone el signal de forma inmutable al exterior
- `update()` - Actualiza el valor basándose en el anterior

**Ejemplo de actualización:**
```typescript
addNode(node: DiagramNode) {
  this.nodesSignal.update((nodes) => [...nodes, node]);
}
```

---

### 3. **Computed Signals - Valores Derivados**

Los **computed signals** son valores que se recalculan automáticamente cuando sus dependencias cambian.

**Ejemplo en `node-renderer.component.ts`:**
```typescript
isSelected = computed(() => this.diagramService.selection().has(this.node.id));
```

**¿Qué está pasando?**
- `computed()` crea un signal derivado
- Automáticamente se suscribe a `this.diagramService.selection()`
- Cuando la selección cambia, `isSelected` se recalcula
- El template se actualiza automáticamente

---

### 4. **Inyección de Dependencias con `inject()`**

Angular 21 favorece la función `inject()` sobre el decorador `@Inject` en el constructor.

**Comparación:**

**❌ Forma antigua:**
```typescript
constructor(
  private diagramService: DiagramService,
  private htmlExportService: HtmlExportService
) {}
```

**✅ Forma moderna (usada en la app):**
```typescript
private diagramService = inject(DiagramService);
private htmlExportService = inject(HtmlExportService);
```

**Ventajas:**
- Más conciso y legible
- Puede usarse fuera del constructor
- Permite inyección condicional

---

### 5. **Control Flow Syntax - Nueva Sintaxis de Templates**

Angular 21 introduce una nueva sintaxis para estructuras de control en templates.

**`@for` - Iteración (canvas.component.ts:30)**
```typescript
@for (node of nodes(); track node.id) {
  <app-node-renderer [node]="node"></app-node-renderer>
}
```

**`@switch` - Condicional (web-node-wrapper.component.ts:14)**
```typescript
@switch (node.componentType) {
  @case ('button') {
    <app-web-button [text]="node.data.text" />
  }
  @case ('input') {
    <app-web-input [label]="node.data.label" />
  }
  @default {
    <div>Unknown: {{ node.componentType }}</div>
  }
}
```

**Ventajas sobre `*ngFor` y `*ngIf`:**
- Más legible y menos verboso
- Mejor rendimiento
- Mejor integración con TypeScript
- Sintaxis más similar a JavaScript nativo

---

### 6. **Directivas Standalone**

Las directivas también son standalone y se importan directamente.

**Ejemplo: `draggable.directive.ts`**
```typescript
@Directive({
  selector: '[appDraggable]',
  standalone: true,  // ← Directiva standalone
})
export class DraggableDirective {
  @Input() dragDisabled = false;
  @Input() snapToGrid = false;
  @Output() dragMove = new EventEmitter<Point>();

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) { /* ... */ }
}
```

**Uso en el componente:**
```typescript
<div appDraggable
     [snapToGrid]="true"
     (dragMove)="onDragMove($event)">
```

---

### 7. **Servicios con `providedIn: 'root'`**

Todos los servicios usan el patrón de inyección singleton a nivel de aplicación.

```typescript
@Injectable({
  providedIn: 'root',  // ← Disponible en toda la app
})
export class DiagramService { }
```

---

## 🏗️ **PARTE 2: Arquitectura de la Aplicación**

### Estructura de Directorios

```
diagram-builder/
├── src/
│   ├── app/
│   │   ├── core/                    # Núcleo de la aplicación
│   │   │   ├── models/              # Modelos de datos TypeScript
│   │   │   │   └── diagram.model.ts # Interfaces principales
│   │   │   └── services/            # Servicios globales
│   │   │       ├── diagram.service.ts      # Gestión de estado
│   │   │       └── html-exporter.service.ts # Exportación HTML
│   │   ├── canvas/                  # Sistema de canvas
│   │   │   ├── components/
│   │   │   │   └── node-renderer.component.ts
│   │   │   ├── directives/
│   │   │   │   └── draggable.directive.ts
│   │   │   └── canvas.component.ts
│   │   ├── stencils/                # Sistema de figuras SVG
│   │   │   ├── shapes/
│   │   │   │   ├── basic.shapes.ts  # Formas básicas
│   │   │   │   └── bpmn.shapes.ts   # Formas BPMN
│   │   │   └── stencil.service.ts
│   │   ├── components-tailwind/     # Componentes web
│   │   │   ├── renderers/
│   │   │   │   ├── web-button.component.ts
│   │   │   │   ├── web-card.component.ts
│   │   │   │   └── web-input.component.ts
│   │   │   └── web-node-wrapper.component.ts
│   │   ├── app.ts                   # Componente raíz
│   │   ├── app.config.ts            # Configuración
│   │   └── app.routes.ts            # Rutas
│   ├── main.ts                      # Bootstrap de la app
│   └── styles.css                   # Estilos globales con Tailwind
├── angular.json                     # Configuración de Angular CLI
├── tailwind.config.js               # Configuración de Tailwind CSS
└── package.json                     # Dependencias
```

---

## 📐 **PARTE 3: Modelo de Datos - Type System**

### Jerarquía de Interfaces

El archivo `diagram.model.ts` define un sistema de tipos robusto:

```typescript
// 1. Tipos básicos
export type NodeType = 'shape' | 'web-component';

// 2. Interfaces geométricas
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// 3. Base para todos los elementos
export interface DiagramElement {
  id: string;
  selected?: boolean;
  zIndex: number;
}

// 4. Nodo base (composición de interfaces)
export interface DiagramNode extends DiagramElement, Point, Size {
  type: NodeType;
  data: any;           // ← Flexible data bag
  rotation?: number;
}

// 5. Especializaciones
export interface ShapeNode extends DiagramNode {
  type: 'shape';
  shapeType: string;   // 'rectangle', 'bpmn-task', etc.
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface WebNode extends DiagramNode {
  type: 'web-component';
  componentType: string;  // 'button', 'card', 'input'
}

// 6. Modelo completo del diagrama
export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
```

**Conceptos TypeScript importantes:**
- **Type unions**: `NodeType = 'shape' | 'web-component'`
- **Interface extension**: `extends DiagramElement, Point, Size`
- **Optional properties**: `rotation?: number`
- **Discriminated unions**: `type` field para diferenciar nodos

---

## 🎨 **PARTE 4: Sistema de Gestión de Estado con Signals**

### DiagramService - El Corazón de la Aplicación

```typescript
@Injectable({ providedIn: 'root' })
export class DiagramService {
  // 📦 Estado privado con signals
  private nodesSignal = signal<DiagramNode[]>([]);
  private edgesSignal = signal<DiagramEdge[]>([]);
  private selectionSignal = signal<Set<string>>(new Set());

  // 🔒 API pública de solo lectura
  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();
}
```

**Patrón de diseño:**
1. **Signals privados** - Solo el servicio puede modificarlos
2. **ReadonlySignals públicos** - Los componentes solo pueden leer
3. **Métodos de acción** - Única forma de modificar el estado

### Acciones CRUD

**Agregar nodo:**
```typescript
addNode(node: DiagramNode) {
  this.nodesSignal.update((nodes) => [...nodes, node]);
}
```
- `update()` recibe una función que transforma el estado
- Spread operator `[...nodes, node]` crea nuevo array (inmutabilidad)

**Actualizar nodo:**
```typescript
updateNode(id: string, changes: Partial<DiagramNode>) {
  this.nodesSignal.update((nodes) =>
    nodes.map((n) => (n.id === id ? { ...n, ...changes } : n))
  );
}
```
- `Partial<DiagramNode>` - Solo propiedades a cambiar
- Object spread `{ ...n, ...changes }` - Merge inmutable

**Gestión de selección:**
```typescript
toggleSelection(id: string, multi: boolean) {
  this.selectionSignal.update((sel) => {
    const newSel = multi ? new Set<string>(sel) : new Set<string>();
    if (sel.has(id) && multi) {
      newSel.delete(id);
    } else {
      newSel.add(id);
    }
    return newSel;
  });
}
```
- Soporte multi-selección con `Cmd/Shift`
- Usa `Set` para búsquedas O(1)

---

## 🖼️ **PARTE 5: Sistema de Renderizado - Canvas y Nodos**

### CanvasComponent - El Lienzo

```typescript
@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, NodeRendererComponent],
  template: `
    <div class="relative w-full h-full bg-slate-50"
         (click)="onBackgroundClick()">

      <!-- Grid visual -->
      <div class="absolute inset-0 pointer-events-none"
           style="background-image: radial-gradient(#000 1px, transparent 1px);
                  background-size: 20px 20px;">
      </div>

      <!-- Renderizado de nodos -->
      @for (node of nodes(); track node.id) {
        <app-node-renderer [node]="node"></app-node-renderer>
      }
    </div>
  `
})
export class CanvasComponent {
  private diagramService = inject(DiagramService);
  nodes = this.diagramService.nodes;  // ← ReadonlySignal
}
```

**Características clave:**
- Grid con `radial-gradient` CSS
- `pointer-events-none` evita interferencia con interacciones
- `@for` itera sobre el signal reactivamente
- `track node.id` optimiza renderizado (similar a `trackBy`)

### NodeRendererComponent - Renderizador Polimórfico

Este componente maneja dos tipos de nodos: **Shapes (SVG)** y **Web Components**.

```typescript
@Component({
  selector: 'app-node-renderer',
  template: `
    <div class="absolute select-none"
         appDraggable
         [snapToGrid]="true"
         [startPosition]="{ x: node.x, y: node.y }"
         (dragMove)="onDragMove($event)"
         [class.ring-2]="isSelected()"
         [style.left.px]="node.x"
         [style.top.px]="node.y">

      <!-- SVG Shapes -->
      <svg *ngIf="node.type === 'shape'"
           [attr.viewBox]="'0 0 ' + node.width + ' ' + node.height">
        <g [innerHTML]="getShapeContent()"></g>

        <!-- Texto sobre la figura -->
        <foreignObject *ngIf="node.data?.text"
                       [attr.width]="node.width"
                       [attr.height]="node.height">
          <div class="w-full h-full flex items-center justify-center">
            {{ node.data.text }}
          </div>
        </foreignObject>
      </svg>

      <!-- Web Components -->
      <div *ngIf="node.type === 'web-component'">
        <app-web-node-wrapper [node]="asWebNode(node)"></app-web-node-wrapper>
      </div>
    </div>
  `
})
export class NodeRendererComponent {
  @Input({ required: true }) node!: DiagramNode;

  isSelected = computed(() =>
    this.diagramService.selection().has(this.node.id)
  );
}
```

**Técnicas avanzadas:**
- **Conditional rendering** con `*ngIf` basado en `node.type`
- **foreignObject** - Permite HTML dentro de SVG
- **Property binding** dinámico: `[style.left.px]="node.x"`
- **Computed signal** para reactividad eficiente

---

## 🎭 **PARTE 6: Sistema de Directivas - Drag & Drop**

### DraggableDirective - Interactividad Avanzada

```typescript
@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective {
  @Input() snapToGrid = false;
  @Input() gridSize = 10;
  @Output() dragMove = new EventEmitter<Point>();

  private isDragging = false;
  private initialMouse: Point = { x: 0, y: 0 };

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.initialMouse = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.initialMouse.x;
    const deltaY = event.clientY - this.initialMouse.y;

    let newX = this.initialPos.x + deltaX;
    let newY = this.initialPos.y + deltaY;

    // Snapping al grid
    if (this.snapToGrid) {
      newX = Math.round(newX / this.gridSize) * this.gridSize;
      newY = Math.round(newY / this.gridSize) * this.gridSize;
    }

    this.dragMove.emit({ x: newX, y: newY });
  }
}
```

**Conceptos clave de Angular:**
- `@HostListener` - Escucha eventos en el elemento host
- `document:mousemove` - Escucha global (funciona fuera del elemento)
- `EventEmitter` - Comunicación hijo → padre
- **Snapping algorithm**: `Math.round(pos / grid) * grid`

---

## 🎨 **PARTE 7: Sistema de Stencils (Figuras SVG)**

### StencilService - Registry Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class StencilService {
  private shapes: Record<string, ShapeGenerator> = {
    rectangle: BasicShapes.rectangle,
    cylinder: BasicShapes.cylinder,
    'bpmn-task': BpmnShapes.task,
    // ... más shapes
  };

  getShapeSVG(type: string, width: number, height: number): SafeHtml {
    const generator = this.shapes[type];
    return this.sanitizer.bypassSecurityTrustHtml(
      generator(width, height)
    );
  }
}
```

**Patrón Registry:**
- Mapeo `string → función generadora`
- Fácil extensión agregando nuevas formas
- `DomSanitizer` previene XSS attacks

### Generadores de Figuras

**Rectángulo básico:**
```typescript
rectangle: (w: number, h: number) => {
  return `<rect x="0" y="0"
               width="${w}"
               height="${h}"
               fill="white"
               stroke="black"
               stroke-width="2"/>`;
}
```

**Cilindro (forma compleja):**
```typescript
cylinder: (w: number, h: number) => {
  const rx = w / 2;
  const ry = h * 0.15;
  return `
    <path d="M 0 ${ry} A ${rx} ${ry} 0 0 1 ${w} ${ry}
             A ${rx} ${ry} 0 0 1 0 ${ry} Z"
          fill="white" stroke="black"/>
    <path d="M 0 ${ry} V ${h - ry}
             A ${rx} ${ry} 0 0 0 ${w} ${h - ry}
             V ${ry}"
          fill="none" stroke="black"/>
  `;
}
```

**Conceptos SVG:**
- `<path>` con comandos `M` (move), `A` (arc), `V` (vertical line)
- Cálculo dinámico de geometría basado en dimensiones

---

## 🧩 **PARTE 8: Componentes Web con Tailwind**

### WebNodeWrapperComponent - Switch Dinámico

```typescript
@Component({
  template: `
    @switch (node.componentType) {
      @case ('button') {
        <app-web-button
          [text]="node.data.text || 'Button'"
          [variant]="node.data.variant || 'primary'" />
      }
      @case ('card') {
        <app-web-card
          [title]="node.data.title"
          [content]="node.data.content" />
      }
    }
  `
})
export class WebNodeWrapperComponent {
  @Input({ required: true }) node!: WebNode;
}
```

### WebButtonComponent - Componente con Variantes

```typescript
@Component({
  selector: 'app-web-button',
  template: `<button [class]="getClasses()">{{ text }}</button>`,
})
export class WebButtonComponent {
  @Input() text = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'success' = 'primary';

  getClasses() {
    const base = 'px-4 py-2 rounded font-semibold';
    const variants = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
    };
    return `${base} ${variants[this.variant]}`;
  }
}
```

**Patrón de diseño:**
- Clases dinámicas con Tailwind
- Type-safe variants con TypeScript unions
- Composición de strings para flexibilidad

---

## 📤 **PARTE 9: Sistema de Exportación HTML**

### HtmlExportService - Generación de HTML Standalone

```typescript
@Injectable({ providedIn: 'root' })
export class HtmlExportService {
  exportHtml(model: DiagramModel): string {
    const nodesHtml = model.nodes.map(node => {
      if (node.type === 'shape') {
        return this.renderShape(node as ShapeNode);
      } else {
        return this.renderWebComponent(node as WebNode);
      }
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      .diagram-container { position: relative; width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div class="diagram-container">
${nodesHtml}
    </div>
</body>
</html>`;
  }
}
```

**Renderizado de SVG:**
```typescript
private renderShape(node: ShapeNode): string {
  const svgContent = this.getSvgContent(node);
  return `
    <div style="position: absolute;
                left: ${node.x}px;
                top: ${node.y}px;">
      <svg viewBox="0 0 ${node.width} ${node.height}">
        ${svgContent}
      </svg>
    </div>`;
}
```

**Renderizado de componentes:**
```typescript
private renderButton(node: WebNode, style: string): string {
  const cls = `px-4 py-2 rounded bg-blue-500 hover:bg-blue-600`;
  return `<button style="${style}" class="${cls}">
    ${node.data.text}
  </button>`;
}
```

---

## ⚙️ **PARTE 10: Configuración del Proyecto**

### 1. Bootstrap de la Aplicación (main.ts)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

**Diferencia con versiones antiguas:**
- No hay `platformBrowserDynamic().bootstrapModule(AppModule)`
- Bootstrap directo del componente raíz
- Configuración separada en `appConfig`

### 2. Configuración de la App (app.config.ts)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

**Provider functions:**
- `provideRouter()` - Configuración de rutas
- `provideBrowserGlobalErrorListeners()` - Manejo de errores

### 3. Rutas (app.routes.ts)

```typescript
export const routes: Routes = [
  { path: '', component: CanvasComponent }
];
```

### 4. TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "experimentalDecorators": true,
    "target": "ES2022"
  },
  "angularCompilerOptions": {
    "strictTemplates": true
  }
}
```

**Configuraciones importantes:**
- `strict: true` - Type checking estricto
- `experimentalDecorators` - Soporte para decoradores
- `strictTemplates` - Type checking en templates

### 5. Tailwind CSS Configuration

**tailwind.config.js:**
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],  // ← Escanea templates
  theme: { extend: {} },
  plugins: [],
};
```

**styles.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🎓 **PARTE 11: Conceptos Avanzados de Angular 21**

### Change Detection Strategy

Aunque no está explícitamente configurado en esta app, Angular 21 con Signals usa:
- **Automatic change detection** basada en signals
- Actualizaciones granulares (solo cambia lo necesario)
- Mejor rendimiento que Zone.js tradicional

### Dependency Injection Hierarchy

```
ApplicationConfig (root)
   ↓
DiagramService (providedIn: 'root')
   ↓
Components (inject en cada nivel)
```

### Template Syntax Evolution

| Característica | Sintaxis Antigua | Angular 21 |
|---|---|---|
| Loops | `*ngFor="let item of items"` | `@for (item of items; track item.id)` |
| Conditionals | `*ngIf="condition"` | `@if (condition)` |
| Switch | `[ngSwitch]` | `@switch (value)` |

---

## 🚀 **PARTE 12: Roadmap de Aprendizaje**

Para recrear esta aplicación desde cero, sigue este orden:

### Nivel 1: Fundamentos
1. TypeScript avanzado (interfaces, generics, type guards)
2. Componentes standalone básicos
3. Property/Event binding
4. Services e inyección de dependencias

### Nivel 2: Signals y Reactividad
5. `signal()` y `computed()`
6. `effect()` para side effects
7. Patrones de gestión de estado

### Nivel 3: Templates Avanzados
8. Nueva sintaxis `@for`, `@if`, `@switch`
9. `@Input()` y `@Output()`
10. Template references y ViewChild

### Nivel 4: Directivas y Pipes
11. Attribute directives (`appDraggable`)
12. `@HostListener` y `@HostBinding`
13. Custom pipes

### Nivel 5: Interactividad
14. Eventos del DOM
15. Drag & Drop custom
16. Canvas y SVG manipulation

### Nivel 6: Arquitectura
17. Patrón Registry (StencilService)
18. Export/Import de datos
19. Type-safe APIs

### Nivel 7: Integración CSS
20. Tailwind CSS con Angular
21. Dynamic class binding
22. Responsive design

---

## 📊 **PARTE 13: Flujo de Datos Completo**

```
Usuario hace click en nodo
         ↓
NodeRendererComponent.onSelect()
         ↓
DiagramService.toggleSelection(id)
         ↓
selectionSignal.update()
         ↓
Computed signal isSelected() se recalcula
         ↓
Template se actualiza automáticamente
         ↓
Visual feedback (ring azul)
```

---

## 🎯 **Resumen de Características Angular 21**

Esta aplicación demuestra:

1. ✅ **Standalone Components** - 100% sin NgModules
2. ✅ **Signals** - Gestión de estado moderna
3. ✅ **Computed Signals** - Valores derivados
4. ✅ **inject()** - DI moderna
5. ✅ **@for/@if/@switch** - Nueva sintaxis de control
6. ✅ **Directivas standalone** - Reutilización de comportamiento
7. ✅ **Type safety** - TypeScript estricto
8. ✅ **Arquitectura modular** - Separación de responsabilidades
9. ✅ **Performance** - Change detection optimizada
10. ✅ **Tailwind CSS** - Integración perfecta

---

## 📝 **Referencias de Archivos Clave**

### Servicios
- **diagram.service.ts** (diagram-builder/src/app/core/services/diagram.service.ts) - Gestión de estado con Signals
- **html-exporter.service.ts** (diagram-builder/src/app/core/services/html-exporter.service.ts) - Exportación HTML
- **stencil.service.ts** (diagram-builder/src/app/stencils/stencil.service.ts) - Registry de figuras SVG

### Componentes
- **canvas.component.ts** (diagram-builder/src/app/canvas/canvas.component.ts) - Canvas principal
- **node-renderer.component.ts** (diagram-builder/src/app/canvas/components/node-renderer.component.ts) - Renderizador polimórfico
- **web-node-wrapper.component.ts** (diagram-builder/src/app/components-tailwind/web-node-wrapper.component.ts) - Switch de componentes web

### Directivas
- **draggable.directive.ts** (diagram-builder/src/app/canvas/directives/draggable.directive.ts) - Drag & Drop con snapping

### Modelos
- **diagram.model.ts** (diagram-builder/src/app/core/models/diagram.model.ts) - Type system completo

### Configuración
- **main.ts** (diagram-builder/src/main.ts) - Bootstrap
- **app.config.ts** (diagram-builder/src/app/app.config.ts) - Configuración de providers
- **tailwind.config.js** (diagram-builder/tailwind.config.js) - Configuración Tailwind

---

## 🎓 **Conclusión**

Esta aplicación DiagramBuilder es un ejemplo perfecto de las mejores prácticas de Angular 21, demostrando:

- **Arquitectura moderna** con Standalone Components
- **Gestión de estado eficiente** con Signals
- **Type safety completo** con TypeScript estricto
- **Separación de responsabilidades** clara
- **Reactividad optimizada** con computed signals
- **Interactividad avanzada** con directivas personalizadas
- **Exportación funcional** de HTML standalone
- **Integración perfecta** con Tailwind CSS

Es una base sólida para aprender Angular 21 y construir aplicaciones web modernas y escalables.
