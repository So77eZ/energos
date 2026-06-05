import { useMemo } from 'react'
import { buildActivityCalendar, type Review } from '@entities/review'

const DOW = ['', 'Пн', '', 'Ср', '', 'Пт', ''] // подписи через одну
const MONTHS_FULL = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

// «2026-03-12» → «12 мар 2026»
function tipDate(key: string): string {
  const [y, m, d] = key.split('-')
  return `${Number(d)} ${MONTHS_FULL[Number(m) - 1]} ${y}`
}

export function CalendarHeatmap({ reviews }: { reviews: Review[] }) {
  const cal = useMemo(() => buildActivityCalendar(reviews.map((r) => r.created_at)), [reviews])

  return (
    <section className="cal-section">
      <div className="cal-head">
        <span className="cal-title">
          {cal.total} {plural(cal.total, 'отзыв', 'отзыва', 'отзывов')} за год
        </span>
        <span className="cal-legend">
          меньше
          <i style={{ background: 'var(--bg-input)' }} />
          <i style={{ background: 'rgba(var(--accent-rgb),0.30)' }} />
          <i style={{ background: 'rgba(var(--accent-rgb),0.55)' }} />
          <i style={{ background: 'rgba(var(--accent-rgb),0.78)' }} />
          <i style={{ background: 'rgb(var(--accent-rgb))' }} />
          больше
        </span>
      </div>

      <div className="cal-scroll">
        <div className="cal-body">
          <div className="cal-months">
            {cal.weeks.map((_, w) => {
              const label = cal.monthLabels.find((m) => m.index === w)
              return (
                <span key={w} className="cal-month" style={{ width: 14 }}>
                  {label ? label.label : ''}
                </span>
              )
            })}
          </div>
          <div className="cal-rows">
            <div className="cal-dows">
              {DOW.map((d, i) => <span key={i} className="cal-dow">{d}</span>)}
            </div>
            <div className="cal-grid">
              {cal.weeks.map((week, w) => (
                <div key={w} className="cal-week">
                  {week.map((day, d) => (
                    <span
                      key={d}
                      className={`cal-cell${day.inRange ? '' : ' cal-cell-empty'}`}
                      data-level={day.level}
                      data-tip={day.inRange ? `${tipDate(day.date)} · ${day.count} ${plural(day.count, 'отзыв', 'отзыва', 'отзывов')}` : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
