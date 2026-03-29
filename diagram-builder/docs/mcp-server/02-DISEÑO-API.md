# 2. Diseño de la API MCP — Tools, Resources y Prompts

## 2.1 Tools (Herramientas invocables por el LLM)

### Grupo 1 — Node Management

#### `create_node`
Crea un nodo en el diagrama.
```json
{
  "name": "create_node",
  "description": "Create a new node in the diagram (shape or web component)",
  "inputSchema": {
    "type": { "type": "string", "enum": ["shape", "web-component"] },
    "shapeType": { "type": "string", "description": "Shape type (rectangle, bpmn-task, bpmn-gateway-exclusive, etc.)" },
    "componentType": { "type": "string", "description": "Web component type (bpmn-user-task-web, bpmn-start-event-web, etc.)" },
    "x": { "type": "number", "description": "X position" },
    "y": { "type": "number", "description": "Y position" },
    "width": { "type": "number", "default": 160 },
    "height": { "type": "number", "default": 80 },
    "text": { "type": "string", "description": "Text content of the node" },
    "variant": { "type": "string", "enum": ["blue", "yellow", "green", "purple", "red"] },
    "zIndex": { "type": "number", "default": 1 }
  },
  "required": ["type", "x", "y"]
}
```

#### `update_node`
Modifica propiedades de un nodo existente.
```json
{
  "name": "update_node",
  "inputSchema": {
    "nodeId": { "type": "string" },
    "changes": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" },
        "width": { "type": "number" },
        "height": { "type": "number" },
        "text": { "type": "string" },
        "variant": { "type": "string" },
        "zIndex": { "type": "number" }
      }
    }
  },
  "required": ["nodeId", "changes"]
}
```

#### `delete_node`
Elimina un nodo y todas sus conexiones.
```json
{
  "name": "delete_node",
  "inputSchema": {
    "nodeId": { "type": "string" }
  },
  "required": ["nodeId"]
}
```

#### `list_nodes`
Retorna todos los nodos del diagrama actual.
```json
{
  "name": "list_nodes",
  "description": "Get all nodes in the current diagram",
  "inputSchema": {}
}
```

---

### Grupo 2 — Edge Management

#### `create_edge`
Crea una conexion entre dos nodos.
```json
{
  "name": "create_edge",
  "inputSchema": {
    "sourceId": { "type": "string" },
    "targetId": { "type": "string" },
    "flowType": { "type": "string", "enum": ["sequence", "message", "association"], "default": "sequence" },
    "label": { "type": "string" },
    "sourcePort": { "type": "string", "enum": ["top", "right", "bottom", "left"] },
    "targetPort": { "type": "string", "enum": ["top", "right", "bottom", "left"] }
  },
  "required": ["sourceId", "targetId"]
}
```

#### `update_edge`
Modifica propiedades de una conexion.
```json
{
  "name": "update_edge",
  "inputSchema": {
    "edgeId": { "type": "string" },
    "changes": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "flowType": { "type": "string" },
        "color": { "type": "string" },
        "strokeWidth": { "type": "number" }
      }
    }
  },
  "required": ["edgeId", "changes"]
}
```

#### `delete_edge`
```json
{
  "name": "delete_edge",
  "inputSchema": { "edgeId": { "type": "string" } },
  "required": ["edgeId"]
}
```

#### `list_edges`
```json
{
  "name": "list_edges",
  "description": "Get all edges in the current diagram",
  "inputSchema": {}
}
```

---

### Grupo 3 — Layout & Alignment

#### `align_nodes`
```json
{
  "name": "align_nodes",
  "description": "Align selected nodes by edge or center",
  "inputSchema": {
    "nodeIds": { "type": "array", "items": { "type": "string" } },
    "mode": { "type": "string", "enum": ["left", "center", "right", "top", "middle", "bottom"] }
  },
  "required": ["nodeIds", "mode"]
}
```

#### `distribute_nodes`
```json
{
  "name": "distribute_nodes",
  "description": "Distribute nodes evenly along an axis",
  "inputSchema": {
    "nodeIds": { "type": "array", "items": { "type": "string" } },
    "axis": { "type": "string", "enum": ["horizontal", "vertical"] }
  },
  "required": ["nodeIds", "axis"]
}
```

#### `auto_layout`
```json
{
  "name": "auto_layout",
  "description": "Automatically arrange all nodes in a structured layout",
  "inputSchema": {
    "direction": { "type": "string", "enum": ["left-to-right", "top-to-bottom"], "default": "left-to-right" },
    "spacing": { "type": "number", "default": 60 }
  }
}
```

---

### Grupo 4 — Export & Import

#### `export_diagram`
```json
{
  "name": "export_diagram",
  "description": "Export the current diagram in the specified format",
  "inputSchema": {
    "format": { "type": "string", "enum": ["json", "html", "svg"] }
  },
  "required": ["format"]
}
```

Retorna:
- `json` → String JSON del DiagramModel
- `html` → String HTML standalone
- `svg` → String SVG

#### `import_diagram`
```json
{
  "name": "import_diagram",
  "description": "Load a diagram from JSON (replaces current diagram)",
  "inputSchema": {
    "json": { "type": "string", "description": "JSON string of DiagramModel" }
  },
  "required": ["json"]
}
```

