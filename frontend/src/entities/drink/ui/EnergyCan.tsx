// SVG energy-drink can illustration.
// Ported 1:1 from `frontendNew/cans.jsx`. Real drink data does not yet carry
// can colors — callers build a CanSpec from drink metadata.

export interface CanSpec {
  body: string
  stripe: string
  accent: string
  label: string
  code: string
}

interface EnergyCanProps {
  can: CanSpec
  name?: string
  w?: number
  h?: number
}

export function EnergyCan({ can, w = 110, h = 240 }: EnergyCanProps) {
  const { body, stripe, accent, label, code } = can
  const safe = code.replace(/[^a-z0-9]/gi, '')
  const gid = `g-${safe}`
  const sid = `s-${safe}`
  const cid = `c-${safe}`
  const clipId = `clip-${safe}`

  return (
    <svg
      viewBox="0 0 110 260"
      width={w}
      height={h}
      style={{
        display: 'block',
        filter: `drop-shadow(0 14px 18px rgba(0,0,0,.55)) drop-shadow(0 0 22px ${stripe}33)`,
      }}
    >
      <defs>
        {/* cylinder body shading */}
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#000" stopOpacity=".55" />
          <stop offset="18%"  stopColor={body} />
          <stop offset="50%"  stopColor={body} />
          <stop offset="80%"  stopColor={body} />
          <stop offset="100%" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
        {/* stripe gradient */}
        <linearGradient id={sid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={stripe} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        {/* cap shading */}
        <linearGradient id={cid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3a3a44" />
          <stop offset="50%"  stopColor="#16161e" />
          <stop offset="100%" stopColor="#2a2a34" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="10" y="30" width="90" height="210" rx="6" ry="6" />
        </clipPath>
      </defs>

      {/* cap (top) */}
      <rect x="14" y="6" width="82" height="14" rx="3" fill={`url(#${cid})`} />
      <rect x="14" y="6" width="82" height="3" rx="1.5" fill="#000" opacity=".5" />
      <rect x="14" y="18" width="82" height="2" fill="#000" opacity=".3" />

      {/* shoulder taper */}
      <path d="M14 20 L96 20 L100 32 L10 32 Z" fill={`url(#${gid})`} />

      {/* main body */}
      <rect x="10" y="30" width="90" height="210" rx="6" ry="6" fill={`url(#${gid})`} />

      {/* bottom shadow */}
      <rect x="10" y="232" width="90" height="8" rx="3" fill="#000" opacity=".5" />

      <g clipPath={`url(#${clipId})`}>
        {/* signature diagonal bolt stripe */}
        <path d="M 5 80 L 105 50 L 105 95 L 5 130 Z" fill={`url(#${sid})`} opacity=".95" />
        <path d="M 5 80 L 105 50" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
        <path d="M 5 130 L 105 95" stroke="#000" strokeOpacity=".35" strokeWidth="1" />

        {/* brand wordmark (vertical, large) */}
        <text
          x="55" y="195" textAnchor="middle"
          fontFamily="Orbitron, sans-serif" fontWeight="800"
          fontSize="14" fill="#fff" letterSpacing="2"
        >
          ENERGY
        </text>

        {/* variant label */}
        <text
          x="55" y="215" textAnchor="middle"
          fontFamily="'Share Tech Mono', monospace" fontWeight="400"
          fontSize="9" fill={stripe} letterSpacing="1.2"
        >
          {label}
        </text>

        {/* product code top */}
        <text
          x="20" y="52" fontFamily="'Share Tech Mono', monospace"
          fontSize="6" fill="#fff" opacity=".65" letterSpacing="1"
        >
          {code}
        </text>
        <text
          x="90" y="52" textAnchor="end" fontFamily="'Share Tech Mono', monospace"
          fontSize="6" fill="#fff" opacity=".65" letterSpacing="1"
        >
          0.45L
        </text>

        {/* brand mark — bolt icon */}
        <path
          d="M 55 138 L 45 168 L 52 168 L 47 188 L 65 158 L 58 158 L 63 138 Z"
          fill="#fff" stroke={stripe} strokeWidth="0.6" opacity=".95"
        />

        {/* highlight (left edge) */}
        <rect x="14" y="30" width="6" height="210" fill="#fff" opacity=".08" />
        {/* shadow (right edge) */}
        <rect x="90" y="30" width="6" height="210" fill="#000" opacity=".25" />
      </g>

      {/* subtle scan-line */}
      <rect x="10" y="225" width="90" height="1" fill="#fff" opacity=".06" />
    </svg>
  )
}
