# 3. Arquitectura Tecnica del MCP Server

## 3.1 Estructura del Proyecto

```
diagram-builder/
├── src/app/                          ← Angular app (frontend existente)
│   ├── core/models/                  ← Modelos compartidos
│   ├── core/services/                ← Logica de negocio
│   └── ...
│
└── mcp-server/                       ← NUEVO: MCP Server (Node.js)
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts                  ← Entry point + transport
    │   ├── server.ts                 ← Registro de tools/resources/prompts
    │   ├── engine/
    │   │   ├── diagram-engine.ts     ← Motor headless (sin Angular)
    │   │   ├── node-factory.ts       ← Creacion de nodos con defaults
    │   │   └── auto-layout.ts        ← Algoritmo de layout automatico
    │   ├── tools/
    │   │   ├── node-tools.ts         ← create/update/delete/list nodes
    │   │   ├── edge-tools.ts         ← create/update/delete/list edges
    │   │   ├── layout-tools.ts       ← align/distribute/auto-layout
    │   │   ├── export-tools.ts       ← export/import/get/clear diagram
    │   │   ├── history-tools.ts      ← undo/redo
    │   │   └── batch-tools.ts        ← create_bpmn_process
    │   ├── resources/
    │   │   └── diagram-resources.ts  ← shapes, schema, flow-types, current
    │   ├── prompts/
    │   │   └── diagram-prompts.ts    ← create-process, optimize, explain
    │   └── shared/
    │       ├── types.ts              ← Re-export de modelos del core
    │       └── id-generator.ts       ← UUID generator
    └── build/                        ← Output compilado
```

---

## 3.2 Estrategia de Reutilizacion de Codigo

### Problema

La logica de negocio vive en servicios Angular (`DiagramCommands`, `DiagramStore`, `HtmlExportService`) que dependen de:
- Angular DI (`@Injectable`, `inject()`)
- Angular Signals (`signal()`, `computed()`)
- `DomSanitizer` (para SVG)

Estos **no pueden ejecutarse directamente** en un entorno Node.js puro.

### Solucion: DiagramEngine (Motor Headless)

Crear un `DiagramEngine` que reimplemente la logica de negocio sin dependencias de Angular:

```typescript
// mcp-server/src/engine/diagram-engine.ts

import type { DiagramModel, DiagramNode, DiagramEdge, Point } from './types';

export class DiagramEngine {
  private model: DiagramModel = { modelVersion: 2, nodes: [], edges: [] };
  private historyPast: DiagramModel[] = [];
  private historyFuture: DiagramModel[] = [];
  private readonly MAX_HISTORY = 120;

  // --- State ---
  getModel(): DiagramModel { return this.model; }
  getNodes(): DiagramNode[] { return this.model.nodes; }
  getEdges(): DiagramEdge[] { return this.model.edges; }

  // --- Node Operations ---
  addNode(node: DiagramNode): void { ... }
  updateNode(id: string, changes: Partial<DiagramNode>): void { ... }
  removeNode(id: string): void { ... }

  // --- Edge Operations ---
  addEdge(edge: DiagramEdge): void { ... }
  updateEdge(id: string, changes: Partial<DiagramEdge>): void { ... }
  removeEdge(id: string): void { ... }

  // --- Layout ---
  alignNodes(ids: string[], mode: AlignMode): void { ... }
  distributeNodes(ids: string[], axis: 'horizontal' | 'vertical'): void { ... }

  // --- History ---
  private pushHistory(): void { ... }
  undo(): boolean { ... }
  redo(): boolean { ... }

  // --- Import/Export ---
  loadFromJson(json: string): void { ... }
  exportJson(): string { ... }
  exportHtml(): string { ... }
  exportSvg(): string { ... }
  clear(): void { ... }
}
```

### Que se reutiliza vs que se reimplementa

| Modulo | Reutilizacion | Estrategia |
|--------|--------------|-----------|
| `diagram.model.ts` | **Copiar tipos** | Los interfaces son puros TS, sin deps Angular |
| `diagram-schema.ts` | **Copiar constantes** | Solo constantes y tipos |
| `diagram-migrations.ts` | **Copiar funciones** | Funciones puras sin deps Angular |
| `diagram-commands.service.ts` | **Reimplementar** | Quitar Angular DI, usar clase plana |
| `diagram-store.service.ts` | **Simplificar** | Reemplazar signals con propiedades planas |
| `html-exporter.service.ts` | **Adaptar** | Quitar DomSanitizer, output string directamente |
| `edge-style.mapper.ts` | **Copiar directo** | Funciones puras, zero deps |
| `stencil.service.ts` | **Adaptar** | Quitar DomSanitizer, retornar string |
| `basic.shapes.ts` | **Copiar directo** | Funciones puras |
| `bpmn.shapes.ts` | **Copiar directo** | Funciones puras |
| `bpmn-visual-tokens.ts` | **Copiar directo** | Solo constantes |

