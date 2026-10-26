import { describe, it, expect } from 'vitest'
import { FONTS, FONT_STACKS } from './fonts'

describe('FONT_STACKS', () => {
  it('у каждого шрифта стек начинается с него самого и есть запасной (кириллица)', () => {
    for (const { id } of FONTS) {
      const families = FONT_STACKS[id].split(',').map((f) => f.trim())
      expect(families[0]).toBe(`'${id}'`)
      expect(families.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('шрифты без кириллицы откатываются на загруженные шрифты с кириллицей, а не на системный serif', () => {
    expect(FONT_STACKS['Orbitron']).toContain(`'Russo One'`)
    expect(FONT_STACKS['Rajdhani']).toContain(`'Exo 2'`)
    expect(FONT_STACKS['Share Tech Mono']).toContain(`'JetBrains Mono'`)
  })
})
