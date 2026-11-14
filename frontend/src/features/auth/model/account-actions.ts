'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authApi } from '@entities/user'
import { getToken } from '@shared/lib/session'
import { ApiError, RateLimitError, SessionExpiredError } from '@shared/api/http'
import { redirectIfSessionExpired } from '@shared/lib/auth-guard'
import { localizeAuthError } from './auth-errors'

export type ChangeEmailState = { error: string; success?: boolean; email?: string } | null
export type ChangePasswordState = { error: string; success?: boolean } | null

async function confirmPassword(token: string, password: string) {
  const user = await authApi.me(token)
  let accessToken: string
  try {
    // Адрес берём из сессии: поля формы не могут выбрать другой аккаунт.
    const { access_token } = await authApi.login(user.email, password)
    accessToken = access_token
  } catch (error) {
    // На login 401 означает неверный пароль, а не истечение исходной сессии.
    if (error instanceof SessionExpiredError) return null
    if (error instanceof ApiError && error.status === 400 && error.message.includes('LOGIN_BAD_CREDENTIALS')) return null
    throw error
  }
  const confirmed = await authApi.me(accessToken)
  return confirmed.id === user.id ? confirmed : null
}

async function accountError(error: unknown, fallback: string): Promise<string> {
  await redirectIfSessionExpired(error)
  if (error instanceof RateLimitError) return error.message
  return error instanceof ApiError ? localizeAuthError(error, fallback) : fallback
}

export async function changeEmailAction(_prev: ChangeEmailState, formData: FormData): Promise<ChangeEmailState> {
  const token = await getToken()
  if (!token) redirect('/auth/login?return=%2Fprofile%3Ftab%3Daccount')
  const value = formData.get('email')
  const email = typeof value === 'string' ? value.trim() : ''
  const currentPassword = formData.get('currentPassword')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Введите корректный e-mail', email }
  if (typeof currentPassword !== 'string' || !currentPassword) return { error: 'Введите текущий пароль', email }

  try {
    const user = await confirmPassword(token, currentPassword)
    if (!user) return { error: 'Текущий пароль указан неверно', email }
    // Повтор того же адреса тоже сбрасывает подтверждение в существующем API.
    if (email.toLowerCase() === user.email.toLowerCase()) return { error: 'Укажите другой e-mail', email }
    const updated = await authApi.updateMe(token, { email })
    revalidatePath('/', 'layout')
    return { error: '', success: true, email: updated.email }
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return { error: 'Введите корректный e-mail', email }
    return { error: await accountError(error, 'Не удалось сменить e-mail. Попробуйте позже.'), email }
  }
}

export async function changePasswordAction(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const token = await getToken()
  if (!token) redirect('/auth/login?return=%2Fprofile%3Ftab%3Daccount')
  const currentPassword = formData.get('currentPassword')
  const value = formData.get('password')
  const password = typeof value === 'string' ? value : ''
  const confirm = formData.get('confirm')
  if (typeof currentPassword !== 'string' || !currentPassword) return { error: 'Введите текущий пароль' }
  if (Array.from(password).length < 8) return { error: 'Пароль должен быть не короче 8 символов' }
  if (password !== confirm) return { error: 'Пароли не совпадают' }

  try {
    if (!await confirmPassword(token, currentPassword)) return { error: 'Текущий пароль указан неверно' }
    await authApi.updateMe(token, { password })
    return { error: '', success: true }
  } catch (error) {
    return { error: await accountError(error, 'Не удалось сменить пароль. Попробуйте позже.') }
  }
}
