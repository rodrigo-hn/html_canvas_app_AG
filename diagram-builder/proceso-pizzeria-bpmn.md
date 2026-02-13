# 🍕 Proceso de Negocio - Pizzería La Italiana

## Descripción del Proceso BPMN 2.0

Este documento describe el proceso de negocio para la gestión de pedidos en una pizzería, modelado según el estándar BPMN 2.0.

---

## Flujo Principal

1. **Pedido recibido** → **Registrar** → **Verificar disponibilidad**
2. Si disponible → **Confirmar** → **Preparar pizza** → **Control calidad**
3. Si aprobada → **Empaquetar** → **Asignar repartidor** → **Entregar** → **Cobrar** → **Fin**

---

## Flujos Alternativos

- **No disponible** → Notificar cliente → Fin (cancelado)
- **No aprobada** → Vuelve a preparar pizza

---

## Diagrama BPMN

```mermaid
flowchart LR
    subgraph Pool["🍕 PIZZERÍA LA ITALIANA"]
        direction LR
        
        subgraph Lane1["Atención al Cliente"]
            A(("📩"))
            B["Registrar\npedido"]
            C["Verificar\ndisponibilidad"]
            D{"¿Disponible?"}
            E["Confirmar\npedido"]
        end
        
        subgraph Lane2["Cocina"]
            F[["Preparar\npizza"]]
            G["Control de\ncalidad"]
            H{"¿Aprobada?"}
            I["Empaquetar\npedido"]
        end
        
        subgraph Lane3["Delivery"]
            J["Asignar\nrepartidor"]
            K["Entregar\npedido"]
            L["Procesar\npago"]
            M((("✓")))
        end
    end
    
    %% Flujo principal
    A --> B --> C --> D
    D -->|Sí| E
    D -->|No| N["Notificar\ncliente"]
    N --> O((("✗")))
    
    E --> F --> G --> H
    H -->|Sí| I
    H -->|No| F
    
    I --> J --> K --> L --> M
    
    %% Estilos
    classDef startEvent fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:2px
    classDef endEvent fill:#ef4444,stroke:#dc2626,color:#fff,stroke-width:3px
    classDef endEventBad fill:#f97316,stroke:#ea580c,color:#fff,stroke-width:3px
    classDef task fill:#1e293b,stroke:#3b82f6,color:#fff,stroke-width:2px
    classDef gateway fill:#fbbf24,stroke:#f59e0b,color:#000,stroke-width:2px
    classDef subprocess fill:#1e293b,stroke:#a855f7,color:#fff,stroke-width:2px
    
    class A startEvent
    class M endEvent
    class O endEventBad
    class B,C,E,G,I,J,K,L,N task
    class D,H gateway
    class F subprocess
```

---

## Leyenda de Símbolos

| Símbolo | Elemento BPMN | Descripción |
|---------|---------------|-------------|
| ⭕ | Evento de inicio | Inicia el proceso (mensaje recibido) |
| ⬛ | Tarea | Actividad a realizar |
| ⬛⬛ | Subproceso | Proceso anidado con múltiples pasos |
| ◇ | Gateway XOR | Decisión exclusiva (solo una ruta) |
| ⭕ | Evento de fin | Finaliza el proceso |

---

## Participantes (Lanes)

| Lane | Responsabilidades |
|------|-------------------|
| **Atención al Cliente** | Recibir pedido, verificar disponibilidad, confirmar |
| **Cocina** | Preparar pizza, control de calidad, empaquetar |
| **Delivery** | Asignar repartidor, entregar, cobrar |

---

*Documento generado según estándar BPMN 2.0 - ISO/IEC 19510*
