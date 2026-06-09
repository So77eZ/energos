'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { stepSpin, SPIN, useCanGame, type SpinState } from '@shared/lib/can-game'
import { ACCENT_MAP, useTheme } from '@shared/lib/theme'

/**
 * Two large low-poly cans floating beside the catalog grid.
 * Click adds angular acceleration (stepSpin integrator) → omega ramps → burst →
 * cans + ice cubes vanish → reappear. Без кликов accel затухает демпфером, банка
 * коастит обратно в idle. Серия кликов компаундит → разгон к взрыву.
 *
 * Ported from `frontendNew/three-cans.jsx`; the burst/hidden/fadeIn visuals + ice
 * cube centrifugal model are preserved verbatim. Спека: docs/superpowers/specs/
 * 2026-06-09-cans-click-burst-design.md.
 */

type Side = 'left' | 'right'
type Shade = 'dark' | 'light'
type State = 'active' | 'burst' | 'hidden' | 'fadeIn'

interface CanPalette {
  body: number
  capTop: number
  capBot: number
}

const PALETTES: Record<Shade, CanPalette> = {
  dark:  { body: 0x0d1d36, capTop: 0x2a2a36, capBot: 0x18181f },
  light: { body: 0xe6ecf3, capTop: 0xc8d0dc, capBot: 0xa8b2c0 },
}

