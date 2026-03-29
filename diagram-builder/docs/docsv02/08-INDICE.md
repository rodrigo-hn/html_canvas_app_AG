# Diagram Builder — Índice de Documentación v02

## Documentos

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | [01-OVERVIEW.md](./01-OVERVIEW.md) | Visión general, stack tecnológico, estructura del proyecto |
| 2 | [02-FUNCIONALIDADES.md](./02-FUNCIONALIDADES.md) | Catálogo completo de funcionalidades: canvas, nodos, edges, alineación, exportación, undo/redo, modos, persistencia, atajos |
| 3 | [03-PALETA-COMPONENTES.md](./03-PALETA-COMPONENTES.md) | Paleta de componentes: 10 grupos, 50+ elementos (General, Web, BPMN Web, BPMN SVG) |
| 4 | [04-UX-UI.md](./04-UX-UI.md) | Análisis UX/UI: layout, toolbar, paleta, inspector, canvas, interacciones, colores, tipografía, estados |
| 5 | [05-ARQUITECTURA-FRONTEND.md](./05-ARQUITECTURA-FRONTEND.md) | Arquitectura: stack, componentes, servicios, modelo de datos, directivas, pipelines, testing, build |
| 6 | [06-COMPONENTES-DETALLE.md](./06-COMPONENTES-DETALLE.md) | Descripción detallada de cada componente: Canvas, NodeRenderer, EdgesLayer, Inspector, Web Components |
| 7 | [07-EXPORTACION-PERSISTENCIA.md](./07-EXPORTACION-PERSISTENCIA.md) | Exportación (HTML/SVG/PNG/JSON), migración de modelos, localStorage, plantillas |
| 8 | [09-PROPUESTA-MEJORAS-UX-UI.md](./09-PROPUESTA-MEJORAS-UX-UI.md) | Propuesta de mejoras UX/UI: toolbar, iconos, paleta, inspector, canvas, feedback, accesibilidad |

---

## Resumen de la Aplicación

**Diagram Builder** es un editor visual de diagramas construido con Angular 21 que permite:

- Crear diagramas de flujo y procesos BPMN 2.0 mediante drag & drop
- Editar nodos (formas SVG + componentes web Tailwind) y conexiones (3 tipos de flujo)
- Exportar en 4 formatos: HTML standalone, SVG, PNG, JSON
- Trabajar con undo/redo ilimitado, snap-to-grid, alineación y distribución
- Navegar con zoom, pan, minimap y frames
- Personalizar la experiencia con modos de visualización y contraste

### Números Clave
- **~2000 líneas** en el componente canvas principal
- **~980 líneas** en el inspector
- **50+ elementos** en la paleta
- **30+ formas SVG** generadas programáticamente
- **12 componentes web** BPMN renderizados con Tailwind
- **3 tipos de flujo** con estilos diferenciados
- **4 formatos** de exportación
- **120 entradas** de historial undo/redo
- **0 dependencias** de librerías de canvas externas