---

## 3.3 Dependencias del MCP Server

### package.json

```json
{
  "name": "diagram-builder-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "diagram-builder-mcp": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector node build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.28.0",
    "zod": "^3.23.0",
    "uuid": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/uuid": "^10.0.0",
    "typescript": "~5.9.0",
    "tsx": "^4.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

---

## 3.4 Transporte

### Opcion A: stdio (recomendado para empezar)

```typescript
// mcp-server/src/index.ts
#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DiagramEngine } from "./engine/diagram-engine.js";
import { registerNodeTools } from "./tools/node-tools.js";
import { registerEdgeTools } from "./tools/edge-tools.js";
import { registerLayoutTools } from "./tools/layout-tools.js";
import { registerExportTools } from "./tools/export-tools.js";
import { registerHistoryTools } from "./tools/history-tools.js";
import { registerBatchTools } from "./tools/batch-tools.js";
import { registerResources } from "./resources/diagram-resources.js";
import { registerPrompts } from "./prompts/diagram-prompts.js";

const server = new McpServer({
  name: "diagram-builder",
  version: "1.0.0",
});

const engine = new DiagramEngine();

// Register all primitives
registerNodeTools(server, engine);
registerEdgeTools(server, engine);
registerLayoutTools(server, engine);
registerExportTools(server, engine);
registerHistoryTools(server, engine);
registerBatchTools(server, engine);
registerResources(server, engine);
registerPrompts(server);

// Start
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Diagram Builder MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```

### Opcion B: Streamable HTTP (para uso remoto)

Para exponer el servidor en red (ej. integrar con la app Angular en tiempo real):

```typescript
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3001, () => {
  console.error("MCP Server listening on http://localhost:3001/mcp");
});
```

---

## 3.5 Configuracion en Claude Desktop

### claude_desktop_config.json

```json
{
  "mcpServers": {
    "diagram-builder": {
      "command": "node",
      "args": ["/absolute/path/to/diagram-builder/mcp-server/build/index.js"]
    }
  }
}
```

### Con npx (si se publica como paquete npm)

```json
{
  "mcpServers": {
    "diagram-builder": {
      "command": "npx",
      "args": ["-y", "diagram-builder-mcp-server"]
    }
  }
}
```

---

## 3.6 Flujo de Datos

### Ejemplo: "Crea un proceso con 3 tareas"

```
1. Usuario → Claude: "Crea un proceso BPMN de 3 tareas para onboarding"

2. Claude (LLM) decide invocar tool:
   → tools/call: create_bpmn_process
   {
     "name": "Employee Onboarding",
     "steps": [
       { "id": "start", "type": "start", "label": "Start", "connectTo": [{"targetId": "t1"}] },
       { "id": "t1", "type": "user-task", "label": "Complete Forms", "connectTo": [{"targetId": "t2"}] },
       { "id": "t2", "type": "service-task", "label": "Setup Accounts", "connectTo": [{"targetId": "t3"}] },
       { "id": "t3", "type": "user-task", "label": "Orientation", "connectTo": [{"targetId": "end"}] },
       { "id": "end", "type": "end", "label": "End" }
     ],
     "direction": "left-to-right"
   }

3. MCP Server:
   → DiagramEngine.clear()
   → DiagramEngine.addNode(...) × 5
   → DiagramEngine.addEdge(...) × 4
   → Calcula posiciones automaticas

4. MCP Server responde:
   {
     "content": [{
       "type": "text",
       "text": "Created BPMN process 'Employee Onboarding' with 5 nodes and 4 edges"
     }]
   }

5. Claude → Usuario: "He creado el proceso de onboarding con 5 nodos..."

6. Usuario puede continuar:
   → "Exporta como SVG" → tools/call: export_diagram { format: "svg" }
   → "Agrega una compuerta" → tools/call: create_node + create_edge
```

---

## 3.7 Estado y Persistencia

### Estado en memoria

El MCP Server mantiene el `DiagramEngine` en memoria durante toda la sesion. Cada herramienta opera sobre el mismo estado compartido.

### Persistencia opcional

```typescript
// Auto-save a archivo cada vez que el modelo cambia
engine.onModelChange((model) => {
  fs.writeFileSync('diagram-state.json', JSON.stringify(model, null, 2));
});

// Restaurar al iniciar
if (fs.existsSync('diagram-state.json')) {
  engine.loadFromJson(fs.readFileSync('diagram-state.json', 'utf-8'));
}
```

### Integracion con la app Angular (opcional, fase futura)

El servidor MCP podria comunicarse con la app Angular via WebSocket o API REST para sincronizar el estado en tiempo real:

```
MCP Server ←→ WebSocket ←→ Angular App (canvas en browser)
```

Esto permitiria que los cambios hechos por el LLM se reflejen en la UI en vivo.