function mountCanScene(canvas: HTMLCanvasElement, side: Side, accentRgb: string, shade: Shade, animate: boolean, onBurst?: (m: { spinUpMs: number }) => void): () => void {
  const isLeft = side === 'left'
  const palette = PALETTES[shade]

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setClearColor(0x000000, 0)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 0, 9)

  function resize() {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (w === 0 || h === 0) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  // Lights
  scene.add(new THREE.AmbientLight(0x303048, 0.5))
  const key = new THREE.DirectionalLight(0xffffff, 0.85)
  key.position.set(isLeft ? 3 : -3, 5, 4)
  scene.add(key)
  const accentLight = new THREE.PointLight(new THREE.Color(`rgb(${accentRgb})`), 1.6, 26)
  accentLight.position.set(isLeft ? -2 : 2, 1, 3)
  scene.add(accentLight)
  const pinkLight = new THREE.PointLight(0xff2e88, 0.9, 26)
  pinkLight.position.set(isLeft ? 2 : -2, -1, 2)
  scene.add(pinkLight)

  // Can group
  const canGroup = new THREE.Group()
  const R = 0.98
  const H = 2.85
  const SEG = 8

  const matBody    = new THREE.MeshLambertMaterial({ color: palette.body, flatShading: true, transparent: true, opacity: 1 })
  const matStripe1 = new THREE.MeshLambertMaterial({ color: new THREE.Color(`rgb(${accentRgb})`), flatShading: true, transparent: true, opacity: 1 })
  const matStripe2 = new THREE.MeshLambertMaterial({ color: 0xff2e88, flatShading: true, transparent: true, opacity: 1 })
  const matCapTop  = new THREE.MeshLambertMaterial({ color: palette.capTop, flatShading: true, transparent: true, opacity: 1 })
  const matCapBot  = new THREE.MeshLambertMaterial({ color: palette.capBot, flatShading: true, transparent: true, opacity: 1 })
  const canMats = [matBody, matStripe1, matStripe2, matCapTop, matCapBot]

  canGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, SEG, 1), matBody))

  const stripeA = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.003, R * 1.003, 0.40, SEG, 1), matStripe1)
  stripeA.position.y = 0.5
  canGroup.add(stripeA)

  const stripeB = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.003, R * 1.003, 0.22, SEG, 1), matStripe2)
  stripeB.position.y = -0.1
  canGroup.add(stripeB)

  const stripeC = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.003, R * 1.003, 0.08, SEG, 1), matStripe1)
  stripeC.position.y = -0.5
  canGroup.add(stripeC)

  const top = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.94, R * 0.97, 0.13, SEG, 1), matCapTop)
  top.position.y = H / 2 + 0.065
  canGroup.add(top)
  const lid = new THREE.Mesh(new THREE.TorusGeometry(R * 0.55, 0.05, 4, 12), matCapTop)
  lid.rotation.x = Math.PI / 2
  lid.position.y = H / 2 + 0.14
  canGroup.add(lid)

  const bot = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.94, R * 0.90, 0.13, SEG, 1), matCapBot)
  bot.position.y = -H / 2 - 0.065
  canGroup.add(bot)

  canGroup.rotation.z = isLeft ? 0.26 : -0.21
  scene.add(canGroup)

  // Ice cubes orbiting (Saturn-ring style)
  interface CubeData {
    mat: THREE.MeshLambertMaterial
    baseOpacity: number
    orbitR: number
    orbitA: number
    orbitSpeed: number
    orbitYOffset: number
    orbitTilt: number
    spinX: number
    spinY: number
    spinZ: number
  }
  interface IceCube { mesh: THREE.Mesh; data: CubeData }
  const cubes: IceCube[] = []
  const N_CUBES = 5
  const iceColors = [0xaae8ff, 0xc5f0ff, 0x88d4ff]
  for (let i = 0; i < N_CUBES; i++) {
    const size = 0.18 + Math.random() * 0.25
    const mat = new THREE.MeshLambertMaterial({
      color: iceColors[i % iceColors.length],
      transparent: true,
      opacity: 0.5,
      flatShading: true,
      // Льдинки орбитят кольцом вокруг банки: задняя половина орбиты иначе
      // перекрывается непрозрачным телом банки и пропадает. depthTest:false
      // + renderOrder рисует их поверх — лёд всегда виден, плавает вокруг.
      depthTest: false,
    })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat)
    mesh.renderOrder = 2
    const data: CubeData = {
      mat,
      baseOpacity: 0.5,
      orbitR: 2.2 + Math.random() * 1.2,
      orbitA: Math.random() * Math.PI * 2,
      orbitSpeed: (0.12 + Math.random() * 0.18) * (Math.random() > 0.5 ? 1 : -1),
      orbitYOffset: (Math.random() - 0.5) * 2.2,
      orbitTilt: (Math.random() - 0.5) * 0.55,
      spinX: (Math.random() - 0.5) * 0.6,
      spinY: (Math.random() - 0.5) * 0.6,
      spinZ: (Math.random() - 0.5) * 0.6,
    }
    scene.add(mesh)
    cubes.push({ mesh, data })
  }

  // Burst particles
  interface ParticleData {
    mat: THREE.MeshBasicMaterial
    vx: number
    vy: number
    vz: number
    life: number
  }
  interface Particle { mesh: THREE.Mesh; data: ParticleData }
  const particles: Particle[] = []
  const particleMatA = new THREE.MeshBasicMaterial({ color: new THREE.Color(`rgb(${accentRgb})`), transparent: true, opacity: 0 })
  const particleMatB = new THREE.MeshBasicMaterial({ color: 0xff2e88, transparent: true, opacity: 0 })
  for (let i = 0; i < 18; i++) {
    const m = (i % 2 === 0 ? particleMatA : particleMatB).clone()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), m)
    mesh.visible = false
    const data: ParticleData = { mat: m, vx: 0, vy: 0, vz: 0, life: 0 }
    scene.add(mesh)
    particles.push({ mesh, data })
  }

  // State machine — клик-разгон: accel-интегратор → omega → burst.
  let state: State = 'active'
  let stateAt = 0
  let spin: SpinState = { omega: 1, accel: 0 }   // omega = бывший speedMul
  let spinStartAt: number | null = null          // таймстамп первого клика из idle (ms)

  function setCanOpacity(o: number) {
    canMats.forEach((m) => { m.opacity = o })
    cubes.forEach(({ data }) => { data.mat.opacity = data.baseOpacity * o })
  }
  function setCanScale(s: number) {
    canGroup.scale.setScalar(s)
    cubes.forEach(({ mesh }) => mesh.scale.setScalar(s))
  }

  function triggerBurst() {
    state = 'burst'
    stateAt = performance.now() / 1000
    particles.forEach(({ mesh, data }, i) => {
      mesh.visible = true
      mesh.position.set(0, 0, 0)
      const theta = (i / particles.length) * Math.PI * 2 + Math.random()
      const phi = (Math.random() - 0.5) * Math.PI * 0.7
      const v = 3 + Math.random() * 4
      data.vx = Math.cos(theta) * Math.cos(phi) * v
      data.vy = Math.sin(phi) * v
      data.vz = Math.sin(theta) * Math.cos(phi) * v
      data.life = 0
      data.mat.opacity = 1
      mesh.scale.setScalar(1)
    })
    const spinUpMs = spinStartAt != null ? performance.now() - spinStartAt : 0
    spinStartAt = null
    onBurst?.({ spinUpMs })
  }

  function onCanvasClick() {
    if (state !== 'active') return                 // клики во время взрыва игнор
    if (spinStartAt == null) spinStartAt = performance.now()
    spin = { ...spin, accel: spin.accel + SPIN.CLICK_KICK }
    // juice: микро-сквош, чтобы клик ощущался (банки немые)
    canGroup.scale.setScalar(0.94)
  }

  function disposeAll() {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => m.dispose())
      }
    })
    renderer.dispose()
  }

  // Разложить льдинки по их орбите один раз (в анимации это делает tick на
  // каждом кадре). Без этого в статичном кадре все кубы остаются в (0,0,0) —
  // слипаются в центре банки. speedMul=1 → radiusMul=1, поворот не нужен.
  function layoutCubesStatic() {
    cubes.forEach(({ mesh, data }) => {
      const ox = Math.cos(data.orbitA) * data.orbitR
      const oz = Math.sin(data.orbitA) * data.orbitR
      mesh.position.x = ox
      mesh.position.z = oz * Math.cos(data.orbitTilt)
      mesh.position.y = data.orbitYOffset + oz * Math.sin(data.orbitTilt)
    })
  }

  // prefers-reduced-motion: показываем банки статичным кадром — без rAF-цикла,
  // hover-разгона и орбиты льдинок. Элемент остаётся (как у liquid-bg), глушим
  // только движение. resize перерисовывает единичный кадр.
  if (!animate) {
    layoutCubesStatic()
    resize()
    renderer.render(scene, camera)
    const onResize = () => { resize(); renderer.render(scene, camera) }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      disposeAll()
    }
  }

  canvas.addEventListener('click', onCanvasClick)

  let raf = 0
  let last = performance.now()
  function tick(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = now / 1000

    if (state === 'active') {
      // плавный возврат scale после juice-сквоша
      canGroup.scale.setScalar(canGroup.scale.x + (1 - canGroup.scale.x) * Math.min(1, dt * 12))
      spin = stepSpin(spin, dt)
      if (spin.omega <= 1.02) spinStartAt = null   // вернулись в idle — сброс таймера
      if (spin.omega >= SPIN.BURST_AT) {
        triggerBurst()                             // выставит state='burst' + дёрнет onBurst
      }
    } else if (state === 'burst') {
      const e = t - stateAt
      const fade = Math.max(0, 1 - e / 0.35)
      setCanOpacity(fade)
      setCanScale(1 + e * 0.6)
      spin.omega = 120 + e * 180
      if (e >= 0.4) {
        state = 'hidden'
        stateAt = t
        setCanOpacity(0)
      }
    } else if (state === 'hidden') {
      const e = t - stateAt
      particles.forEach(({ mesh, data }) => {
        if (!mesh.visible) return
        data.life += dt
        mesh.position.x += data.vx * dt
        mesh.position.y += data.vy * dt
        mesh.position.z += data.vz * dt
        data.vy -= 4 * dt
        mesh.rotation.x += 4 * dt
        mesh.rotation.y += 5 * dt
        const lifeT = data.life / 1.2
        data.mat.opacity = Math.max(0, 1 - lifeT)
        mesh.scale.setScalar(Math.max(0.05, 1 - lifeT))
        if (lifeT >= 1) mesh.visible = false
      })
      const wait = 2.2 + (isLeft ? 0 : 0.4)
      if (e >= wait) {
        state = 'fadeIn'
        stateAt = t
        spin.omega = 1
        setCanScale(0.2)
      }
    } else if (state === 'fadeIn') {
      const e = t - stateAt
      const k = Math.min(e / 0.7, 1)
      const ease = 1 - Math.pow(1 - k, 3)
      setCanOpacity(ease)
      setCanScale(0.2 + ease * 0.8)
      if (k >= 1) {
        state = 'active'
        setCanOpacity(1)
        setCanScale(1)
        spin = { omega: 1, accel: 0 }
        spinStartAt = null
      }
    }

    // Can rotation + idle wobble
    canGroup.rotation.y += (isLeft ? 0.15 : -0.12) * spin.omega * dt
    canGroup.position.y = Math.sin(t * 0.5 + (isLeft ? 0 : 1.5)) * 0.18
    canGroup.position.x = Math.sin(t * 0.3 + (isLeft ? 0.5 : 2.1)) * 0.10

    // Ice cubes — lighter than the can, so they accelerate harder and drift outward.
    const iceMul = Math.pow(spin.omega, 1.28)
    const radiusMul = 1 + Math.min(spin.omega / 120, 1) * 0.45
    cubes.forEach(({ mesh, data }) => {
      data.orbitA += data.orbitSpeed * iceMul * dt
      const r = data.orbitR * radiusMul
      const ox = Math.cos(data.orbitA) * r
      const oz = Math.sin(data.orbitA) * r
      mesh.position.x = ox
      mesh.position.z = oz * Math.cos(data.orbitTilt)
      mesh.position.y = data.orbitYOffset + oz * Math.sin(data.orbitTilt)
      mesh.rotation.x += data.spinX * iceMul * dt
      mesh.rotation.y += data.spinY * iceMul * dt
      mesh.rotation.z += data.spinZ * iceMul * dt
    })

    renderer.render(scene, camera)
    raf = requestAnimationFrame(tick)
  }

  resize()
  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  raf = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    canvas.removeEventListener('click', onCanvasClick)
    disposeAll()
  }
}

