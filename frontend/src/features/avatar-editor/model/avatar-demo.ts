// TODO(backend #10): весь модуль убрать когда /me/avatar эндпоинты появятся —
// тогда avatar_kind/url/seed приходят с бека в User и localStorage-демо не нужен.
const KEY = (id: number) => `energos_avatar_demo_${id}`

export interface AvatarDemo { kind: 'upload' | 'preset'; url?: string; seed?: string }
export interface ResolvedAvatar { kind: 'upload' | 'preset' | null; url?: string | null; seed?: string | null }

export function readAvatarDemo(id: number): AvatarDemo | null {
  try {
    const r = localStorage.getItem(KEY(id))
    return r ? (JSON.parse(r) as AvatarDemo) : null
  } catch {
    return null
  }
}

export function writeAvatarDemo(id: number, d: AvatarDemo): void {
  try { localStorage.setItem(KEY(id), JSON.stringify(d)) } catch {}
}

export function clearAvatarDemo(id: number): void {
  try { localStorage.removeItem(KEY(id)) } catch {}
}

/** Чистое гейтирование (без localStorage — тестируется юнитом в node-env по политике
 *  проекта): бек главный (user.avatar_* пришёл → он источник); иначе — переданный
 *  localStorage-демо (висяк до #10); иначе null. Демо НЕ перебивает данные бека.
 *  Call-site: `resolveAvatar(user, readAvatarDemo(user.id))`. */
export function resolveAvatar(
  user: { avatar_kind?: 'upload' | 'preset' | null; avatar_url?: string | null; avatar_seed?: string | null },
  demo: AvatarDemo | null,
): ResolvedAvatar {
  if (user.avatar_kind) return { kind: user.avatar_kind, url: user.avatar_url, seed: user.avatar_seed }
  if (demo) return { kind: demo.kind, url: demo.url, seed: demo.seed }
  return { kind: null }
}
