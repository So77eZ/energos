'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Icons } from '@shared/ui/icons'
import {
  TierBadge,
  EnergyCan,
  cleanDrinkName,
  splitDrinkBrand,
  type EnrichedDrink,
} from '@entities/drink'
import { useScrollLock } from '@shared/lib/useScrollLock'

export type GachaponPhase = 'loading' | 'error' | 'spinning' | 'landed'

interface GachaponMachineProps {
  phase: GachaponPhase
  reel: EnrichedDrink[]
  winIndex: number
  winner: EnrichedDrink | null
  /** Длительность спина в секундах (провайдер учитывает reduced-motion). */
  dur: number
  /** Смещение метки внутри ячейки выигрыша (CS2-саспенс), ∈ [-0.4, 0.4]. */
  landFrac: number
  /** Reduced-motion: одна фаза, строго центр, без overshoot/рандома. */
  reduced: boolean
  onLand: (w: EnrichedDrink) => void
  onRespin: () => void
  onGo: (w: EnrichedDrink) => void
  onClose: () => void
}

export function GachaponMachine({
  phase, reel, winIndex, winner, dur, landFrac, reduced, onLand, onRespin, onGo, onClose,
}: GachaponMachineProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useScrollLock(true)

  // Императивная прокрутка ленты через WAAPI. Полный режим (CS2): momentum-разгон
  // → проскок мимо саспенс-точки → мягкий стоп off-center (выигрыш не по центру)
  // → краткая пауза → подтяжка к дед-центру изображения энергетика. Reduced: одна
  // фаза, сразу центр. Лендинг по anim.finished (промис снимается .cancel()'ом в
  // cleanup). done-гард от гонки finish/cancel.
  useLayoutEffect(() => {
    if (phase !== 'spinning') return
    const win = windowRef.current
    const strip = stripRef.current
    if (!win || !strip || !strip.children.length) return
    const target = reel[winIndex]
    if (!target) return
    const cellW = (strip.children[0] as HTMLElement).offsetWidth
    const winW = win.clientWidth
    const center = winW / 2 - (winIndex * cellW + cellW / 2)   // дед-центр выигрыша = финал
    const off = reduced ? center : center + landFrac * cellW   // саспенс-стоп (off-center)

    let done = false
    const land = () => {
      if (done) return
      done = true
      // Зафиксировать ФИНАЛ (центр) как inline-стиль: переживёт .cancel() в cleanup
      // (иначе fill:forwards снимается и лента прыгает обратно в 0 при phase→landed).
      strip.style.transform = `translateX(${center}px)`
      onLand(target)
    }

    // ВАЖНО: easing на кейфрейме применяется к интервалу, НАЧИНАЮЩЕМУСЯ с него.
    strip.style.transform = 'translateX(0px)'
    const keyframes: Keyframe[] = reduced
      ? [
          { transform: 'translateX(0px)', easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          { transform: `translateX(${center}px)` },
        ]
      : [
          // 0→0.60: momentum-разгон/торможение до проскока. easeOutQuint тормозит к апексу ~в ноль.
          { transform: 'translateX(0px)', offset: 0, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          // 0.60→0.74: проскок (0.4 ячейки дальше по ходу) → мягкий подхват в off-center,
          // ease-in-старт (наклон ~0) подхватывает апекс без рывка.
          { transform: `translateX(${off - cellW * 0.4}px)`, offset: 0.60, easing: 'cubic-bezier(0.40, 0, 0.50, 1)' },
          // 0.74→0.82: пауза в off-center — «остановка» читается перед подтяжкой.
          { transform: `translateX(${off}px)`, offset: 0.74, easing: 'linear' },
          // 0.82→1: подтяжка к центру изображения энергетика, плавно (ease-in-out, наклон ~0 с концов).
          { transform: `translateX(${off}px)`, offset: 0.82, easing: 'cubic-bezier(0.40, 0, 0.40, 1)' },
          { transform: `translateX(${center}px)`, offset: 1 },
        ]
    const anim = strip.animate(keyframes, { duration: dur * 1000, fill: 'forwards' })
    anim.finished.then(land).catch(() => {}) // catch: AbortError при .cancel()

    return () => {
      anim.cancel()
    }
  }, [phase, reel, winIndex, dur, reduced, landFrac, onLand])

  if (!mounted) return null

  const blend = winner ? winner.blend : '0,229,255'

  return createPortal(
    <div className="gacha-overlay" onClick={onClose}>
      <div
        className="gacha-machine"
        role="dialog"
        aria-modal="true"
        aria-label="Случайный напиток"
        onClick={(e) => e.stopPropagation()}
        style={{ '--win-blend': blend } as CSSProperties}
      >
        <div className="gacha-head">
          <div className="gacha-head-l">
            <span className="gacha-badge"><Icons.dice w={14} /> ГАЧАПОН</span>
            <span className="gacha-sub">барабан случайного напитка</span>
          </div>
          <button className="gacha-close" onClick={onClose} aria-label="Закрыть"><Icons.x w={16} /></button>
        </div>

        {phase === 'error' ? (
          <div className="gacha-result">
            <div className="gacha-spinning"><span>Не удалось загрузить напитки</span></div>
          </div>
        ) : phase === 'loading' ? (
          <div className="gacha-result">
            <div className="gacha-spinning">
              <span className="gacha-dots"><i /><i /><i /></span>
              <span>Загрузка…</span>
            </div>
          </div>
        ) : (
          <>
            <div className={`gacha-window ${phase}`} ref={windowRef}>
              <div className="gacha-strip" ref={stripRef}>
                {reel.map((d, i) => (
                  <div className="gacha-cell" key={i}>
                    <div
                      className="gacha-cell-glow"
                      style={{ background: `radial-gradient(ellipse at center 60%, rgba(${d.blend},0.30), transparent 70%)` }}
                    />
                    {d.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image_url} alt={d.name} className="gacha-cell-img" />
                    ) : (
                      <EnergyCan can={d.can} name={d.name} w={64} h={140} />
                    )}
                    <div className="gacha-cell-name">{splitDrinkBrand(cleanDrinkName(d.name)).brand}</div>
                  </div>
                ))}
              </div>
              <div className="gacha-fade gacha-fade-l" />
              <div className="gacha-fade gacha-fade-r" />
              <div className="gacha-payline">
                <span className="gacha-tick gacha-tick-t" />
                <span className="gacha-tick gacha-tick-b" />
              </div>
            </div>

            <div className="gacha-result">
              {phase === 'spinning' ? (
                <div className="gacha-spinning">
                  <span className="gacha-dots"><i /><i /><i /></span>
                  <span>Крутим барабан…</span>
                </div>
              ) : winner ? (
                <div className="gacha-won">
                  <div className="gacha-won-tags">
                    {winner.tier && <TierBadge tier={winner.tier} size="sm" />}
                    <span className="gacha-won-rate">
                      <Icons.star w={12} /> {winner.rating != null ? winner.rating.toFixed(1) : '—'}
                    </span>
                    {winner.no_sugar && <span className="micro-tag micro-lime">ZERO</span>}
                  </div>
                  <div className="gacha-won-brand">{splitDrinkBrand(cleanDrinkName(winner.name)).brand}</div>
                  <div className="gacha-won-name">{winner.name}</div>
                  <div className="gacha-actions">
                    <button className="cta-primary" onClick={() => onGo(winner)}>
                      Открыть карточку <Icons.arrow w={14} />
                    </button>
                    <button className="cta-ghost" onClick={onRespin}>
                      <Icons.dice w={13} /> Крутить ещё
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
