import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BANNED_NICKNAMES, validateNickname } from './nickname'

const CONSTANTS_PY = path.resolve(__dirname, '../../../../../backend/core/constants.py')

describe('validateNickname — те же правила, что UserManager.validate_username на бэке', () => {
  it.each(['Fox', 'e2e_k3j9x', 'playwright_taken', 'a-b_c', 'adminka', 'a'.repeat(32)])('подходит: %j', (nick) =>
    expect(validateNickname(nick)).toBeNull(),
  )

  it.each([
    ['ab', /от 3 до 32/],
    ['a'.repeat(33), /от 3 до 32/],
    ['Лиса', /латинские буквы/],
    ['fox bear', /латинские буквы/],
    ['fox.com', /латинские буквы/],
    ['http://x', /латинские буквы/],
    ['_fox', /начинаться и заканчиваться/],
    ['fox-', /начинаться и заканчиваться/],
    ['fo__x', /подряд/],
    ['fo-_x', /подряд/],
    ['Admin', /зарезервировано/],
    ['undefined', /зарезервировано/],
  ])('не подходит: %j', (nick, error) => expect(validateNickname(nick)).toMatch(error))

  it.skipIf(!existsSync(CONSTANTS_PY))('список запрещённых имён совпадает с BANNED_USERNAMES бэка', () => {
    const block = readFileSync(CONSTANTS_PY, 'utf8').match(/BANNED_USERNAMES\s*=\s*\{([^}]*)\}/)?.[1] ?? ''
    const backend = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1])
    expect(backend.length).toBeGreaterThan(0)
    expect([...BANNED_NICKNAMES].sort()).toEqual(backend.sort())
  })
})
