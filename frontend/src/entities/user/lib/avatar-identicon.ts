// Детерминированный neon-identicon от seed → PNG dataURL. Порт makePreset из макета
// (fromDesign/Avatar Editor.html). Модульный кэш: один seed считается раз (canvas+toDataURL
// тяжёлый; без кэша джанк в плотных списках на каждый ре-рендер).
const METRIC = ['#00e5ff', '#ff2e88', '#00ff9d', '#fbbf24', '#c084fc', '#4d96ff']
const cache = new Map<string, string>()

export const AVATAR_PRESET_SEEDS = ['neon_drift', 'volt_x', 'citrus_42', 'pulse', 'hex_core', 'aurora_9']

// cells: 0 = off, 1 = цвет ca, 2 = цвет cb
export interface IdenticonData { ca: string; cb: string; cells: number[][] }

/** Чистая детерминированная часть (без canvas): hash+PRNG → 2 цвета + 3×6 матрица ячеек.
 *  Тестируется юнитом; makeIdenticon её рисует. */
export function identiconData(seed: string): IdenticonData {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296 }
  const ca = METRIC[Math.floor(rnd() * METRIC.length)]
  let cb = METRIC[Math.floor(rnd() * METRIC.length)]
  if (cb === ca) cb = METRIC[(METRIC.indexOf(ca) + 2) % METRIC.length]
  const cells: number[][] = []
  for (let i = 0; i < 3; i++) {
    cells[i] = []
    for (let j = 0; j < 6; j++) {
      const on = rnd() > 0.5
      const useA = rnd() > 0.5
      cells[i][j] = on ? (useA ? 1 : 2) : 0
    }
  }
  return { ca, cb, cells }
}

export function makeIdenticon(seed: string): string {
  const hit = cache.get(seed)
  if (hit) return hit
  const { ca, cb, cells } = identiconData(seed)
  const c = document.createElement('canvas')
  c.width = c.height = 120
  const x = c.getContext('2d')!
  const g = x.createLinearGradient(0, 0, 120, 120)
  g.addColorStop(0, '#10101a'); g.addColorStop(1, '#070710')
  x.fillStyle = g; x.fillRect(0, 0, 120, 120)
  const cell = 20
  for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) {
    const v = cells[i][j]
    if (v) {
      x.fillStyle = v === 1 ? ca : cb
      x.globalAlpha = 0.85
      x.fillRect(i * cell, j * cell, cell, cell)
      x.fillRect((5 - i) * cell, j * cell, cell, cell)
    }
  }
  x.globalAlpha = 1
  const rg = x.createRadialGradient(60, 60, 2, 60, 60, 46)
  rg.addColorStop(0, ca); rg.addColorStop(0.5, ca + '00'); rg.addColorStop(1, 'transparent')
  x.globalCompositeOperation = 'lighter'
  x.fillStyle = rg; x.beginPath(); x.arc(60, 60, 46, 0, 7); x.fill()
  x.globalCompositeOperation = 'source-over'
  x.fillStyle = 'rgba(255,255,255,0.92)'
  x.save(); x.translate(60, 60); x.scale(2.2, 2.2); x.beginPath()
  const bolt = [[1, -11], [-4, 2], [0, 2], [-1, 11], [5, -3], [1, -3]]
  bolt.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])))
  x.closePath(); x.fill(); x.restore()
  const url = c.toDataURL()
  cache.set(seed, url)
  return url
}
