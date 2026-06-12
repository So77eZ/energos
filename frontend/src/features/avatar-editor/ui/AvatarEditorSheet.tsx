'use client'

import Cropper, { type Area } from 'react-easy-crop'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AVATAR_PRESET_SEEDS, makeIdenticon } from '@entities/user'
import { Icons } from '@shared/ui/icons'
import { Sheet } from '@shared/ui/Sheet'
import { shapePath, AVATAR_SHAPES, type AvatarShape } from '../lib/shape-path'
import { getCroppedImg, loadOriented } from '../lib/crop-output'
import { saveAvatarAction, savePresetAction, removeAvatarAction } from '../model/actions'

interface Props {
  userId: number
  open: boolean
  onClose: () => void
  /** Дёргается после сохранения/удаления — рендерер делает router.refresh() + ре-резолв демо. */
  onSaved: () => void
}

const STAGE = 264

const SHAPE_LABEL: Record<AvatarShape, string> = { circle: 'Круг', rounded: 'Скругл.', hex: 'Гекс' }

export function AvatarEditorSheet({ userId, open, onClose, onSaved }: Props) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [shape, setShape] = useState<AvatarShape>('circle')
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), [])

  // WYSIWYG-маска: форма (scrim-дырка + accent-ring glow + thirds) поверх Cropper, тем же
  // shapePath, что в crop-output → preview == output. Sheet рендерит children всегда → canvas-ref
  // стабилен; перерисовка при смене shape/open (на open=true маска видима).
  useEffect(() => {
    const cv = overlayRef.current
    if (!cv) return
    const DPR = 2
    cv.width = cv.height = STAGE * DPR
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const d = STAGE * 0.86 * DPR
    const c = (STAGE * DPR) / 2
    ctx.clearRect(0, 0, STAGE * DPR, STAGE * DPR)
    // scrim снаружи формы
    ctx.fillStyle = 'rgba(8,8,14,0.72)'
    ctx.fillRect(0, 0, STAGE * DPR, STAGE * DPR)
    ctx.globalCompositeOperation = 'destination-out'
    shapePath(ctx, shape, c, c, d)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    // accent-ring c glow
    shapePath(ctx, shape, c, c, d)
    ctx.lineWidth = 2 * DPR
    ctx.strokeStyle = '#00e5ff'
    ctx.shadowColor = 'rgba(0,229,255,0.6)'
    ctx.shadowBlur = 14 * DPR
    ctx.stroke()
    ctx.shadowBlur = 0
    // гайды третей внутри формы
    shapePath(ctx, shape, c, c, d)
    ctx.clip()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      const g = (c - d / 2 + (d * i) / 3)
      ctx.beginPath(); ctx.moveTo(g, c - d / 2); ctx.lineTo(g, c + d / 2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(c - d / 2, g); ctx.lineTo(c + d / 2, g); ctx.stroke()
    }
  }, [shape, open])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const bmp = await loadOriented(f)
    const c = document.createElement('canvas')
    c.width = bmp.width; c.height = bmp.height
    c.getContext('2d')!.drawImage(bmp, 0, 0)
    setImgUrl(c.toDataURL())
    setZoom(1); setCrop({ x: 0, y: 0 })
  }

  async function onSaveUpload() {
    if (!imgUrl || !area) return
    setBusy(true)
    try {
      const im = new Image(); im.src = imgUrl; await im.decode()
      const blob = await getCroppedImg(im, area, shape)
      await saveAvatarAction(userId, blob)
      onSaved(); onClose()
    } finally { setBusy(false) }
  }

  async function onPreset(seed: string) {
    setBusy(true)
    try { await savePresetAction(userId, seed); onSaved(); onClose() } finally { setBusy(false) }
  }

  async function onDelete() {
    setBusy(true)
    try { await removeAvatarAction(userId); onSaved(); onClose() } finally { setBusy(false) }
  }

  return (
    <Sheet open={open} onClose={onClose} variant="bottom" title="РЕДАКТОР АВАТАРА">
      <div className="ava-stage-wrap" style={{ width: STAGE, height: STAGE }}>
        {imgUrl ? (
          <Cropper
            image={imgUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={false}
            objectFit="contain"
            cropSize={{ width: STAGE * 0.86, height: STAGE * 0.86 }}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{ cropAreaStyle: { border: 'none', boxShadow: 'none', color: 'transparent' } }}
          />
        ) : (
          <div className="ava-stage-empty"><Icons.upload w={28} /><span>Загрузи фото для кадрирования</span></div>
        )}
        <canvas ref={overlayRef} className="ava-overlay" style={{ width: STAGE, height: STAGE }} />
      </div>

      {imgUrl && (
        <div className="ava-zoom-row">
          <Icons.search w={15} />
          <input type="range" min={1} max={3.2} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </div>
      )}

      <div className="ava-lbl">Форма фото</div>
      <div className="ava-seg">
        {AVATAR_SHAPES.map((s) => (
          <button key={s} type="button" className={shape === s ? 'on' : ''} onClick={() => setShape(s)}>{SHAPE_LABEL[s]}</button>
        ))}
      </div>

      <div className="ava-lbl">Или выбери пресет</div>
      <div className="ava-presets">
        {AVATAR_PRESET_SEEDS.map((seed) => (
          // eslint-disable-next-line @next/next/no-img-element
          <button key={seed} type="button" className="ava-preset" onClick={() => onPreset(seed)} aria-label={`Пресет ${seed}`} disabled={busy}>
            <img src={makeIdenticon(seed)} alt="" />
          </button>
        ))}
      </div>

      <div className="ava-actions">
        <button type="button" className="cta-ghost" onClick={onDelete} disabled={busy}><Icons.trash w={15} /> Удалить</button>
        <button type="button" className="cta-ghost" onClick={() => fileRef.current?.click()} disabled={busy}><Icons.upload w={15} /> Загрузить</button>
        <button type="button" className="cta-primary" onClick={onSaveUpload} disabled={busy || !imgUrl}><Icons.check w={15} /> Сохранить</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
    </Sheet>
  )
}
