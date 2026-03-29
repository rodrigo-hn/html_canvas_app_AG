# Analisis Comparativo Detallado: v4 Original vs v4 Editado

> Basado en 4 imagenes de puntos de interes proporcionadas por el usuario, mostrando
> las correcciones manuales realizadas en la app Angular sobre el JSON generado por el MCP server.

## Archivos comparados

| Version | JSON | HTML |
|---------|------|------|
| Original (MCP auto-layout) | `gestion_pedidos_bpmn_v4_con_rechazo.json` | `gestion_pedidos_bpmn_v4_con_rechazo.html` |
| Editado (ajuste manual) | `gestion_pedidos_bpmn_v4_con_rechazo_editado.json` | `gestion_pedidos_bpmn_v4_con_rechazo_editado.html` |

**Totales:** 34 nodos, 37 edges. **11 nodos movidos, 10 puertos cambiados.**

---

## Imagen 11 — Zona "Stock Disponible? / Backorder"

### Que muestra la imagen

La imagen del editado muestra el gateway "Stock Disponible?" con:
- Rama "Si" → derecha → "4. Calcular Precio y Descuentos"
- Rama "No" → **arriba** → "Gestionar Backorder" → "Notificar Espera al Cliente"
- Edge de retorno desde "Notificar Espera" que **baja verticalmente** y entra a "Calcular Precio" por el puerto `top`

### Diferencia con el original

| Elemento | Original (MCP) | Editado (manual) |
|----------|---------------|-----------------|
| Posiciones de nodos | **Sin cambios** — Backorder ya estaba en Y=20 (arriba), gateway en Y=200 | Identicas posiciones |
| Edge "Stock Disponible?" → "Backorder" | `right → top` | **`top → left`** |
| Edge "Notificar Espera" → "Calcular Precio" | `bottom → left` | **`right → top`** |

### Porque el usuario hizo este cambio

**Problema del original:** El edge del gateway a Backorder salia por la **derecha** (`right`) hacia un nodo que esta **arriba**. Esto genera un routing confuso — el edge va horizontal y luego sube, cruzando visualmente.

**Solucion del editado:** Cambiar a `top → left` — el edge **sale hacia arriba** directamente desde el gateway, luego gira a la izquierda hacia Backorder. Esto es mas natural: "No hay stock → sube a gestionar backorder".

**Problema del original (retorno):** "Notificar Espera" → "Calcular Precio" usaba `bottom → left` — el edge bajaba y luego iba a la izquierda, pero "Calcular Precio" esta **abajo y a la derecha**, no a la izquierda.

**Solucion del editado:** `right → top` — el edge sale a la derecha de "Notificar Espera", baja verticalmente y entra por el `top` de "Calcular Precio". Esto comunica visualmente **"la rama de espera se reincorpora al flujo principal desde arriba"**.

### Regla para el auto-layout

> **Cuando un gateway tiene una rama que va a un nivel superior (Y menor), el edge debe salir por `top`, no por `right`.**
> **Cuando un nodo de nivel superior reconecta al flujo principal, debe entrar por `top` del nodo destino.**

---

## Imagen 12 — Zona "Pago Aprobado? / Factura / QA"

### Que muestra la imagen

Esta es la zona mas compleja del diagrama. La imagen del editado muestra:

```
                [Solicitar Nuevo Metodo]  (nivel -1, arriba)
                     ↑ No    ↓ (loop a Procesar Pago)
[5. Procesar Pago] → [Pago Aprobado?]               [Pasa QA?] → Si → [9. Actualizar...]
                          ↓ Si         No ↗    ↑ (desde QC)
                   [6. Generar Factura] → [7. Preparar Paquete] → [8. Control Calidad]
                                          (nivel +1, sub-flujo abajo)
```

### Diferencias criticas con el original

| Nodo | Original | Editado | Cambio |
|------|----------|---------|--------|
| **Pago Aprobado?** | (1780, **310**) — **debajo** del flujo | (2268, **200**) — **en linea** con flujo | **Subido al flujo principal** |
| **5. Procesar Pago** | (2260, 200) | (2020, 200) | Movido a la izquierda (antes del gateway) |
| **6. Generar Factura** | (2020, **200**) — en linea | (2218, **420**) — **abajo** | **Bajado a sub-flujo** |
| **7. Preparar Paquete** | (5080, 200) — **muy lejos a la derecha** | (2444, **420**) — **abajo y cerca** | **Reubicado completamente** |
| **8. Control de Calidad** | (2500, 200) — en linea | (2670, **420**) — **abajo** | **Bajado a sub-flujo** |
| **Pasa QA?** | (2740, 200) — en linea | (2720, 200) — sin cambio significativo | Se mantiene |

