import { Icons } from '@shared/ui/icons'
import { HiddenBolt } from '@features/easter-eggs'

const TEAM = [
  { role: 'Фронт', name: 'So77eZ',                 url: 'https://github.com/So77eZ' },
  { role: 'Бэк',   name: 'SeleznevAS-dev',         url: 'https://github.com/SeleznevAS-dev' },
  { role: 'Боль',  name: 'GeroiGorodskoyZastroiki', url: 'https://github.com/GeroiGorodskoyZastroiki' },
] as const

const TELEGRAMS = [
  { handle: '@thisIsBananash',    url: 'https://t.me/thisIsBananash' },
  { handle: '@its_a_magic_time',  url: 'https://t.me/its_a_magic_time' },
] as const

export function Footer() {
  return (
    <footer className="foot">
      <HiddenBolt id="footer" />
      <div className="foot-left">
        <span className="foot-logo">
          <Icons.bolt w={14} /> ENERGOS
        </span>
        <span className="foot-dim">/ платформа рейтинга энергетиков</span>
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
          <span key={m.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="dot" />
            <a className="foot-link" href={m.url} target="_blank" rel="noopener noreferrer">
              <Icons.github w={12} /> {m.role}: {m.name}
            </a>
          </span>
        ))}
      </div>

      <div className="foot-right">
        <span>© 2026</span>
        {TELEGRAMS.map((tg) => (
          <span key={tg.handle} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="dot" />
            <a className="foot-link" href={tg.url} target="_blank" rel="noopener noreferrer">
              <Icons.telegram w={12} /> {tg.handle}
            </a>
          </span>
        ))}
      </div>
    </footer>
  )
}
