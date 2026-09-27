'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authApi } from '@entities/user'
import { setToken, clearToken } from '@shared/lib/session'
import { RateLimitError } from '@shared/api/http'
import { clientIpHeaders } from '@shared/lib/client-ip'

// username возвращается в состоянии, чтобы форма подставила его обратно:
// React 19 после server action сбрасывает неуправляемые поля (#299).
// Пароли не возвращаем — их пользователь вводит заново.
export type AuthFormState = { error: string; success?: boolean; username?: string } | null

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  try {
    const { access_token } = await authApi.login(username, password, await clientIpHeaders())
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message, username }
    return { error: 'Неверный логин или пароль', username }
  }

  // Вместо redirect (который вызывает soft-навигацию),
  // даем команду клиенту выполнить window.location.href='/'.
  return { error: '', success: true }
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return { error: 'Пароли не совпадают', username }

  try {
    const ipHeaders = await clientIpHeaders()
    await authApi.register(username, password, ipHeaders)
    const { access_token } = await authApi.login(username, password, ipHeaders)
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message, username }
    return { error: e instanceof Error ? e.message : 'Ошибка регистрации', username }
  }

  return { error: '', success: true }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  await clearToken()
  return { success: true }
}
