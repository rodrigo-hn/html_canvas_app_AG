export const BasicShapes = {
  rectangle: (w: number, h: number) => {
    return `<rect x="0" y="0" width="${w}" height="${h}" fill="white" stroke="black" stroke-width="2"/>`;
  },

  roundedRectangle: (w: number, h: number) => {
    return `<rect x="0" y="0" width="${w}" height="${h}" rx="10" ry="10" fill="white" stroke="black" stroke-width="2"/>`;
  },

  document: (w: number, h: number) => {
    const fold = Math.min(w, h) * 0.2;
    // Path: move to top-right minus fold, curve or simple line to fold, down to bottom, close.
    // Simple document shape with wave bottom
    const waveHeight = h * 0.1;
    const path = `
      M 0 0 
      H ${w} 
      V ${h - waveHeight} 
      C ${w * 0.75} ${h} ${w * 0.25} ${h - 2 * waveHeight} 0 ${h - waveHeight} 
      Z
    `;
    return `<path d="${path}" fill="white" stroke="black" stroke-width="2"/>`;
  },

  cylinder: (w: number, h: number) => {
    const rx = w / 2;
    const ry = h * 0.15;
    const pathBody = `
      M 0 ${ry} 
      V ${h - ry} 
      A ${rx} ${ry} 0 0 0 ${w} ${h - ry} 
      V ${ry} 
      A ${rx} ${ry} 0 0 0 0 ${ry} 
    `;
    const topEllipse = `<ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="white" stroke="black" stroke-width="2"/>`;
    // Body needs to be behind or handled carefully.
    // Simplified for single path style:
    return `
      <path d="M 0 ${ry} A ${rx} ${ry} 0 0 1 ${w} ${ry} A ${rx} ${ry} 0 0 1 0 ${ry} Z" fill="white" stroke="black" stroke-width="2"/>
      <path d="M 0 ${ry} V ${h - ry} A ${rx} ${ry} 0 0 0 ${w} ${
      h - ry
    } V ${ry}" fill="none" stroke="black" stroke-width="2"/>
      <path d="M 0 ${ry} A ${rx} ${ry} 0 0 1 ${w} ${ry}" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
    `;
  },

  diamond: (w: number, h: number) => {
    return `<path d="M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${
      h / 2
    } Z" fill="white" stroke="black" stroke-width="2"/>`;
  },
};
