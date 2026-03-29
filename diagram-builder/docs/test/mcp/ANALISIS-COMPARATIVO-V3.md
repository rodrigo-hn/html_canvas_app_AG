# Analisis Comparativo: v3 Original vs v3 Editado

## Archivos comparados

| Version | JSON | HTML |
|---------|------|------|
| Original (MCP auto-layout) | `gestion_pedidos_bpmn_v3_con_stock.json` | `gestion_pedidos_bpmn_v3_con_stock.html` |
| Editado (ajuste manual) | `gestion_pedidos_bpmn_v3_con_stock_editado.json` | `gestion_pedidos_bpmn_v3_con_stock_editado.html` |

---

## 1. Diferencias Estructurales

| Aspecto | Original | Editado | Delta |
|---------|----------|---------|-------|
| Nodos | 26 | 26 | Sin cambios |
| Edges | 28 | 28 | Sin cambios |
| Textos | — | — | Sin cambios |
| Nodos reposicionados | — | 23 de 26 | 88% movidos |
| Edges con puertos cambiados | — | 9 de 28 | 32% reasignados |
| Nodos redimensionados | — | 0 | Sin cambios |

**Conclusion:** La estructura logica del proceso es identica. Solo cambia la disposicion espacial y los puertos de conexion.

---

## 2. Cambios de Posicion por Nodo

| Nodo | Pos Original | Pos Editada | Cambio |
|------|-------------|-------------|--------|
| Pedido Recibido | (80, 80) | (79, 90) | Ajuste menor |
| 1. Registrar Pedido | sin cambio | sin cambio | — |
| 2. Validar Datos del Cliente | sin cambio | sin cambio | — |
| Cliente Valido? (gateway) | sin cambio | sin cambio | — |
| Rechazar Pedido | (820, 200) | (820, 240) | Bajado 40px |
| Notificar Rechazo | (1060, 200) | (1040, 240) | Bajado 40px |
| Pedido Rechazado (end) | (1300, 200) | (1303, 250) | Bajado 50px |
| 3. Verificar Stock | (820, 80) | (828, 80) | Ajuste menor |
| Stock Disponible? (gateway) | (1060, 80) | (1120, 80) | Derecha 60px |
| **Gestionar Backorder** | **(1300, 200)** | **(1260, -140)** | **Subido 340px (de abajo a arriba)** |
| **Notificar Espera al Cliente** | **(1540, 200)** | **(1540, -140)** | **Subido 340px** |
| 4. Calcular Precio y Descuentos | (1780, 80) | (1534, 80) | Izquierda 246px |
| 5. Procesar Pago | (2260, 80) | (1863, 79) | Izquierda 397px |
| **Pago Aprobado? (gateway)** | **(1780, 80)** | **(2162, 75)** | **Derecha 382px (desuperposicion)** |
| Solicitar Nuevo Metodo de Pago | (2020, 200) | (2112, 243) | Derecha + abajo |
| 6. Generar Factura | (2020, 80) | (2366, 75) | Derecha 346px |
| 7. Preparar Paquete | (2880, 80) | (2628, 75) | Izquierda 252px |
| 8. Control de Calidad | (2500, 80) | (2858, 75) | Derecha 358px |
| **Pasa QA? (gateway)** | **(2740, 80)** | **(2908, 238)** | **Bajado 158px (sacado del flujo principal)** |
| 9. Actualizar Stock | (2880, 80) | (3139, 80) | Derecha 259px |
| 10-14 (flujo final) | X: 3120-4320 | X: 3387-4598 | Desplazados ~250px derecha |
| Pedido Completado (end) | (4320, 80) | (4598, 90) | Derecha 278px |

---

## 3. Cambios de Puertos en Edges

