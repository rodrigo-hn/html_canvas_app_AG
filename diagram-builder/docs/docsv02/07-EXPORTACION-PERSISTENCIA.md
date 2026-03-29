# 7. Sistema de Exportación y Persistencia

## 7.1 HtmlExportService

**Archivo**: `src/app/core/services/html-exporter.service.ts` (~887 líneas)

### Export HTML

Genera un archivo HTML **completamente standalone** que incluye:

1. **Meta tags y viewport**: Configuración responsive
2. **Tailwind CSS CDN**: Enlace al CDN para estilos
3. **Estilos inline**: Posicionamiento absoluto de cada nodo
4. **SVG embebido**: Formas renderizadas como SVG inline
5. **Web components**: Renderizados como HTML nativo con estilos Tailwind
6. **Edges**: Capa SVG superpuesta con paths y markers

**Estructura del HTML generado**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>/* Estilos de marcadores SVG */</style>
</head>
<body>
  <div style="position:relative; width:Wpx; height:Hpx;">
    <!-- Nodos background (zIndex <= 0) -->
    <div style="position:absolute; left:Xpx; top:Ypx; ...">
      <!-- SVG shape o HTML web component -->
    </div>

    <!-- SVG Edges Layer -->
    <svg style="position:absolute; inset:0; ...">
      <defs><!-- Markers --></defs>
      <path d="..." stroke="..." />
    </svg>

    <!-- Nodos foreground (zIndex > 0) -->
  </div>
</body>
</html>
```

### Export SVG

Genera un SVG limpio con:

1. **ViewBox calculado**: Bounds ajustados al contenido
2. **Defs**: Definiciones de markers (arrow, open-arrow, open-circle, etc.)
3. **Shapes**: Cada nodo como grupo SVG con su forma correspondiente
4. **Edges**: Paths SVG con estilos y markers
5. **Textos**: Labels de nodos y edges como `<text>` SVG

### Export PNG

Proceso asíncrono:
1. Genera SVG del diagrama
2. Crea un elemento `Image` con el SVG como data URL
3. Dibuja la imagen en un `Canvas` HTML5
4. Convierte el canvas a `Blob` PNG
5. Dispara descarga del blob

### Export/Import JSON

**Export**: Serializa `DiagramModel` directamente:
```json
{
  "modelVersion": 2,
  "nodes": [...],
  "edges": [...]
}
```

**Import**:
1. Abre diálogo de archivo (accept: `.json`)
2. Lee el contenido como texto
3. Parsea JSON
4. Ejecuta migración si el modelo es de versión anterior
5. Carga en el store

---

## 7.2 Sistema de Migración

**Archivo**: `src/app/core/services/diagram-migrations.ts` (~73 líneas)

### Versiones
| Versión | Cambios |
|---------|---------|
| 1 (Legacy) | Formato original sin normalización de edges |
| 2 (Actual) | Points y labelPosition normalizados en edges |

### Flujo de Migración
```
Input JSON
    ↓
¿Tiene modelVersion?
    ├── Sí → ¿Es versión actual?
    │        ├── Sí → sanitize only
    │        └── No → migrate + sanitize
    └── No → Tratar como legacy → migrate legacy → sanitize
```

### Sanitización
- **Nodes**: Verifica que cada nodo tenga `id`, `type`, `x`, `y`, `width`, `height`
- **Edges**: Verifica `id`, `sourceId`, `targetId`; normaliza `points[]` y `labelPosition`
- Entradas inválidas se filtran silenciosamente

---

## 7.3 Persistencia LocalStorage

### Datos Persistidos

**Diagrama** (via `DiagramCommands`):
```typescript
saveToLocalStorage() {
  localStorage.setItem('diagram-builder-data', JSON.stringify({
    modelVersion: CURRENT_DIAGRAM_MODEL_VERSION,
    nodes: store.getNodes(),
    edges: store.getEdges()
  }));
}
```

**Configuración de UI** (via `CanvasComponent`):
```typescript
saveUiSettings() {
  localStorage.setItem('diagram-builder-ui', JSON.stringify({
    isPaletteOpen, inspectorOpen,
    leftPanelWidth, rightPanelWidth,
    zoomLevel, panX, panY,
    pagePreset, pageWidth, pageHeight,
    contrastPreset, autoSaveEnabled
  }));
}
```

### Auto-save
- Se activa con checkbox en toolbar
- Intervalo configurable (por defecto periódico)
- Guarda diagrama + UI settings automáticamente
- Se restaura al recargar la página

---

## 7.4 Plantillas de Ejemplo

Ubicadas en `public/examples/`:

| Archivo | Descripción |
|---------|-------------|
| `pizzeria-proceso-basico.json` | Proceso básico de pizzería |
| `pizzeria-proceso-bpmn-default.json` | Proceso BPMN completo (se carga al inicio) |
| `pizzeria-confirmacion-entrega.json` | Flujo de confirmación de entrega |
| `pizzeria-confirmacion-entrega-presentation.json` | Versión para presentación |

Las plantillas de dominio (Ventas, Soporte, Logística) se cargan desde rutas definidas en `domainTemplates[]`.
