# 6. Plan de Mejoras — Layout de Gateways y Routing de Edges

## Problema General

Cuando el MCP server genera un proceso BPMN complejo con gateways (bifurcaciones), **todos los nodos se posicionan en una sola linea horizontal**, incluyendo las ramas "Si" y "No". Esto hace que:

1. Las bifurcaciones no se visualizan como ramas separadas
2. Los edges de retorno (loops) cruzan otros nodos
3. Los labels "Si"/"No" se superponen
4. No se distingue visualmente el flujo principal de las ramas alternativas

### Estado actual vs Estado deseado

**Actual:**
```
[Start] → [Task1] → [Gateway] → [TaskSi] → [TaskNo] → [End]
                        ↑ todo en una sola linea Y=200
```

**Deseado:**
```
                                  [TaskSi] ──→ [End]
                                ↗ Si
[Start] → [Task1] → [Gateway]
                                ↘ No
                                  [TaskNo] ──→ [End]
```

---

## Analisis de Causa Raiz

### 1. Batch Tool (`batch-tools.ts`) — Posicionamiento Lineal

**Codigo actual (lineas 65-91):**
```typescript
let offset = 80;
const crossCenter = 200;  // ← TODOS los nodos en Y=200

for (const step of steps) {
  const x = isHorizontal ? offset : crossCenter - mapping.w / 2;
  const y = isHorizontal ? crossCenter - mapping.h / 2 : offset;  // ← FIJO
  offset += (isHorizontal ? mapping.w : mapping.h) + spacing;
}
```

**Problema:** El algoritmo itera secuencialmente por el array de steps y asigna posiciones incrementales en el eje X, con Y fijo (`crossCenter = 200`). No tiene ninguna conciencia del grafo de conexiones.

**Impacto:** Todas las ramas del gateway (Si, No) se colocan en la misma linea horizontal.

---

### 2. Auto-Layout (`diagram-engine.ts`) — Sin Semantica de Branching

