# 🎨 Tutorial Completo: DiagramBuilder con Angular 21

## Construye una Aplicación de Diagramación Profesional desde Cero

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [¿Qué Vamos a Construir?](#2-qué-vamos-a-construir)
3. [Prerrequisitos y Configuración Inicial](#3-prerrequisitos-y-configuración-inicial)
4. [Arquitectura de la Aplicación](#4-arquitectura-de-la-aplicación)
5. [Parte 1: Fundamentos - Modelo de Datos](#5-parte-1-fundamentos---modelo-de-datos)
6. [Parte 2: Gestión de Estado con Signals](#6-parte-2-gestión-de-estado-con-signals)
7. [Parte 3: El Sistema de Canvas](#7-parte-3-el-sistema-de-canvas)
8. [Parte 4: Directiva Draggable](#8-parte-4-directiva-draggable)
9. [Parte 5: Sistema de Stencils SVG](#9-parte-5-sistema-de-stencils-svg)
10. [Parte 6: Componentes Web con Tailwind](#10-parte-6-componentes-web-con-tailwind)
11. [Parte 7: Motor de Exportación HTML](#11-parte-7-motor-de-exportación-html)
12. [Parte 8: Configuración del Proyecto](#12-parte-8-configuración-del-proyecto)
13. [Flujos de Datos y Diagramas](#13-flujos-de-datos-y-diagramas)
14. [Ejercicios Prácticos](#14-ejercicios-prácticos)
15. [Solución de Problemas Comunes](#15-solución-de-problemas-comunes)
16. [Próximos Pasos y Mejoras](#16-próximos-pasos-y-mejoras)

---

## 1. Introducción

### ¿Por qué este tutorial?

Este tutorial te guiará paso a paso en la construcción de **DiagramBuilder**, una aplicación de diagramación similar a draw.io pero con un enfoque único: **exportar diagramas como HTML funcional con Tailwind CSS**.

A diferencia de otras herramientas que exportan solo imágenes estáticas, DiagramBuilder genera código HTML real que puedes usar directamente en tus proyectos web.

### ¿Qué aprenderás?

Al completar este tutorial dominarás:

- **Angular 21** con sus características más modernas (Signals, Standalone Components, nueva sintaxis de control flow)
- **TypeScript avanzado** con interfaces, generics y discriminated unions
- **SVG programático** para crear figuras dinámicas
- **Tailwind CSS** integrado con Angular
- **Patrones de arquitectura** como Registry Pattern y gestión de estado reactivo
- **Drag & Drop nativo** sin librerías externas

### Nivel de dificultad

Este tutorial está diseñado para desarrolladores con:
- Conocimientos básicos de JavaScript/TypeScript
- Familiaridad con conceptos de frameworks frontend
- Ganas de aprender Angular moderno

---

## 2. ¿Qué Vamos a Construir?

### Vista General de la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│  DiagramBuilder                                    [Export HTML] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌──────────────┐        ┌──────────────────────────┐        │
│    │  Rectangle   │        │    Card Component        │        │
│    │  (SVG)       │        │    ┌────────────────┐   │        │
│    │  Start       │        │    │ User Profile   │   │        │
│    │  Process     │        │    │ Details...     │   │        │
│    └──────────────┘        │    └────────────────┘   │        │
│                            └──────────────────────────┘        │
│    ┌──────────┐                                                 │
│    │ Cylinder │      ┌──────────────┐                          │
│    │ Database │      │   [Save]     │   ← Button Component     │
│    └──────────┘      │   (Tailwind) │                          │
│                      └──────────────┘                          │
│    ┌──────────────┐                                            │
│    │  BPMN Task   │                                            │
│    │  User Task   │                                            │
│    └──────────────┘                                            │
│                                                                  │
│  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ← Grid (20px)            │
└─────────────────────────────────────────────────────────────────┘
```

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Canvas Interactivo** | Área de dibujo con grid visual de 20px |
| **Drag & Drop** | Arrastra elementos con snapping al grid |
| **Selección** | Click simple o multi-selección con Cmd/Shift |
| **Figuras SVG** | Rectángulos, cilindros, diamantes, formas BPMN |
| **Componentes Web** | Botones, inputs, cards con Tailwind CSS |
| **Exportación HTML** | Genera HTML standalone funcional |

### Stack Tecnológico

```
Frontend Framework:  Angular 21
Styling:            Tailwind CSS
Graphics:           SVG (sin canvas 2D)
State Management:   Angular Signals (sin NgRx/RxJS)
Type System:        TypeScript Strict
```

---

## 3. Prerrequisitos y Configuración Inicial

### 3.1 Herramientas Necesarias

Antes de comenzar, asegúrate de tener instalado:

```bash
# Verificar versiones
node --version    # v18.0.0 o superior
npm --version     # v9.0.0 o superior
```

### 3.2 Crear el Proyecto

```bash
# Crear nuevo proyecto Angular 21
npx @angular/cli@latest new diagram-builder

# Opciones recomendadas:
# - Stylesheet format: CSS
# - Enable SSR: No
# - Enable SSG: No

cd diagram-builder
```

### 3.3 Instalar Tailwind CSS

```bash
# Instalar Tailwind y sus dependencias
npm install -D tailwindcss postcss autoprefixer

# Inicializar configuración
npx tailwindcss init
```

### 3.4 Configurar Tailwind

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // ← Escanea templates Angular
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/styles.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  height: 100%;
  margin: 0;
}
```

### 3.5 Estructura de Directorios Final

Crea esta estructura de carpetas:

```
src/app/
├── core/                        # Núcleo de la aplicación
│   ├── models/
│   │   └── diagram.model.ts     # Interfaces TypeScript
│   └── services/
│       ├── diagram.service.ts   # Estado con Signals
│       └── html-exporter.service.ts
├── canvas/                      # Sistema de dibujo
│   ├── components/
│   │   └── node-renderer.component.ts
│   ├── directives/
│   │   └── draggable.directive.ts
│   └── canvas.component.ts
├── stencils/                    # Figuras SVG
│   ├── shapes/
│   │   ├── basic.shapes.ts
│   │   └── bpmn.shapes.ts
│   └── stencil.service.ts
├── components-tailwind/         # Componentes web
│   ├── renderers/
│   │   ├── web-button.component.ts
│   │   ├── web-input.component.ts
│   │   └── web-card.component.ts
│   └── web-node-wrapper.component.ts
├── app.ts                       # Componente raíz
├── app.config.ts                # Configuración
├── app.routes.ts                # Rutas
├── app.html                     # Template raíz
└── app.css                      # Estilos raíz
```

---

## 4. Arquitectura de la Aplicación

### 4.1 Diagrama de Capas

La aplicación sigue una arquitectura de capas bien definida:

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOOTSTRAP LAYER                           │
│                                                                  │
│  main.ts ──> app.config.ts (providers) ──> App Component        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                          │
│                                                                  │
│  CanvasComponent                                                 │
│    └── NodeRendererComponent (N instancias)                     │
│          ├── SVG Shapes (via StencilService)                    │
│          └── WebNodeWrapper (via componentType)                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                             │
│                                                                  │
│  DiagramService      StencilService      HtmlExportService      │
│  (Estado)            (SVG Registry)      (Generador HTML)       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│                                                                  │
│  DiagramNode ──> ShapeNode | WebNode                            │
│  DiagramEdge                                                     │
│  DiagramModel                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Principios de Diseño

1. **Standalone Components**: Cada componente es autosuficiente
2. **Inmutabilidad**: El estado nunca se muta directamente
3. **Signals**: Reactividad granular y eficiente
4. **Registry Pattern**: Mapeo de tipos a implementaciones
5. **Type Safety**: TypeScript estricto en todas partes

---

## 5. Parte 1: Fundamentos - Modelo de Datos

### 5.1 ¿Por qué empezar por el modelo?

El modelo de datos es el corazón de cualquier aplicación. Define la forma de los datos y las relaciones entre ellos. Un modelo bien diseñado facilita todo lo demás.

### 5.2 Crear el archivo de modelos

**src/app/core/models/diagram.model.ts:**

```typescript
// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipo de nodo: puede ser una figura SVG o un componente web
 */
export type NodeType = 'shape' | 'web-component';

/**
 * Representa un punto en el canvas
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Representa dimensiones
 */
export interface Size {
  width: number;
  height: number;
}

// ============================================
// ELEMENTOS DEL DIAGRAMA
// ============================================

/**
 * Propiedades comunes a todos los elementos
 */
export interface DiagramElement {
  id: string;          // Identificador único
  selected?: boolean;  // ¿Está seleccionado?
  zIndex: number;      // Orden de apilamiento
}

/**
 * Nodo base del diagrama
 * Combina posición, tamaño y propiedades de elemento
 */
export interface DiagramNode extends DiagramElement, Point, Size {
  type: NodeType;      // 'shape' o 'web-component'
  data: any;           // Datos específicos (texto, configuración)
  rotation?: number;   // Rotación en grados (opcional)
}

// ============================================
// ESPECIALIZACIONES DE NODOS
// ============================================

/**
 * Nodo de tipo figura SVG
 */
export interface ShapeNode extends DiagramNode {
  type: 'shape';                    // ← Literal type (discriminator)
  shapeType: string;                // 'rectangle', 'cylinder', 'bpmn-task'
  style?: {
    fill?: string;                  // Color de relleno
    stroke?: string;                // Color de borde
    strokeWidth?: number;           // Grosor de borde
  };
}

/**
 * Nodo de tipo componente web
 */
export interface WebNode extends DiagramNode {
  type: 'web-component';            // ← Literal type (discriminator)
  componentType: string;            // 'button', 'input', 'card'
}

// ============================================
// CONEXIONES (EDGES)
// ============================================

/**
 * Representa una conexión entre dos nodos
 */
export interface DiagramEdge extends DiagramElement {
  sourceId: string;                 // ID del nodo origen
  targetId: string;                 // ID del nodo destino
  points: Point[];                  // Puntos intermedios
  markerEnd?: string;               // Tipo de flecha ('arrow')
  style?: {
    stroke?: string;
    strokeWidth?: number;
  };
}

// ============================================
// MODELO COMPLETO
// ============================================

/**
 * Representa un diagrama completo
 */
export interface DiagramModel {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}
```

### 5.3 Conceptos TypeScript Importantes

#### Discriminated Unions

El campo `type` actúa como **discriminador**:

```typescript
function processNode(node: DiagramNode) {
  if (node.type === 'shape') {
    // TypeScript sabe que node es ShapeNode aquí
    console.log(node.shapeType);  // ✓ Válido
  } else if (node.type === 'web-component') {
    // TypeScript sabe que node es WebNode aquí
    console.log(node.componentType);  // ✓ Válido
  }
}
```

#### Interface Extension

Las interfaces pueden extender múltiples interfaces:

```typescript
// DiagramNode hereda de:
// - DiagramElement (id, selected, zIndex)
// - Point (x, y)
// - Size (width, height)
export interface DiagramNode extends DiagramElement, Point, Size {
  // Agrega propiedades adicionales
}
```

---

## 6. Parte 2: Gestión de Estado con Signals

### 6.1 ¿Qué son los Signals?

Los **Signals** son la nueva forma de manejar estado reactivo en Angular. Son más simples que RxJS y más eficientes que Zone.js.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPARACIÓN DE ENFOQUES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RxJS (Tradicional)              Signals (Angular 21)           │
│  ─────────────────────           ──────────────────────         │
│  BehaviorSubject                 signal()                        │
│  Observable.subscribe()          computed()                      │
│  async pipe                      Lectura directa: signal()       │
│  Gestión de suscripciones        Automático                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Crear el DiagramService

**src/app/core/services/diagram.service.ts:**

```typescript
import { Injectable, signal, computed } from '@angular/core';
import {
  DiagramModel,
  DiagramNode,
  DiagramEdge,
  ShapeNode,
  WebNode,
} from '../models/diagram.model';

@Injectable({
  providedIn: 'root',  // Singleton a nivel de aplicación
})
export class DiagramService {
  // ============================================
  // ESTADO PRIVADO (Writable Signals)
  // ============================================
  
  /**
   * Array de nodos en el diagrama
   * Solo este servicio puede modificarlo
   */
  private nodesSignal = signal<DiagramNode[]>([]);
  
  /**
   * Array de conexiones entre nodos
   */
  private edgesSignal = signal<DiagramEdge[]>([]);
  
  /**
   * Set de IDs de nodos seleccionados
   * Usamos Set para búsquedas O(1)
   */
  private selectionSignal = signal<Set<string>>(new Set());

  // ============================================
  // API PÚBLICA (Readonly Signals)
  // ============================================
  
  /**
   * Los componentes pueden leer pero NO escribir
   */
  readonly nodes = this.nodesSignal.asReadonly();
  readonly edges = this.edgesSignal.asReadonly();
  readonly selection = this.selectionSignal.asReadonly();

  // ============================================
  // CONSTRUCTOR: Datos iniciales de prueba
  // ============================================
  
  constructor() {
    // Agregar datos de ejemplo para ver algo en el canvas
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Figura: Rectángulo
    this.addNode({
      id: '1',
      type: 'shape',
      shapeType: 'rectangle',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      zIndex: 1,
      data: { text: 'Start Process' },
      style: { fill: '#ffffff', stroke: '#000000', strokeWidth: 2 },
    } as ShapeNode);

    // Figura: Cilindro (base de datos)
    this.addNode({
      id: '2',
      type: 'shape',
      shapeType: 'cylinder',
      x: 300,
      y: 150,
      width: 80,
      height: 100,
      zIndex: 1,
      data: { text: 'Database' },
    } as ShapeNode);

    // Figura: BPMN Task
    this.addNode({
      id: '3',
      type: 'shape',
      shapeType: 'bpmn-task',
      x: 140,
      y: 300,
      width: 140,
      height: 80,
      zIndex: 1,
      data: { text: 'User Task' },
    } as ShapeNode);

    // Componente: Botón
    this.addNode({
      id: '4',
      type: 'web-component',
      componentType: 'button',
      x: 400,
      y: 400,
      width: 100,
      height: 40,
      zIndex: 1,
      data: { text: 'Save', variant: 'success' },
    } as WebNode);

    // Componente: Card
    this.addNode({
      id: '5',
      type: 'web-component',
      componentType: 'card',
      x: 550,
      y: 100,
      width: 300,
      height: 200,
      zIndex: 0,
      data: { title: 'User Profile', content: 'Details regarding the user...' },
    } as WebNode);
  }

  // ============================================
  // ACCIONES: Métodos que modifican el estado
  // ============================================

  /**
   * Agrega un nuevo nodo al diagrama
   * Usa spread operator para crear nuevo array (inmutabilidad)
   */
  addNode(node: DiagramNode) {
    this.nodesSignal.update((nodes) => [...nodes, node]);
  }

  /**
   * Elimina un nodo y sus conexiones asociadas
   */
  removeNode(nodeId: string) {
    // Eliminar el nodo
    this.nodesSignal.update((nodes) => 
      nodes.filter((n) => n.id !== nodeId)
    );
    
    // Eliminar edges conectados
    this.edgesSignal.update((edges) =>
      edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId)
    );
    
    // Quitar de selección
    this.selectionSignal.update((sel) => {
      const newSel = new Set(sel);
      newSel.delete(nodeId);
      return newSel;
    });
  }

  /**
   * Actualiza propiedades de un nodo existente
   * @param id - ID del nodo a actualizar
   * @param changes - Objeto con las propiedades a cambiar
   */
  updateNode(id: string, changes: Partial<DiagramNode>) {
    this.nodesSignal.update((nodes) =>
      nodes.map((n) => 
        n.id === id 
          ? { ...n, ...changes }  // Merge inmutable
          : n
      )
    );
  }

  /**
   * Alterna la selección de un nodo
   * @param id - ID del nodo
   * @param multi - Si es true, permite multi-selección (Cmd/Shift)
   */
  toggleSelection(id: string, multi: boolean) {
    this.selectionSignal.update((sel) => {
      // Si no es multi-select, empezar con Set vacío
      const newSel = multi ? new Set<string>(sel) : new Set<string>();
      
      if (sel.has(id) && multi) {
        // Si ya está seleccionado y es multi, deseleccionar
        newSel.delete(id);
      } else {
        // Agregar a selección
        newSel.add(id);
      }
      
      return newSel;
    });
  }

  /**
   * Limpia toda la selección
   */
  clearSelection() {
    this.selectionSignal.set(new Set());
  }
}
```

### 6.3 Patrones Importantes de Signals

#### Patrón de Actualización Inmutable

```typescript
// ❌ INCORRECTO: Mutación directa
this.nodesSignal().push(newNode);  // No funciona, no dispara cambios

// ✓ CORRECTO: Crear nuevo array
this.nodesSignal.update(nodes => [...nodes, newNode]);
```

#### Signal vs Computed

```typescript
// signal(): Valor que puede cambiar
private counter = signal(0);

// computed(): Valor derivado (automáticamente se recalcula)
readonly doubled = computed(() => this.counter() * 2);

// Cuando counter cambia, doubled se recalcula automáticamente
```

---

## 7. Parte 3: El Sistema de Canvas

### 7.1 Componente Canvas Principal

El Canvas es el componente que contiene todos los nodos y maneja eventos globales.

**src/app/canvas/canvas.component.ts:**

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramService } from '../core/services/diagram.service';
import { NodeRendererComponent } from './components/node-renderer.component';
import { HtmlExportService } from '../core/services/html-exporter.service';

@Component({
  selector: 'app-canvas',
  standalone: true,  // ← Componente autónomo (sin NgModule)
  imports: [CommonModule, NodeRendererComponent],
  template: `
    <!-- Container principal -->
    <div 
      class="relative w-full h-full bg-slate-50 overflow-hidden" 
      (click)="onBackgroundClick()"
    >
      <!-- Toolbar flotante -->
      <div class="absolute top-4 right-4 z-50 flex gap-2">
        <button
          (click)="exportHtml()"
          class="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          Export HTML
        </button>
      </div>

      <!-- Grid visual con patrón de puntos -->
      <div
        class="absolute inset-0 pointer-events-none opacity-10"
        style="
          background-image: radial-gradient(#000 1px, transparent 1px); 
          background-size: 20px 20px;
        "
      ></div>

      <!-- Renderizado de nodos -->
      <!-- @for es la nueva sintaxis de Angular 21 para loops -->
      @for (node of nodes(); track node.id) {
        <app-node-renderer [node]="node"></app-node-renderer>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `],
})
export class CanvasComponent {
  // Inyección moderna con inject()
  private diagramService = inject(DiagramService);
  private htmlExportService = inject(HtmlExportService);
  
  // Exponer el signal de nodos para el template
  nodes = this.diagramService.nodes;

  /**
   * Click en el fondo limpia la selección
   */
  onBackgroundClick() {
    this.diagramService.clearSelection();
  }

  /**
   * Exporta el diagrama como HTML y lo descarga
   */
  exportHtml() {
    const html = this.htmlExportService.exportHtml({
      nodes: this.diagramService.nodes(),
      edges: [],
    });

    // Crear blob y disparar descarga
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram-export.html';
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

### 7.2 Componente NodeRenderer (Renderizador Polimórfico)

Este componente decide cómo renderizar cada nodo según su tipo.

**src/app/canvas/components/node-renderer.component.ts:**

```typescript
import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramNode, Point, ShapeNode, WebNode } from '../../core/models/diagram.model';
import { DiagramService } from '../../core/services/diagram.service';
import { DraggableDirective } from '../directives/draggable.directive';
import { StencilService } from '../../stencils/stencil.service';
import { WebNodeWrapperComponent } from '../../components-tailwind/web-node-wrapper.component';

@Component({
  selector: 'app-node-renderer',
  standalone: true,
  imports: [CommonModule, DraggableDirective, WebNodeWrapperComponent],
  template: `
    <!-- Contenedor del nodo -->
    <div
      class="absolute select-none hover:ring-2 hover:ring-blue-400 group"
      appDraggable
      [snapToGrid]="true"
      [gridSize]="20"
      [startPosition]="{ x: node.x, y: node.y }"
      (dragMove)="onDragMove($event)"
      [class.ring-2]="isSelected()"
      [class.ring-blue-600]="isSelected()"
      [style.left.px]="node.x"
      [style.top.px]="node.y"
      [style.width.px]="node.width"
      [style.height.px]="node.height"
      [style.z-index]="node.zIndex"
      (click)="onSelect($event)"
    >
      <!-- ============================================ -->
      <!-- RENDERIZADO CONDICIONAL POR TIPO            -->
      <!-- ============================================ -->
      
      <!-- Opción 1: Figuras SVG -->
      <svg
        *ngIf="node.type === 'shape'"
        class="w-full h-full pointer-events-none"
        [attr.viewBox]="'0 0 ' + node.width + ' ' + node.height"
        style="overflow: visible;"
      >
        <!-- El contenido SVG viene del StencilService -->
        <g [innerHTML]="getShapeContent()"></g>

        <!-- Texto superpuesto usando foreignObject -->
        <foreignObject
          *ngIf="node.data?.text"
          x="0"
          y="0"
          [attr.width]="node.width"
          [attr.height]="node.height"
        >
          <div class="w-full h-full flex items-center justify-center text-center p-1 text-sm pointer-events-none">
            {{ node.data.text }}
          </div>
        </foreignObject>
      </svg>

      <!-- Opción 2: Componentes Web (Tailwind) -->
      <div *ngIf="node.type === 'web-component'" class="w-full h-full">
        <app-web-node-wrapper [node]="asWebNode(node)"></app-web-node-wrapper>
      </div>
    </div>
  `,
})
export class NodeRendererComponent {
  // Input requerido - el nodo a renderizar
  @Input({ required: true }) node!: DiagramNode;

  private diagramService = inject(DiagramService);
  private stencilService = inject(StencilService);

  /**
   * Computed signal que indica si el nodo está seleccionado
   * Se recalcula automáticamente cuando cambia la selección
   */
  isSelected = computed(() => 
    this.diagramService.selection().has(this.node.id)
  );

  /**
   * Maneja el click para seleccionar el nodo
   */
  onSelect(event: MouseEvent) {
    event.stopPropagation();  // Evitar que llegue al canvas
    const multi = event.metaKey || event.shiftKey;
    this.diagramService.toggleSelection(this.node.id, multi);
  }

  /**
   * Actualiza posición durante el arrastre
   */
  onDragMove(pos: Point) {
    this.diagramService.updateNode(this.node.id, { x: pos.x, y: pos.y });
  }

  /**
   * Obtiene el SVG content del StencilService
   */
  getShapeContent() {
    if (this.node.type !== 'shape') return '';
    const shapeNode = this.node as ShapeNode;
    return this.stencilService.getShapeSVG(
      shapeNode.shapeType, 
      this.node.width, 
      this.node.height
    );
  }

  /**
   * Type assertion helper para templates
   */
  asWebNode(node: DiagramNode): WebNode {
    return node as WebNode;
  }
}
```

### 7.3 Nueva Sintaxis de Control Flow (@for, @if)

Angular 21 introduce una nueva sintaxis más legible:

```typescript
// ❌ Sintaxis antigua
<div *ngFor="let item of items; trackBy: trackById">

// ✓ Nueva sintaxis Angular 21
@for (item of items; track item.id) {
  <div>{{ item.name }}</div>
}

// Condicionales
@if (condition) {
  <div>Verdadero</div>
} @else {
  <div>Falso</div>
}

// Switch
@switch (type) {
  @case ('a') { <div>Es A</div> }
  @case ('b') { <div>Es B</div> }
  @default { <div>Otro</div> }
}
```

---

## 8. Parte 4: Directiva Draggable

### 8.1 ¿Qué es una Directiva?

Una directiva es un comportamiento reutilizable que se puede aplicar a cualquier elemento. En este caso, `appDraggable` permite arrastrar cualquier elemento.

### 8.2 Implementación

**src/app/canvas/directives/draggable.directive.ts:**

```typescript
import { 
  Directive, 
  ElementRef, 
  EventEmitter, 
  HostListener, 
  Input, 
  Output 
} from '@angular/core';
import { Point } from '../../core/models/diagram.model';

@Directive({
  selector: '[appDraggable]',
  standalone: true,  // ← Directiva standalone
})
export class DraggableDirective {
  // ============================================
  // INPUTS: Configuración del comportamiento
  // ============================================
  
  @Input() dragDisabled = false;      // Deshabilitar arrastre
  @Input() snapToGrid = false;        // Activar snapping
  @Input() gridSize = 10;             // Tamaño del grid
  @Input() zoom = 1;                  // Nivel de zoom (para calcular delta)
  @Input() startPosition: Point = { x: 0, y: 0 };  // Posición inicial

  // ============================================
  // OUTPUTS: Eventos emitidos
  // ============================================
  
  @Output() dragStart = new EventEmitter<void>();
  @Output() dragMove = new EventEmitter<Point>();
  @Output() dragEnd = new EventEmitter<Point>();

  // ============================================
  // ESTADO INTERNO
  // ============================================
  
  private isDragging = false;
  private initialMouse: Point = { x: 0, y: 0 };  // Posición inicial del mouse
  private initialPos: Point = { x: 0, y: 0 };    // Posición inicial del elemento

  constructor(private el: ElementRef) {}

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Inicia el arrastre al presionar el mouse
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // No arrastrar si está deshabilitado
    if (this.dragDisabled) return;
    
    // No arrastrar si el click fue en un control (input, button, etc.)
    if ((event.target as HTMLElement).closest('input, select, textarea, button')) {
      return;
    }

    // Iniciar arrastre
    this.isDragging = true;
    this.initialMouse = { x: event.clientX, y: event.clientY };
    this.initialPos = { ...this.startPosition };

    this.dragStart.emit();
    event.preventDefault();  // Evitar selección de texto
  }

  /**
   * Actualiza posición durante el movimiento
   * Escucha en document para capturar movimientos fuera del elemento
   */
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    // Calcular delta (diferencia desde inicio)
    const deltaX = (event.clientX - this.initialMouse.x) / this.zoom;
    const deltaY = (event.clientY - this.initialMouse.y) / this.zoom;

    // Nueva posición
    let newX = this.initialPos.x + deltaX;
    let newY = this.initialPos.y + deltaY;

    // Aplicar snapping al grid si está habilitado
    if (this.snapToGrid) {
      newX = Math.round(newX / this.gridSize) * this.gridSize;
      newY = Math.round(newY / this.gridSize) * this.gridSize;
    }

    this.dragMove.emit({ x: newX, y: newY });
  }

  /**
   * Finaliza el arrastre al soltar el mouse
   */
  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.dragEnd.emit({ x: this.initialPos.x, y: this.initialPos.y });
  }
}
```

### 8.3 Algoritmo de Snapping

El snapping alinea la posición al grid más cercano:

```
Posición Original: 173px
Grid Size: 20px

Cálculo:
─────────────────────────────────────────
Math.round(173 / 20) * 20
         ↓
Math.round(8.65) * 20
         ↓
      9 * 20
         ↓
      180px  ← POSICIÓN FINAL

Grid Visual:
┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
│160 │    │180 │    │200 │    │220 │    │240 │    │
└────┴────┴──↑─┴────┴────┴────┴────┴────┴────┴────┘
             │
          173 → 180 (snapped)
```

---

## 9. Parte 5: Sistema de Stencils SVG

### 9.1 ¿Qué son los Stencils?

Los **Stencils** son funciones que generan código SVG dinámicamente basado en dimensiones. Esto permite crear figuras de cualquier tamaño.

### 9.2 Figuras Básicas

**src/app/stencils/shapes/basic.shapes.ts:**

```typescript
export const BasicShapes = {
  /**
   * Rectángulo simple
   */
  rectangle: (w: number, h: number) => {
    return `<rect 
      x="0" y="0" 
      width="${w}" height="${h}" 
      fill="white" 
      stroke="black" 
      stroke-width="2"
    />`;
  },

  /**
   * Rectángulo con esquinas redondeadas
   */
  roundedRectangle: (w: number, h: number) => {
    return `<rect 
      x="0" y="0" 
      width="${w}" height="${h}" 
      rx="10" ry="10" 
      fill="white" 
      stroke="black" 
      stroke-width="2"
    />`;
  },

  /**
   * Forma de documento (con borde ondulado inferior)
   */
  document: (w: number, h: number) => {
    const waveHeight = h * 0.1;
    const path = `
      M 0 0 
      H ${w} 
      V ${h - waveHeight} 
      C ${w * 0.75} ${h} ${w * 0.25} ${h - 2 * waveHeight} 0 ${h - waveHeight} 
      Z
    `;
    return `<path d="${path}" fill="white" stroke="black" stroke-width="2"/>`;
  },

  /**
   * Cilindro (representa base de datos)
   */
  cylinder: (w: number, h: number) => {
    const rx = w / 2;      // Radio X de la elipse
    const ry = h * 0.15;   // Radio Y (más pequeño para efecto 3D)
    
    return `
      <!-- Elipse superior (tapa) -->
      <path 
        d="M 0 ${ry} A ${rx} ${ry} 0 0 1 ${w} ${ry} A ${rx} ${ry} 0 0 1 0 ${ry} Z" 
        fill="white" 
        stroke="black" 
        stroke-width="2"
      />
      <!-- Cuerpo del cilindro -->
      <path 
        d="M 0 ${ry} V ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} V ${ry}" 
        fill="none" 
        stroke="black" 
        stroke-width="2"
      />
      <!-- Sombra sutil en la tapa -->
      <path 
        d="M 0 ${ry} A ${rx} ${ry} 0 0 1 ${w} ${ry}" 
        fill="none" 
        stroke="rgba(0,0,0,0.1)" 
        stroke-width="1"
      />
    `;
  },

  /**
   * Diamante (rombo)
   */
  diamond: (w: number, h: number) => {
    return `<path 
      d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" 
      fill="white" 
      stroke="black" 
      stroke-width="2"
    />`;
  },
};
```

### 9.3 Figuras BPMN

**src/app/stencils/shapes/bpmn.shapes.ts:**

```typescript
export const BpmnShapes = {
  /**
   * Tarea BPMN (rectángulo redondeado)
   */
  task: (w: number, h: number) => {
    return `<rect 
      x="0" y="0" 
      width="${w}" height="${h}" 
      rx="10" ry="10" 
      fill="white" 
      stroke="black" 
      stroke-width="2"
    />`;
  },

  /**
   * Evento de inicio (círculo simple)
   */
  eventStart: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `<circle 
      cx="${w / 2}" cy="${h / 2}" r="${r - 1}" 
      fill="white" 
      stroke="black" 
      stroke-width="2"
    />`;
  },

  /**
   * Evento de fin (círculo con borde grueso)
   */
  eventEnd: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `<circle 
      cx="${w / 2}" cy="${h / 2}" r="${r - 1}" 
      fill="white" 
      stroke="black" 
      stroke-width="4"
    />`;
  },

  /**
   * Gateway (diamante con diamante interno)
   */
  gateway: (w: number, h: number) => {
    return `
      <!-- Diamante exterior -->
      <path 
        d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" 
        fill="white" 
        stroke="black" 
        stroke-width="2"
      />
      <!-- Diamante interior (decoración) -->
      <path 
        d="M ${w / 2} ${h * 0.2} L ${w * 0.8} ${h / 2} L ${w / 2} ${h * 0.8} L ${w * 0.2} ${h / 2} Z" 
        fill="none" 
        stroke="black" 
        stroke-width="1"
      />
    `;
  },

  /**
   * Pool (contenedor con header lateral)
   */
  pool: (w: number, h: number) => {
    const headerSize = 30;
    return `
      <!-- Header lateral -->
      <rect 
        x="0" y="0" 
        width="${headerSize}" height="${h}" 
        fill="white" 
        stroke="black" 
        stroke-width="2"
      />
      <!-- Área principal -->
      <rect 
        x="${headerSize}" y="0" 
        width="${w - headerSize}" height="${h}" 
        fill="white" 
        stroke="black" 
        stroke-width="2"
      />
    `;
  },
};
```

### 9.4 Servicio de Stencils (Registry Pattern)

**src/app/stencils/stencil.service.ts:**

```typescript
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BasicShapes } from './shapes/basic.shapes';
import { BpmnShapes } from './shapes/bpmn.shapes';

// Tipo para funciones generadoras de SVG
export type ShapeGenerator = (w: number, h: number) => string;

@Injectable({
  providedIn: 'root',
})
export class StencilService {
  /**
   * Registry: Mapeo de nombre de shape a función generadora
   * Esto permite agregar nuevas figuras sin modificar la lógica de renderizado
   */
  private shapes: Record<string, ShapeGenerator> = {
    // Figuras básicas
    'rectangle': BasicShapes.rectangle,
    'rounded-rectangle': BasicShapes.roundedRectangle,
    'document': BasicShapes.document,
    'cylinder': BasicShapes.cylinder,
    'diamond': BasicShapes.diamond,
    
    // Figuras BPMN
    'bpmn-task': BpmnShapes.task,
    'bpmn-start-event': BpmnShapes.eventStart,
    'bpmn-end-event': BpmnShapes.eventEnd,
    'bpmn-gateway': BpmnShapes.gateway,
    'bpmn-pool': BpmnShapes.pool,
  };

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Obtiene el SVG para un tipo de shape dado
   * Usa DomSanitizer para evitar XSS attacks
   */
  getShapeSVG(type: string, width: number, height: number): SafeHtml {
    const generator = this.shapes[type];
    
    if (generator) {
      return this.sanitizer.bypassSecurityTrustHtml(
        generator(width, height)
      );
    }
    
    // Fallback: rectángulo rojo para shapes desconocidos
    return this.sanitizer.bypassSecurityTrustHtml(
      `<rect width="${width}" height="${height}" fill="red"/>`
    );
  }
}
```

---

## 10. Parte 6: Componentes Web con Tailwind

### 10.1 Componente Botón

**src/app/components-tailwind/renderers/web-button.component.ts:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [class]="getClasses()">
      {{ text }}
    </button>
  `,
})
export class WebButtonComponent {
  @Input() text = 'Button';
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';

  /**
   * Genera clases Tailwind dinámicamente según la variante
   */
  getClasses() {
    const base = 'px-4 py-2 rounded font-semibold focus:outline-none focus:shadow-outline';
    
    const variants = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    
    return `${base} ${variants[this.variant]}`;
  }
}
```

### 10.2 Componente Input

**src/app/components-tailwind/renderers/web-input.component.ts:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col">
      <label *ngIf="label" class="mb-1 text-sm font-bold text-gray-700">
        {{ label }}
      </label>
      <input
        [type]="type"
        [placeholder]="placeholder"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  `,
})
export class WebInputComponent {
  @Input() label = '';
  @Input() placeholder = 'Input text';
  @Input() type = 'text';
}
```

### 10.3 Componente Card

**src/app/components-tailwind/renderers/web-card.component.ts:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-web-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-sm rounded overflow-hidden shadow-lg bg-white h-full">
      <div class="px-6 py-4">
        <div class="font-bold text-xl mb-2">{{ title }}</div>
        <p class="text-gray-700 text-base">
          {{ content }}
        </p>
      </div>
    </div>
  `,
})
export class WebCardComponent {
  @Input() title = 'Card Title';
  @Input() content = 'Lorem ipsum dolor sit amet.';
}
```

### 10.4 Wrapper Dinámico

**src/app/components-tailwind/web-node-wrapper.component.ts:**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebNode } from '../core/models/diagram.model';
import { WebButtonComponent } from './renderers/web-button.component';
import { WebInputComponent } from './renderers/web-input.component';
import { WebCardComponent } from './renderers/web-card.component';

@Component({
  selector: 'app-web-node-wrapper',
  standalone: true,
  imports: [CommonModule, WebButtonComponent, WebInputComponent, WebCardComponent],
  template: `
    <div class="w-full h-full overflow-hidden pointer-events-none">
      <!-- @switch usa el nuevo control flow de Angular 21 -->
      @switch (node.componentType) {
        @case ('button') {
          <app-web-button
            [text]="node.data.text || 'Button'"
            [variant]="node.data.variant || 'primary'"
          />
        }
        @case ('input') {
          <app-web-input
            [label]="node.data.label"
            [placeholder]="node.data.placeholder"
            [type]="node.data.inputType || 'text'"
          />
        }
        @case ('card') {
          <app-web-card 
            [title]="node.data.title" 
            [content]="node.data.content" 
          />
        }
        @default {
          <div class="text-red-500">Unknown: {{ node.componentType }}</div>
        }
      }
    </div>
  `,
})
export class WebNodeWrapperComponent {
  @Input({ required: true }) node!: WebNode;
}
```

---

## 11. Parte 7: Motor de Exportación HTML

### 11.1 El Concepto

El exportador genera un archivo HTML **completamente independiente** que:
- No requiere Angular
- Incluye Tailwind CSS vía CDN
- Los botones tienen estados hover funcionales
- Los SVGs se renderizan correctamente

### 11.2 Implementación

**src/app/core/services/html-exporter.service.ts:**

```typescript
import { Injectable, inject } from '@angular/core';
import { DiagramModel, ShapeNode, WebNode } from '../models/diagram.model';
import { BasicShapes } from '../../stencils/shapes/basic.shapes';
import { BpmnShapes } from '../../stencils/shapes/bpmn.shapes';

@Injectable({
  providedIn: 'root',
})
export class HtmlExportService {
  
  /**
   * Genera HTML completo a partir del modelo del diagrama
   */
  exportHtml(model: DiagramModel): string {
    // Renderizar cada nodo
    const nodesHtml = model.nodes
      .map((node) => {
        if (node.type === 'shape') {
          return this.renderShape(node as ShapeNode);
        } else {
          return this.renderWebComponent(node as WebNode);
        }
      })
      .join('\n');

    // Template HTML completo
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Diagram</title>
    <!-- Tailwind CSS desde CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { 
        margin: 0; 
        padding: 0; 
        background-color: #f8fafc; 
        overflow: auto; 
      }
      .diagram-container { 
        position: relative; 
        width: 100vw; 
        height: 100vh; 
      }
    </style>
</head>
<body>
    <div class="diagram-container">
${nodesHtml}
    </div>
</body>
</html>
    `;
  }

  // ============================================
  // RENDERIZADO DE SHAPES (SVG)
  // ============================================

  private renderShape(node: ShapeNode): string {
    const svgContent = this.getSvgContent(node);
    return this.generateSvgWrapper(node, svgContent);
  }

  private getSvgContent(node: ShapeNode): string {
    // Registry local de generadores (mismo que StencilService)
    const shapes: Record<string, (w: number, h: number) => string> = {
      'rectangle': BasicShapes.rectangle,
      'rounded-rectangle': BasicShapes.roundedRectangle,
      'document': BasicShapes.document,
      'cylinder': BasicShapes.cylinder,
      'diamond': BasicShapes.diamond,
      'bpmn-task': BpmnShapes.task,
      'bpmn-start-event': BpmnShapes.eventStart,
      'bpmn-end-event': BpmnShapes.eventEnd,
      'bpmn-gateway': BpmnShapes.gateway,
      'bpmn-pool': BpmnShapes.pool,
    };
    
    const generator = shapes[node.shapeType];
    if (generator) {
      return generator(node.width, node.height);
    }
    return `<rect width="${node.width}" height="${node.height}" fill="red"/>`;
  }

  private generateSvgWrapper(node: ShapeNode, innerContent: string): string {
    return `
      <div style="position: absolute; left: ${node.x}px; top: ${node.y}px; width: ${node.width}px; height: ${node.height}px; z-index: ${node.zIndex}; pointer-events: none;">
        <svg viewBox="0 0 ${node.width} ${node.height}" style="width: 100%; height: 100%; overflow: visible;">
           ${innerContent}
        </svg>
        ${node.data?.text ? `
        <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; font-size: 0.875rem;">
            ${node.data.text}
        </div>` : ''}
      </div>`;
  }

  // ============================================
  // RENDERIZADO DE WEB COMPONENTS
  // ============================================

  private renderWebComponent(node: WebNode): string {
    const style = `position: absolute; left: ${node.x}px; top: ${node.y}px; z-index: ${node.zIndex};`;

    switch (node.componentType) {
      case 'button':
        return this.renderButton(node, style);
      case 'input':
        return this.renderInput(node, style);
      case 'card':
        return this.renderCard(node, style);
      default:
        return `<!-- Unknown component: ${node.componentType} -->`;
    }
  }

  private renderButton(node: WebNode, style: string): string {
    const variant = node.data.variant || 'primary';
    const variants: Record<string, string> = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      success: 'bg-green-500 text-white hover:bg-green-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const cls = `px-4 py-2 rounded font-semibold focus:outline-none ${variants[variant]}`;
    return `<button style="${style}" class="${cls}">${node.data.text || 'Button'}</button>`;
  }

  private renderInput(node: WebNode, style: string): string {
    const widthStyle = `width: ${node.width}px;`;
    return `
     <div style="${style} ${widthStyle}" class="flex flex-col">
       ${node.data.label ? `<label class="mb-1 text-sm font-bold text-gray-700">${node.data.label}</label>` : ''}
       <input type="${node.data.inputType || 'text'}" 
              placeholder="${node.data.placeholder || ''}" 
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
     </div>`;
  }

  private renderCard(node: WebNode, style: string): string {
    const widthStyle = `width: ${node.width}px; height: ${node.height}px;`;
    return `
      <div style="${style} ${widthStyle}" class="max-w-sm rounded overflow-hidden shadow-lg bg-white">
        <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2">${node.data.title || 'Card'}</div>
            <p class="text-gray-700 text-base">
                ${node.data.content || ''}
            </p>
        </div>
      </div>`;
  }
}
```

---

## 12. Parte 8: Configuración del Proyecto

### 12.1 Bootstrap de la Aplicación

**src/main.ts:**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

### 12.2 Configuración

**src/app/app.config.ts:**
```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

### 12.3 Rutas

**src/app/app.routes.ts:**
```typescript
import { Routes } from '@angular/router';
import { CanvasComponent } from './canvas/canvas.component';

export const routes: Routes = [
  { path: '', component: CanvasComponent }
];
```

### 12.4 Componente Raíz

**src/app/app.ts:**
```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('diagram-builder');
}
```

**src/app/app.html:**
```html
<router-outlet></router-outlet>
```

### 12.5 HTML Principal

**src/index.html:**
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DiagramBuilder</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

---

## 13. Flujos de Datos y Diagramas

### 13.1 Flujo de Selección de Nodo

```
Usuario hace click en un nodo
         │
         ▼
┌──────────────────────────────────────┐
│  NodeRendererComponent.onSelect()    │
│  ─────────────────────────────────   │
│  event.stopPropagation()             │
│  diagramService.toggleSelection(id)  │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  DiagramService.toggleSelection()    │
│  ─────────────────────────────────   │
│  selectionSignal.update(sel => {     │
│    newSel.add(id);                   │
│    return newSel;                    │
│  });                                 │
└──────────────────────────────────────┘
         │
         │ Signal emite cambio
         ▼
┌──────────────────────────────────────┐
│  computed: isSelected()              │
│  ─────────────────────────────────   │
│  selection().has(node.id) → true     │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Template se actualiza               │
│  ─────────────────────────────────   │
│  [class.ring-2]="isSelected()"       │
│  → Clase ring-2 aplicada             │
└──────────────────────────────────────┘
         │
         ▼
    Anillo azul visible
```

### 13.2 Flujo de Arrastre

```
Mouse Down → Mouse Move → Mouse Up
    │            │           │
    ▼            ▼           ▼
Guardar     Calcular      Emitir
posición    delta +       dragEnd
inicial     snapping
    │            │
    │            ▼
    │       dragMove.emit()
    │            │
    │            ▼
    │       onDragMove()
    │            │
    │            ▼
    │       updateNode(id, {x, y})
    │            │
    │            ▼
    │       nodesSignal.update()
    │            │
    │            ▼
    └───────> Template actualiza
              style.left/top
```

---

## 14. Ejercicios Prácticos

### Ejercicio 1: Agregar una Nueva Figura

**Objetivo:** Crear una figura de "hexágono" y agregarla al sistema.

**Pasos:**

1. Agregar la función generadora en `basic.shapes.ts`:
```typescript
hexagon: (w: number, h: number) => {
  const cx = w / 2;
  const cy = h / 2;
  const size = Math.min(w, h) / 2;
  
  // Calcular los 6 puntos del hexágono
  let points = '';
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  points += 'Z';
  
  return `<path d="${points}" fill="white" stroke="black" stroke-width="2"/>`;
}
```

2. Registrar en `stencil.service.ts`:
```typescript
'hexagon': BasicShapes.hexagon,
```

3. Agregar un nodo de prueba en `diagram.service.ts`:
```typescript
this.addNode({
  id: '6',
  type: 'shape',
  shapeType: 'hexagon',
  x: 500,
  y: 300,
  width: 100,
  height: 100,
  zIndex: 1,
  data: { text: 'Hexagon' },
} as ShapeNode);
```

### Ejercicio 2: Agregar un Componente Checkbox

**Objetivo:** Crear un componente de checkbox con label.

1. Crear `web-checkbox.component.ts`
2. Agregarlo al `web-node-wrapper.component.ts`
3. Implementar `renderCheckbox` en `html-exporter.service.ts`

### Ejercicio 3: Implementar Undo/Redo

**Objetivo:** Agregar historial de cambios.

**Pista:** Usa un array de estados pasados y un puntero al estado actual.

---

## 15. Solución de Problemas Comunes

### Error: "Property 'x' does not exist on type 'DiagramNode'"

**Causa:** TypeScript no puede inferir el tipo correcto.

**Solución:**
```typescript
// Usar type assertion
const shapeNode = node as ShapeNode;
console.log(shapeNode.shapeType);

// O usar type guard
if (node.type === 'shape') {
  // Aquí TypeScript sabe que es ShapeNode
}
```

### Error: "Signal value changed during rendering"

**Causa:** Estás modificando un signal durante el renderizado.

**Solución:**
```typescript
// ❌ Incorrecto
ngOnInit() {
  this.mySignal.set(newValue);  // Durante rendering
}

// ✓ Correcto - Usar effect o mover a evento
effect(() => {
  // Código reactivo aquí
});
```

### Los estilos Tailwind no se aplican

**Causa:** Tailwind no está procesando los archivos correctamente.

**Solución:**
1. Verificar `tailwind.config.js` tiene el path correcto
2. Verificar `styles.css` tiene las directivas @tailwind
3. Reiniciar el servidor de desarrollo

---

## 16. Próximos Pasos y Mejoras

### Funcionalidades para Agregar

1. **Toolbar con Drag de Stencils**
   - Paleta lateral con figuras disponibles
   - Drag & drop para agregar nuevos nodos

2. **Conexiones (Edges)**
   - Dibujar líneas entre nodos
   - Flechas y diferentes estilos de línea

3. **Property Editor**
   - Panel para editar propiedades del nodo seleccionado
   - Cambiar colores, texto, tamaños

4. **Zoom y Pan**
   - Hacer zoom con scroll
   - Arrastrar el canvas

5. **Guardar/Cargar**
   - Exportar modelo como JSON
   - Importar desde archivo

6. **Múltiples Páginas**
   - Soporte para diagramas multi-página

### Mejoras de Arquitectura

1. **Undo/Redo con Immer**
2. **Lazy Loading de módulos**
3. **Tests unitarios con Jest**
4. **Tests E2E con Cypress**

---

## 🎉 Conclusión

¡Felicidades! Has construido una aplicación de diagramación completa con Angular 21.

### Lo que aprendiste:

✅ **Standalone Components** - Arquitectura moderna sin NgModules  
✅ **Signals** - Estado reactivo eficiente  
✅ **TypeScript Avanzado** - Discriminated unions, generics  
✅ **SVG Programático** - Generar gráficos dinámicamente  
✅ **Tailwind CSS** - Integración con Angular  
✅ **Directivas** - Comportamiento reutilizable  
✅ **Patrones de Diseño** - Registry, Inmutabilidad  

### Recursos Adicionales

- [Documentación oficial de Angular](https://angular.dev)
- [Guía de Signals](https://angular.dev/guide/signals)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

---

*Tutorial creado basado en el proyecto DiagramBuilder - Angular 21 + Tailwind CSS*
