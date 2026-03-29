# 2. Catálogo Completo de Funcionalidades

## 2.1 Gestión del Canvas

### Zoom y Navegación
- **Zoom In/Out**: Botones `+` / `-` en la barra de herramientas o rueda del ratón (`wheel`)
- **Reset Zoom**: Click en el porcentaje mostrado (ej. `100%`) para reiniciar a zoom 1:1
- **Fit to Content**: Botón `Fit` que ajusta el zoom y posición para mostrar todos los nodos
- **Pan (Desplazamiento)**: Mantener `Espacio` + arrastrar para desplazar el canvas libremente
- **Minimap**: Widget SVG en la esquina inferior que muestra una vista general del diagrama con el viewport actual resaltado; click en el minimap navega al área seleccionada

### Presets de Página
- **Infinite**: Canvas infinito sin bordes definidos (modo por defecto)
- **A4**: 794 × 1123 px (proporciones estándar A4)
- **A3**: 1123 × 1587 px
- **16:9**: 1280 × 720 px (formato presentación)
- **Custom**: Dimensiones personalizadas con inputs de ancho y alto

### Frames (Marcos)
- **Add Frame**: Captura el viewport actual como un frame con nombre
- **Navegar a Frame**: Selector dropdown + botón `Go` para ir al frame seleccionado
- **Eliminar Frame**: Botón `Del` para eliminar el frame seleccionado
- Los frames se visualizan como rectángulos con borde discontinuo color esmeralda

---

## 2.2 Gestión de Nodos

### Añadir Nodos
- **Desde la paleta**: Click en un item de la paleta para añadir al canvas
- **Drag & Drop**: Arrastrar un item desde la paleta y soltarlo en la posición deseada del canvas
- **Posicionamiento automático**: Los nodos nuevos se colocan escalonados cuando se añaden por click

### Selección de Nodos
- **Click simple**: Selecciona un nodo individual
- **Ctrl/Cmd + Click**: Toggle de selección múltiple (añadir/quitar de la selección)
- **Marquee Selection**: Arrastrar sobre el canvas para crear un rectángulo de selección que selecciona todos los nodos contenidos
- **Selección aditiva**: Mantener Shift durante marquee selection para añadir a la selección existente
- **Click en fondo**: Deselecciona todos los elementos

### Edición de Nodos
- **Mover**: Arrastrar nodos seleccionados; soporte para mover múltiples nodos simultáneamente
- **Redimensionar**: 8 handles de redimensionamiento (esquinas + puntos medios) visibles al seleccionar un nodo
- **Editar texto**: Doble click en un nodo para entrar en modo de edición de texto inline
- **Eliminar**: Tecla `Delete` o `Backspace` para eliminar nodos seleccionados
- **Z-Order**: Controles en el inspector para cambiar el orden de apilamiento

### Snap to Grid
- **Toggle**: Checkbox `Snap` en la barra de herramientas
- **Tamaño de grid**: Input numérico configurable (mínimo 2px)
- **Visual**: Patrón de puntos visual cuando el grid está activo
- Los nodos se ajustan automáticamente a la cuadrícula más cercana al mover

---

## 2.3 Gestión de Conexiones (Edges)

### Crear Conexiones
- **Puertos de conexión**: Al pasar el mouse sobre un nodo aparecen 4 puertos (top, right, bottom, left)
- **Arrastrar desde puerto**: Click + drag desde un puerto de origen hasta un nodo de destino
- **Preview visual**: Línea de preview que sigue al cursor mientras se arrastra la conexión
- **Flow Type activo**: Modo de dibujo donde se puede seleccionar el tipo de flujo antes de conectar

### Tipos de Flujo (Flow Types)
| Tipo | Estilo Visual | Marcador Inicio | Marcador Final | Radio Esquinas |
|------|--------------|-----------------|----------------|----------------|
| **Sequence** | Línea sólida | Ninguno | Flecha cerrada | 8px |
| **Message** | Línea discontinua (`6 4`) | Círculo abierto | Flecha abierta | 6px |
| **Association** | Línea punteada (`3 4`) | Ninguno | Ninguno | 4px |

