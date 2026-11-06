import { describe, expect, it } from 'vitest'
import { tooltipPosition } from './tooltip-position'

describe('taste map tooltip', () => {
  it('opens to the left at the maximum X value', () => {
    expect(tooltipPosition(860, 270)).toEqual({ x: 600, y: 226 })
  })

  it('keeps details inside the bottom edge', () => {
    expect(tooltipPosition(860, 480)).toEqual({ x: 600, y: 396 })
  })

  it('leaves room above the details at the minimum X value', () => {
    expect(tooltipPosition(60, 60)).toEqual({ x: 80, y: 16 })
  })

  it('bounds details at the top edge', () => {
    expect(tooltipPosition(460, 0)).toEqual({ x: 480, y: 8 })
  })
})
