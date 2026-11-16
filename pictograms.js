// Simple line-art pictograms showing body position for each movement pattern.
// Drawn with basic shapes, no external images, so they stay copyright-free and offline.
function svgWrap(inner) {
  return `<svg viewBox="0 0 120 100" class="pictogram-svg" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
const head = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="currentColor" stroke="none" />`;

const PICTOGRAMS = {
  bench_press: svgWrap(`
    <rect x="25" y="68" width="70" height="8" fill="currentColor" stroke="none" opacity="0.3" />
    ${head(30, 55)}
    <line x1="38" y1="58" x2="75" y2="60" />
    <line x1="75" y1="60" x2="80" y2="80" />
    <line x1="80" y1="80" x2="95" y2="95" />
    <line x1="50" y1="58" x2="55" y2="30" />
    <line x1="30" y1="30" x2="80" y2="30" />
    <circle cx="30" cy="30" r="6" />
    <circle cx="80" cy="30" r="6" />
  `),
  fly: svgWrap(`
    <rect x="25" y="68" width="70" height="8" fill="currentColor" stroke="none" opacity="0.3" />
    ${head(30, 55)}
    <line x1="38" y1="58" x2="78" y2="62" />
    <line x1="78" y1="62" x2="82" y2="82" />
    <line x1="82" y1="82" x2="96" y2="95" />
    <path d="M45,45 C35,35 20,40 15,55" />
    <path d="M55,45 C65,35 80,40 85,55" />
    <circle cx="15" cy="55" r="6" />
    <circle cx="85" cy="55" r="6" />
  `),
  pushup: svgWrap(`
    <line x1="10" y1="90" x2="110" y2="90" opacity="0.3" />
    ${head(20, 55)}
    <line x1="25" y1="60" x2="90" y2="78" />
    <line x1="40" y1="65" x2="35" y2="90" />
    <line x1="90" y1="78" x2="100" y2="90" />
  `),
  pulldown: svgWrap(`
    <line x1="30" y1="10" x2="30" y2="25" />
    <line x1="15" y1="25" x2="45" y2="25" />
    ${head(60, 35)}
    <line x1="60" y1="43" x2="60" y2="70" />
    <line x1="30" y1="25" x2="48" y2="50" />
    <line x1="30" y1="25" x2="48" y2="38" />
    <line x1="60" y1="55" x2="40" y2="70" />
    <line x1="60" y1="55" x2="80" y2="70" />
    <line x1="60" y1="70" x2="50" y2="90" />
    <line x1="60" y1="70" x2="70" y2="90" />
  `),
  row: svgWrap(`
    <rect x="80" y="40" width="8" height="12" fill="currentColor" stroke="none" opacity="0.3" />
    ${head(85, 35)}
    <line x1="85" y1="43" x2="55" y2="60" />
    <line x1="75" y1="50" x2="35" y2="50" />
    <line x1="55" y1="60" x2="40" y2="85" />
    <line x1="55" y1="60" x2="70" y2="85" />
  `),
  deadlift: svgWrap(`
    <line x1="15" y1="80" x2="60" y2="80" opacity="0.5" />
    <circle cx="20" cy="80" r="8" />
    ${head(60, 35)}
    <line x1="60" y1="43" x2="45" y2="60" />
    <line x1="45" y1="60" x2="20" y2="78" />
    <line x1="45" y1="60" x2="55" y2="90" />
    <line x1="45" y1="60" x2="70" y2="88" />
  `),
  pullup: svgWrap(`
    <line x1="10" y1="12" x2="110" y2="12" />
    <line x1="45" y1="12" x2="35" y2="25" />
    <line x1="75" y1="12" x2="35" y2="25" />
    ${head(35, 25)}
    <line x1="35" y1="33" x2="35" y2="65" />
    <line x1="35" y1="45" x2="20" y2="60" />
    <line x1="35" y1="65" x2="25" y2="90" />
    <line x1="35" y1="65" x2="45" y2="90" />
  `),
  overhead_press: svgWrap(`
    ${head(60, 30)}
    <line x1="60" y1="38" x2="60" y2="70" />
    <line x1="35" y1="10" x2="85" y2="10" />
    <line x1="60" y1="45" x2="40" y2="20" />
    <line x1="60" y1="45" x2="80" y2="20" />
    <line x1="60" y1="70" x2="45" y2="92" />
    <line x1="60" y1="70" x2="75" y2="92" />
  `),
  lateral_raise: svgWrap(`
    ${head(60, 25)}
    <line x1="60" y1="33" x2="60" y2="70" />
    <line x1="60" y1="42" x2="20" y2="35" />
    <line x1="60" y1="42" x2="100" y2="35" />
    <circle cx="20" cy="35" r="5" />
    <circle cx="100" cy="35" r="5" />
    <line x1="60" y1="70" x2="45" y2="92" />
    <line x1="60" y1="70" x2="75" y2="92" />
  `),
  face_pull: svgWrap(`
    <line x1="80" y1="10" x2="80" y2="25" />
    ${head(50, 30)}
    <line x1="50" y1="38" x2="52" y2="68" />
    <line x1="58" y1="45" x2="80" y2="25" />
    <line x1="58" y1="55" x2="80" y2="35" />
    <line x1="52" y1="68" x2="40" y2="92" />
    <line x1="52" y1="68" x2="64" y2="92" />
  `),
  curl: svgWrap(`
    ${head(55, 25)}
    <line x1="55" y1="33" x2="58" y2="65" />
    <line x1="62" y1="40" x2="85" y2="48" />
    <line x1="85" y1="48" x2="78" y2="25" />
    <circle cx="78" cy="25" r="6" />
    <line x1="58" y1="65" x2="45" y2="92" />
    <line x1="58" y1="65" x2="70" y2="92" />
  `),
  triceps: svgWrap(`
    ${head(45, 20)}
    <line x1="45" y1="28" x2="48" y2="60" />
    <line x1="50" y1="30" x2="75" y2="35" />
    <line x1="75" y1="35" x2="78" y2="70" />
    <circle cx="78" cy="70" r="6" />
    <line x1="48" y1="60" x2="35" y2="92" />
    <line x1="48" y1="60" x2="60" y2="92" />
  `),
  dip: svgWrap(`
    <line x1="25" y1="20" x2="25" y2="70" opacity="0.4" />
    <line x1="85" y1="20" x2="85" y2="70" opacity="0.4" />
    ${head(55, 25)}
    <line x1="55" y1="33" x2="55" y2="60" />
    <line x1="55" y1="40" x2="25" y2="45" />
    <line x1="55" y1="40" x2="85" y2="45" />
    <line x1="55" y1="60" x2="45" y2="85" />
    <line x1="55" y1="60" x2="65" y2="85" />
  `),
  squat: svgWrap(`
    ${head(55, 15)}
    <line x1="35" y1="8" x2="75" y2="8" />
    <line x1="55" y1="23" x2="55" y2="50" />
    <line x1="55" y1="50" x2="35" y2="65" />
    <line x1="35" y1="65" x2="35" y2="90" />
    <line x1="55" y1="50" x2="75" y2="65" />
    <line x1="75" y1="65" x2="75" y2="90" />
  `),
  leg_press: svgWrap(`
    <line x1="85" y1="15" x2="85" y2="85" opacity="0.4" />
    ${head(25, 50)}
    <line x1="30" y1="55" x2="55" y2="60" />
    <line x1="55" y1="60" x2="55" y2="40" />
    <line x1="55" y1="60" x2="80" y2="50" />
    <line x1="55" y1="40" x2="80" y2="35" />
  `),
  leg_extension: svgWrap(`
    ${head(25, 20)}
    <line x1="27" y1="28" x2="30" y2="55" />
    <line x1="30" y1="55" x2="60" y2="55" />
    <line x1="60" y1="55" x2="90" y2="40" />
    <circle cx="90" cy="40" r="5" opacity="0.5" />
  `),
  leg_curl: svgWrap(`
    <line x1="10" y1="60" x2="70" y2="60" opacity="0.3" />
    ${head(20, 48)}
    <line x1="25" y1="55" x2="55" y2="58" />
    <line x1="55" y1="58" x2="55" y2="35" />
    <line x1="55" y1="35" x2="85" y2="40" />
    <circle cx="85" cy="40" r="5" opacity="0.5" />
  `),
  lunge: svgWrap(`
    ${head(45, 15)}
    <line x1="45" y1="23" x2="48" y2="55" />
    <line x1="48" y1="55" x2="25" y2="70" />
    <line x1="25" y1="70" x2="25" y2="90" />
    <line x1="48" y1="55" x2="75" y2="60" />
    <line x1="75" y1="60" x2="80" y2="90" />
  `),
  calf_raise: svgWrap(`
    <line x1="30" y1="88" x2="90" y2="88" opacity="0.4" />
    ${head(55, 20)}
    <line x1="55" y1="28" x2="55" y2="60" />
    <line x1="55" y1="60" x2="45" y2="80" />
    <line x1="45" y1="80" x2="48" y2="88" />
    <line x1="55" y1="60" x2="65" y2="80" />
    <line x1="65" y1="80" x2="68" y2="88" />
  `),
  hip_thrust: svgWrap(`
    <rect x="10" y="55" width="25" height="8" fill="currentColor" stroke="none" opacity="0.3" />
    ${head(15, 50)}
    <line x1="22" y1="55" x2="55" y2="60" />
    <line x1="55" y1="60" x2="60" y2="40" />
    <line x1="55" y1="60" x2="75" y2="80" />
    <line x1="75" y1="80" x2="95" y2="80" />
    <circle cx="60" cy="40" r="5" opacity="0.5" />
  `),
  plank: svgWrap(`
    <line x1="10" y1="90" x2="110" y2="90" opacity="0.3" />
    ${head(20, 60)}
    <line x1="26" y1="62" x2="95" y2="72" />
    <line x1="35" y1="65" x2="33" y2="85" />
    <line x1="95" y1="72" x2="98" y2="88" />
  `),
  crunch: svgWrap(`
    <line x1="10" y1="80" x2="100" y2="80" opacity="0.3" />
    ${head(45, 55)}
    <path d="M50,58 C65,65 70,75 65,80" />
    <line x1="65" y1="80" x2="60" y2="60" />
    <line x1="65" y1="80" x2="80" y2="65" />
  `),
  hanging_raise: svgWrap(`
    <line x1="10" y1="12" x2="110" y2="12" />
    <line x1="55" y1="12" x2="55" y2="25" />
    ${head(55, 25)}
    <line x1="55" y1="33" x2="55" y2="60" />
    <path d="M55,60 C55,45 75,35 80,25" />
  `),
  twist: svgWrap(`
    <line x1="10" y1="85" x2="100" y2="85" opacity="0.3" />
    ${head(55, 30)}
    <line x1="55" y1="38" x2="55" y2="65" />
    <path d="M40,45 C50,50 60,50 70,45" />
    <line x1="55" y1="65" x2="40" y2="85" />
    <line x1="55" y1="65" x2="70" y2="85" />
  `),
  generic: svgWrap(`
    ${head(60, 30)}
    <line x1="60" y1="38" x2="60" y2="70" />
    <line x1="60" y1="45" x2="40" y2="60" />
    <line x1="60" y1="45" x2="80" y2="60" />
    <line x1="60" y1="70" x2="45" y2="92" />
    <line x1="60" y1="70" x2="75" y2="92" />
  `),
};
