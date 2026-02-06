# Plan de mejoras

Fecha: 2026-02-03

## Objetivo
Evolucionar el editor de diagramas para soportar creación/edición avanzada, mejores conexiones, export robusto y una arquitectura más mantenible.

## Alcance propuesto (fases)

### Fase 1: UX y edición básica (2-4 días)
1. Marquee selection (selección por arrastre en el fondo). **Estado: Implementado**
2. Resize handles en nodos (arrastrar esquinas y bordes). **Estado: Implementado**
3. Inline edit de texto (doble click en nodo). **Estado: Implementado**
4. Snap-to-grid configurable (toggle + tamaño en toolbar). **Estado: Implementado**
5. Mejoras del Inspector:
   - Secciones colapsables. **Estado: Implementado**
   - Selects para `shapeType` y `componentType`. **Estado: Implementado**
   - Validación de campos (números >= 0). **Estado: Implementado**

**Entregables**
- Interacción fluida para selección múltiple y resize.
- Inspector más usable y sin valores inválidos.

**Riesgos**
- Conflictos entre drag y resize.
- Doble click vs drag rápido.

---

### Fase 2: Conexiones y edges interactivos (3-6 días)
1. Puertos de conexión (anchors) por nodo: `top`, `right`, `bottom`, `left` (opcionales diagonales). **Estado: Implementado**
2. Modo “draw edge”: drag desde un puerto con preview y snap visual. **Estado: Implementado**
3. Conexión inteligente al borde: si no hay puerto destino, elegir el más cercano. **Estado: Implementado**
4. Modelo de edge ampliado: `sourcePort`, `targetPort` para recalcular al mover/redimensionar. **Estado: Implementado**
5. Routing ortogonal básico (Manhattan routing). **Estado: Implementado**
6. Edición de estilo de edges (color, ancho, flecha). **Estado: Implementado**
7. Mejora del render: single SVG layer para todos los edges. **Estado: Implementado**

**Mejoras propuestas para routing y dirección de flechas**
1. Ajustar segmento final para que la flecha entre en la dirección del `targetPort`.
2. Routing ortogonal con heurística simple (elige entre rutas candidatas la de menor longitud y mejor dirección).
3. (Opcional) Permitir un “bend handle” manual para redireccionar edges.

**Entregables**
- Conexión visual funcional entre nodos de distinto tipo (shape y web-component).
- Edges conectados al borde con puertos consistentes.
- Edges con estilos personalizables.

**Riesgos**
- Routing simple puede cruzar nodos; requiere heurística básica.
- Puertos en shapes no rectangulares pueden requerir intersección con path.

---

### Fase 3: Export y persistencia (2-4 días)
1. Export SVG/PNG además de HTML. **Estado: Implementado**
2. Exportar edges con estilos completos. **Estado: Implementado**
3. Guardar y cargar diagramas en JSON. **Estado: Implementado**
4. Auto-save opcional en `localStorage`. **Estado: Implementado**

**Entregables**
- Export robusto y portable.
- Persistencia local para el usuario.

**Riesgos**
- CORS/tainting si hay imágenes externas en PNG.

---

### Fase 4: Arquitectura y calidad (3-6 días)
1. Separar store (estado) de comandos (acciones). **Estado: Implementado**
2. Tipar `data` por tipo de nodo (uniones discriminadas más estrictas). **Estado: Implementado**
3. Tests unitarios de store y export. **Estado: Implementado**
4. E2E con `playwright-cli` automatizado. **Estado: Implementado**

**Entregables**
- Base más mantenible y testeable.
- Menos bugs en regresiones.

**Riesgos**
- Refactor amplio, requiere coordinación.

---

## Métricas de éxito
- Reducir fricción de edición (menos clicks y errores).
- Export consistente (HTML/SVG/PNG) sin pérdida visual.
- Flujo completo: crear -> editar -> conectar -> exportar -> reabrir.

## Dependencias
- Definir lista final de shapes válidos.
- Definir set mínimo de estilos de edge.
- Confirmar formato JSON de persistencia.

## Siguiente paso recomendado
Confirmar prioridades de Fase 1 y 2, y elegir qué implementar primero.
