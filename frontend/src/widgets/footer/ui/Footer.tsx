import { Icons } from '@shared/ui/icons'
import { HiddenBolt } from '@features/easter-eggs'

// Каждый участник один раз: Telegram, затем GitHub-ссылка с ролью и ником.
const TEAM: ReadonlyArray<{ role: string; github: string; telegram?: string }> = [
  { role: 'Фронт', github: 'So77eZ',         telegram: 'thisIsBananash' },
  { role: 'Бэк',   github: 'SeleznevAS-dev', telegram: 'its_a_magic_time' },
  { role: 'Боль',  github: 'trb1mkr' },
]

export function Footer() {
  return (
    <footer className="foot">
      <HiddenBolt id="footer" />
      <div className="foot-left">
        <span className="foot-logo">
          <Icons.bolt w={14} /> ENERGOS
        </span>
        <span className="foot-dim">/ платформа рейтинга энергетиков</span>
        <a className="foot-link foot-contact" href="mailto:contact@energos.fun">contact@energos.fun</a>
      </div>

      <div className="foot-mid">
        <a
          className="foot-link"
          href="https://github.com/So77eZ/energos"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icons.github w={12} /> So77eZ/energos
        </a>
        {TEAM.map((m) => (
          <span key={m.github} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="dot" />
            {m.telegram && (
              <a
                className="foot-link"
                href={`https://t.me/${m.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Telegram: @${m.telegram}`}
                title={`@${m.telegram}`}
              >
                <Icons.telegram w={12} />
              </a>
            )}
            <a
              className="foot-link"
              href={`https://github.com/${m.github}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub: ${m.github}`}
              title={m.github}
            >
              <Icons.github w={12} /> {m.role}: {m.github}
            </a>
          </span>
        ))}
      </div>

      <div className="foot-right">
        <span>© 2026</span>
      </div>
    </footer>
  )
}
