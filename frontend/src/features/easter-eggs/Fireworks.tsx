import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/ui/icons'

export function Fireworks({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])

  return createPortal(
    <div className="egg-fireworks" onClick={onDone} role="presentation">
      <div className="egg-fw-burst">
        <Icons.bolt w={64} />
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="egg-fw-spark" style={{ '--a': `${i * 30}deg` } as React.CSSProperties} />
        ))}
      </div>
      <div className="egg-fw-cap">100 кликов 🎉</div>
    </div>,
    document.body,
  )
}