| Edge | Puerto Original | Puerto Editado | Mejora |
|------|----------------|----------------|--------|
| Cliente Valido? → Rechazar Pedido | right → left | **bottom → left** | Bifurcacion vertical clara |
| Stock Disponible? → Gestionar Backorder | right → left | **top → left** | Rama sube en vez de bajar |
| Pago Aprobado? → Solicitar Nuevo Metodo | right → left | **bottom → top** | Rama alternativa hacia abajo |
| Solicitar Nuevo Metodo → Procesar Pago | right → left | **right → bottom** | Loop entra por abajo |
| Procesar Pago → Pago Aprobado? | bottom → bottom | **right → bottom** | Conexion directa lateral |
| Preparar Paquete → Control de Calidad | bottom → bottom | **right → left** | Flujo horizontal restaurado |
| Control de Calidad → Pasa QA? | right → left | **bottom → top** | Gateway abajo del flujo |
| Pasa QA? → Preparar Paquete | right → left | **right → bottom** | Loop claro |
| Notificar Espera → Calcular Precio | right → left | **right → top** | Re-ingreso desde arriba |

---

## 4. Analisis Visual Comparativo

### Niveles Verticales

**Original (2 niveles):**
```
Y=80   ─── Flujo principal + backorder + loops ───
Y=200  ─── Rechazo + alternativas ─────────────────
```

**Editado (3 niveles):**
```
Y=-140 ─── Backorder / Reintento (rama arriba) ────
Y=80   ─── Flujo principal ────────────────────────
Y=240  ─── Rechazo / Error (rama abajo) ───────────
```

El editado usa **3 niveles semanticos** que comunican:
- **Arriba:** Espera / Reintento / Backorder (temporal, vuelve al flujo)
- **Centro:** Flujo principal (happy path)
- **Abajo:** Error / Rechazo (termina el proceso)

### Superposiciones

| Zona | Original | Editado |
|------|----------|---------|
| Gateway "Pago Aprobado?" + "Calcular Precio" | **Superpuestos** (ambos en X=1780) | Separados (X=1534 vs X=2162) |
| End "Pedido Rechazado" + "Gestionar Backorder" | Ambos en Y=200, misma fila | Separados (Y=250 vs Y=-140) |
| Gateway "Pasa QA?" | En linea con flujo principal | Bajado a Y=238 (sub-flujo visual) |

### Routing de Edges

| Tipo de Edge | Original | Editado |
|-------------|----------|---------|
| Bifurcacion gateway | Sale por `right` (horizontal) | Sale por `bottom` o `top` (vertical) |
| Loop / retry | bottom → bottom (por debajo) | right → bottom (lateral descendente) |
| Re-ingreso al flujo | right → left (horizontal) | right → top (descendente desde arriba) |
| Flujo principal | right → left (correcto) | right → left (sin cambios) |

---

## 5. Evaluacion de Legibilidad

| Criterio | Original (1-5) | Editado (1-5) | Notas |
|----------|:-:|:-:|-------|
| Flujo principal identificable | 4 | 5 | Editado: linea central limpia |
| Bifurcaciones claras | 3 | 5 | Editado: direccion vertical comunica semantica |
| Loops comprensibles | 3 | 4 | Editado: routing lateral mas intuitivo |
| Sin superposiciones | 2 | 5 | Original: gateway superpuesto |
| Uso del espacio | 3 | 4 | Editado: 3 niveles Y, mas anchura |
| Coherencia visual | 3 | 5 | Editado: arriba=retry, centro=main, abajo=error |
| **Promedio** | **3.0** | **4.7** | |

---

## 6. Propuesta de Mejoras al Auto-Layout

Basado en las decisiones manuales del editado, el `layoutBpmn()` deberia implementar:

### 6.1 Sistema de 3 Niveles Semanticos

```
Nivel -1 (arriba): Ramas de espera, retry, backorder
Nivel  0 (centro): Flujo principal (happy path)
Nivel +1 (abajo):  Ramas de error, rechazo, terminacion alternativa
```

**Logica de asignacion:**

Para cada gateway con 2+ edges salientes, clasificar las ramas:

