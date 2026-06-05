import Link from 'next/link'
import {
  cleanDrinkName,
  EnergyCan,
  splitDrinkBrand,
  TIER_COLORS,
  type EnrichedDrink,
  type Tier,
} from '@entities/drink'
import { Icons } from '@shared/ui/icons'
import { HiddenBolt } from '@shared/ui/HiddenBolt'
import { ROUTES } from '@shared/config/routes'

interface TierPageProps {
  drinks: EnrichedDrink[]
}

interface TierRow {
  tier: Tier
  label: string
  desc: string
}

const TIER_ROWS: TierRow[] = [
  { tier: 'S', label: 'S-Tier · Маст-хэв',         desc: 'Эталонные позиции, идеальный баланс' },
  { tier: 'A', label: 'A-Tier · Отлично',          desc: 'Высокие оценки, минимум слабых сторон' },
  { tier: 'B', label: 'B-Tier · Хорошо',           desc: 'Достойные варианты, есть нюансы' },
  { tier: 'C', label: 'C-Tier · Так себе',         desc: 'Только для специфических вкусов' },
  { tier: 'D', label: 'D-Tier · Не рекомендуется', desc: 'Лучше выбрать что-то другое' },
]

const TIER_LETTERS: Tier[] = ['S', 'A', 'B', 'C', 'D']

function pluralizeDrinks(n: number): string {
  const last = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return `${n} напитков`
  if (last === 1) return `${n} напиток`
  if (last >= 2 && last <= 4) return `${n} напитка`
  return `${n} напитков`
}

export function TierPage({ drinks }: TierPageProps) {
  // Only drinks with computed tier (i.e. those with at least one review).
  const rated = drinks.filter((d): d is EnrichedDrink & { tier: Tier } => d.tier != null)

  return (
    <div className="page page-tier">
      <HiddenBolt id="tier" />
      <header className="tier-head">
        <div>
          <div className="page-eyebrow">РАНЖИРОВАНИЕ · TIER LIST</div>
          <h1 className="page-title">Tier list напитков</h1>
          <p className="page-blurb">
            Распределение по тиру на основе среднего рейтинга по 6 метрикам.
            Без отзывов — нет тира.
          </p>
        </div>
        <div className="tier-legend-mini">
          {TIER_LETTERS.map((t) => (
            <div key={t} className="tier-legend-item" style={{ color: TIER_COLORS[t] }}>
              <span className="tier-leg-letter" style={{ borderColor: TIER_COLORS[t] }}>
                {t}
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="tier-board">
        {TIER_ROWS.map(({ tier, label, desc }) => {
          const items = rated
            .filter((d) => d.tier === tier)
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          return (
            <div
              key={tier}
              className="tier-row"
              style={{ ['--tc' as string]: TIER_COLORS[tier] }}
            >
              <div className="tier-row-side">
                <div className="tier-row-letter">{tier}</div>
                <div className="tier-row-meta">
                  <div className="tier-row-label">{label}</div>
                  <div className="tier-row-desc">{desc}</div>
                  <div className="tier-row-count">{pluralizeDrinks(items.length)}</div>
                </div>
              </div>
              <div className="tier-row-items">
                {items.length === 0 ? (
                  <div className="tier-empty">— пусто —</div>
                ) : (
                  items.map((d) => {
                    const { brand, variant } = splitDrinkBrand(cleanDrinkName(d.name))
                    return (
                      <Link
                        key={d.id}
                        href={ROUTES.reviews(d.id)}
                        className="tier-item"
                      >
                        <div
                          className="tier-item-can"
                          style={{
                            background: `radial-gradient(ellipse at center, rgba(${d.blend}, 0.3), transparent 70%)`,
                          }}
                        >
                          {d.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={d.image_url} alt={d.name} />
                          ) : (
                            <EnergyCan can={d.can} w={56} h={120} />
                          )}
                        </div>
                        <div className="tier-item-info">
                          <div className="tier-item-brand">{brand}</div>
                          <div className="tier-item-name">{variant}</div>
                          <div className="tier-item-meta">
                            <Icons.star w={9} />
                            {d.rating != null ? d.rating.toFixed(1) : '—'}
                            {d.price != null && ` · ${d.price.toFixed(0)}₽`}
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
