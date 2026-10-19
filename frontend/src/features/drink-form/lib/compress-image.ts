// Сжатие фото в браузере перед загрузкой: бэк не принимает тело больше MAX_ENERGY_DRINK_IMAGE_SIZE
// (1 МБ), а фото с телефона весит 3–8 МБ. Бэк всё равно перекодирует в WebP, так что здесь достаточно
// уложиться в лимит: уменьшаем по длинной стороне и кодируем в WebP, шаг за шагом сильнее.
const STEPS: ReadonlyArray<readonly [maxSide: number, quality: number]> = [
  [1600, 0.85],
  [1200, 0.8],
  [1000, 0.7],
]

/** Размер, вписанный в квадрат maxSide; меньшие картинки не увеличиваем. */
export function scaledSize(width: number, height: number, maxSide: number) {
  const k = Math.min(1, maxSide / Math.max(width, height))
  return { width: Math.max(1, Math.round(width * k)), height: Math.max(1, Math.round(height * k)) }
}

/** Первый результат кодирования, который укладывается в maxBytes; null — не уложились ни на одном шаге. */
export async function shrinkToFit(
  encode: (maxSide: number, quality: number) => Promise<Blob | null>,
  maxBytes: number,
): Promise<Blob | null> {
  for (const [side, quality] of STEPS) {
    const blob = await encode(side, quality)
    if (blob && blob.size <= maxBytes) return blob
  }
  return null
}

/** Уменьшенная копия фото, которая помещается в maxBytes, или null (не удалось). */
export async function compressImage(file: File, maxBytes: number): Promise<File | null> {
  const bitmap = await createImageBitmap(file)
  try {
    const blob = await shrinkToFit((side, quality) => {
      const { width, height } = scaledSize(bitmap.width, bitmap.height, side)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
      // Safari старых версий не кодирует WebP и отдаёт PNG — тип берём из самого blob.
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    }, maxBytes)
    if (!blob) return null
    const ext = blob.type === 'image/webp' ? 'webp' : blob.type.split('/')[1] || 'png'
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${ext}`, { type: blob.type })
  } finally {
    bitmap.close()
  }
}
