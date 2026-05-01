import { Zap, Github, Mail, Send } from 'lucide-react'
import { siGithub } from 'simple-icons'

export function Footer() {
  return (
    <footer className="max-w-[1200px] mx-auto px-[5px] sm:px-4 pb-6 mt-8">
      <div className="glass rounded-xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9090a8]">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="font-bold text-[#f0f0f5] tracking-wide">Energos</span>
          </div>
          <a href="https://github.com/So77eZ/energos" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#f0f0f5] hover:text-neon-cyan transition-colors">
              <svg viewBox="0 0 24 24" role="img" aria-label={siGithub.title} className="w-3 h-3 fill-current text-[#f0f0f5]">
                <path d={siGithub.path} />
              </svg>Платформа рейтинга энергетических напитков
            </a>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#9090a8]">Фронт:</span>
            <a href="https://github.com/So77eZ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#f0f0f5] hover:text-neon-cyan transition-colors">
              <Github className="w-3 h-3" /> So77eZ
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#9090a8]">Бэк:</span>
            <a href="https://github.com/SeleznevAS-dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#f0f0f5] hover:text-neon-cyan transition-colors">
              <Github className="w-3 h-3" /> SeleznevAS-dev
            </a>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#9090a8]">Боль:</span>
            <a href="https://github.com/GeroiGorodskoyZastroiki" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#f0f0f5] hover:text-neon-cyan transition-colors">
              <Github className="w-3 h-3" />Даня ОйОйОйкин</a>
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-1 text-xs">
          <span className="text-[#f0f0f5] font-semibold">© 2026</span>
          <a
            href="http://t.me/thisIsBananash"
            className="flex items-center gap-1 hover:text-neon-cyan transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            @thisIsBananash
          </a>
        </div>
      </div>
    </footer>
  )
}
