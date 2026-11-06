export const MAP_WIDTH = 920
export const MAP_HEIGHT = 540
export const TOOLTIP_WIDTH = 240
export const TOOLTIP_HEIGHT = 136

export function tooltipPosition(cx: number, cy: number): { x: number; y: number } {
  const x = cx + 20 + TOOLTIP_WIDTH > MAP_WIDTH ? cx - TOOLTIP_WIDTH - 20 : cx + 20
  return {
    x: Math.max(8, Math.min(MAP_WIDTH - TOOLTIP_WIDTH - 8, x)),
    y: Math.max(8, Math.min(MAP_HEIGHT - TOOLTIP_HEIGHT - 8, cy - 44)),
  }
}
