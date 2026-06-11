import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

// FSD-гард: импорт разрешён только ВНИЗ (app→widgets→features→entities→shared)
// и НЕ между слайсами одного слоя (кроме санкционированного cross-import `@x`).
// Срабатывает на CI через `vitest run`. eslint в проекте нет — это его замена.

const SRC = join(process.cwd(), 'src')
const RANK: Record<string, number> = { shared: 0, entities: 1, features: 2, widgets: 3, app: 4 }

function walk(dir: string): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p))
    else out.push(p)
  }
  return out
}

function layerOf(path: string): string | null {
  const m = path.replace(/\\/g, '/').match(/src\/(app|widgets|features|entities|shared)\//)
  return m ? m[1] : null
}
function importedLayer(spec: string): string | null {
  const m = spec.match(/^@(shared|entities|features|widgets)\b/)
  return m ? m[1] : null
}
function sliceOf(path: string): string {
  const m = path.replace(/\\/g, '/').match(/src\/(?:widgets|features|entities)\/([^/]+)/)
  return m ? m[1] : ''
}
function importedSlice(spec: string): string {
  const m = spec.match(/^@(?:entities|features|widgets)\/([^/'"]+)/)
  return m ? m[1] : ''
}

describe('FSD boundaries', () => {
  const files = walk(SRC).filter(
    (f) => /\.(ts|tsx)$/.test(f) && !/\.(test|spec)\.[tj]sx?$/.test(f),
  )

  it('нет импорта вверх и кросс-слайс (кроме @x)', () => {
    const violations: string[] = []
    for (const file of files) {
      const layer = layerOf(file)
      if (!layer) continue
      const src = readFileSync(file, 'utf8')
      const specs = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])
      for (const spec of specs) {
        const il = importedLayer(spec)
        if (!il) continue
        const rel = relative(process.cwd(), file).replace(/\\/g, '/')
        if (RANK[il] > RANK[layer]) {
          violations.push(`${rel} (${layer}) → ${spec} [импорт вверх]`)
        } else if (RANK[il] === RANK[layer] && il !== 'shared') {
          const a = sliceOf(file)
          const b = importedSlice(spec)
          if (a && b && a !== b && !spec.includes('/@x/')) {
            violations.push(`${rel} (${a}) → ${spec} [кросс-слайс]`)
          }
        }
      }
    }
    expect(violations, '\n' + violations.join('\n')).toEqual([])
  })
})
