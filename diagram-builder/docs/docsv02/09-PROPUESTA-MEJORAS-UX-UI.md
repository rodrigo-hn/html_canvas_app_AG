# 9. Propuesta de Mejoras UX/UI y Visuales

> Documento generado tras analisis visual en Chrome de la aplicacion Diagram Builder.
> Basado en capturas de pantalla a 1920x1080 y revision de la estructura de componentes.

---

## Hallazgos del Analisis Visual

### Estado Actual Observado

1. **Toolbar sobrecargado**: La barra de herramientas superior contiene ~30+ controles en una sola linea con flex-wrap, lo que genera **2 filas de botones** que ocupan ~80px de alto y son dificiles de escanear visualmente.

2. **Sin jerarquia visual en toolbar**: Export HTML, Export SVG, Export PNG (indigo) tienen el mismo peso visual que Undo, Redo, Fit, Preset, Focus (slate). No hay agrupacion logica clara.

3. **Paleta oscura vs toolbar clara**: La paleta usa tema oscuro (`bg-slate-900`) mientras el toolbar usa blanco (`bg-white/90`), creando un contraste visual inconsistente.

4. **Inspector basico**: El panel derecho muestra campos de formulario planos sin agrupacion visual sofisticada. Los campos son funcionales pero carecen de refinamiento.

5. **Minimap pequeno y desconectado**: El minimap (200x130px) esta en la esquina inferior derecha, visualmente desconectado del resto de la UI.

6. **Sin iconografia**: Todos los botones del toolbar usan texto plano sin iconos, lo que aumenta el ancho necesario y dificulta el reconocimiento rapido.

7. **Labels mixtos idioma**: Algunos labels estan en espanol ("Claro", "Medio", "Alto", "Plantillas BPMN") y otros en ingles ("Export", "Undo", "Snap", "Grid").

8. **Toolbar no responsivo**: En resoluciones menores, el toolbar desborda y los controles se amontonan sin prioridad.

---

## PROPUESTA 1: Rediseño del Toolbar

### Problema
30+ controles planos en una barra horizontal sin agrupacion, con texto solamente.

