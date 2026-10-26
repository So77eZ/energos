'use client'

import Link from 'next/link'
import { useState, type ComponentProps } from 'react'

/** <Link>, который подгружает страницу только при наведении, а не при появлении в зоне видимости.
 *  Для длинных списков: каталог из ~100 карточек при прокрутке слал по запросу на каждую
 *  (112 запросов `/drinks?id=…&_rsc=…` за одну прокрутку). Паттерн из документации Next
 *  («Disabling prefetching» → prefetch on hover). На тач-экранах наведения нет — страница
 *  грузится по нажатию. */
export function HoverPrefetchLink({ onMouseEnter, ...props }: Omit<ComponentProps<typeof Link>, 'prefetch'>) {
  const [active, setActive] = useState(false)
  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={(e) => { setActive(true); onMouseEnter?.(e) }}
    />
  )
}
