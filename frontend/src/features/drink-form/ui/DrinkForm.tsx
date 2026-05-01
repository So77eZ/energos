'use client'

import { useActionState, useRef, useState } from 'react'
import { Save, ImagePlus, X } from 'lucide-react'
import type { Drink } from '@entities/drink'
import type { Review } from '@entities/review'
import { METRIC_LABELS, METRIC_KEYS } from '@entities/review'

interface DrinkFormProps {
  mode: 'create' | 'edit'
  drink?: Drink
  adminReview?: Review | null
  action: (formData: FormData) => Promise<void>
}

export function DrinkForm({ mode, drink, adminReview, action }: DrinkFormProps) {
  const [, formAction, isPending] = useActionState(
    async (_: void, formData: FormData) => { await action(formData) },
    undefined,
  )
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(drink?.image_url ?? null)

  const label = mode === 'create' ? 'Создать' : 'Сохранить'

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  function clearFile() {
    setPreview(drink?.image_url ?? null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form action={formAction} className="glass rounded-xl p-6 flex flex-col gap-5 max-w-xl">
      <h2 className="text-lg font-bold text-[#f0f0f5]">
        {mode === 'create' ? 'Новый напиток' : 'Редактировать'}
      </h2>

      {/* Base fields */}
      <section className="flex flex-col gap-3">
        <Field label="Название *" name="name" defaultValue={drink?.name} required />
        <Field label="Цена (₽)" name="price" type="number" step="0.01" defaultValue={drink?.price ?? ''} />

        {/* Image upload */}
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-[#9090a8]">Изображение</span>
          <div className="flex items-center gap-3">
            {preview && (
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="w-full h-full object-contain p-1" />
                {preview !== drink?.image_url && (
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:text-neon-red transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[#9090a8] hover:border-neon-blue/50 hover:text-neon-cyan transition-colors cursor-pointer">
              <ImagePlus className="w-4 h-4 shrink-0" />
              <span>{preview ? 'Заменить фото' : 'Загрузить фото'}</span>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-[#9090a8] cursor-pointer select-none">
          <input
            type="checkbox"
            name="no_sugar"
            defaultChecked={drink?.no_sugar ?? false}
            className="accent-neon-green w-4 h-4"
          />
          Без сахара
        </label>
      </section>

      {/* Admin metrics */}
      <section className="border-t border-white/10 pt-4 flex flex-col gap-3">
        <p className="text-xs text-[#9090a8]">Оценка администратора (оставьте пустым, чтобы пропустить)</p>
        <Field
          label="Общий рейтинг"
          name="rating"
          type="number"
          min="1"
          max="5"
          step="0.1"
          defaultValue={adminReview?.rating ?? ''}
        />
        <div className="grid grid-cols-2 gap-3">
          {METRIC_KEYS.map((key) => (
            <Field
              key={key}
              label={METRIC_LABELS[key]}
              name={key}
              type="number"
              min="1"
              max="5"
              step="0.1"
              defaultValue={adminReview?.[key] ?? ''}
            />
          ))}
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg text-sm font-semibold text-neon-cyan hover:bg-neon-blue/30 transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {isPending ? 'Сохранение…' : label}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  ...rest
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string | number
  required?: boolean
  [k: string]: unknown
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[#9090a8]">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue as string}
        required={required}
        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[#f0f0f5] placeholder-[#9090a8] focus:outline-none focus:border-neon-blue/50 transition-colors"
        {...(rest as object)}
      />
    </label>
  )
}