**Codigo actual (Kahn's Algorithm, lineas 246-316):**

El auto-layout usa ordenamiento topologico para crear "capas" (layers), pero:

- Trata **todos los edges por igual** — no distingue entre flujo principal y ramas condicionales
- Los nodos de ramas "Si" y "No" que tienen el mismo in-degree quedan en la **misma capa**
- Dentro de una capa, los nodos se apilan verticalmente sin separacion semantica
- No hay concepto de "rama principal" vs "rama alternativa"

**Ejemplo del problema:**

Para un gateway con:
- Si → ProcessPago (in-degree: 1)
- No → RechazarPedido (in-degree: 1)

Ambos tienen in-degree = 1, asi que entran en la misma capa y se apilan verticalmente, pero sin contexto de que son ramas alternativas de un mismo gateway.

---

### 3. Routing de Edges (`diagram-engine.ts`) — Sin Deteccion de Obstaculos

**Codigo actual (lineas 634-678):**

```typescript
const routeSimple = (s, e, sp, tp) => {
  const so = pushFromPort(s, sp, offset);   // 20px desde el puerto
  const ei = pushFromPort(e, tp, offset);   // 20px desde el puerto
  const mid = { x: ei.x, y: so.y };         // Punto L-shape
  return simplifyPoints([s, so, mid, ei, e]);
};
```

**Problemas:**

| Problema | Descripcion |
|----------|-------------|
| **Sin deteccion de colisiones** | Las lineas cruzan nodos intermedios |
| **L-shape fijo** | Siempre usa la misma estrategia: horizontal → vertical |
| **Offset de 20px hardcodeado** | Insuficiente para routing complejo |
| **Sin awareness del grafo** | No sabe donde estan otros nodos/edges |
| **Loops se solapan** | Edge derecha→izquierda cruza todos los nodos intermedios |

---

### 4. Puertos Fijos en Batch Tool

**Codigo actual (lineas 104-111):**
```typescript
engine.addEdge({
  sourcePort: isHorizontal ? "right" : "bottom",  // SIEMPRE right
  targetPort: isHorizontal ? "left" : "top",       // SIEMPRE left
});
```

**Problema:** Todos los edges usan `right → left`, incluyendo:
- Gateway "No" que deberia salir por `bottom` → target `top`
- Edges de retorno que deberian salir por `bottom` → target `top` o `left`

---

## Propuesta de Solucion

### Fase A — Layout Inteligente con Branching (Prioridad Alta)

#### A.1 Nuevo algoritmo `layoutBpmn()` en DiagramEngine

Crear un algoritmo de layout especifico para BPMN que entienda bifurcaciones:

```typescript
layoutBpmn(direction: 'left-to-right' | 'top-to-bottom', spacing: number): void
```

**Algoritmo propuesto:**

1. **Identificar nodos gateway** — son los que tienen `componentType` que contiene `gateway` o `shapeType` que contiene `gateway`
2. **Construir arbol de flujo** — BFS desde el start event
3. **Detectar bifurcaciones** — gateway con 2+ edges salientes
4. **Detectar convergencias** — nodos con 2+ edges entrantes
5. **Asignar "swim lanes" por rama:**
   - Rama principal (primer connectTo) → Y = centerY
   - Rama alternativa (segundo connectTo) → Y = centerY + branchOffset
   - Si hay 3+ ramas → distribuir verticalmente
6. **Posicionar nodos por rama:**
   - Cada rama es una sub-secuencia horizontal independiente
   - El nodo de convergencia se coloca al final de la rama mas larga
7. **Manejar loops:** Detectar edges que van "hacia atras" y posicionar con offset vertical

**Datos adicionales necesarios:**

Para determinar que edge es "Si" y cual es "No", usar el `label` del edge o el orden de `connectTo`:
- Primer `connectTo` → rama principal (mismo Y, sigue derecha)
- Segundo `connectTo` → rama alternativa (Y desplazado abajo)

#### A.2 Actualizar Batch Tool

Modificar `create_bpmn_process` para:

1. Llamar `engine.layoutBpmn()` en vez del posicionamiento manual lineal
2. Asignar puertos inteligentes segun la direccion de la rama:
   - Rama principal: `sourcePort: "right"` → `targetPort: "left"`
   - Rama abajo: `sourcePort: "bottom"` → `targetPort: "top"`
   - Convergencia: El nodo convergente recibe edges desde `left` y `top`

**Schema enriquecido (opcional):**

Agregar campo `branchDirection` al step schema:
```typescript
connectTo: [{
  targetId: string,
  label?: string,
  flowType?: string,
  branch?: 'main' | 'alternate'  // NUEVO
}]
```

---

### Fase B — Routing Mejorado de Edges (Prioridad Media)

#### B.1 Seleccion Inteligente de Puertos

Crear funcion `selectPorts(source, target)`:

```typescript
private selectPorts(source: DiagramNode, target: DiagramNode): { sourcePort: string, targetPort: string } {
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  // Target esta a la derecha
  if (dx > 0 && Math.abs(dx) > Math.abs(dy)) return { sourcePort: 'right', targetPort: 'left' };
  // Target esta abajo
  if (dy > 0 && Math.abs(dy) >= Math.abs(dx)) return { sourcePort: 'bottom', targetPort: 'top' };
  // Target esta a la izquierda (loop)
  if (dx < 0 && Math.abs(dx) > Math.abs(dy)) return { sourcePort: 'left', targetPort: 'right' };
  // Target esta arriba
  return { sourcePort: 'top', targetPort: 'bottom' };
}
```

#### B.2 Routing con Evitacion de Obstaculos

Mejorar `buildOrthogonalPoints()` para:

1. **Detectar nodos en el camino** — verificar si la ruta L-shape cruza algun nodo
2. **Generar ruta alternativa** — si hay colision, agregar waypoints para rodear el obstaculo
3. **Rutas de loop** — para edges derecha→izquierda, rutear por debajo/arriba de los nodos

```typescript
private routeWithAvoidance(start, end, sourcePort, targetPort): Point[] {
  const directRoute = this.routeSimple(start, end, sourcePort, targetPort);

  // Check if route crosses any node
  const collision = this.checkNodeCollisions(directRoute);
  if (!collision) return directRoute;

  // Route around obstacle
  const detourY = this.findClearY(start, end, collision);
  return [start, {x: start.x + 20, y: start.y}, {x: start.x + 20, y: detourY},
          {x: end.x - 20, y: detourY}, {x: end.x - 20, y: end.y}, end];
}
```

#### B.3 Offset Dinamico

Reemplazar el offset fijo de 20px con un offset proporcional:

```typescript
const offset = Math.max(20, spacing * 0.3);
```

---

### Fase C — Mejoras Visuales del Export (Prioridad Baja)

#### C.1 End Events Diferenciados

Actualmente ambos end events (rechazo y completado) usan el mismo estilo rosa/rojo. Agregar soporte para variantes:

- End event de **exito** (verde): `variant: "green"` en el data
- End event de **error/rechazo** (rojo): `variant: "red"` en el data
- End event **default** (rosa): sin variant

Modificar `renderEndEventHtml()` para leer `data.variant` y usar colores correspondientes.

#### C.2 Labels de Gateway en Edges

Cuando un edge sale de un gateway, posicionar el label ("Si"/"No") mas cerca del gateway para evitar que quede en el medio de una linea larga.

Modificar `polylineMidpoint()` para edges desde gateways:
```typescript
// Para edges desde gateway, posicionar label al 20% del path en vez del 50%
const labelRatio = isFromGateway ? 0.2 : 0.5;
```

#### C.3 Subprocess con Borde Diferenciado

El subprocess ya tiene el badge "+" pero visualmente se confunde con una tarea normal. Agregar:
- Borde mas grueso (3px en vez de 2px)
- Doble borde interior (como en BPMN spec)

---

## Componentes a Modificar

| Archivo | Cambios | Fase |
|---------|---------|------|
| `mcp-server/src/engine/diagram-engine.ts` | Nuevo metodo `layoutBpmn()`, mejorar `buildOrthogonalPoints()`, agregar `selectPorts()`, agregar `checkNodeCollisions()` | A, B |
| `mcp-server/src/tools/batch-tools.ts` | Reemplazar posicionamiento lineal con `layoutBpmn()`, puertos inteligentes | A |
| `mcp-server/src/engine/diagram-engine.ts` (export) | Diferenciar end events, label positioning, subprocess styling | C |
| `mcp-server/src/shared/types.ts` | Agregar `branch` al tipo de conexion (opcional) | A |

---

## Plan de Implementacion

### Fase A — Layout BPMN Inteligente

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| A.1 | Implementar deteccion de gateways y bifurcaciones en el grafo | Medio |
| A.2 | Implementar BFS para construir arbol de flujo con ramas | Medio |
| A.3 | Implementar posicionamiento por rama (main Y vs alternate Y+offset) | Medio |
| A.4 | Detectar nodos de convergencia y posicionarlos al final de la rama mas larga | Medio |
| A.5 | Actualizar batch-tools.ts para usar `layoutBpmn()` | Bajo |
| A.6 | Asignar puertos inteligentes (right/bottom segun rama) | Bajo |
| A.7 | Tests: proceso simple, proceso con 1 gateway, proceso con multiples gateways, proceso con loops | Medio |

**Esfuerzo total Fase A: 2-3 dias**

### Fase B — Routing Mejorado

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| B.1 | Implementar `selectPorts()` basado en posicion relativa | Bajo |
| B.2 | Implementar `checkNodeCollisions()` para detectar cruces | Medio |
| B.3 | Implementar routing alternativo con waypoints de evasion | Alto |
| B.4 | Manejar edges de loop (derecha→izquierda) con ruta por debajo | Medio |
| B.5 | Tests: edges rectos, edges con esquinas, edges con colision, loops | Medio |

**Esfuerzo total Fase B: 2-3 dias**

### Fase C — Mejoras Visuales

| Tarea | Descripcion | Esfuerzo |
|-------|-------------|----------|
| C.1 | End events con variante de color | Bajo |
| C.2 | Labels de gateway posicionados al 20% del path | Bajo |
| C.3 | Subprocess con borde diferenciado | Bajo |

**Esfuerzo total Fase C: 0.5 dias**

---

## Resultado Esperado

### Antes (actual):
```
[●] → [Registrar] → [Validar] → [◇ Valido?] → [Rechazar] → [Notificar] → [○ Rechazado] → [Stock] → ...
       (todo en una sola linea horizontal, edges cruzados)
```

### Despues (mejorado):
```
                                      No
[●] → [Registrar] → [Validar] → [◇ Valido?] ──→ [Rechazar] → [Notificar] → [○ Rechazado]
                                      │ Si
                                      ▼
                                  [Stock] → [◇ Disponible?] ──→ [Calcular] → [Pagar] → ...
                                                  │ No
                                                  ▼
                                            [Backorder] → [Notificar Espera] ──→ ↩
```

### Metricas de exito

| Metrica | Antes | Despues |
|---------|-------|---------|
| Ramas de gateway visibles | No | Si |
| Edges cruzan nodos | Si | No |
| Labels legibles | Parcial | Completo |
| Loops visibles | No (linea recta) | Si (ruta por debajo) |
| End events diferenciados | No | Si (verde/rojo) |
| Nodos en una sola linea | Si | No (multi-fila) |
