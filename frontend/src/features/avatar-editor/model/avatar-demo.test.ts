import { describe, it, expect } from 'vitest'
import { resolveAvatar } from './avatar-demo'

// Тестируем ЧИСТОЕ гейтирование (node-env, по политике проекта). localStorage-I/O
// (read/write/clear) — браузерное, проверяется визуально (T9).
describe('resolveAvatar (висяк-гейтинг)', () => {
  it('бек главный: user.avatar_kind задан → демо игнорируется', () => {
    const r = resolveAvatar(
      { avatar_kind: 'upload', avatar_url: 'http://x/a.png', avatar_seed: null },
      { kind: 'preset', seed: 'volt_x' },
    )
    expect(r).toEqual({ kind: 'upload', url: 'http://x/a.png', seed: null })
  })
  it('поля user пусты → берётся демо', () => {
    const r = resolveAvatar({ avatar_kind: null }, { kind: 'preset', seed: 'volt_x' })
    expect(r).toEqual({ kind: 'preset', url: undefined, seed: 'volt_x' })
  })
  it('нет ни бека, ни демо → kind null', () => {
    expect(resolveAvatar({}, null)).toEqual({ kind: null })
  })
})
