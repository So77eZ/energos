'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ROUTES } from '@shared/config/routes'
import { IconBolt } from '@shared/ui/icons'
import { useEasterEggs } from '@features/easter-eggs'

export function LogoLink() {
  const { registerLogoClick } = useEasterEggs()
  const [flash, setFlash] = useState(false)

  return (
    <Link
      href={ROUTES.home}
      className={`logo${flash ? ' logo-flash' : ''}`}
      onClick={() => {
        registerLogoClick()
        setFlash(false)
        requestAnimationFrame(() => setFlash(true))
      }}
      onAnimationEnd={() => setFlash(false)}
    >
      <span className="logo-bolt">
        <IconBolt w={18} />
      </span>
      <span className="logo-word">ENERGOS</span>
      <span className="logo-meta">/ v3.0</span>
    </Link>
  )
}
