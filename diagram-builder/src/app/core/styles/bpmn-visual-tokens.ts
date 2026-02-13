export type BpmnWebTaskVariant = 'blue' | 'yellow' | 'green' | 'purple' | 'red';
export type BpmnTaskIconKind = 'user' | 'service' | 'manual' | 'subprocess' | 'start';

export const BPMN_VISUAL_TOKENS = {
  background: '#0b0f14',
  text: '#f8fafc',
  textMuted: '#cbd5e1',
  fontFamily: `'DM Sans', sans-serif`,
  taskPadding: '0.8rem 1.2rem',
  taskMinWidth: '110px',
  taskRadius: '8px',
  subprocessRadius: '10px',
  stroke: {
    task: 2,
    gateway: 1.5,
    eventStart: 1.5,
    eventEnd: 2.5,
    lane: 1,
    pool: 1.5,
  },
  typography: {
    taskSize: '0.8rem',
    taskWeight: 600,
    labelSize: '0.75rem',
    labelWeight: 500,
  },
  icon: {
    sizePx: 16,
    left: '7px',
    top: '5px',
  },
  badge: {
    sizePx: 14,
    fontSizePx: 12,
    radius: '2px',
    bottom: '3px',
  },
  variants: {
    blue: { border: '#58a6ff', accent: '#7ab8ff' },
    yellow: { border: '#eab308', accent: '#facc15' },
    green: { border: '#34d399', accent: '#6ee7b7' },
    purple: { border: '#a78bfa', accent: '#c4b5fd' },
    red: { border: '#f87171', accent: '#fca5a5' },
  } satisfies Record<BpmnWebTaskVariant, { border: string; accent: string }>,
  lane: {
    background: 'rgba(15,23,42,0.94)',
    sidebar: '#253246',
    sidebarText: '#dbe3ef',
    border: '#41516a',
  },
  pool: {
    background: 'rgba(15,23,42,0.18)',
    sidebar: '#ea5b22',
    sidebarText: '#ffffff',
    border: '#41516a',
  },
  interaction: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export const EDGE_MARKER_TOKENS = {
  arrow: { markerWidth: 10, markerHeight: 10, refX: 9, refY: 3 },
  openArrow: { markerWidth: 10, markerHeight: 10, refX: 9, refY: 3, strokeWidth: 1.5 },
  openCircle: { markerWidth: 10, markerHeight: 10, refX: 3, refY: 3, radius: 2, strokeWidth: 1.2 },
};

export function bpmnTaskTone(variant: BpmnWebTaskVariant, fallback: BpmnWebTaskVariant = 'blue') {
  return BPMN_VISUAL_TOKENS.variants[variant] || BPMN_VISUAL_TOKENS.variants[fallback];
}

export function bpmnIconSvg(kind: BpmnTaskIconKind, color: string, sizePx = BPMN_VISUAL_TOKENS.icon.sizePx): string {
  const common = `width="${sizePx}" height="${sizePx}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === 'user') {
    return `<svg ${common}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 19c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/></svg>`;
  }
  if (kind === 'service') {
    return `<svg ${common}><circle cx="12" cy="12" r="2.5"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M5.9 5.9l1.6 1.6M16.5 16.5l1.6 1.6M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6"/></svg>`;
  }
  if (kind === 'manual') {
    return `<svg ${common}><path d="M8.8 12.5V7.8a1.1 1.1 0 112.2 0v2.5"/><path d="M11 10.8V7.2a1.1 1.1 0 112.2 0v3.1"/><path d="M13.2 10.6V7.8a1.1 1.1 0 112.2 0v3.3"/><path d="M15.4 11.4v-1.2a1.1 1.1 0 112.2 0v3.1c0 3.4-2.3 5.7-5.6 5.7h-1.7c-1.3 0-2.3-.8-2.9-1.8l-1.2-2.1a1 1 0 011.7-1l.9 1.3"/></svg>`;
  }
  if (kind === 'subprocess') {
    return `<svg ${common}><path d="M3.5 8l8.5-4 8.5 4-8.5 4-8.5-4z"/><path d="M3.5 8v8l8.5 4 8.5-4V8"/></svg>`;
  }
  return `<svg ${common}><rect x="4.5" y="6.5" width="15" height="11" rx="2"/><path d="M5.5 8l6.5 5 6.5-5"/></svg>`;
}
