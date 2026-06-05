export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export interface CalendarDay {
  date: string        // YYYY-MM-DD (локальная)
  count: number
  level: ActivityLevel
  inRange: boolean    // false для будущих дней текущей недели
}
export interface MonthLabel {
  index: number       // индекс недели (столбца)
  label: string
}
export interface ActivityCalendar {
  weeks: CalendarDay[][]   // 53 столбца × 7 дней (Пн→Вс)
  total: number
  monthLabels: MonthLabel[]
}

const WEEKS = 53
const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function levelFor(count: number): ActivityLevel {
  if (count <= 0) return 0
  if (count >= 4) return 4
  return count as ActivityLevel
}

// now инъецируется для тестов (как rng в reel.ts).
export function buildActivityCalendar(createdAts: (string | null)[], now: Date = new Date()): ActivityCalendar {
  // Бакетинг по локальной дате. created_at — наивный UTC → +Z (как night-owl бейдж).
  const counts = new Map<string, number>()
  for (const s of createdAts) {
    if (!s) continue
    const d = new Date(s.endsWith('Z') ? s : `${s}Z`)
    if (Number.isNaN(d.getTime())) continue
    const key = localDateKey(d)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const mondayIndex = (today.getDay() + 6) % 7 // Пн=0 … Вс=6
  const startMonday = new Date(today)
  startMonday.setDate(today.getDate() - mondayIndex - (WEEKS - 1) * 7)

  const weeks: CalendarDay[][] = []
  const monthLabels: MonthLabel[] = []
  let total = 0
  let prevMonth = -1

  for (let w = 0; w < WEEKS; w++) {
    const week: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(startMonday)
      cur.setDate(startMonday.getDate() + w * 7 + d)
      const inRange = cur.getTime() <= today.getTime()
      const key = localDateKey(cur)
      const count = inRange ? (counts.get(key) ?? 0) : 0
      if (inRange) total += count
      week.push({ date: key, count, level: levelFor(count), inRange })
    }
    const firstDay = new Date(startMonday)
    firstDay.setDate(startMonday.getDate() + w * 7)
    if (firstDay.getMonth() !== prevMonth) {
      monthLabels.push({ index: w, label: MONTHS_RU[firstDay.getMonth()] })
      prevMonth = firstDay.getMonth()
    }
    weeks.push(week)
  }

  return { weeks, total, monthLabels }
}
