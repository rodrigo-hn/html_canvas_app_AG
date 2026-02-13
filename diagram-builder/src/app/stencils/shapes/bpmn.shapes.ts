import { VisualTokens as T } from '../visual-tokens';

const stroke = T.stroke;
const fill = T.fill;
const sw = T.strokeWidth;

export const BpmnShapes = {
  task: (w: number, h: number) =>
    `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${T.radiusMd}" ry="${T.radiusMd}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,

  eventStart: (w: number, h: number) => {
    const r = Math.min(w, h) / 2 - 1;
    return `<circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  },

  eventEnd: (w: number, h: number) => {
    const r = Math.min(w, h) / 2 - 1;
    const inner = Math.max(2, r - 7);
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${T.strokeWidthStrong}"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${inner}" fill="none" stroke="${stroke}" stroke-width="1.2"/>
    `;
  },

  gateway: (w: number, h: number) => `
    <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <path d="M ${w / 2} ${h * 0.2} L ${w * 0.8} ${h / 2} L ${w / 2} ${h * 0.8} L ${w * 0.2} ${h / 2} Z" fill="none" stroke="${stroke}" stroke-width="1.2"/>
  `,

  pool: (w: number, h: number) => {
    const header = T.laneHeaderWidth;
    return `
      <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="transparent" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="0.5" y="0.5" width="${header}" height="${h - 1}" fill="${T.laneHeaderFill}" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="${header}" y1="0.5" x2="${header}" y2="${h - 0.5}" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  lane: (w: number, h: number) => {
    const header = Math.max(24, Math.min(34, Math.round(w * 0.03)));
    return `
      <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="transparent" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="0.5" y="0.5" width="${header}" height="${h - 1}" fill="${T.laneHeaderFill}" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="${header}" y1="0.5" x2="${header}" y2="${h - 0.5}" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  subprocess: (w: number, h: number) => `
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${T.radiusMd}" ry="${T.radiusMd}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <rect x="${w / 2 - 8}" y="${h - 16}" width="16" height="12" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    <line x1="${w / 2 - 4}" y1="${h - 10}" x2="${w / 2 + 4}" y2="${h - 10}" stroke="${stroke}" stroke-width="1"/>
    <line x1="${w / 2}" y1="${h - 13}" x2="${w / 2}" y2="${h - 7}" stroke="${stroke}" stroke-width="1"/>
  `,

  callActivity: (w: number, h: number) =>
    `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${T.radiusMd}" ry="${T.radiusMd}" fill="${fill}" stroke="${stroke}" stroke-width="${T.strokeWidthStrong}"/>`,

  transaction: (w: number, h: number) => `
    <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${T.radiusMd}" ry="${T.radiusMd}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="${T.radiusSm}" ry="${T.radiusSm}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  `,

  eventSubprocess: (w: number, h: number) =>
    `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${T.radiusMd}" ry="${T.radiusMd}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="6 4"/>`,

  choreoTask: (w: number, h: number) => {
    const band = Math.max(16, h * 0.22);
    return `
      <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${T.radiusSm}" ry="${T.radiusSm}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="0.5" y="0.5" width="${w - 1}" height="${band}" rx="${T.radiusSm}" ry="${T.radiusSm}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      <rect x="0.5" y="${h - band}" width="${w - 1}" height="${band - 0.5}" rx="${T.radiusSm}" ry="${T.radiusSm}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
    `;
  },

  choreoSubprocess: (w: number, h: number) => {
    const base = BpmnShapes.choreoTask(w, h);
    return `${base}
      <rect x="${w / 2 - 8}" y="${h - 14}" width="16" height="10" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
      <line x1="${w / 2 - 4}" y1="${h - 9}" x2="${w / 2 + 4}" y2="${h - 9}" stroke="${stroke}" stroke-width="1"/>
      <line x1="${w / 2}" y1="${h - 12}" x2="${w / 2}" y2="${h - 6}" stroke="${stroke}" stroke-width="1"/>
    `;
  },

  conversation: (w: number, h: number) =>
    `<path d="M ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} L 0 ${h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`,

  eventIntermediate: (w: number, h: number) => {
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.max(2, r - 7)}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  eventBoundary: (w: number, h: number) => {
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="4 3"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.max(2, r - 7)}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  eventThrowing: (w: number, h: number) => {
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${stroke}" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.max(2, r - 7)}" fill="${fill}" stroke="${fill}" stroke-width="1.5"/>
    `;
  },

  eventMessage: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 1;
    const ex = w * 0.28;
    const ey = h * 0.33;
    const ew = w * 0.44;
    const eh = h * 0.28;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M ${ex} ${ey} L ${ex + ew / 2} ${ey + eh * 0.55} L ${ex + ew} ${ey}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  eventTimer: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <circle cx="${cx}" cy="${cy}" r="${Math.max(2, r - 8)}" fill="none" stroke="${stroke}" stroke-width="1.2"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.45}" stroke="${stroke}" stroke-width="1.5"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + r * 0.32}" y2="${cy}" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  eventError: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M ${cx - r * 0.35} ${cy + r * 0.3} L ${cx - r * 0.05} ${cy - r * 0.1} L ${cx - r * 0.18} ${cy - r * 0.1}
      L ${cx + r * 0.35} ${cy - r * 0.35} L ${cx + r * 0.05} ${cy + r * 0.05} L ${cx + r * 0.18} ${cy + r * 0.05} Z"
      fill="none" stroke="${stroke}" stroke-width="1.4"/>
    `;
  },

  eventSignal: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M ${cx} ${cy - r * 0.38} L ${cx + r * 0.35} ${cy + r * 0.22} L ${cx - r * 0.35} ${cy + r * 0.22} Z"
      fill="none" stroke="${stroke}" stroke-width="1.5"/>
    `;
  },

  eventEscalation: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 1;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M ${cx - r * 0.2} ${cy + r * 0.3} L ${cx} ${cy - r * 0.3} L ${cx + r * 0.2} ${cy + r * 0.3}
      M ${cx - r * 0.3} ${cy + r * 0.1} L ${cx} ${cy - r * 0.4} L ${cx + r * 0.3} ${cy + r * 0.1}"
      fill="none" stroke="${stroke}" stroke-width="1.3"/>
    `;
  },

  gatewayExclusive: (w: number, h: number) => `
    <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="${T.decisionFill}" stroke="${T.decisionStroke}" stroke-width="${sw}"/>
    <path d="M ${w * 0.33} ${h * 0.33} L ${w * 0.67} ${h * 0.67} M ${w * 0.67} ${h * 0.33} L ${w * 0.33} ${h * 0.67}" stroke="${stroke}" stroke-width="2"/>
  `,

  gatewayParallel: (w: number, h: number) => `
    <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="${T.decisionFill}" stroke="${T.decisionStroke}" stroke-width="${sw}"/>
    <line x1="${w * 0.5}" y1="${h * 0.28}" x2="${w * 0.5}" y2="${h * 0.72}" stroke="${stroke}" stroke-width="2"/>
    <line x1="${w * 0.28}" y1="${h * 0.5}" x2="${w * 0.72}" y2="${h * 0.5}" stroke="${stroke}" stroke-width="2"/>
  `,

  gatewayInclusive: (w: number, h: number) => `
    <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="${T.decisionFill}" stroke="${T.decisionStroke}" stroke-width="${sw}"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.18}" fill="none" stroke="${stroke}" stroke-width="2"/>
  `,

  gatewayEventBased: (w: number, h: number) => {
    const r = Math.min(w, h) * 0.19;
    return `
      <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="${T.decisionFill}" stroke="${T.decisionStroke}" stroke-width="${sw}"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="none" stroke="${stroke}" stroke-width="1.5"/>
      <path d="M ${w / 2} ${h / 2 - r * 0.65} L ${w / 2 + r * 0.62} ${h / 2 + r * 0.5} L ${w / 2 - r * 0.62} ${h / 2 + r * 0.5} Z"
      fill="none" stroke="${stroke}" stroke-width="1.3"/>
    `;
  },

  dataObject: (w: number, h: number) => {
    const fold = Math.min(w, h) * 0.24;
    return `
      <path d="M 0 0 H ${w - fold} L ${w} ${fold} V ${h} H 0 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <line x1="${w - fold}" y1="0" x2="${w - fold}" y2="${fold}" stroke="${stroke}" stroke-width="1.2"/>
      <line x1="${w - fold}" y1="${fold}" x2="${w}" y2="${fold}" stroke="${stroke}" stroke-width="1.2"/>
    `;
  },

  dataStore: (w: number, h: number) => {
    const rx = w / 2;
    const ry = h * 0.14;
    return `
      <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M 0 ${ry} V ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} V ${ry}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
      <path d="M 0 ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
    `;
  },

  group: (w: number, h: number) =>
    `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" ry="8" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="7 4"/>`,

  textAnnotation: (w: number, h: number) => `
    <path d="M ${w * 0.15} 0 V ${h} M ${w * 0.15} 0 H ${w * 0.35} M ${w * 0.15} ${h} H ${w * 0.35}"
    fill="none" stroke="${stroke}" stroke-width="${sw}"/>
  `,

  sequenceFlow: (w: number, h: number) => `
    <line x1="0" y1="${h / 2}" x2="${w - 14}" y2="${h / 2}" stroke="${stroke}" stroke-width="${sw}"/>
    <path d="M ${w - 14} ${h / 2 - 6} L ${w} ${h / 2} L ${w - 14} ${h / 2 + 6} Z" fill="${stroke}" stroke="${stroke}" stroke-width="1"/>
  `,

  messageFlow: (w: number, h: number) => `
    <line x1="0" y1="${h / 2}" x2="${w - 14}" y2="${h / 2}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="6 4"/>
    <path d="M ${w - 14} ${h / 2 - 6} L ${w} ${h / 2} L ${w - 14} ${h / 2 + 6}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>
  `,

  association: (w: number, h: number) =>
    `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="${T.strokeMuted}" stroke-width="${sw}" stroke-dasharray="4 4"/>`,
};

