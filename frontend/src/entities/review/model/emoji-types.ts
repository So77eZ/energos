// Бэк: backend/src/api/review_emoji.py
//   GET    /api/reviews/{review_id}/emojis/                — public, list[ReviewEmojiSchema]
//   POST   /api/reviews/{review_id}/emojis/?emoji=🤙        — auth, 201
//   DELETE /api/reviews/{review_id}/emojis/?emoji=🤙        — auth, 204
//
// Уникальность по (review_id, user_id, emoji_unicode) — один юзер не может
// поставить один и тот же эмодзи дважды, но разные — может.

export interface ReviewEmoji {
  id: number
  emoji_unicode: string
  review_id: number
  user_id: number
  created_at: string | null
  updated_at: string | null
}

/** Агрегат по emoji-символу: сколько всего и стоит ли своя реакция. */
export interface EmojiAggregate {
  emoji: string
  count: number
  mine: boolean
}

/** Группируем массив реакций по emoji_unicode. mine — есть ли реакция от currentUserId. */
export function aggregateEmojis(
  reactions: ReviewEmoji[],
  currentUserId: number | null,
): EmojiAggregate[] {
  const map = new Map<string, EmojiAggregate>()
  for (const r of reactions) {
    const a = map.get(r.emoji_unicode) ?? { emoji: r.emoji_unicode, count: 0, mine: false }
    a.count += 1
    if (currentUserId != null && r.user_id === currentUserId) a.mine = true
    map.set(r.emoji_unicode, a)
  }
  // Сортируем по убыванию count, при равенстве — по unicode для стабильности.
  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji),
  )
}
