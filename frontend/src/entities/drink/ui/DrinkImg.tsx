'use client'

import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react'

interface DrinkImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  /** Что показать, если картинка не загрузилась (обычно та же банка, что и без image_url). */
  fallback?: ReactNode
}

/** <img> напитка с запасным вариантом. В API ветки mvp у списка напитков нет признака
 *  «картинка есть», а бэк на напиток без картинки отвечает пустым телом (docs/mvp-backend-questions.md),
 *  поэтому о её отсутствии узнаём только по ошибке загрузки. */
export function DrinkImg({ src, alt, fallback = null, ...rest }: DrinkImgProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const ref = useRef<HTMLImageElement>(null)

  // SSR-разметка приходит с <img>, и ошибка загрузки может случиться ДО гидрации —
  // onError её уже не поймает. После монтирования проверяем, что браузер уже сдался.
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) setFailedSrc(src)
  }, [src])

  if (failedSrc === src) return <>{fallback}</>
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} onError={() => setFailedSrc(src)} {...rest} />
}