### Cambios de puertos (6 edges modificados)

| Edge | Original | Editado | Motivo |
|------|----------|---------|--------|
| Procesar Pago → Pago Aprobado? | `bottom→bottom` (loop) | **`right→left`** (flujo directo) | Ya no es loop, estan en la misma linea |
| Pago Aprobado? → Generar Factura (Si) | `right→left` (horizontal) | **`bottom→top`** (vertical) | Factura esta abajo, el edge baja |
| Pago Aprobado? → Solicitar Nuevo Metodo (No) | `right→top` | **`top→top`** | Ambos arriba, edge sube directamente |
| Solicitar Nuevo Metodo → Procesar Pago | `bottom→left` | **`left→top`** | Loop baja por la izquierda y entra por arriba |
| Preparar Paquete → Control Calidad | `bottom→bottom` (loop) | **`right→left`** (flujo directo) | Estan en la misma fila (sub-flujo) |
| Control Calidad → Pasa QA? | `right→left` (horizontal) | **`top→bottom`** (vertical) | QC esta abajo, sube al gateway |
| Pasa QA? → Preparar Paquete (No) | `right→left` | **`right→top`** | Loop baja al sub-flujo |

### Porque el usuario hizo estos cambios

**Problema principal del original:** El gateway "Pago Aprobado?" estaba en nivel +1 (Y=310, abajo del flujo) porque el auto-layout detecta que tiene un loop y lo empuja abajo. Pero este gateway es un **punto de decision critico del happy path** — debe estar en la linea principal.

**Patron creado por el editado: "Sub-flujo de preparacion"**

El usuario creo un patron visual de 2 filas:

- **Fila superior (Y=200):** Flujo de decision: `Procesar Pago → Pago Aprobado? → ... → Pasa QA? → Actualizar Stock`
- **Fila inferior (Y=420):** Sub-flujo de preparacion: `Generar Factura → Preparar Paquete → Control de Calidad`

Las dos filas se conectan verticalmente con edges `bottom→top` y `top→bottom`. Esto comunica visualmente que los pasos 6-7-8 son un **sub-proceso de preparacion** que ocurre entre la aprobacion del pago y la verificacion de calidad.

**Problema adicional del original:** "7. Preparar Paquete" estaba en X=5080 (muy lejos a la derecha) porque el auto-layout lo posicionaba segun su columna topologica. En el editado esta en X=2444, mucho mas cerca de su contexto (entre Factura y QC).

### Reglas para el auto-layout

> 1. **Gateways del happy-path NO deben bajar aunque tengan loops.** Solo bajar gateways de sub-procesos secundarios.
> 2. **Cuando un gateway tiene rama "Si" que lleva a 2+ nodos secuenciales antes de reconectar, esos nodos deben ir a un sub-flujo inferior.**
> 3. **Nodos del sub-flujo deben posicionarse en las mismas columnas X que sus equivalentes del flujo principal, pero en Y+offset.**

---

## Imagen 13 — Zona "Reenviar o Reembolsar?"

### Que muestra la imagen

El gateway "Reenviar o Reembolsar?" con:
- Rama "Reembolsar" → derecha → "17. Procesar Reembolso" → "18. Notificar Reembolso" → End (rosa)
- Rama "Reenviar" → **abajo** (linea vertical negra descendente, hacia "7. Preparar Paquete")

### Diferencias con el original

| Elemento | Original | Editado |
|----------|----------|---------|
| 17. Procesar Reembolso | (5080, **310**) nivel +1 | (5088, **200**) **nivel 0** |
| Edge "Reenviar" → "7. Preparar Paquete" | `right → left` | **`bottom → bottom`** |

### Porque el usuario hizo este cambio

**Problema del original:** "17. Procesar Reembolso" estaba en nivel +1 (Y=310), debajo del flujo. Pero el reembolso es un **flujo alternativo completo** (no un error), asi que tiene mas sentido en la linea principal.

**Problema del original (Reenviar):** El edge de "Reenviar" a "7. Preparar Paquete" usaba `right → left`. Pero "Preparar Paquete" esta en X=2444 (muy a la izquierda), asi que el edge cruzaria todo el diagrama horizontalmente.

