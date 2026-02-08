export const BpmnShapes = {
  task: (w: number, h: number) => {
    return `<rect x="0" y="0" width="${w}" height="${h}" rx="10" ry="10" fill="white" stroke="black" stroke-width="2"/>`;
  },

  eventStart: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `<circle cx="${w / 2}" cy="${h / 2}" r="${
      r - 1
    }" fill="white" stroke="black" stroke-width="2"/>`;
  },

  eventEnd: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `<circle cx="${w / 2}" cy="${h / 2}" r="${
      r - 1
    }" fill="white" stroke="black" stroke-width="4"/>`;
  },

  gateway: (w: number, h: number) => {
    // Diamond
    return `<path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${
      h / 2
    } Z" fill="white" stroke="black" stroke-width="2"/>
            <path d="M ${w / 2} ${h * 0.2} L ${w * 0.8} ${h / 2} L ${w / 2} ${h * 0.8} L ${
      w * 0.2
    } ${h / 2} Z" fill="none" stroke="black" stroke-width="1"/>
            `;
  },

  pool: (w: number, h: number) => {
    const headerSize = 30;
    return `
        <rect x="0" y="0" width="${headerSize}" height="${h}" fill="white" stroke="black" stroke-width="2"/>
        <rect x="${headerSize}" y="0" width="${
      w - headerSize
    }" height="${h}" fill="white" stroke="black" stroke-width="2"/>
      `;
  },

  lane: (w: number, h: number) => {
    const headerSize = 26;
    return `
      <rect x="0" y="0" width="${headerSize}" height="${h}" fill="white" stroke="black" stroke-width="2"/>
      <rect x="${headerSize}" y="0" width="${w - headerSize}" height="${h}" fill="white" stroke="black" stroke-width="2"/>
      <line x1="${headerSize}" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="black" stroke-width="1"/>
    `;
  },

  subprocess: (w: number, h: number) => {
    return `
      <rect x="0" y="0" width="${w}" height="${h}" rx="10" ry="10" fill="white" stroke="black" stroke-width="2"/>
      <rect x="${w / 2 - 8}" y="${h - 16}" width="16" height="12" fill="white" stroke="black" stroke-width="1"/>
      <line x1="${w / 2 - 4}" y1="${h - 10}" x2="${w / 2 + 4}" y2="${h - 10}" stroke="black" stroke-width="1"/>
      <line x1="${w / 2}" y1="${h - 13}" x2="${w / 2}" y2="${h - 7}" stroke="black" stroke-width="1"/>
    `;
  },

  callActivity: (w: number, h: number) => {
    return `
      <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="10" ry="10" fill="white" stroke="black" stroke-width="3"/>
    `;
  },

  transaction: (w: number, h: number) => {
    return `
      <rect x="0" y="0" width="${w}" height="${h}" rx="10" ry="10" fill="white" stroke="black" stroke-width="2"/>
      <rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="8" ry="8" fill="none" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventSubprocess: (w: number, h: number) => {
    return `
      <rect x="0" y="0" width="${w}" height="${h}" rx="10" ry="10" fill="white" stroke="black" stroke-width="2" stroke-dasharray="6 4"/>
    `;
  },

  choreoTask: (w: number, h: number) => {
    const band = Math.max(16, h * 0.22);
    return `
      <rect x="0" y="0" width="${w}" height="${h}" rx="8" ry="8" fill="white" stroke="black" stroke-width="2"/>
      <rect x="0" y="0" width="${w}" height="${band}" rx="8" ry="8" fill="white" stroke="black" stroke-width="1"/>
      <rect x="0" y="${h - band}" width="${w}" height="${band}" rx="8" ry="8" fill="white" stroke="black" stroke-width="1"/>
    `;
  },

  choreoSubprocess: (w: number, h: number) => {
    const band = Math.max(16, h * 0.22);
    return `
      <rect x="0" y="0" width="${w}" height="${h}" rx="8" ry="8" fill="white" stroke="black" stroke-width="2"/>
      <rect x="0" y="0" width="${w}" height="${band}" rx="8" ry="8" fill="white" stroke="black" stroke-width="1"/>
      <rect x="0" y="${h - band}" width="${w}" height="${band}" rx="8" ry="8" fill="white" stroke="black" stroke-width="1"/>
      <rect x="${w / 2 - 8}" y="${h - 14}" width="16" height="10" fill="white" stroke="black" stroke-width="1"/>
      <line x1="${w / 2 - 4}" y1="${h - 9}" x2="${w / 2 + 4}" y2="${h - 9}" stroke="black" stroke-width="1"/>
      <line x1="${w / 2}" y1="${h - 12}" x2="${w / 2}" y2="${h - 6}" stroke="black" stroke-width="1"/>
    `;
  },

  conversation: (w: number, h: number) => {
    return `
      <path d="M ${w * 0.2} 0 L ${w * 0.8} 0 L ${w} ${h / 2} L ${w * 0.8} ${h} L ${w * 0.2} ${h} L 0 ${h / 2} Z"
      fill="white" stroke="black" stroke-width="2"/>
    `;
  },

  eventIntermediate: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 7}" fill="none" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventBoundary: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 1}" fill="white" stroke="black" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 7}" fill="none" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventThrowing: (w: number, h: number) => {
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 1}" fill="black" stroke="black" stroke-width="2"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r - 7}" fill="white" stroke="white" stroke-width="1.5"/>
    `;
  },

  eventMessage: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    const ex = w * 0.28;
    const ey = h * 0.33;
    const ew = w * 0.44;
    const eh = h * 0.28;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="none" stroke="black" stroke-width="1.5"/>
      <path d="M ${ex} ${ey} L ${ex + ew / 2} ${ey + eh * 0.55} L ${ex + ew} ${ey}" fill="none" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventTimer: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="none" stroke="black" stroke-width="1.2"/>
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.45}" stroke="black" stroke-width="1.5"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + r * 0.32}" y2="${cy}" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventError: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <path d="M ${cx - r * 0.35} ${cy + r * 0.3} L ${cx - r * 0.05} ${cy - r * 0.1} L ${cx - r * 0.18} ${cy - r * 0.1}
      L ${cx + r * 0.35} ${cy - r * 0.35} L ${cx + r * 0.05} ${cy + r * 0.05} L ${cx + r * 0.18} ${cy + r * 0.05} Z"
      fill="none" stroke="black" stroke-width="1.4"/>
    `;
  },

  eventSignal: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <path d="M ${cx} ${cy - r * 0.38} L ${cx + r * 0.35} ${cy + r * 0.22} L ${cx - r * 0.35} ${cy + r * 0.22} Z"
      fill="none" stroke="black" stroke-width="1.5"/>
    `;
  },

  eventEscalation: (w: number, h: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="white" stroke="black" stroke-width="2"/>
      <path d="M ${cx - r * 0.2} ${cy + r * 0.3} L ${cx} ${cy - r * 0.3} L ${cx + r * 0.2} ${cy + r * 0.3}
      M ${cx - r * 0.3} ${cy + r * 0.1} L ${cx} ${cy - r * 0.4} L ${cx + r * 0.3} ${cy + r * 0.1}"
      fill="none" stroke="black" stroke-width="1.3"/>
    `;
  },

  gatewayExclusive: (w: number, h: number) => {
    return `
      <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="white" stroke="black" stroke-width="2"/>
      <path d="M ${w * 0.33} ${h * 0.33} L ${w * 0.67} ${h * 0.67} M ${w * 0.67} ${h * 0.33} L ${w * 0.33} ${h * 0.67}"
      stroke="black" stroke-width="2"/>
    `;
  },

  gatewayParallel: (w: number, h: number) => {
    return `
      <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="white" stroke="black" stroke-width="2"/>
      <line x1="${w * 0.5}" y1="${h * 0.28}" x2="${w * 0.5}" y2="${h * 0.72}" stroke="black" stroke-width="2"/>
      <line x1="${w * 0.28}" y1="${h * 0.5}" x2="${w * 0.72}" y2="${h * 0.5}" stroke="black" stroke-width="2"/>
    `;
  },

  gatewayInclusive: (w: number, h: number) => {
    return `
      <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="white" stroke="black" stroke-width="2"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.18}" fill="none" stroke="black" stroke-width="2"/>
    `;
  },

  gatewayEventBased: (w: number, h: number) => {
    const r = Math.min(w, h) * 0.19;
    return `
      <path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z" fill="white" stroke="black" stroke-width="2"/>
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="none" stroke="black" stroke-width="1.5"/>
      <path d="M ${w / 2} ${h / 2 - r * 0.65} L ${w / 2 + r * 0.62} ${h / 2 + r * 0.5} L ${w / 2 - r * 0.62} ${h / 2 + r * 0.5} Z"
      fill="none" stroke="black" stroke-width="1.3"/>
    `;
  },

  dataObject: (w: number, h: number) => {
    const fold = Math.min(w, h) * 0.24;
    return `
      <path d="M 0 0 H ${w - fold} L ${w} ${fold} V ${h} H 0 Z" fill="white" stroke="black" stroke-width="2"/>
      <line x1="${w - fold}" y1="0" x2="${w - fold}" y2="${fold}" stroke="black" stroke-width="1.2"/>
      <line x1="${w - fold}" y1="${fold}" x2="${w}" y2="${fold}" stroke="black" stroke-width="1.2"/>
    `;
  },

  dataStore: (w: number, h: number) => {
    const rx = w / 2;
    const ry = h * 0.14;
    return `
      <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="white" stroke="black" stroke-width="2"/>
      <path d="M 0 ${ry} V ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry} V ${ry}" fill="none" stroke="black" stroke-width="2"/>
      <path d="M 0 ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${h - ry}" fill="none" stroke="black" stroke-width="2"/>
    `;
  },

  group: (w: number, h: number) => {
    return `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="8" ry="8" fill="none" stroke="black" stroke-width="2" stroke-dasharray="7 4"/>`;
  },

  textAnnotation: (w: number, h: number) => {
    return `
      <path d="M ${w * 0.15} 0 V ${h} M ${w * 0.15} 0 H ${w * 0.35} M ${w * 0.15} ${h} H ${w * 0.35}"
      fill="none" stroke="black" stroke-width="2"/>
    `;
  },

  sequenceFlow: (w: number, h: number) => {
    return `
      <line x1="0" y1="${h / 2}" x2="${w - 14}" y2="${h / 2}" stroke="black" stroke-width="2"/>
      <path d="M ${w - 14} ${h / 2 - 6} L ${w} ${h / 2} L ${w - 14} ${h / 2 + 6} Z" fill="black" stroke="black" stroke-width="1"/>
    `;
  },

  messageFlow: (w: number, h: number) => {
    return `
      <line x1="0" y1="${h / 2}" x2="${w - 14}" y2="${h / 2}" stroke="black" stroke-width="2" stroke-dasharray="6 4"/>
      <path d="M ${w - 14} ${h / 2 - 6} L ${w} ${h / 2} L ${w - 14} ${h / 2 + 6}" fill="none" stroke="black" stroke-width="2"/>
    `;
  },

  association: (w: number, h: number) => {
    return `<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="black" stroke-width="2" stroke-dasharray="4 4"/>`;
  },
};
