export const AVATAR_SHAPES = ['circle', 'rounded', 'hex'] as const
export type AvatarShape = (typeof AVATAR_SHAPES)[number]

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Рисует путь формы в текущий ctx (центр x,y; габарит d). Общий модуль для
 *  WYSIWYG-overlay редактора и output-клипа crop-output → preview == output. */
export function shapePath(ctx: CanvasRenderingContext2D, s: AvatarShape, x: number, y: number, d: number) {
  const r = d / 2
  ctx.beginPath()
  if (s === 'circle') {
    ctx.arc(x, y, r, 0, Math.PI * 2)
  } else if (s === 'rounded') {
    roundRect(ctx, x - r, y - r, d, d, d * 0.26)
  } else {
    const pts = [[0.5, 0], [0.93, 0.25], [0.93, 0.75], [0.5, 1], [0.07, 0.75], [0.07, 0.25]]
    pts.forEach((p, i) => {
      const px = x - r + p[0] * d
      const py = y - r + p[1] * d
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
    })
    ctx.closePath()
  }
}