#### `get_diagram`
```json
{
  "name": "get_diagram",
  "description": "Get the complete current diagram model as JSON",
  "inputSchema": {}
}
```

#### `clear_diagram`
```json
{
  "name": "clear_diagram",
  "description": "Remove all nodes and edges from the diagram",
  "inputSchema": {}
}
```

---

### Grupo 5 — History

#### `undo`
```json
{
  "name": "undo",
  "description": "Undo the last operation",
  "inputSchema": {}
}
```

#### `redo`
```json
{
  "name": "redo",
  "description": "Redo the last undone operation",
  "inputSchema": {}
}
```

---

### Grupo 6 — Batch Operations

#### `create_bpmn_process`
Tool de alto nivel para crear un proceso BPMN completo.
```json
{
  "name": "create_bpmn_process",
  "description": "Create a complete BPMN process from a step list. Automatically positions nodes and creates edges.",
  "inputSchema": {
    "name": { "type": "string", "description": "Process name" },
    "steps": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["start", "end", "user-task", "service-task", "manual-task", "subprocess", "exclusive-gateway"] },
          "label": { "type": "string" },
          "variant": { "type": "string" },
          "connectTo": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "targetId": { "type": "string" },
                "label": { "type": "string" },
                "flowType": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "direction": { "type": "string", "enum": ["left-to-right", "top-to-bottom"], "default": "left-to-right" }
  },
  "required": ["name", "steps"]
}
```

---

## 2.2 Resources (Datos de solo lectura)

### `diagram://shapes`
Lista todas las formas disponibles.
```json
{
  "uri": "diagram://shapes",
  "name": "Available Shapes",
  "description": "All shape types available in the diagram editor",
  "mimeType": "application/json"
}
```

Retorna:
```json
{
  "basic": ["rectangle", "rounded-rectangle", "document", "cylinder", "diamond"],
  "bpmn-tasks": ["bpmn-task", "bpmn-subprocess", "bpmn-call-activity", "bpmn-transaction", "bpmn-event-subprocess"],
  "bpmn-events": ["bpmn-start-event", "bpmn-end-event", "bpmn-intermediate-event", ...],
  "bpmn-gateways": ["bpmn-gateway", "bpmn-gateway-exclusive", "bpmn-gateway-inclusive", ...],
  "bpmn-organizational": ["bpmn-pool", "bpmn-lane", "bpmn-group"],
  "web-components": ["button", "input", "card"],
  "bpmn-web": ["bpmn-user-task-web", "bpmn-service-task-web", ...]
}
```

### `diagram://schema`
Esquema completo del modelo de datos.
```json
{
  "uri": "diagram://schema",
  "name": "Diagram Schema",
  "description": "TypeScript interfaces for DiagramModel, DiagramNode, DiagramEdge",
  "mimeType": "application/json"
}
```

### `diagram://flow-types`
Tipos de flujo disponibles con sus estilos.
```json
{
  "uri": "diagram://flow-types",
  "name": "Flow Types",
  "description": "Edge flow types with default styling (sequence, message, association)",
  "mimeType": "application/json"
}
```

### `diagram://current`
El diagrama actual completo.
```json
{
  "uri": "diagram://current",
  "name": "Current Diagram",
  "description": "The current diagram model with all nodes and edges",
  "mimeType": "application/json"
}
```

---

## 2.3 Prompts (Templates invocables por el usuario)

### `create-process`
```json
{
  "name": "create-process",
  "description": "Guide the user through creating a BPMN process",
  "arguments": [
    { "name": "domain", "description": "Business domain (e.g., sales, support, logistics)", "required": true },
    { "name": "complexity", "description": "Process complexity: simple (3-5 steps), medium (5-10), complex (10+)", "required": false }
  ]
}
```

### `optimize-layout`
```json
{
  "name": "optimize-layout",
  "description": "Analyze the current diagram and suggest layout improvements",
  "arguments": []
}
```

### `explain-diagram`
```json
{
  "name": "explain-diagram",
  "description": "Generate a human-readable description of the current diagram",
  "arguments": [
    { "name": "format", "description": "Output format: text, markdown, or bullet-points", "required": false }
  ]
}
```

---

## 2.4 Resumen de la API

| Categoria | Tools | Descripcion |
|-----------|-------|-------------|
| Nodes | `create_node`, `update_node`, `delete_node`, `list_nodes` | CRUD de nodos |
| Edges | `create_edge`, `update_edge`, `delete_edge`, `list_edges` | CRUD de conexiones |
| Layout | `align_nodes`, `distribute_nodes`, `auto_layout` | Alineacion y distribucion |
| Export | `export_diagram`, `import_diagram`, `get_diagram`, `clear_diagram` | E/S de diagramas |
| History | `undo`, `redo` | Deshacer/Rehacer |
| Batch | `create_bpmn_process` | Creacion de procesos completos |

| Categoria | Resources | URI |
|-----------|-----------|-----|
| Referencia | Shapes disponibles | `diagram://shapes` |
| Referencia | Schema del modelo | `diagram://schema` |
| Referencia | Tipos de flujo | `diagram://flow-types` |
| Live | Diagrama actual | `diagram://current` |

| Prompts | Descripcion |
|---------|-------------|
| `create-process` | Guia para crear proceso BPMN |
| `optimize-layout` | Sugerencias de layout |
| `explain-diagram` | Explicacion del diagrama |
