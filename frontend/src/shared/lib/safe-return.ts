// Анти-open-redirect для return-to при грейсфул-401.
// Изоморфный (без серверных импортов): зовётся и на сервере (Referer-парсер
// в auth-guard), и на клиенте/в RSC (чтение ?return= на логин-странице).

const DEFAULT_RETURN = '/'

// C0-control-байты (0x00-0x1F) + DEL (0x7F). Без regex-эскейпов в исходнике —
// проверка по charCode, чтобы в файл не попадали невидимые литералы.
function hasControlByte(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c <= 0x1f || c === 0x7f) return true
  }
  return false
}

/** Пускает только безопасный относительный путь своего приложения.
 *  Режет: не-/ начало, // и /\ (protocol-relative), control-байты, /scheme: */
export function safeReturnPath(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_RETURN
  if (!raw.startsWith('/')) return DEFAULT_RETURN
  if (raw.startsWith('//') || raw.startsWith('/\\')) return DEFAULT_RETURN
  if (hasControlByte(raw)) return DEFAULT_RETURN
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(raw)) return DEFAULT_RETURN
  return raw
}

/** Referer (абсолютный) → относительный path+search своего origin, затем safe-проверка.
 *  Чужой origin или мусор → дефолт. Нельзя гнать сырой Referer прямо в safeReturnPath —
 *  абсолютный URL отрежется в '/', и return-to не заработает. */
export function returnPathFromReferer(referer: string | null, ownOrigin: string): string {
  if (!referer) return DEFAULT_RETURN
  try {
    const u = new URL(referer)
    if (u.origin !== ownOrigin) return DEFAULT_RETURN
    return safeReturnPath(u.pathname + u.search)
  } catch {
    return DEFAULT_RETURN
  }
}
