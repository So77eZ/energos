import type { JSX } from 'react'

// Размер задаёт CSS (.medal-core svg { width: var(--isz) }) — глифы без width/height.
type Glyph = () => JSX.Element

const S = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

export const BADGE_ICONS: Record<string, Glyph> = {
  'first-review': () => (<svg {...S}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>),
  'five-reviews': () => (<svg {...S}><path d="M5 4h14l-1.3 14.2a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3z" /><path d="M6.4 9h11.2" /></svg>),
  'twenty-reviews': () => (<svg {...S}><circle cx="12" cy="9" r="6" /><path d="m9 14.2-2.2 7.3L12 18l5.2 3.5-2.2-7.3" /></svg>),
  'first-fav': () => (<svg {...S}><path d="M12 20.5C7 16.7 3.5 13.6 3.5 9.4 3.5 6.9 5.4 5 7.8 5c1.6 0 3.1.9 3.8 2.3.7-1.4 2.2-2.3 3.8-2.3 2.4 0 4.3 1.9 4.3 4.4 0 4.2-3.5 7.3-8.5 11.1z" /></svg>),
  'ten-favs': () => (<svg {...S}><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 16 9 5 9-5M3 12l9 5 9-5" /></svg>),
  'first-submit': () => (<svg {...S}><path d="M21 3 10.5 13.5" /><path d="M21 3 14.5 21l-4-8.5L2 8.5z" /></svg>),
  'approved-submit': () => (<svg {...S}><circle cx="12" cy="12" r="9" /><path d="m8 12 2.8 2.8L16 9" /></svg>),
  'three-approved': () => (<svg {...S}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="m8.5 13 2 2 4-4" /></svg>),
  'critic': () => (<svg {...S}><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" /><path d="M8.5 10h7M8.5 13.5h4.5" /></svg>),
  'connoisseur': () => (<svg {...S}><path d="M20.2 12.2A6 6 0 0 0 11.8 3.8L5 10.6V19h8.4z" /><path d="m16 8-12 12" /><path d="M17.4 15H9" /></svg>),
  'sweet-tooth': () => (<svg {...S}><circle cx="9.5" cy="8.5" r="6.3" /><path d="m13.9 13.1 5.1 6.6" /><path d="M7 8.5a2.5 2.5 0 0 1 5 .2 1.5 1.5 0 0 1-2.9.3" /></svg>),
  'night-owl': () => (<svg {...S}><path d="M20 14.3A8 8 0 1 1 9.7 4 6.3 6.3 0 0 0 20 14.3z" /><path d="M18 3.5v3M16.5 5h3" /></svg>),
  'universalist': () => (<svg {...S}><rect x="3" y="4" width="18" height="3" rx="1" /><rect x="3" y="10.5" width="13" height="3" rx="1" /><rect x="3" y="17" width="8" height="3" rx="1" /></svg>),
  'pioneer': () => (<svg {...S}><path d="M5 22V3" /><path d="M5 3.5h12l-2.2 4.2L17 12H5" /></svg>),
  'activist': () => (<svg {...S}><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.5L3 21l1.9-5.6A8.5 8.5 0 1 1 21 11.5z" /><path d="M12 15.2c-2.6-1.7-3.6-3-3.6-4.4a1.7 1.7 0 0 1 3.1-1 1.7 1.7 0 0 1 3.1 1c0 1.4-1 2.7-2.6 4.4z" /></svg>),
  'top10': () => (<svg {...S}><path d="M3 7.5 7 11l5-6.5L17 11l4-3.5L19 19H5z" /><path d="M5 19h14" /></svg>),
  'logo-maniac': () => (<svg {...S}><path d="M13 2 4 14h6l-1 8 9-12h-6z" /><circle cx="12" cy="12" r="10" /></svg>),
  'pathfinder': () => (<svg {...S}><path d="m12 2 2.4 6.3L21 9l-5 4.2L17.6 20 12 16.4 6.4 20 8 13.2 3 9l6.6-.7z" /></svg>),
  'can-demolitionist': () => (<svg {...S}><circle cx="12" cy="13" r="7" /><path d="M12 6V2M12 2l-2 2M12 2l2 2" /><path d="m9.5 12 1.5 2 3.5-4" /></svg>),
  'can-turbine': () => (<svg {...S}><circle cx="12" cy="12" r="3" /><path d="M12 9c1-3 0-5-1.5-6 3 .5 4.5 2.5 4.5 6M15 12c3-1 5 0 6 1.5-.5-3-2.5-4.5-6-4.5M12 15c-1 3 0 5 1.5 6-3-.5-4.5-2.5-4.5-6M9 12c-3 1-5 0-6-1.5.5 3 2.5 4.5 6 4.5" /></svg>),
  'can-chain': () => (<svg {...S}><path d="M8.5 11 7 12.5a3 3 0 1 0 4.2 4.2L12.7 15M15.5 13 17 11.5a3 3 0 1 0-4.2-4.2L11.3 9" /><path d="M10 14l4-4" /></svg>),
  _default: () => (<svg {...S}><circle cx="12" cy="12" r="7" /></svg>),
}
