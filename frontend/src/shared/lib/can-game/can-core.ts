import type { CanGameState } from './can-storage'

/** Константы интегратора разгона. Hand-tunable — подобраны на ощущение. */
export const SPIN = {
  CLICK_KICK: 60,  // прибавка к угловому ускорению за клик
  DAMP: 2.2,       // затухание ускорения (полужизнь ~0.3с)
  FRICT: 0.8,      // трение скорости — коаст обратно к idle
  BURST_AT: 120,   // порог omega для взрыва (= текущий max)
} as const

export const FAST_SPIN_MS = 2000   // «Турбина»: взрыв за < 2с
export const CASCADE_TARGET = 5    // «Цепная реакция»: 5 взрывов подряд
export const CASCADE_GAP = 6000    // макс. пауза между взрывами в каскаде (мс)

export interface SpinState { omega: number; accel: number }

/**
 * Шаг интегратора (детерминированный, pure). Клик добавляется к accel ДО вызова.
 * omega = интеграл accel, с трением к idle; accel затухает демпфером.
 */
export function stepSpin(s: SpinState, dt: number): SpinState {
  let omega = s.omega + s.accel * dt                    // интегрируем ускорение
  omega = 1 + (omega - 1) * Math.exp(-SPIN.FRICT * dt)  // трение к idle (omega→1)
  const accel = s.accel * Math.exp(-SPIN.DAMP * dt)     // демпфер ускорения
  return { omega: Math.max(1, omega), accel }
}

export interface CanRuntime { prevBurstAt: number | null; currentCascade: number }

/**
 * Зарегистрировать взрыв. `state` персистится в localStorage, `runtime` живёт в
 * провайдер-ref (каскад — сессионный челлендж, не переживает перезагрузку).
 */
export function registerBurst(
  state: CanGameState,
  runtime: CanRuntime,
  meta: { spinUpMs: number; now: number },
): { state: CanGameState; runtime: CanRuntime } {
  const inWindow = runtime.prevBurstAt != null && meta.now - runtime.prevBurstAt <= CASCADE_GAP
  const currentCascade = inWindow ? runtime.currentCascade + 1 : 1
  const bestSpinUpMs = state.bestSpinUpMs == null
    ? meta.spinUpMs
    : Math.min(state.bestSpinUpMs, meta.spinUpMs)
  return {
    state: {
      bursts: state.bursts + 1,
      bestSpinUpMs,
      maxCascade: Math.max(state.maxCascade, currentCascade),
    },
    runtime: { prevBurstAt: meta.now, currentCascade },
  }
}

/** Метрики для AchievementStats (3 секретных бейджа). */
export function evaluateCanBadges(state: CanGameState): {
  canBursts: number; canFastSpin: number; canCascade: number
} {
  return {
    canBursts: state.bursts,
    canFastSpin: state.bestSpinUpMs != null && state.bestSpinUpMs <= FAST_SPIN_MS ? 1 : 0,
    canCascade: state.maxCascade >= CASCADE_TARGET ? 1 : 0,
  }
}
