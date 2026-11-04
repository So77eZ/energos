// Слабая графика: браузер рисует без видеокарты или просто не тянет эффекты.
// Без видеокарты проверяет THEME_INIT_SCRIPT (WebGL с failIfMajorPerformanceCaveat), остальное
// ловит замер кадров после загрузки (ThemeProvider). Итог — <html data-gfx="low">, см. globals.css.

/** Медианный кадр дольше — графика не тянет (< 25 кадров/с). Режим энергосбережения
 *  Chrome/Safari держит 30 кадров/с (33 мс) — его не задеваем. */
export const SLOW_FRAME_MS = 40

/** Медиана интервалов между кадрами длиннее SLOW_FRAME_MS. Нет кадров — нет данных, не медленно. */
export function isSlowFrames(deltas: number[]): boolean {
  if (!deltas.length) return false
  const sorted = [...deltas].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] > SLOW_FRAME_MS
}

/** Интервалы между кадрами за `ms` миллисекунд. null — вкладку прятали во время замера
 *  (фоновая вкладка не рисует кадры, замер ничего не значит). */
export function measureFrameDeltas(ms: number): Promise<number[] | null> {
  return new Promise((resolve) => {
    const deltas: number[] = []
    let hidden = document.hidden
    const onVisibility = () => { if (document.hidden) hidden = true }
    document.addEventListener('visibilitychange', onVisibility)
    let start = 0
    let prev = 0
    const tick = (t: number) => {
      if (!start) start = t
      else deltas.push(t - prev)
      prev = t
      if (t - start < ms) {
        requestAnimationFrame(tick)
        return
      }
      document.removeEventListener('visibilitychange', onVisibility)
      resolve(hidden ? null : deltas)
    }
    requestAnimationFrame(tick)
  })
}