### Solucion: Toolbar segmentado con iconos

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] │ File ▾ │ Edit ▾ │ View ▾ │ [sep] │ Icons... │ [sep] │ Zoom │
└─────────────────────────────────────────────────────────────────────┘
```

#### Estructura propuesta:

**Grupo 1 — Archivo** (dropdown menu):
- Export HTML / SVG / PNG / JSON
- Import JSON
- Templates (submenu)
- Auto-save toggle

**Grupo 2 — Edicion** (iconos inline + dropdown):
- Undo / Redo (iconos)
- Separador
- Align / Distribute (dropdown con submenu visual)
- Grid settings (dropdown)

**Grupo 3 — Vista** (iconos inline):
- Zoom: [-] [100%] [+] [Fit]
- Focus mode toggle
- Presentation mode toggle
- Palette toggle
- Inspector toggle

**Grupo 4 — Canvas** (dropdown):
- Page preset
- Frames management
- Contrast presets

### Cambios concretos:

1. **Reemplazar textos por iconos SVG** con tooltips:
   - `Undo` → icono flecha circular izquierda + tooltip "Undo (Ctrl+Z)"
   - `Redo` → icono flecha circular derecha
   - `+` / `-` → ya son iconicos, mantener
   - `Fit` → icono expand-arrows
   - `Align L` → icono align-left
   - `Export HTML` → agrupar en menu "Export ▾"

2. **Agrupar en menus dropdown** los controles de uso infrecuente:
   - Export (4 opciones) → un solo boton "Export ▾"
   - Import → dentro del menu Export o como icono
   - Templates → dentro de menu "File ▾"
   - Frames → dentro de menu "Canvas ▾"
   - Align/Distribute → dentro de "Arrange ▾" o palette de alineacion

3. **Separadores visuales** entre grupos funcionales:
   ```html
   <div class="h-6 w-px bg-slate-300 mx-1"></div>
   ```

4. **Reducir altura a una sola linea** (~44px max)

### Impacto esperado:
- Toolbar de 2 filas → 1 fila
- ~30 botones visibles → ~12 iconos + 3 dropdowns
- Escaneo visual 3x mas rapido

---

## PROPUESTA 2: Sistema de Iconografia

### Problema
Todos los botones usan texto, ocupando mucho espacio y dificultando el reconocimiento rapido.

### Solucion: Iconos SVG inline con sistema coherente

#### Iconos sugeridos (24x24 SVG):

| Accion | Icono sugerido | Estilo |
|--------|---------------|--------|
| Undo | Arrow curve left | Stroke 1.5px |
| Redo | Arrow curve right | Stroke 1.5px |
| Export | Arrow up from box | Stroke 1.5px |
| Import | Arrow down to box | Stroke 1.5px |
| Zoom In | Magnifier + | Stroke 1.5px |
| Zoom Out | Magnifier - | Stroke 1.5px |
| Fit | Expand arrows (4) | Stroke 1.5px |
| Focus | Crosshair / Maximize | Stroke 1.5px |
| Presentation | Play / Screen | Stroke 1.5px |
| Align Left | Bars align left | Stroke 1.5px |
| Align Top | Bars align top | Stroke 1.5px |
| Dist H | Arrows horizontal | Stroke 1.5px |
| Dist V | Arrows vertical | Stroke 1.5px |
| Snap | Grid / Magnet | Stroke 1.5px |
| Delete | Trash | Stroke 1.5px |
| Add Frame | Frame + | Stroke 1.5px |
| Settings | Gear | Stroke 1.5px |

#### Implementacion sugerida:
- Crear archivo `src/app/shared/icons.ts` con funciones SVG inline
- Tamano consistente: 20x20px en toolbar, 16x16px en inspector
- Color: `currentColor` para heredar del contexto
- Hover: Escalar 1.05x + color mas oscuro

---

## PROPUESTA 3: Mejora de la Paleta de Componentes

### Problema
- Grid de 2 columnas muy comprimido
- Previews SVG pequenos (36x36) dificiles de distinguir
- Los items BPMN Web usan letras ("U", "S", "M") en vez de iconos reales
- Demasiadas secciones abiertas simultaneamente

### Solucion:

#### 3a. Previews mas grandes y descriptivos
- Aumentar previews de 36x36 a **48x48 px**
- Para BPMN Web Tasks: mostrar mini-render del componente real en vez de letras
- Agregar tooltips con descripcion detallada al hover

#### 3b. Layout mejorado
```
┌───────────────────────────┐
│ [Search...]               │
├───────────────────────────┤
│ ▸ Favoritos (nuevo)       │  ← Elementos usados frecuentemente
│ ▾ General                 │
│   [Rect] [Round] [Diam]  │  ← Grid 3 cols en pantalla ancha
│   [Doc]  [Cyl]           │
│ ▾ BPMN Tasks (Web)       │
│   [UserT] [ServT] [ManT] │  ← Mini-renders reales
│ ▸ BPMN Events            │  ← Colapsado por defecto
│ ▸ BPMN Gateways          │
│ ...                       │
└───────────────────────────┘
```

#### 3c. Seccion "Favoritos" / "Recientes"
- Agregar seccion superior con los ultimos 5-8 elementos utilizados
- Persistir en localStorage
- Permite acceso rapido sin buscar en categorias

#### 3d. Vista de lista alternativa
- Toggle entre vista grid (actual) y vista lista (una columna con descripcion)
- Util cuando el usuario no reconoce la forma por el preview

---

## PROPUESTA 4: Rediseño del Inspector

### Problema
- Campos de formulario planos sin agrupacion visual
- No hay distincion clara entre secciones
- Color pickers nativos del browser (inconsistentes entre OS)
- Sin feedback visual al editar valores

### Solucion:

#### 4a. Secciones con cards
```
┌─────────────────────────┐
│ Inspector                │
├─────────────────────────┤
│ ┌─ Transform ──────────┐│
│ │ X [120]  Y [340]     ││
│ │ W [160]  H [80]      ││
│ │ Z [5]   R [0°]       ││
│ └──────────────────────┘│
│ ┌─ Appearance ─────────┐│
│ │ Fill   [■ #fff]      ││
│ │ Stroke [■ #1f2937]   ││
│ │ Width  [2]           ││
│ └──────────────────────┘│
│ ┌─ Content ────────────┐│
│ │ Text  [Registrar...] ││
│ │ Type  [User Task ▾]  ││
│ └──────────────────────┘│
│ ┌─ Actions ────────────┐│
│ │ [Delete] [Duplicate] ││
│ └──────────────────────┘│
└─────────────────────────┘
```

#### 4b. Inputs compactos con labels inline
- Usar layout de 2 columnas (label + input) en vez de label encima de input
- Para Position/Size: inputs side-by-side con labels XY/WH minimos
- Reducir padding entre campos

#### 4c. Color picker mejorado
- Reemplazar `<input type="color">` nativo por un popover custom
- Incluir: Swatches frecuentes, input hex, cuentagotas
- Predefinir swatches de los tokens BPMN (blue, yellow, green, purple, red)

#### 4d. Informacion contextual
- Mostrar tipo de nodo con icono en el header del inspector
- Mostrar ID abreviado como chip copyable
- Para edges: mostrar preview visual del estilo de linea

---

## PROPUESTA 5: Mejoras al Canvas

### 5a. Guias de alineacion inteligentes (Smart Guides)
**Problema**: El snap-to-grid es util pero no ayuda a alinear con otros nodos.

**Solucion**: Mostrar lineas guia temporales cuando un nodo en movimiento se alinea con los bordes o centros de otros nodos.
- Lineas horizontales/verticales en azul claro
- Aparecen automaticamente durante drag
- Snap magnetico a la guia (configurable)

### 5b. Indicadores de conexion mejorados
**Problema**: Los puertos de conexion son circulos pequenos que aparecen al hover.

**Solucion**:
- Puertos mas visibles: 10px → 14px con borde coloreado segun flowType activo
- Animacion pulse suave cuando se esta en modo de conexion
- Highlight del nodo destino al acercar el cursor durante drag de edge

### 5c. Zoom a seleccion
- Nuevo atajo: `Ctrl+1` para zoom al nodo/grupo seleccionado
- Complementa el `Fit` que ajusta a todo el contenido

### 5d. Canvas background mejorado
**Problema**: El grid de puntos es muy sutil (opacidad 10%).

**Solucion**:
- Grid de lineas finas en vez de puntos (mas profesional, tipo Figma)
- Dos niveles de grid: mayor (cada 5 celdas) y menor
- Color adaptable al contraste seleccionado

---

## PROPUESTA 6: Mejoras de Feedback Visual

### 6a. Toasts/Notificaciones
**Problema**: Acciones como Export, Import, Save no dan feedback visual.

**Solucion**: Sistema de toast notifications:
```
┌──────────────────────────────┐
│ ✓ Diagram exported as PNG    │  ← Aparece 3s, esquina superior derecha
└──────────────────────────────┘
```
- Success: Verde para export/import exitoso
- Error: Rojo para errores de importacion
- Info: Azul para acciones como auto-save completado

### 6b. Cursor contextual
| Estado | Cursor |
|--------|--------|
| Default | `default` |
| Sobre nodo | `move` |
| Resize handle | `nw-resize`, `ne-resize`, etc. |
| Panning | `grab` / `grabbing` |
| Modo conexion | `crosshair` |
| Sobre puerto | `cell` (o custom SVG cursor) |
| Sobre edge | `pointer` |

### 6c. Animaciones suaves
- Transicion al hacer zoom: `transition: transform 0.15s ease-out`
- Fade in/out de paneles al toggle
- Animacion de seleccion: ring pulsante suave
- Snap: Micro-animacion cuando un nodo "salta" al grid

---

## PROPUESTA 7: Minimap Mejorado

### Problema
- Muy pequeno (200x130)
- Sin opciones de redimensionamiento
- Solo muestra rectangulos grises, no distingue tipos de nodo

### Solucion:
- **Tamano ajustable**: Permitir resize del minimap
- **Colores por tipo**: Nodos BPMN Web en un color, shapes en otro
- **Edges visibles**: Lineas finas entre nodos
- **Posicion configurable**: Poder mover a cualquier esquina
- **Collapse**: Boton para minimizar a solo un icono
- **Doble click**: Zoom in al area clickeada

---

## PROPUESTA 8: Consistencia de Idioma

### Problema
Mezcla de espanol e ingles en la interfaz.

### Solucion:
Elegir UN idioma principal y ser consistente. Dado que los labels BPMN son estandar en ingles, se recomienda:

**Opcion A — Todo en ingles** (recomendada para herramienta tecnica):
- "Claro" → "Light"
- "Medio" → "Medium"
- "Alto" → "High"
- "Plantillas BPMN por dominio" → "Domain templates"

**Opcion B — i18n**:
- Implementar sistema de internacionalizacion con Angular i18n o ngx-translate
- Archivos de traduccion en/es
- Selector de idioma en settings

---

## PROPUESTA 9: Accesibilidad (a11y)

### Problemas detectados:
1. Botones sin `aria-label` cuando solo tienen icono
2. Color picker nativo no es accesible
3. Canvas no es navegable con teclado
4. Sin `role` semanticos en la paleta
5. Contraste de texto en paleta oscura puede no cumplir WCAG AA

### Mejoras sugeridas:
1. `aria-label` en todos los botones con icono
2. `role="toolbar"` en la barra de herramientas
3. `role="tree"` en la paleta con `role="treeitem"` por grupo
4. `aria-selected` en nodos seleccionados
5. `aria-expanded` en secciones colapsables
6. Skip navigation para llegar al canvas directamente
7. Anuncio de acciones via `aria-live` regions

---

## PROPUESTA 10: Mejoras Visuales Generales

### 10a. Sistema de sombras consistente
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-toolbar: 0 2px 8px rgba(15,23,42,0.08);
--shadow-panel: 0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.08);
```

### 10b. Bordes redondeados uniformes
```css
--radius-sm: 4px;   /* Botones pequenos, inputs */
--radius-md: 8px;   /* Cards, panels */
--radius-lg: 12px;  /* Modals, popovers */
--radius-xl: 16px;  /* Containers principales */
```

### 10c. Espaciado consistente (8px grid system)
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

### 10d. Palette de colores unificada
Definir tokens CSS custom que se usen tanto en toolbar, paleta como inspector:
```css
:root {
  --color-primary: #4f46e5;      /* Indigo - acciones principales */
  --color-primary-hover: #4338ca;
  --color-surface: #ffffff;       /* Fondos de paneles */
  --color-surface-alt: #f8fafc;   /* Fondo del canvas */
  --color-border: #e2e8f0;        /* Bordes sutiles */
  --color-text: #1e293b;          /* Texto principal */
  --color-text-muted: #64748b;    /* Texto secundario */
  --color-danger: #dc2626;        /* Acciones destructivas */
  --color-success: #16a34a;       /* Confirmaciones */
  --color-accent: #06b6d4;        /* Highlights, focus rings */
}
```

---

## PROPUESTA 11: Keyboard Shortcuts Panel

### Problema
Los atajos de teclado no se descubren facilmente.

### Solucion:
- Boton `?` o `Ctrl+/` que abre un modal con todos los atajos
- Organizado por categoria (File, Edit, View, Canvas)
- Siempre accesible desde el menu Help

```
┌────────────────────────────────────────┐
│  Keyboard Shortcuts                 [x]│
├────────────────────────────────────────┤
│  File                                  │
│  Ctrl+S        Save                    │
│  Ctrl+Shift+E  Export                  │
│                                        │
│  Edit                                  │
│  Ctrl+Z        Undo                    │
│  Ctrl+Y        Redo                    │
│  Delete        Remove selection        │
│  Ctrl+D        Duplicate               │
│                                        │
│  View                                  │
│  Ctrl+0        Fit to content          │
│  Ctrl++        Zoom in                 │
│  Ctrl+-        Zoom out               │
│  Space+Drag    Pan canvas              │
│                                        │
│  Canvas                                │
│  Alt+Shift+L   Align left              │
│  Alt+Shift+T   Align top               │
│  Alt+Shift+H   Distribute horizontal   │
│  Alt+Shift+V   Distribute vertical     │
└────────────────────────────────────────┘
```

---

## PROPUESTA 12: Context Menu (Click Derecho)

### Problema
Todas las acciones requieren ir al toolbar o inspector.

### Solucion: Menu contextual en nodos y canvas.

**Click derecho en nodo:**
```
┌──────────────────────┐
│ Cut          Ctrl+X  │
│ Copy         Ctrl+C  │
│ Paste        Ctrl+V  │
│ Duplicate    Ctrl+D  │
│ ─────────────────    │
│ Bring to Front       │
│ Send to Back         │
│ ─────────────────    │
│ Align  ▸            │
│ ─────────────────    │
│ Delete       Del     │
└──────────────────────┘
```

**Click derecho en canvas vacio:**
```
┌──────────────────────┐
│ Paste        Ctrl+V  │
│ ─────────────────    │
│ Add Shape    ▸       │
│ Add BPMN     ▸       │
│ ─────────────────    │
│ Zoom to Fit          │
│ Reset View           │
│ ─────────────────    │
│ Toggle Grid          │
│ Canvas Settings  ▸   │
└──────────────────────┘
```

**Click derecho en edge:**
```
┌──────────────────────┐
│ Edit Label           │
│ Change Flow Type ▸   │
│ Add Bend Point       │
│ Reset Path           │
│ ─────────────────    │
│ Delete       Del     │
└──────────────────────┘
```

---

## Prioridades de Implementacion

### Alta Prioridad (impacto inmediato)
| # | Mejora | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | Toolbar segmentado con dropdowns | Medio | Alto |
| 6a | Toast notifications | Bajo | Alto |
| 8 | Consistencia de idioma | Bajo | Medio |
| 10d | Tokens de color CSS unificados | Bajo | Medio |

### Media Prioridad (siguiente iteracion)
| # | Mejora | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 2 | Sistema de iconografia | Medio | Alto |
| 4 | Rediseño del inspector | Medio | Alto |
| 5a | Smart guides | Alto | Alto |
| 12 | Context menu | Medio | Alto |

### Baja Prioridad (mejoras incrementales)
| # | Mejora | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 3c | Favoritos en paleta | Bajo | Medio |
| 5d | Background grid mejorado | Bajo | Bajo |
| 6c | Animaciones suaves | Bajo | Medio |
| 7 | Minimap mejorado | Medio | Bajo |
| 9 | Accesibilidad | Alto | Medio |
| 11 | Panel de atajos | Bajo | Bajo |

---

## Resumen Ejecutivo

La aplicacion Diagram Builder tiene una base funcional solida con un conjunto completo de features. Las principales areas de mejora visual y de UX se centran en:

1. **Reducir la complejidad visual del toolbar** (agrupacion, iconos, dropdowns)
2. **Mejorar el feedback** al usuario (toasts, cursores, animaciones)
3. **Consistencia visual** (tokens CSS, idioma, sombras, espaciados)
4. **Productividad** (context menu, smart guides, atajos descubribles)
5. **Accesibilidad** (aria labels, roles semanticos, contraste)

Estas mejoras mantienen toda la funcionalidad actual pero la hacen mas accesible, descubrible y profesional visualmente.
