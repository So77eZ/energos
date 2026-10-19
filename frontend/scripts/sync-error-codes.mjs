// Переносит коды ошибок бэка (backend/core/error_codes.py) во фронт:
// пишет src/shared/api/error-codes.ts. Запуск: `npm run sync:error-codes` после правки кодов на бэке.
// Тест src/shared/api/error-codes.test.ts падает, если файл отстал от бэка.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
export const PY_PATH = path.resolve(here, '../../backend/core/error_codes.py')
export const TS_PATH = path.resolve(here, '../src/shared/api/error-codes.ts')

/** Коды из `class ErrorCode(StrEnum)`: строки вида `NAME = "VALUE"`. */
export function parseErrorCodes(pySource) {
  return [...pySource.matchAll(/^\s+[A-Z][A-Z0-9_]*\s*=\s*"([A-Z][A-Z0-9_]*)"/gm)].map((m) => m[1])
}

export function renderErrorCodes(pySource) {
  const codes = parseErrorCodes(pySource)
  if (codes.length === 0) throw new Error('в error_codes.py не найдено ни одного кода')
  return [
    '// Сгенерировано scripts/sync-error-codes.mjs из backend/core/error_codes.py — не править руками.',
    '// Обновить: npm run sync:error-codes',
    '',
    'export const ERROR_CODES = [',
    ...codes.map((c) => `  '${c}',`),
    '] as const',
    '',
    'export type ErrorCode = (typeof ERROR_CODES)[number]',
    '',
  ].join('\n')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ts = renderErrorCodes(readFileSync(PY_PATH, 'utf8'))
  writeFileSync(TS_PATH, ts)
  console.log(`error-codes.ts: ${parseErrorCodes(readFileSync(PY_PATH, 'utf8')).length} кодов`)
}
