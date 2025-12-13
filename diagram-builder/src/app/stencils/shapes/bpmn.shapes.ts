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
};
