🎯 PROMPT PARA AGENTE DE IA

Generar aplicación de diagramación con exportación HTML funcional usando Tailwind CSS y stencils propios

⸻

📌 CONTEXTO GENERAL

Quiero que generes una aplicación web completa de diagramación, similar conceptualmente a diagrams.net (draw.io), pero con un objetivo central y diferenciador:

Exportar diagramas a HTML FUNCIONAL REAL, manteniendo una alta semejanza visual con el canvas original, SIN depender de mxGraph, diagrams.net ni ningún viewer externo.

La aplicación debe estar desarrollada en Angular 21, usando arquitectura limpia, buenas prácticas, código moderno, legible y mantenible.

⸻

🎯 OBJETIVO PRINCIPAL

Diseñar e implementar una aplicación que permita:
	1.	Crear diagramas en un canvas interactivo (drag & drop).
	2.	Usar librerías de formas diagramáticas:
	•	Formas básicas (rectángulo, documento, cilindro, rombo, flechas)
	•	BPMN (Pool, Lanes, Tasks, Events, Gateways, Flows)
	3.	Usar una biblioteca extensa de COMPONENTES WEB REALES, renderizados con Tailwind CSS.
	4.	Exportar el resultado a un HTML independiente y funcional, que contenga:
	•	HTML real + Tailwind CSS para componentes web
	•	SVG con stencils propios para todas las formas diagramáticas
	5.	El HTML exportado debe ser:
	•	Portable
	•	Editable por desarrolladores web
	•	Renderizable sin herramientas externas
	•	Visualmente muy similar al canvas original

⸻

⚠️ RESTRICCIONES TÉCNICAS (OBLIGATORIAS)
	•	Framework: Angular 21
	•	Estilos: Tailwind CSS
	•	Arquitectura desacoplada:
	•	Core de diagramas (modelo + lógica)
	•	UI (Angular components)
	•	Librerías de stencils SVG
	•	Exportadores (HTML / SVG)
	•	❌ NO usar mxGraph
	•	❌ NO usar viewer-static
	•	❌ NO usar diagrams.net
	•	❌ NO usar Bootstrap
	•	❌ NO hacer aproximaciones simples de shapes
	•	✅ Todas las formas deben dibujarse con stencils SVG propios
	•	✅ Exportación basada en modelo de datos, no capturas visuales

⸻

🧠 MODELO DE EXPORTACIÓN (CRÍTICO)

Regla fundamental
	•	Todo lo que sea componente web real → HTML + Tailwind
	•	Todo lo que sea forma diagramática → SVG (stencils propios)

Flujo conceptual

Diagram Model
 ├─ WebNodes (Tailwind components)
 │   ├─ Button
 │   ├─ Input
 │   ├─ Select
 │   ├─ Card
 │   ├─ Alert
 │   ├─ Badge
 │   ├─ Navbar
 │   ├─ Sidebar
 │   ├─ Table
 │   ├─ Modal
 │   ├─ Form layouts
 │   └─ etc. (la mayor cantidad posible)
 ├─ ShapeNodes (SVG)
 │   ├─ Document
 │   ├─ Database
 │   ├─ Flow shapes
 ├─ BPMN (SVG)
 │   ├─ Pool
 │   ├─ Lane
 │   ├─ Task
 │   ├─ Event
 │   └─ Gateway
 └─ Edges (SVG paths + markers)


⸻

🧩 BIBLIOTECA DE COMPONENTES WEB (TAILWIND CSS)

La aplicación debe incluir una biblioteca amplia y extensible de componentes reales, construidos con Tailwind CSS.

Componentes mínimos requeridos
	•	Button (primary, secondary, success, danger, ghost)
	•	Input (text, email, password)
	•	Textarea
	•	Select
	•	Checkbox / Radio
	•	Card
	•	Alert
	•	Badge
	•	Navbar
	•	Sidebar
	•	Table
	•	Modal
	•	Dropdown
	•	Tabs
	•	Accordion
	•	Formularios completos (label + input + help text)

Cada componente debe:
	•	Renderizarse en el canvas como WebNode
	•	Exportarse como HTML real con clases Tailwind
	•	Mantener posición, tamaño y estilos

⸻

🎨 STENCILS PROPIOS (REQUISITO CRÍTICO)

Cada forma diagramática debe implementarse como un stencil SVG propio, con alta fidelidad visual.

Stencils obligatorios

drawDocument(x, y, w, h)
drawCylinder(x, y, w, h)
drawBpmnPool(x, y, w, h, headerSize)
drawBpmnLane(x, y, w, h)
drawBpmnTask(x, y, w, h)
drawBpmnStartEvent(x, y, r)
drawSequenceFlow(points[])

❗ No usar <rect> genéricos cuando el shape es complejo.

⸻

🧾 EJEMPLO DE HTML EXPORTADO ESPERADO

<div class="relative w-[900px] h-[720px] bg-white border">

  <!-- HTML REAL (Tailwind) -->
  <button
    class="absolute left-[150px] top-[240px] w-[96px] h-[38px]
           bg-green-600 text-white rounded-md text-sm font-medium">
    Success
  </button>

  <div class="absolute left-[520px] top-[80px] w-[260px]">
    <h3 class="text-lg font-bold mb-2">Heading</h3>
    <p class="text-sm text-gray-700">
      Lorem ipsum dolor sit amet, consectetur adipisicing elit.
    </p>
  </div>

  <!-- SVG STENCILS -->
  <svg viewBox="0 0 900 720" class="absolute inset-0 pointer-events-none">
    <path d="M150 80 H300 V140 C260 160 190 160 150 140 Z"
          fill="white" stroke="black" stroke-width="2"/>
  </svg>

</div>


⸻

🛠 FUNCIONALIDADES MÍNIMAS DE LA APLICACIÓN

Canvas
	•	Drag & drop
	•	Move / resize
	•	Z-index
	•	Snapping a grid
	•	Selección simple y múltiple

Librerías
	•	Shapes básicos
	•	BPMN básico
	•	Componentes Tailwind reales

Exportación
	•	Export HTML (principal)
	•	Export SVG (opcional)
	•	Modelo intermedio JSON estable

⸻

🧑‍💻 BUENAS PRÁCTICAS ANGULAR 21
	•	Standalone Components
	•	Signals para estado
	•	ChangeDetectionStrategy.OnPush
	•	Servicios desacoplados
	•	TypeScript estricto
	•	Estructura clara de carpetas:

/core
/canvas
/stencils
/components-tailwind
/exporters
/models


⸻

📦 ENTREGABLES ESPERADOS DEL AGENTE
	1.	📁 Estructura completa del proyecto Angular 21
	2.	📐 Modelo de datos del diagrama
	3.	🎨 Implementación de stencils SVG propios
	4.	🧩 Biblioteca amplia de componentes Tailwind
	5.	📤 Servicio HtmlExportService
	6.	🧪 Ejemplo de HTML exportado final
	7.	📝 Documentación mínima

⸻

✅ CRITERIO DE ÉXITO

El HTML exportado debe:
	•	Verse muy similar al canvas original
	•	Contener HTML funcional real con Tailwind
	•	No depender de ningún viewer externo
	•	Ser editable por desarrolladores web
	•	Poder integrarse en cualquier proyecto web moderno

⸻

📌 IMPORTANTE FINAL

Prioriza siempre:
	•	Fidelidad visual
	•	Independencia total
	•	Arquitectura limpia
	•	Escalabilidad del sistema de stencils y componentes Tailwind