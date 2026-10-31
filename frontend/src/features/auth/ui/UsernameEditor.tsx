'use client'

import { useActionState, useEffect, useState } from 'react'
import { Icons } from '@shared/ui/icons'
import { changeUsernameAction } from '../model/actions'

/** Имя в шапке профиля с карандашом: по клику — поле и «Сохранить». */
export function UsernameEditor({ username }: { username: string }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, isPending] = useActionState(changeUsernameAction, null)

  useEffect(() => {
    if (state?.success) setEditing(false)
  }, [state])

  if (!editing) {
    return (
      <div className="prof-name-row">
        <h1 className="prof-name">{username}</h1>
        <button type="button" className="prof-name-edit" onClick={() => setEditing(true)} aria-label="Изменить имя">
          <Icons.edit w={15} />
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="prof-name-form">
      <input
        name="nickname"
        className="prof-name-input"
        defaultValue={state?.nickname ?? username}
        aria-label="Новое имя"
        required
        minLength={3}
        maxLength={32}
        autoComplete="nickname"
        autoFocus
      />
      <button type="submit" className="cta-primary" disabled={isPending}>
        {isPending ? 'Сохранение…' : 'Сохранить'}
      </button>
      <button type="button" className="cta-ghost" onClick={() => setEditing(false)} disabled={isPending}>
        Отменить
      </button>
      {state?.error && <p className="auth-error prof-name-error">{state.error}</p>}
    </form>
  )
}
