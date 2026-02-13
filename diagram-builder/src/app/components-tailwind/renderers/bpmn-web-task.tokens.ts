export type BpmnWebTaskVariant = 'blue' | 'yellow' | 'green' | 'purple' | 'red';

export const BPMN_WEB_TASK_TOKENS = {
  background: '#0f0f0f',
  text: '#ffffff',
  variants: {
    blue: { border: '#60a5fa', accent: '#60a5fa' },
    yellow: { border: '#ffc233', accent: '#ffc233' },
    green: { border: '#4ade80', accent: '#4ade80' },
    purple: { border: '#a78bfa', accent: '#a78bfa' },
    red: { border: '#f87171', accent: '#f87171' },
  } satisfies Record<BpmnWebTaskVariant, { border: string; accent: string }>,
};