```typescript
function classifyBranch(edge: DiagramEdge, targetNode: DiagramNode): 'main' | 'retry' | 'error' {
  const label = (edge.label || '').toLowerCase();
  const targetText = (targetNode.data?.text || '').toLowerCase();

  // Rama principal: "Si", "Yes", "Aprobado", primer connectTo
  if (label === 'sí' || label === 'si' || label === 'yes') return 'main';

  // Rama de error: "No" + target contiene "rechaz", "cancel", "error"
  if (targetText.includes('rechaz') || targetText.includes('cancel') || targetText.includes('error'))
    return 'error';

  // Rama de retry: target contiene "backorder", "espera", "nuevo metodo", "reintentar"
  if (targetText.includes('backorder') || targetText.includes('espera') || targetText.includes('nuevo'))
    return 'retry';

  // Default: ramas "No" van a error
  if (label === 'no') return 'error';

  return 'main';
}
```

**Asignacion de Y por nivel:**

```typescript
const LEVEL_OFFSET = 180; // px entre niveles

switch (branchType) {
  case 'main':  targetY = flowCenterY;                    break;
  case 'retry': targetY = flowCenterY - LEVEL_OFFSET;     break; // arriba
  case 'error': targetY = flowCenterY + LEVEL_OFFSET;     break; // abajo
}
```

### 6.2 Deteccion de Convergencia

Cuando una rama alternativa se reconecta al flujo principal (ej. "Notificar Espera" → "Calcular Precio"), detectar que:

1. El nodo destino ya esta en el flujo principal (nivel 0)
2. El nodo origen esta en nivel -1 o +1
3. Asignar puertos: desde nivel -1 usar `right → top`, desde nivel +1 usar `right → bottom`

### 6.3 Anti-Superposicion

Despues de asignar posiciones, verificar pares de nodos con overlap:

```typescript
function hasOverlap(a: DiagramNode, b: DiagramNode, margin: number = 20): boolean {
  return a.x < b.x + b.width + margin &&
         a.x + a.width + margin > b.x &&
         a.y < b.y + b.height + margin &&
         a.y + a.height + margin > b.y;
}
```

Si hay overlap, desplazar el nodo con mayor X hacia la derecha hasta eliminar la colision.

### 6.4 Puertos Semanticos por Tipo de Rama

| Tipo de rama | Puerto fuente | Puerto destino |
|-------------|---------------|----------------|
| Flujo principal (→) | right | left |
| Error / rechazo (↓) | bottom | left o top |
| Retry / backorder (↑) | top | left |
| Loop de vuelta (←↓) | right | bottom |
| Re-ingreso al flujo (↑→) | right | top |

### 6.5 Gateway como Sub-Flujo

Cuando un gateway tiene un loop de vuelta (ej. QA → Preparar Paquete → QA), posicionar el gateway **debajo** del flujo principal:

```typescript
if (hasLoopBack(gatewayId)) {
  gatewayNode.y = flowCenterY + LEVEL_OFFSET; // Baja del flujo
}
```

Esto comunica visualmente que el gateway es un "checkpoint" que puede repetirse.

---

## 7. Componentes a Modificar

| Archivo | Cambio | Prioridad |
|---------|--------|-----------|
| `diagram-engine.ts` → `layoutBpmn()` | Implementar 3 niveles semanticos | Alta |
| `diagram-engine.ts` → `layoutBpmn()` | Agregar `classifyBranch()` | Alta |
| `diagram-engine.ts` → `layoutBpmn()` | Agregar anti-superposicion | Media |
| `diagram-engine.ts` → `selectPorts()` | Usar puertos semanticos por tipo de rama | Media |
| `diagram-engine.ts` → `layoutBpmn()` | Detectar gateways con loop y posicionar abajo | Baja |

---

## 8. Resumen

La version editada manualmente demuestra que un layout BPMN legible requiere **comprension semantica** del proceso, no solo ordenamiento topologico. Las 3 mejoras mas impactantes son:

1. **3 niveles Y** (retry arriba, principal centro, error abajo) — comunica la naturaleza de cada rama
2. **Puertos direccionales** (bottom para error, top para retry) — refuerza la semantica visual
3. **Anti-superposicion** — elimina colisiones que confunden la lectura

Implementar estas mejoras haria que el auto-layout del MCP server genere diagramas con la misma calidad visual que el ajuste manual.
