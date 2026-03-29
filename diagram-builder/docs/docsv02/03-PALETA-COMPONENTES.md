# 3. Paleta de Componentes

La paleta de componentes es el panel lateral izquierdo que contiene todas las formas y elementos disponibles para crear diagramas. Se organiza en **10 grupos** con un total de **50+ elementos**.

---

## 3.1 General (Formas Básicas)

Formas SVG geométricas fundamentales para diagramas genéricos.

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Rectangle | `rectangle` | Rectángulo estándar |
| Rounded Rectangle | `rounded-rectangle` | Rectángulo con esquinas redondeadas (rx/ry=10) |
| Diamond | `diamond` | Rombo / forma de decisión |
| Document | `document` | Forma de documento con borde inferior ondulado |
| Cylinder | `cylinder` | Cilindro 3D (bases de datos) |

---

## 3.2 Web Components

Componentes web interactivos renderizados con Tailwind CSS.

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Button | `web-button` | Botón con variantes: primary, secondary, success, danger |
| Input | `web-input` | Campo de entrada con label y placeholder |
| Card | `web-card` | Tarjeta con título y contenido |

---

## 3.3 BPMN Web Tasks

Elementos BPMN renderizados como componentes web Tailwind (apariencia moderna con tema oscuro).

| Elemento | Key | Descripción |
|----------|-----|-------------|
| User Task (Web) | `web-bpmn-user-task` | Tarea manual con ícono de usuario |
| Service Task (Web) | `web-bpmn-service-task` | Tarea de servicio con ícono de engranaje |
| Manual Task (Web) | `web-bpmn-manual-task` | Tarea manual con ícono de mano |
| Subprocess (Web) | `web-bpmn-subprocess-task` | Subproceso con badge expandible |
| Start Event (Web) | `web-bpmn-start-event` | Evento de inicio circular verde |
| Exclusive Gateway (Web) | `web-bpmn-exclusive-gateway` | Compuerta exclusiva (diamante con X) |
| End Event (Web) | `web-bpmn-end-event` | Evento de fin circular rojo |
| Lane (Web) | `web-bpmn-lane` | Carril horizontal con sidebar |
| Pool (Web) | `web-bpmn-pool` | Pool contenedor con sidebar naranja |

---

## 3.4 BPMN 2.0 General (SVG)

Elementos organizacionales BPMN en formato SVG clásico.

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Pool | `bpmn-pool` | Contenedor de participante con header |
| Lane | `bpmn-lane` | Subdivisión horizontal dentro de un pool |
| Group | `bpmn-group` | Agrupación visual con borde discontinuo redondeado |
| Conversation | `bpmn-conversation` | Forma hexagonal para conversaciones |

---

## 3.5 BPMN 2.0 Tasks (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Task | `bpmn-task` | Tarea genérica (rectángulo redondeado) |
| Subprocess | `bpmn-subprocess` | Tarea con marcador de subproceso (cuadrado inferior) |
| Event Subprocess | `bpmn-event-subprocess` | Rectángulo con borde discontinuo |
| Call Activity | `bpmn-call-activity` | Tarea con borde grueso (actividad invocable) |
| Transaction | `bpmn-transaction` | Tarea con borde interior doble |

---

## 3.6 BPMN 2.0 Events (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Start Event | `bpmn-start-event` | Círculo simple (inicio) |
| Intermediate Event | `bpmn-intermediate-event` | Doble círculo (intermedio) |
| Boundary Event | `bpmn-boundary-event` | Doble círculo discontinuo |
| Throwing Event | `bpmn-throwing-event` | Evento de lanzamiento |
| End Event | `bpmn-end-event` | Círculo con círculo interior (fin) |
| Message Event | `bpmn-event-message` | Evento con marcador de mensaje |
| Timer Event | `bpmn-event-timer` | Evento con marcador de temporizador |
| Error Event | `bpmn-event-error` | Evento con marcador de error |
| Signal Event | `bpmn-event-signal` | Evento con marcador de señal |
| Escalation Event | `bpmn-event-escalation` | Evento con marcador de escalación |

---

## 3.7 BPMN 2.0 Gateways (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Gateway | `bpmn-gateway` | Diamante con diamante interior |
| Exclusive Gateway | `bpmn-gateway-exclusive` | Diamante con marcador X |
| Inclusive Gateway | `bpmn-gateway-inclusive` | Diamante con marcador O |
| Parallel Gateway | `bpmn-gateway-parallel` | Diamante con marcador + |
| Event-Based Gateway | `bpmn-gateway-event-based` | Diamante con pentágono interior |

---

## 3.8 BPMN 2.0 Data & Artifacts (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Data Object | `bpmn-data-object` | Documento con esquina doblada |
| Data Store | `bpmn-data-store` | Dos rectángulos paralelos |
| Text Annotation | `bpmn-text-annotation` | Rectángulo con bracket izquierdo |

---

## 3.9 BPMN 2.0 Flows (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Sequence Flow Shape | `bpmn-sequence-flow` | Forma de flecha sólida |
| Message Flow Shape | `bpmn-message-flow` | Forma de flecha discontinua |
| Association Shape | `bpmn-association` | Forma de línea punteada |

---

## 3.10 BPMN 2.0 Choreographies (SVG)

| Elemento | Key | Descripción |
|----------|-----|-------------|
| Choreography Task | `bpmn-choreography-task` | Rectángulo con bandas superior e inferior |
| Choreography Subprocess | `bpmn-choreography-subprocess` | Coreografía con marcador de subproceso |

---

## Búsqueda en Paleta

La paleta incluye un campo de búsqueda que filtra elementos en tiempo real por nombre. Los grupos se muestran como secciones colapsables (`<details>/<summary>`) que el usuario puede expandir o contraer independientemente.

## Redimensionamiento de Paleta

El ancho del panel de paleta es ajustable mediante un handle de redimensionamiento (`cursor-ew-resize`) en el borde derecho del panel.
