# 1. Que es MCP y Por Que Convertir Diagram Builder en un Servidor MCP

## 1.1 Model Context Protocol (MCP)

**MCP** (Model Context Protocol) es un estandar abierto creado por Anthropic — ahora gobernado por la Agentic AI Foundation bajo Linux Foundation — que define como las aplicaciones de IA (Claude, VS Code Copilot, Cursor, ChatGPT) se conectan a herramientas y fuentes de datos externas.

Es el **"USB-C de la IA"**: una interfaz estandarizada para que cualquier host de IA pueda conectarse a cualquier servidor MCP usando el mismo protocolo.

### Arquitectura

```
┌──────────────────────────────────────────┐
│              MCP Host                     │
│   (Claude Desktop, VS Code, Cursor)      │
│                                           │
│   ┌─────────────┐  ┌─────────────┐       │
│   │  MCP Client  │  │  MCP Client  │      │
│   └──────┬──────┘  └──────┬──────┘       │
└──────────┼─────────────────┼──────────────┘
           │ stdio/HTTP      │ stdio/HTTP
           ▼                 ▼
   ┌───────────────┐ ┌───────────────┐
   │  MCP Server A  │ │  MCP Server B  │
   │  (Filesystem)  │ │  (Diagram)     │
   └───────────────┘ └───────────────┘
```

### Protocolo

- **Capa de datos**: JSON-RPC 2.0
- **Capa de transporte**: stdio (local) o Streamable HTTP (remoto)
- **Version actual**: `2025-06-18`

### Los 3 Primitivos

| Primitivo | Controlado por | Descripcion |
|-----------|---------------|-------------|
| **Tools** | El modelo (LLM) | Funciones ejecutables que el LLM invoca: crear nodo, exportar, etc. |
| **Resources** | La aplicacion | Datos de solo lectura: esquemas, shapes disponibles, config |
| **Prompts** | El usuario | Templates reutilizables para interacciones estructuradas |

---

## 1.2 Por Que Diagram Builder como MCP Server

### Caso de uso

Convertir Diagram Builder en un servidor MCP permite que un agente de IA (Claude, Cursor, etc.) pueda:

1. **Crear diagramas BPMN programaticamente** — "Crea un proceso de onboarding con 5 tareas"
2. **Modificar diagramas existentes** — "Agrega una compuerta despues de la tarea 3"
3. **Exportar en multiples formatos** — "Exporta el diagrama como SVG"
4. **Consultar el estado** — "Cuantos nodos tiene el diagrama actual?"
5. **Aplicar layouts** — "Alinea todos los nodos a la izquierda"

### Ventajas

- **Automatizacion**: Generar diagramas complejos con una sola instruccion
- **Integracion**: Cualquier host MCP puede usar el servidor
- **Reutilizacion**: La logica de negocio existente (commands, store, exporter) se reutiliza directamente
- **Estandar abierto**: Compatible con Claude Desktop, VS Code, Cursor, y cualquier cliente MCP futuro

### Arquitectura propuesta

```
┌──────────────────┐
│  Claude Desktop   │
│  (MCP Host)       │
│  ┌──────────────┐ │
│  │  MCP Client   │ │
│  └──────┬───────┘ │
└─────────┼─────────┘
          │ stdio (JSON-RPC 2.0)
          ▼
┌───────────────────────────────────────┐
│  diagram-builder-mcp-server           │
│  (Node.js / TypeScript)               │
│                                       │
│  ┌─────────────┐  ┌────────────────┐  │
│  │ MCP Handler  │→│ DiagramEngine   │  │
│  │ (SDK)        │  │ (core logic)   │  │
│  └─────────────┘  └────────────────┘  │
│                    ┌────────────────┐  │
│                    │ HtmlExporter    │  │
│                    └────────────────┘  │
└───────────────────────────────────────┘
```

El servidor MCP envuelve la logica de negocio existente (modelos, commands, exporter) en una interfaz JSON-RPC accesible desde cualquier cliente MCP.
