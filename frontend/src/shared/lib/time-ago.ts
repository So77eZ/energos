/** Русское склонение: plural(2, 'час','часа','часов') → 'часа'. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

/** Относительное время «N мин/часов/дней назад». `now` — для тестируемости. */
export function timeAgo(iso: string | null, now: number = Date.now()): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const sec = Math.max(0, Math.floor((now - then) / 1000))
  if (sec < 60) return 'только что'

  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} ${plural(min, 'мин', 'мин', 'мин')} назад`

  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ${plural(hr, 'час', 'часа', 'часов')} назад`

  const d = Math.floor(hr / 24)
  return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`
}
