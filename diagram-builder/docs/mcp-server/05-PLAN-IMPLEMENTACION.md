# 5. Plan de Implementacion

## 5.1 Fases

### Fase 1 — Scaffolding y Engine (1-2 dias)

| Tarea | Descripcion |
|-------|-------------|
| 1.1 | Crear directorio `mcp-server/` con `package.json` y `tsconfig.json` |
| 1.2 | Instalar dependencias: `@modelcontextprotocol/sdk`, `zod`, `uuid` |
| 1.3 | Copiar tipos de `diagram.model.ts` adaptados (sin deps Angular) |
| 1.4 | Implementar `DiagramEngine` con operaciones CRUD de nodos y edges |
| 1.5 | Implementar historial undo/redo en el engine |
| 1.6 | Implementar alineacion y distribucion |
| 1.7 | Tests unitarios del engine |

**Entregable**: Engine funcional que pasa tests de CRUD + undo/redo.

---

### Fase 2 — MCP Server Basico (1 dia)

| Tarea | Descripcion |
|-------|-------------|
| 2.1 | Crear `index.ts` con McpServer + StdioServerTransport |
| 2.2 | Registrar tools de nodos: `create_node`, `update_node`, `delete_node`, `list_nodes` |
| 2.3 | Registrar tools de edges: `create_edge`, `update_edge`, `delete_edge`, `list_edges` |
| 2.4 | Registrar tools de historial: `undo`, `redo` |
| 2.5 | Registrar resources: `diagram://shapes`, `diagram://flow-types`, `diagram://current` |
| 2.6 | Validar con MCP Inspector (`npx @modelcontextprotocol/inspector`) |

**Entregable**: Servidor MCP funcional que responde a tools basicos.

---

### Fase 3 — Tools Avanzados (1-2 dias)

| Tarea | Descripcion |
|-------|-------------|
| 3.1 | Implementar `export_diagram` (json, html, svg) — adaptar HtmlExportService |
| 3.2 | Implementar `import_diagram` y `clear_diagram` |
| 3.3 | Implementar `align_nodes` y `distribute_nodes` |
| 3.4 | Implementar `auto_layout` (layout automatico left-to-right / top-to-bottom) |
| 3.5 | Implementar `create_bpmn_process` (batch tool de alto nivel) |
| 3.6 | Registrar prompts: `create-process`, `explain-diagram` |

**Entregable**: API MCP completa con 15+ tools.

---

### Fase 4 — Integracion y Testing (1 dia)

| Tarea | Descripcion |
|-------|-------------|
| 4.1 | Configurar en Claude Desktop (`claude_desktop_config.json`) |
| 4.2 | Test end-to-end: crear proceso BPMN completo via Claude |
| 4.3 | Test: exportar diagrama como SVG via Claude |
| 4.4 | Test: importar JSON existente, modificar y re-exportar |
| 4.5 | Documentar configuracion y uso |

**Entregable**: MCP Server funcionando en Claude Desktop.

---

### Fase 5 — Sync con Angular (opcional, futuro)

| Tarea | Descripcion |
|-------|-------------|
| 5.1 | Agregar WebSocket server al MCP server |
| 5.2 | Agregar WebSocket client a la app Angular |
| 5.3 | Sincronizar estado bidireccional |
| 5.4 | Reflejar cambios del LLM en el canvas en tiempo real |

**Entregable**: Edicion colaborativa humano + IA en tiempo real.

---

## 5.2 Esfuerzo Estimado

| Fase | Dias | Complejidad |
|------|------|-------------|
| Fase 1 — Engine | 1-2 | Media |
| Fase 2 — MCP Basico | 1 | Baja |
| Fase 3 — Tools Avanzados | 1-2 | Media-Alta |
| Fase 4 — Integracion | 1 | Baja |
| **Total Fases 1-4** | **4-6** | |
| Fase 5 — Sync (opcional) | 2-3 | Alta |

---

## 5.3 Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| Export HTML/SVG requiere DomSanitizer | Medio | Usar strings directamente sin sanitizar (el MCP server no renderiza en browser) |
| Shapes SVG usan funciones puras | Bajo | Copiar directamente `basic.shapes.ts` y `bpmn.shapes.ts` |
| Complejidad del routing de edges | Medio | Copiar `routePoints()` del exporter o usar puntos simples al inicio |
| Estado volatil (se pierde al cerrar) | Bajo | Agregar auto-save a archivo JSON |
| Compatibilidad de modelos v1/v2 | Bajo | Copiar `diagram-migrations.ts` (funciones puras) |

---

## 5.4 Comandos de Setup Rapido

```bash
# 1. Crear el proyecto
cd diagram-builder
mkdir -p mcp-server/src/{engine,tools,resources,prompts,shared}

# 2. Inicializar
cd mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod uuid
npm install -D @types/node @types/uuid typescript tsx

# 3. Configurar TypeScript
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
EOF

# 4. Build y test
npm run build
npx @modelcontextprotocol/inspector node build/index.js

# 5. Configurar en Claude Desktop
# Agregar a ~/Library/Application Support/Claude/claude_desktop_config.json:
# {
#   "mcpServers": {
#     "diagram-builder": {
#       "command": "node",
#       "args": ["/path/to/diagram-builder/mcp-server/build/index.js"]
#     }
#   }
# }
```

---

## 5.5 Indice de Documentacion

| # | Archivo | Contenido |
|---|---------|-----------|
| 1 | [01-CONCEPTO-MCP.md](./01-CONCEPTO-MCP.md) | Que es MCP, por que convertir la app, arquitectura |
| 2 | [02-DISEÑO-API.md](./02-DISEÑO-API.md) | Diseño completo de Tools, Resources y Prompts |
| 3 | [03-ARQUITECTURA-TECNICA.md](./03-ARQUITECTURA-TECNICA.md) | Estructura del proyecto, reutilizacion de codigo, transporte |
| 4 | [04-IMPLEMENTACION-EJEMPLO.md](./04-IMPLEMENTACION-EJEMPLO.md) | Codigo de ejemplo completo: Engine, Tools, Resources, Prompts |
| 5 | [05-PLAN-IMPLEMENTACION.md](./05-PLAN-IMPLEMENTACION.md) | Fases, esfuerzo, riesgos, setup rapido |
