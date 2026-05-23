'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useRef, useState, useTransition } from 'react'
import type { Drink } from '@entities/drink'
import { METRIC_KEYS, MetricRatingInput, type Review, type ReviewMetrics } from '@entities/review'
import { ROUTES } from '@shared/config/routes'
import { Icons } from '@shared/ui/icons'
import { deleteDrinkAction } from '../model/actions'

interface DrinkFormProps {
  mode: 'create' | 'edit'
  drink?: Drink
  adminReview?: Review | null
  action: (formData: FormData) => Promise<void>
}

const EMPTY_METRICS: ReviewMetrics = {
  acidity: 0,
  sweetness: 0,
  carbonation: 0,
  concentration: 0,
  aftertaste: 0,
  price_quality: 0,
}

function pickInitialMetrics(review: Review | null | undefined): ReviewMetrics {
  if (!review) return EMPTY_METRICS
  return {
    acidity: review.acidity,
    sweetness: review.sweetness,
    carbonation: review.carbonation,
    concentration: review.concentration,
    aftertaste: review.aftertaste,
    price_quality: review.price_quality,
  }
}

export function DrinkForm({ mode, drink, adminReview, action }: DrinkFormProps) {
  const router = useRouter()
  const [, formAction, isPending] = useActionState(
    async (_: void, formData: FormData) => { await action(formData) },
    undefined,
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(drink?.image_url ?? null)
  const [metrics, setMetrics] = useState<ReviewMetrics>(() => pickInitialMetrics(adminReview))
  const [name, setName] = useState(drink?.name ?? '')
  const [price, setPrice] = useState<string>(drink?.price?.toString() ?? '')
  const [noSugar, setNoSugar] = useState(drink?.no_sugar ?? false)
  const [isDeletePending, startDelete] = useTransition()

  const isCreate = mode === 'create'

  const setM = (k: keyof ReviewMetrics, v: number) => {
    setMetrics((m) => ({ ...m, [k]: v }))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  function clearFile() {
    setPreview(drink?.image_url ?? null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDelete() {
    if (!drink) return
    if (!confirm(`Удалить «${drink.name}»?`)) return
    startDelete(() => {
      deleteDrinkAction(drink.id)
    })
  }

  return (
    <form action={formAction} className="adm-form" style={{ opacity: isDeletePending ? 0.4 : 1 }}>
      <div className="adm-form-inner">
        <header className="adm-form-head">
          <div>
            <div className="adm-form-eyebrow">{isCreate ? 'НОВЫЙ НАПИТОК' : 'РЕДАКТИРОВАНИЕ'}</div>
            <h2 className="adm-form-title">
              {isCreate ? 'Создать карточку' : drink?.name || 'Напиток'}
            </h2>
          </div>
          <Link
            href={ROUTES.admin.drinks}
            className="rev-form-close"
            aria-label="Закрыть"
          >
            <Icons.x w={16} />
          </Link>
        </header>

        <div className="adm-form-grid">
          {/* Left col — basic drink fields */}
          <div className="adm-form-col">
            <div className="adm-form-section">
              <label className="adm-form-label" htmlFor="drink-image">Изображение</label>
              <div className="adm-upload">
                {preview ? (
                  <div className="adm-upload-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" style={{ maxHeight: 170, width: 'auto', objectFit: 'contain' }} />
                    {preview !== drink?.image_url && (
                      <button
                        type="button"
                        className="adm-upload-clear"
                        onClick={clearFile}
                        aria-label="Очистить превью"
                      >
                        <Icons.x w={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="adm-upload-empty">
                    <Icons.upload w={32} />
                    <span>Изображение ещё не загружено</span>
                  </div>
                )}
                <label className="cta-ghost" htmlFor="drink-image" style={{ cursor: 'pointer' }}>
                  <Icons.upload w={12} /> {preview ? 'Заменить фото' : 'Загрузить фото'}
                </label>
                <input
                  ref={fileRef}
                  id="drink-image"
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                />
              </div>
            </div>

            <div className="adm-form-section">
              <label className="adm-form-label" htmlFor="drink-name">Название *</label>
              <input
                id="drink-name"
                name="name"
                className="adm-input"
                placeholder="Например: ВОЛЬТ ZERO Ледяной арбуз"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="adm-form-row">
              <div className="adm-form-section">
                <label className="adm-form-label" htmlFor="drink-price">Цена (₽)</label>
                <input
                  id="drink-price"
                  name="price"
                  className="adm-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="adm-form-section" style={{ justifyContent: 'flex-end' }}>
                <label className="adm-toggle">
                  <input
                    type="checkbox"
                    name="no_sugar"
                    checked={noSugar}
                    onChange={(e) => setNoSugar(e.target.checked)}
                  />
                  <span className="adm-toggle-track">
                    <span className="adm-toggle-thumb" />
                  </span>
                  <span className="adm-toggle-label">Без сахара</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right col — admin review (optional) */}
          <div className="adm-form-col">
            <div className="adm-form-section">
              <span className="adm-form-label">Оценка администратора (отзыв от лица admin)</span>
              <p className="adm-form-hint">
                Эти оценки публикуются как обзор эксперта рядом с пользовательскими.
                Чтобы пропустить — оставьте все 6 пустыми.
              </p>
              <div className="adm-metrics">
                {METRIC_KEYS.map((k) => (
                  <MetricRatingInput
                    key={k}
                    metricKey={k}
                    value={metrics[k]}
                    onChange={(v) => setM(k, v)}
                    name={k}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="adm-form-foot">
          <div className="adm-form-foot-l">
            {!isCreate && drink && (
              <button
                type="button"
                className="cta-ghost cta-danger"
                onClick={handleDelete}
                disabled={isDeletePending || isPending}
              >
                <Icons.trash /> Удалить
              </button>
            )}
          </div>
          <div className="adm-form-foot-r">
            <button
              type="button"
              className="cta-ghost"
              onClick={() => router.push(ROUTES.admin.drinks)}
              disabled={isPending}
            >
              Отменить
            </button>
            <button type="submit" className="cta-primary" disabled={isPending || isDeletePending}>
              {isPending
                ? 'Сохранение…'
                : (<><Icons.check w={14} /> {isCreate ? 'Создать напиток' : 'Сохранить'}</>)}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