### Edición de Conexiones
- **Seleccionar edge**: Click sobre una conexión para seleccionarla
- **Editar label**: Campo de texto en el inspector para añadir etiquetas
- **Posición de label**: Toggle para posición manual con reset
- **Color**: Color picker + input hex con validación
- **Grosor de trazo**: Control numérico para `strokeWidth`
- **Esquinas redondeadas**: Toggle + input para radio de esquinas
- **Reset Bend**: Resetear puntos de inflexión a la ruta por defecto
- **Eliminar edge**: Botón en el inspector

---

## 2.4 Alineación y Distribución

### Herramientas de Alineación (multi-selección requerida)
- **Align Left** (`Alt+Shift+Left`): Alinear nodos al borde izquierdo
- **Align Top** (`Alt+Shift+Up`): Alinear nodos al borde superior

### Herramientas de Distribución
- **Distribute Horizontal** (`Alt+Shift+H`): Distribuir espacio horizontal uniformemente
- **Distribute Vertical** (`Alt+Shift+V`): Distribuir espacio vertical uniformemente

---

## 2.5 Exportación e Importación

### Formatos de Exportación
- **Export HTML**: Genera un archivo HTML standalone con Tailwind CSS embebido, nodos renderizados y estilos completos
- **Export SVG**: Genera un SVG con todas las formas, marcadores y edges
- **Export PNG**: Conversión asíncrona del diagrama a imagen PNG via Canvas API
- **Export JSON**: Exporta el modelo de datos completo (`DiagramModel`) como JSON

### Importación
- **Import JSON**: Abre un diálogo de archivo para cargar un diagrama previamente exportado
- **Migración automática**: Los archivos de versiones anteriores se migran automáticamente al formato actual (v2)

### Plantillas de Dominio
- **Ventas**: Proceso BPMN predefinido para flujo de ventas
- **Soporte**: Proceso BPMN para atención al cliente
- **Logística**: Proceso BPMN para cadena de suministro
- **Ejemplo inicial**: Se carga automáticamente `pizzeria-proceso-bpmn-default.json` al iniciar

---

## 2.6 Undo/Redo

- **Undo**: `Ctrl/Cmd+Z` o botón en toolbar — revierte la última operación
- **Redo**: `Ctrl/Cmd+Y` o `Ctrl/Cmd+Shift+Z` o botón en toolbar — re-aplica operación revertida
- **Historial**: Máximo 120 entradas de historial
- **Transacciones**: Operaciones complejas (como mover múltiples nodos) se agrupan en una sola entrada de historial
- Los botones se deshabilitan visualmente cuando no hay operaciones disponibles

---

## 2.7 Modos de Visualización

### Modo Presentación
- Oculta toda la interfaz de edición (toolbar, paleta, inspector)
- Muestra solo el diagrama renderizado
- Ideal para compartir o presentar diagramas

### Modo Focus
- Oculta la paleta de componentes y el inspector
- Mantiene la toolbar visible
- Permite edición concentrada sin distracciones de paneles laterales

### Contraste
- **Claro**: Bordes claros optimizados para fondos oscuros
- **Medio**: Contraste equilibrado (por defecto)
- **Alto**: Máximo contraste para tema oscuro

---

## 2.8 Persistencia

### Auto-save
- Toggle en la barra de herramientas
- Guarda automáticamente en `localStorage` a intervalos regulares
- Se restaura al recargar la página

### LocalStorage
- Persiste el estado completo del diagrama (nodos, edges)
- Persiste configuración de UI (paneles abiertos/cerrados, anchos, zoom, grid)

---

## 2.9 Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + Shift + Z` | Redo (alternativo) |
| `Delete` / `Backspace` | Eliminar selección |
| `Ctrl/Cmd + Up` | Subir z-order |
| `Ctrl/Cmd + Down` | Bajar z-order |
| `Alt + Shift + Left` | Alinear izquierda |
| `Alt + Shift + Up` | Alinear arriba |
| `Alt + Shift + H` | Distribuir horizontal |
| `Alt + Shift + V` | Distribuir vertical |
| `Espacio + Drag` | Pan del canvas |
| `Ctrl/Cmd + Click` | Toggle multi-selección |
| `P` | Toggle modo presentación |