**Solucion del editado:** `bottom → bottom` — el edge baja del gateway y rutea por debajo de todos los nodos hasta llegar a "Preparar Paquete". Esto crea un **loop largo visible** que no cruza el flujo principal.

### Regla para el auto-layout

> **Loops largos (que cruzan muchas columnas) deben usar `bottom→bottom` para rutear por debajo, nunca `right→left` que cruza nodos.**
> **Nodos de flujo alternativo (reembolso) deben ir en nivel 0 si son un camino completo hacia un End event.**

---

## Imagen 14 — Zoom del gateway "Reenviar o Reembolsar?"

### Que muestra la imagen

Detalle en zoom del gateway mostrando:
- Label "Reenviar o Reembolsar?" en amarillo encima del diamante
- Label "Reembolsar" a la derecha del edge horizontal
- Linea vertical negra descendente (rama "Reenviar") con circulo azul de handle
- El borde inferior del diamante tiene linea naranja/amarilla

### Observaciones de legibilidad

| Aspecto | Evaluacion |
|---------|-----------|
| Tamano del gateway | Bueno — el diamante es legible a este zoom |
| Label del gateway | Bien posicionado encima, no se superpone |
| Label "Reembolsar" | **Un poco pegado** al diamante — podria tener 10-15px mas de offset |
| Linea de "Reenviar" (abajo) | Clara, sale por el borde inferior del diamante |
| Circulo azul (handle) | Es elemento de edicion de la app Angular, no del export |

### Regla para el auto-layout

> **Labels de edges que salen de gateways necesitan un offset minimo de 40px desde el borde del gateway para no pegarse.**

---

## Resumen de Reglas Extraidas

### Reglas de posicionamiento (layoutBpmn)

| # | Regla | Imagen de referencia |
|---|-------|---------------------|
| R1 | Gateways del happy-path permanecen en nivel 0 aunque tengan loops | Img 12 |
| R2 | Sub-flujos post-gateway (2+ nodos secuenciales) bajan a nivel +1 | Img 12 |
| R3 | Nodos de sub-flujo se alinean en X con su columna topologica | Img 12 |
| R4 | Flujos alternativos completos (→ End) van en nivel 0, no +1 | Img 13 |

### Reglas de puertos (selectPorts / edge assignment)

| # | Regla | Imagen de referencia |
|---|-------|---------------------|
| P1 | Gateway → nodo arriba: usar `top → left` (no `right → top`) | Img 11 |
| P2 | Nodo arriba → nodo abajo (reingreso): usar `right → top` | Img 11 |
| P3 | Gateway → sub-flujo abajo: usar `bottom → top` | Img 12 |
| P4 | Sub-flujo → gateway arriba: usar `top → bottom` | Img 12 |
| P5 | Loop arriba → nodo del flujo: usar `left → top` | Img 12 |
| P6 | Loop largo (muchas columnas): usar `bottom → bottom` | Img 13 |

### Reglas de labels

| # | Regla | Imagen de referencia |
|---|-------|---------------------|
| L1 | Labels de gateway edges: offset minimo 40px del gateway | Img 14 |

---

## Impacto por Prioridad

| Prioridad | Regla(s) | Impacto en legibilidad |
|-----------|----------|----------------------|
| **Alta** | R1 (gateways en nivel 0) | Elimina gateways desplazados del flujo principal |
| **Alta** | R2 (sub-flujo post-gateway abajo) | Crea patron zigzag legible |
| **Alta** | P3, P4 (puertos verticales cross-level) | Routing claro entre niveles |
| **Media** | P1, P2 (puertos para nodos arriba/abajo) | Edges no cruzan innecesariamente |
| **Media** | R4 (flujos alternativos en nivel 0) | Reembolso visible como flujo completo |
| **Media** | P6 (loops largos por abajo) | Loops no cruzan nodos |
| **Baja** | L1 (offset de labels) | Texto no se pega al gateway |

---

## Conclusion

Las 4 imagenes demuestran un patron consistente: el usuario **reorganizo los nodos en 3 capas funcionales** (retry arriba, principal centro, sub-flujo/error abajo) y **cambio los puertos para que los edges reflejen la direccion semantica** (arriba=retry, abajo=sub-flujo, horizontal=flujo normal).

El cambio mas significativo es la **Imagen 12** donde el usuario creo un sub-flujo de preparacion (Factura → Paquete → QC) separado del flujo de decision (Pago → Aprobado? → QA?). Este patron de "zigzag entre dos filas" es la mejora de mayor impacto y la mas compleja de implementar en el auto-layout.
