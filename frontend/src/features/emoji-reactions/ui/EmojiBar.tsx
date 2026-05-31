'use client'

import { useEffect, useRef, useState } from 'react'
import { aggregateEmojis, reviewEmojiApi, type EmojiAggregate, type ReviewEmoji } from '@entities/review'
import { useToast } from '@shared/lib/toast'
import { useCurrentUser } from '@shared/lib/user'
import { Icons } from '@shared/ui/icons'
import { toggleEmojiReactionAction } from '../actions'

interface EmojiBarProps {
  reviewId: number
}

// Пресет в picker'е — общее «универсальное» эмоджи для отзывов о напитках.
// Кастомных кодов нет — нативный unicode идёт прямо в POST query-param.
const PRESET_EMOJIS = ['🔥', '👍', '👎', '💯', '🤙', '❤️', '😂', '🤮']

export function EmojiBar({ reviewId }: EmojiBarProps) {
  const { userId } = useCurrentUser()
  const { toast } = useToast()

  const [reactions, setReactions] = useState<ReviewEmoji[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  // Picker по умолчанию раскрывается вверх; если над якорем мало места
  // (отзыв близко к верху viewport) — флипаем вниз, чтобы не уехать за край.
  const [dropUp, setDropUp] = useState(true)
  const [pending, setPending] = useState(false)
  const pickerAnchorRef = useRef<HTMLDivElement | null>(null)

  function togglePicker() {
    if (!pickerOpen) {
      const rect = pickerAnchorRef.current?.getBoundingClientRect()
      // Примерная высота picker'а + зазор. Если над якорем меньше — вниз.
      const PICKER_H = 52
      setDropUp(!rect || rect.top > PICKER_H)
    }
    setPickerOpen((v) => !v)
  }

  // Загружаем реакции при mount + при смене reviewId.
  useEffect(() => {
    let cancelled = false
    reviewEmojiApi
      .list(reviewId)
      .then((data) => {
        if (!cancelled) setReactions(data)
      })
      .catch(() => {
        if (!cancelled) setReactions([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [reviewId])

  // Esc и клик-вне для picker'а.
  useEffect(() => {
    if (!pickerOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPickerOpen(false)
    }
    function onClick(e: MouseEvent) {
      if (pickerAnchorRef.current?.contains(e.target as Node)) return
      setPickerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => window.addEventListener('click', onClick), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
      clearTimeout(t)
    }
  }, [pickerOpen])

  const aggregates: EmojiAggregate[] = aggregateEmojis(reactions, userId)

  async function toggle(emoji: string, currentlyMine: boolean) {
    if (userId == null) {
      toast({ kind: 'info', msg: 'Войди, чтобы оставлять реакции' })
      return
    }
    if (pending) return
    setPending(true)

    // Оптимистично: добавляем/убираем свою реакцию из массива локально.
    setReactions((prev) => {
      if (currentlyMine) {
        return prev.filter((r) => !(r.user_id === userId && r.emoji_unicode === emoji))
      }
      // Добавляем temp-реакцию с id=-1 (заменится при перезагрузке если нужно).
      return [
        ...prev,
        {
          id: -1, emoji_unicode: emoji, review_id: reviewId, user_id: userId,
          created_at: null, updated_at: null,
        },
      ]
    })

    const result = await toggleEmojiReactionAction(reviewId, emoji, currentlyMine)
    setPending(false)

    if (!result.ok) {
      // Откат.
      setReactions((prev) => {
        if (currentlyMine) {
          return [
            ...prev,
            {
              id: -1, emoji_unicode: emoji, review_id: reviewId, user_id: userId,
              created_at: null, updated_at: null,
            },
          ]
        }
        return prev.filter((r) => !(r.user_id === userId && r.emoji_unicode === emoji))
      })
      toast({ kind: 'err', msg: result.error || 'Не удалось обновить реакцию' })
    }
  }

  function onPick(emoji: string) {
    setPickerOpen(false)
    const mine = aggregates.find((a) => a.emoji === emoji)?.mine ?? false
    void toggle(emoji, mine)
  }

  if (loading) {
    // Минимальный placeholder чтобы layout не прыгал.
    return <div className="emoji-bar emoji-bar-empty" aria-hidden="true" />
  }

  return (
    <div className="emoji-bar">
      {aggregates.map((a) => (
        <button
          key={a.emoji}
          type="button"
          className={`emoji-chip${a.mine ? ' is-mine' : ''}`}
          onClick={() => toggle(a.emoji, a.mine)}
          disabled={pending}
          aria-pressed={a.mine}
          title={a.mine ? 'Убрать мою реакцию' : 'Поставить реакцию'}
        >
          <span className="emoji-chip-glyph">{a.emoji}</span>
          <span className="emoji-chip-count">{a.count}</span>
        </button>
      ))}

      <div className="emoji-add-anchor" ref={pickerAnchorRef}>
        <button
          type="button"
          className="emoji-add"
          onClick={togglePicker}
          aria-expanded={pickerOpen}
          aria-haspopup="menu"
          title="Добавить реакцию"
        >
          <Icons.plus w={12} />
        </button>
        {pickerOpen && (
          <div className={`emoji-picker${dropUp ? '' : ' is-down'}`} role="menu">
            {PRESET_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                role="menuitem"
                className="emoji-picker-item"
                onClick={() => onPick(e)}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
