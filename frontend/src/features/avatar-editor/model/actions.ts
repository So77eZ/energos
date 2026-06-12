'use client'

import { writeAvatarDemo, clearAvatarDemo } from './avatar-demo'

// Server-actions по контракту #10 + localStorage-fallback (висяк).
// TODO(backend #10): когда эндпоинты появятся — убрать try/catch-fallback, оставить fetch.
const BASE = '/api/auth/me/avatar'

export async function saveAvatarAction(userId: number, blob: Blob): Promise<void> {
  try {
    const fd = new FormData()
    fd.append('file', blob, 'avatar.png')
    const res = await fetch(BASE, { method: 'POST', body: fd, credentials: 'include' })
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    // висяк: бек #10 ещё нет → демо в localStorage (dataURL переживёт перезагрузку)
    const url = await blobToDataURL(blob)
    writeAvatarDemo(userId, { kind: 'upload', url })
  }
}

export async function savePresetAction(userId: number, seed: string): Promise<void> {
  try {
    const res = await fetch(`${BASE}/preset`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed }),
      credentials: 'include',
    })
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    writeAvatarDemo(userId, { kind: 'preset', seed })
  }
}

export async function removeAvatarAction(userId: number): Promise<void> {
  try {
    const res = await fetch(BASE, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    // бек недоступен — всё равно чистим демо ниже
  }
  clearAvatarDemo(userId)
}

function blobToDataURL(b: Blob): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onloadend = () => resolve(r.result as string)
    r.readAsDataURL(b)
  })
}
