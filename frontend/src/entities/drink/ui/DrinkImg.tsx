'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react'

interface DrinkImgProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string
  alt: string
  /** Примерная ширина на экране в CSS-px. По ней браузер берёт у оптимизатора Next копию
   *  1× или 2×, а не исходник до 1600 px. Только для `/drink-image/…`; превью из формы
   *  (`blob:`) отдаётся как есть. */
  displayWidth: number
  /** Что показать, если картинка не загрузилась (обычно та же банка, что и без image_url). */
  fallback?: ReactNode
}

const OPTIMIZABLE = /^\/drink-image\/\d+(\?v=\d+)?$/

export function drinkImgSources(src: string, displayWidth: number): { src: string; srcSet?: string } {
  if (!OPTIMIZABLE.test(src)) return { src }
  // height нужен getImageProps, но в URL не попадает — берём только src/srcSet,
  // размеры <img> остаются за CSS (как и раньше).
  const { props } = getImageProps({ src, alt: '', width: displayWidth, height: displayWidth, quality: 75 })
  return { src: props.src, srcSet: props.srcSet }
}

/** <img> напитка с запасным вариантом. В API ветки mvp у списка напитков нет признака
 *  «картинка есть», а бэк на напиток без картинки отвечает пустым телом (docs/mvp-backend-questions.md),
 *  поэтому о её отсутствии узнаём только по ошибке загрузки. */
export function DrinkImg({ src, alt, displayWidth, fallback = null, ...rest }: DrinkImgProps) {
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
  return <img ref={ref} {...drinkImgSources(src, displayWidth)} alt={alt} onError={() => setFailedSrc(src)} {...rest} />
}
