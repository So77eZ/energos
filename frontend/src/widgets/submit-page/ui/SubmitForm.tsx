'use client'

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@entities/user'
import type { Submission } from '@entities/submission'
import { Icons } from '@shared/ui/icons'
import { ROUTES } from '@shared/config/routes'
import { useSubmissions } from '@shared/lib/submissions'
import { useToast } from '@shared/lib/toast'

interface SubmitFormProps {
  currentUser: User
  onSubmitted: (item: Submission) => void
}

const NAME_MIN = 2
const NAME_MAX = 80
const COMMENT_MAX = 500
const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export function SubmitForm({ currentUser, onSubmitted }: SubmitFormProps) {
  const router = useRouter()
  const { add } = useSubmissions()
  const { toast } = useToast()

  const [name, setName]       = useState('')
  const [comment, setComment] = useState('')
  const [price, setPrice]     = useState('')
  const [photo, setPhoto]     = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const trimmedName = name.trim()
  const nameValid = trimmedName.length >= NAME_MIN
  const priceValid = price === '' || (!isNaN(parseFloat(price)) && parseFloat(price) > 0)
  const canSubmit = nameValid && priceValid

  function readFile(file: File | undefined | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ kind: 'err', msg: 'Загрузи изображение (jpg / png)' })
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast({ kind: 'err', msg: 'Файл больше 5 МБ — сожми перед загрузкой' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhoto(String(e.target?.result ?? ''))
      setPhotoName(file.name)
    }
    reader.readAsDataURL(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    readFile(e.target.files?.[0])
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    readFile(e.dataTransfer.files?.[0])
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    const item = add({
      user_id: currentUser.id,
      user_name: currentUser.username,
      drink_name: trimmedName,
      comment: comment.trim() || null,
      price: price === '' ? null : parseFloat(price),
      photo,
    })
    toast({ kind: 'ok', msg: `Заявка №${item.id} отправлена — ждёт модерации` })
    onSubmitted(item)
  }

  return (
    <form className="submit-form" onSubmit={onSubmit}>
      <div className="submit-form-grid">
        {/* LEFT — photo */}
        <div className="submit-form-col submit-form-photo">
          <label className="submit-label">
            Фото банки <span className="opt">опционально</span>
          </label>
          <div
            className={`submit-drop${dragOver ? ' over' : ''}${photo ? ' has-photo' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFileChange}
            />
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="preview" className="submit-drop-img" />
                <div className="submit-drop-meta">
                  <span className="submit-drop-name">{photoName}</span>
                  <button
                    type="button"
                    className="submit-drop-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPhoto(null)
                      setPhotoName('')
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                  >
                    <Icons.x w={14} /> убрать
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="submit-drop-icon"><Icons.upload w={30} /></div>
                <div className="submit-drop-title">Перетащи изображение</div>
                <div className="submit-drop-sub">или кликни, чтобы выбрать</div>
                <div className="submit-drop-hint">JPG / PNG · до 5 МБ</div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — fields */}
        <div className="submit-form-col">
          <div className="submit-field">
            <label className="submit-label" htmlFor="sub-name">
              Название <span className="req">*</span>
            </label>
            <input
              id="sub-name"
              className={`submit-input${name && !nameValid ? ' submit-input-err' : ''}`}
              placeholder="Например: BURN Mango Loco"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="submit-hint">
              <span>{name.length}/{NAME_MAX}</span>
              {!nameValid && name && <span className="submit-err">минимум {NAME_MIN} символа</span>}
            </div>
          </div>

          <div className="submit-field">
            <label className="submit-label" htmlFor="sub-price">
              Цена <span className="opt">опционально, ₽</span>
            </label>
            <input
              id="sub-price"
              className={`submit-input${price && !priceValid ? ' submit-input-err' : ''}`}
              type="number"
              step="0.01"
              min="0"
              placeholder="89.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div className="submit-hint">
              <span>Если знаешь среднюю цену по магазинам</span>
              {!priceValid && <span className="submit-err">введи число &gt; 0</span>}
            </div>
          </div>

          <div className="submit-field">
            <label className="submit-label" htmlFor="sub-comment">
              Комментарий <span className="opt">опционально</span>
            </label>
            <textarea
              id="sub-comment"
              className="submit-textarea"
              placeholder="Где видел, какие ноты вкуса, чем интересен. Это поможет админу разобраться."
              rows={4}
              maxLength={COMMENT_MAX}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="submit-hint">
              <span>{comment.length}/{COMMENT_MAX}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="submit-foot">
        <button type="button" className="cta-ghost" onClick={() => router.push(ROUTES.home)}>
          Отменить
        </button>
        <button type="submit" className="cta-primary" disabled={!canSubmit}>
          <Icons.check w={14} /> Отправить заявку
        </button>
      </div>

      <div className="submit-notice">
        <Icons.beaker w={12} />
        <span>
          Заявка пройдёт модерацию. Тебе будет видно её статус в разделе{' '}
          <b>Профиль → Мои заявки</b>.
        </span>
      </div>
    </form>
  )
}
