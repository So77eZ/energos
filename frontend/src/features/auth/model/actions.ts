'use server'

import { redirect } from 'next/navigation'
import { authApi } from '@entities/user'
import { setToken, clearToken } from '@shared/lib/session'
import { RateLimitError } from '@shared/api/http'

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  try {
    const { access_token } = await authApi.login(username, password)
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: 'Неверный логин или пароль' }
  }

  redirect('/')
}

export async function registerAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return { error: 'Пароли не совпадают' }

  try {
    await authApi.register(username, password)
    const { access_token } = await authApi.login(username, password)
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: e instanceof Error ? e.message : 'Ошибка регистрации' }
  }

  redirect('/')
}

export async function logoutAction(): Promise<void> {
  await clearToken()
  redirect('/auth/login')
}
