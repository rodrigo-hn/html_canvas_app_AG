export type BpmnWebTaskVariant = 'blue' | 'yellow' | 'green' | 'purple' | 'red';

export const BPMN_WEB_TASK_TOKENS = {
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
    size: '16px',
    left: '7px',
    top: '5px',
  },
  badge: {
    size: '14px',
    fontSize: '12px',
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
    background: 'rgba(15,23,42,0.22)',
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
