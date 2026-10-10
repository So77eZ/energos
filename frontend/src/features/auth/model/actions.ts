'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { authApi } from '@entities/user'
import { getToken, setToken, clearToken } from '@shared/lib/session'
import { RateLimitError } from '@shared/api/http'
import { localizeAuthError } from './auth-errors'

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
    const { access_token } = await authApi.login(username, password)
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message, username }
    return { error: 'Неверный e-mail или пароль', username }
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
    await authApi.register(username, password)
    const { access_token } = await authApi.login(username, password)
    await setToken(access_token)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message, username }
    return { error: localizeAuthError(e instanceof Error ? e.message : '', 'Ошибка регистрации'), username }
  }

  return { error: '', success: true }
}

export type ForgotPasswordState = { error: string; sent?: boolean; email?: string } | null

/** Запрос письма для сброса пароля (POST /auth/forgot-password). Бэк всегда отвечает 202 и не
 *  раскрывает, есть ли такой e-mail, — поэтому и мы показываем одно и то же сообщение. */
export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = ((formData.get('email') as string) ?? '').trim()
  if (!email) return { error: 'Введите e-mail' }
  try {
    await authApi.forgotPassword(email)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message, email }
    return { error: 'Не удалось отправить запрос. Попробуйте позже.', email }
  }
  return { error: '', sent: true, email }
}

export type ResetPasswordState = { error: string; success?: boolean } | null

/** Установка нового пароля по токену из письма (POST /auth/reset-password). */
export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = (formData.get('token') as string) ?? ''
  const password = (formData.get('password') as string) ?? ''
  const confirm = (formData.get('confirm') as string) ?? ''

  if (!token) return { error: 'В ссылке нет токена. Откройте ссылку из письма целиком.' }
  if (password !== confirm) return { error: 'Пароли не совпадают' }

  try {
    await authApi.resetPassword(token, password)
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: localizeAuthError(e instanceof Error ? e.message : '', 'Не удалось сменить пароль') }
  }
  return { error: '', success: true }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const token = await getToken()
  // Серверный logout — по возможности: cookie чистим в любом случае.
  if (token) await authApi.logout(token).catch(() => undefined)
  await clearToken()
  return { success: true }
}

/** Подтверждение e-mail по токену из письма (POST /auth/verify). Токен — из ссылки /auth/verify?token=... */
export async function verifyEmailAction(token: string): Promise<{ error: string } | { success: true }> {
  try {
    await authApi.verify(token)
    return { success: true }
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message }
    // fastapi-users: 400 с detail VERIFY_USER_BAD_TOKEN / VERIFY_USER_ALREADY_VERIFIED
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('ALREADY_VERIFIED')) return { success: true }
    return { error: 'Ссылка недействительна или устарела. Запросите письмо ещё раз в профиле.' }
  }
}

/** Повторная отправка письма с подтверждением e-mail (POST /auth/request-verify-token). */
export async function resendVerificationAction(): Promise<{ error: string } | { success: true }> {
  const token = await getToken()
  if (!token) return { error: 'Войдите, чтобы запросить письмо' }
  try {
    const me = await authApi.me(token)
    await authApi.requestVerifyToken(me.email)
    return { success: true }
  } catch (e) {
    if (e instanceof RateLimitError) return { error: e.message }
    return { error: 'Не удалось отправить письмо' }
  }
}
