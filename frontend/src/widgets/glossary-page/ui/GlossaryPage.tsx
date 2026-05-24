import type { EnrichedDrink } from '@entities/drink'
import { cleanDrinkName, splitDrinkBrand } from '@entities/drink'
import {
  METRIC_KEYS,
  METRIC_LABELS,
  METRIC_SHORT,
  MetricShapes,
  type ReviewMetrics,
} from '@entities/review'
import { Icons } from '@shared/ui/icons'

interface GlossaryPageProps {
  drinks: EnrichedDrink[]
}

const METRIC_COLOR_NAMES: Record<keyof ReviewMetrics, string> = {
  acidity: 'cyan',
  sweetness: 'blue',
  carbonation: 'pink',
  concentration: 'purple',
  aftertaste: 'amber',
  price_quality: 'green',
}

const METRIC_DEFS: Record<keyof ReviewMetrics, string> = {
  acidity:
    'Ощущение «остроты» на корне языка. Высокая кислотность даёт яркость и свежесть, ' +
    'низкая — мягкость и сладость на первом плане.',
  sweetness:
    'Уровень сладких нот. Зависит от количества сахара или подсластителей. ' +
    'Высокая — десертные напитки, низкая — сухие и горьковатые.',
  carbonation:
    'Сила и плотность газации. Высокая — много мелких пузырьков, агрессивно щиплет язык. ' +
    'Низкая — почти негазированно, как сок или чай.',
  concentration:
    'Насыщенность вкуса. Высокая — плотный, концентрированный профиль, оставляет долгое впечатление. ' +
    'Низкая — водянистый, разбавленный.',
  aftertaste:
    'Что остаётся во рту через 10 секунд после глотка. Высокая — длинное послевкусие, ' +
    'низкая — быстро улетучивается.',
  price_quality:
    'Субъективная оценка соотношения «получаемого опыта» и цены. Высокая — стоит каждого рубля, ' +
    'низкая — дорого за то, что есть.',
}

const TASTING_STEPS = [
  {
    n: '01',
    title: 'Подготовка',
    body: 'Охлади напиток до 4–6 °C. Чистый стакан. Нейтрализуй вкус — глоток воды.',
  },
  {
    n: '02',
    title: 'Первый глоток',
    body: 'Оцени газацию и первичные ноты на корне языка. Это даст КИС и ГАЗ.',
  },
  {
    n: '03',
    title: 'Средняя часть',
    body: 'Подержи во рту 2–3 секунды. Это даст СЛАД и КОНЦ.',
  },
  {
    n: '04',
    title: 'Послевкусие',
    body: 'Жди 10 секунд после глотка. Что осталось? Это ПОСЛ. Сравни с ценой → Ц/К.',
  },
] as const

function pickExtremes(
  drinks: EnrichedDrink[],
  key: keyof ReviewMetrics,
): { top: EnrichedDrink | null; bottom: EnrichedDrink | null } {
  const rated = drinks.filter((d) => d.metrics != null)
  if (rated.length === 0) return { top: null, bottom: null }
  const sorted = [...rated].sort((a, b) => b.metrics![key] - a.metrics![key])
  return { top: sorted[0]!, bottom: sorted[sorted.length - 1]! }
}

export function GlossaryPage({ drinks }: GlossaryPageProps) {
  return (
    <div className="page page-sommelier">
      <header className="som-head">
        <div className="som-head-meta">
          <div className="page-eyebrow">СПРАВОЧНИК · ТУЛКИТ СОМЕЛЬЕ</div>
          <h1 className="page-title">Словарь вкусов</h1>
          <p className="page-blurb">
            6 ключевых характеристик, по которым оцениваются все напитки в Energos.
            Используй эту карту, чтобы лучше понимать профили и формулировать собственные оценки.
          </p>
        </div>
        <div className="som-head-stat">
          <div className="som-head-stat-val">6</div>
          <div className="som-head-stat-lbl">базовых<br />метрик</div>
        </div>
      </header>

      <div className="som-grid">
        {METRIC_KEYS.map((key, i) => {
          const Icon = MetricShapes[key]
          const color = METRIC_COLOR_NAMES[key]
          const { top, bottom } = pickExtremes(drinks, key)
          const topVal = top?.metrics?.[key]
          const bottomVal = bottom?.metrics?.[key]
          return (
            <article
              key={key}
              className="som-card"
              style={{ ['--col' as string]: `var(--c-${color})` }}
            >
              <div className="som-head-row">
                <div className="som-icon" style={{ color: `var(--c-${color})` }}>
                  {Icon && <Icon />}
                </div>
                <div>
                  <div className="som-term">{METRIC_LABELS[key]}</div>
                  <div className="som-short">{METRIC_SHORT[key]}</div>
                </div>
                <div className="som-axis-no">{String(i + 1).padStart(2, '0')}</div>
              </div>
              <p className="som-def">{METRIC_DEFS[key]}</p>

              <div className="som-scale">
                <span className="som-scale-lbl">МИН</span>
                <div className="som-scale-bar">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <div
                      key={v}
                      className="som-scale-cell"
                      style={{
                        background: `var(--c-${color})`,
                        opacity: 0.2 + v * 0.16,
                      }}
                    />
                  ))}
                </div>
                <span className="som-scale-lbl">МАКС</span>
              </div>

              {top && bottom && (
                <div className="som-examples">
                  <div className="som-ex">
                    <span className="som-ex-tag">
                      МИН: {bottomVal != null ? bottomVal.toFixed(1) : '—'}
                    </span>
                    <span className="som-ex-name">
                      {splitDrinkBrand(cleanDrinkName(bottom.name)).brand}
                    </span>
                  </div>
                  <div className="som-ex">
                    <span
                      className="som-ex-tag"
                      style={{ color: `var(--c-${color})`, borderColor: `var(--c-${color})` }}
                    >
                      МАКС: {topVal != null ? topVal.toFixed(1) : '—'}
                    </span>
                    <span className="som-ex-name">
                      {splitDrinkBrand(cleanDrinkName(top.name)).brand}
                    </span>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      <section className="som-protocol">
        <div className="section-head">
          <h2 className="section-title">
            <Icons.beaker /> Протокол дегустации
          </h2>
          <span className="section-sub">4 шага к точной оценке</span>
        </div>
        <div className="som-steps">
          {TASTING_STEPS.map((s) => (
            <div key={s.n} className="som-step">
              <div className="som-step-n">{s.n}</div>
              <div className="som-step-title">{s.title}</div>
              <p className="som-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
