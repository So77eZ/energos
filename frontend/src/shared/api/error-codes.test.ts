import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PY_PATH, TS_PATH, parseErrorCodes, renderErrorCodes } from '../../../scripts/sync-error-codes.mjs'

describe('коды ошибок фронта совпадают с бэком', () => {
  // Без backend/ рядом (например, в docker-сборке фронта) сверять не с чем.
  it.skipIf(!existsSync(PY_PATH))('error-codes.ts сгенерирован из текущего error_codes.py (иначе: npm run sync:error-codes)', () => {
    expect(readFileSync(TS_PATH, 'utf8').replace(/\r\n/g, '\n')).toBe(renderErrorCodes(readFileSync(PY_PATH, 'utf8')))
  })

  it('парсер берёт значения из StrEnum и пропускает остальное', () => {
    const py = 'from enum import StrEnum\n\nclass ErrorCode(StrEnum):\n    A_CODE = "A_CODE"\n\n    B2 = "B2"\n'
    expect(parseErrorCodes(py)).toEqual(['A_CODE', 'B2'])
  })
})
