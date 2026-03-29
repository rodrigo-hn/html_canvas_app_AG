# Diagram Builder — Documentación Completa v02

## 1. Visión General de la Aplicación

### ¿Qué es Diagram Builder?

**Diagram Builder** es una aplicación web de edición de diagramas construida con **Angular 21** que permite a los usuarios crear, editar y exportar diagramas de procesos de negocio (BPMN 2.0), diagramas de flujo genéricos y componentes web interactivos sobre un canvas HTML/SVG.

La aplicación funciona como un **editor visual tipo drag-and-drop** donde los usuarios pueden:

- Arrastrar formas desde una paleta de componentes al canvas
- Conectar nodos mediante edges (aristas/conexiones) con diferentes estilos
- Editar propiedades de nodos y conexiones desde un panel inspector
- Exportar los diagramas en múltiples formatos (HTML, SVG, PNG, JSON)
- Trabajar con plantillas predefinidas de dominio (Ventas, Soporte, Logística)

### Información Técnica Resumida

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Angular 21.1.0-next.0 (Standalone Components) |
| **Lenguaje** | TypeScript 5.9.2 |
| **Build Tool** | Angular CLI + Vite |
| **Estilos** | Tailwind CSS 3.4.17 |
| **State Management** | Angular Signals (nativo) |
| **Testing** | Vitest 4.0.8 + jsdom |
| **Renderizado** | HTML/SVG nativo (sin librerías de canvas externas) |
| **Routing** | Angular Router (ruta única: `/` → CanvasComponent) |

### Ruta del Proyecto

```
/diagram-builder/
├── src/
│   ├── app/
│   │   ├── core/           → Modelos, servicios, lógica de negocio
│   │   ├── canvas/         → Componente principal del canvas
│   │   ├── stencils/       → Definiciones de formas SVG
│   │   ├── components-tailwind/  → Componentes web renderizados con Tailwind
│   │   ├── inspector/      → Panel de propiedades
│   │   ├── app.ts          → Componente raíz
│   │   ├── app.routes.ts   → Configuración de rutas
│   │   └── app.config.ts   → Providers de la aplicación
│   ├── main.ts             → Bootstrap de Angular
│   ├── index.html          → Entry point HTML
│   └── styles.css          → Estilos globales
├── public/
│   └── examples/           → Plantillas JSON de ejemplo
├── scripts/                → Scripts de testing E2E
└── docs/                   → Documentación
```