const ACCENT_CYCLE: Array<keyof typeof ACCENT_MAP> = ['cyan', 'pink', 'lime', 'amber', 'purple']

export function ThreeCans() {
  const { accent, motion } = useTheme()
  const { onBurst } = useCanGame()
  const onBurstRef = useRef(onBurst)
  useEffect(() => { onBurstRef.current = onBurst }, [onBurst])
  // Left can uses the active accent; right can uses the next one in the cycle
  // so the pair always reads as two distinct hues no matter the theme choice.
  const leftAccent = ACCENT_MAP[accent].rgb
  const rightAccent = ACCENT_MAP[ACCENT_CYCLE[(ACCENT_CYCLE.indexOf(accent) + 1) % ACCENT_CYCLE.length]].rgb
  const leftRef = useRef<HTMLCanvasElement>(null)
  const rightRef = useRef<HTMLCanvasElement>(null)

  // Уважаем системную настройку «уменьшить движение»: банки крутятся/орбитят
  // непрерывно (idle-wobble + кубы-льдинки + hover-разгон). При reduce-motion
  // НЕ прячем банки, а рендерим статичным кадром (как у liquid-bg — глушим
  // только движение). Lazy-init синхронно, чтобы не словить лишний remount.
  const [systemReduce, setSystemReduce] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setSystemReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Профильный оверрайд 'always' бьёт системную настройку (см. motion-preference спеку).
  const reduced = systemReduce && motion !== 'always'

  useEffect(() => {
    const cleanups: Array<() => void> = []
    const fireBurst = (m: { spinUpMs: number }) => onBurstRef.current(m)
    if (leftRef.current) cleanups.push(mountCanScene(leftRef.current, 'left', leftAccent, 'dark', !reduced, fireBurst))
    if (rightRef.current) cleanups.push(mountCanScene(rightRef.current, 'right', rightAccent, 'light', !reduced, fireBurst))
    return () => cleanups.forEach((c) => c())
  }, [leftAccent, rightAccent, reduced])

  return (
    <div className="three-bg" aria-hidden="true">
      <canvas ref={leftRef} className="three-can three-left" />
      <canvas ref={rightRef} className="three-can three-right" />
    </div>
  )
}
