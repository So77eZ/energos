/** Сколько секунд осталось жить JWT (по полю `exp`), `null` — если токен не разобрать.
 *  Подпись не проверяем: это только расчёт срока cookie, а проверяет токен бэк. */
export function secondsUntilExpiry(token: string, nowMs: number = Date.now()): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'))
    return typeof payload.exp === 'number' ? Math.floor(payload.exp - nowMs / 1000) : null
  } catch {
    return null
  }
}
