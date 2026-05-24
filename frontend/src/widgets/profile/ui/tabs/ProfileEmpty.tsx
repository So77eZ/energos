import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icons } from '@shared/ui/icons'

interface ProfileEmptyProps {
  icon: ReactNode
  title: string
  body: string
  cta?: string
  href?: string
}

export function ProfileEmpty({ icon, title, body, cta, href }: ProfileEmptyProps) {
  return (
    <div className="prof-empty">
      <div className="prof-empty-icon">{icon}</div>
      <h3 className="prof-empty-title">{title}</h3>
      <p className="prof-empty-body">{body}</p>
      {cta && href && (
        <Link href={href} className="cta-primary">
          {cta} <Icons.arrow w={12} />
        </Link>
      )}
    </div>
  )
}
