'use server'

import { reviewEmojiApi } from '@entities/review'
import { getToken } from '@shared/lib/session'

export type ToggleEmojiResult =
  | { ok: true; nowMine: boolean }
  | { ok: false; error: string }

/**
 * Server action — переключает мою реакцию на отзыв.
 * Если currentlyMine=true → DELETE, иначе → POST.
 */
export async function toggleEmojiReactionAction(
  reviewId: number,
  emoji: string,
  currentlyMine: boolean,
): Promise<ToggleEmojiResult> {
  const token = await getToken()
  if (!token) return { ok: false, error: 'Не авторизован' }

  try {
    if (currentlyMine) {
      await reviewEmojiApi.remove(reviewId, emoji, token)
      return { ok: true, nowMine: false }
    } else {
      await reviewEmojiApi.add(reviewId, emoji, token)
      return { ok: true, nowMine: true }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Ошибка сервера'
    return { ok: false, error: msg }
  }
}
