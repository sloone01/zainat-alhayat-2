/** Max edge length for enrollment/support inline images (keeps JSON bodies under the API limit). */
const MAX_EDGE = 1600
const JPEG_QUALITY = 0.72

/**
 * Read a File/Blob as a data URL, shrinking raster images so base64 payloads stay manageable.
 * PDFs and other non-images are returned unchanged.
 */
export async function compressImageFileToDataUrl(file: File | Blob): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return readAsDataUrl(file)
  }

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return readAsDataUrl(file)
    ctx.drawImage(bitmap, 0, 0, width, height)
    // Prefer JPEG for photos; keep PNG only when the source has alpha and we need it.
    const mime = file.type === 'image/png' && hasAlpha(ctx, width, height) ? 'image/png' : 'image/jpeg'
    const dataUrl = canvas.toDataURL(mime, JPEG_QUALITY)
    return dataUrl || readAsDataUrl(file)
  } finally {
    bitmap.close()
  }
}

function hasAlpha(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const { data } = ctx.getImageData(0, 0, Math.min(width, 32), Math.min(height, 32))
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) return true
    }
  } catch {
    /* tainted / security — treat as opaque */
  }
  return false
}

function readAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
