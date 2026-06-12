import { shapePath, type AvatarShape } from './shape-path'

export const OUTPUT_CAP = 512

/** Выходной размер аватара: кап OUTPUT_CAP (не POST'ить мегабайтные blob'ы). */
export function outputSize(cropPx: number): number {
  return Math.min(OUTPUT_CAP, Math.round(cropPx))
}

/** EXIF-aware загрузка файла (портреты с iPhone не лягут боком). */
export async function loadOriented(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file, { imageOrientation: 'from-image' })
}

/**
 * Рисует кроп-область (croppedAreaPixels от react-easy-crop) на output-canvas,
 * кап OUTPUT_CAP, клипает форму (alpha вне формы — destination-in) → PNG Blob.
 */
export async function getCroppedImg(
  src: CanvasImageSource,
  area: { x: number; y: number; width: number; height: number },
  shape: AvatarShape,
): Promise<Blob> {
  const size = outputSize(area.width)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.drawImage(src, area.x, area.y, area.width, area.height, 0, 0, size, size)
  ctx.globalCompositeOperation = 'destination-in'
  shapePath(ctx, shape, size / 2, size / 2, size)
  ctx.fill()
  return new Promise((resolve) => c.toBlob((b) => resolve(b!), 'image/png'))
}
