/** Sample dominant colors from a logo image for school branding. */

export type LogoBrandColors = {
  primary: string
  accent: string
}

const HEX = /^#[0-9A-Fa-f]{6}$/

function toHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
      .join('')
  )
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
  }
  return { h, s, l }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load logo for color sampling'))
    img.src = src
  })
}

/**
 * Extract primary + accent hex colors from a logo URL (or data URL).
 * Ignores near-white / near-black / transparent pixels and prefers saturated colors.
 */
export async function extractLogoBrandColors(imageSrc: string): Promise<LogoBrandColors | null> {
  if (!imageSrc.trim()) return null
  try {
    const img = await loadImage(imageSrc)
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    type Bucket = { count: number; r: number; g: number; b: number; score: number }
    const buckets = new Map<string, Bucket>()

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3]
      if (a < 128) continue
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const { s, l } = rgbToHsl(r, g, b)
      // Skip washed-out backgrounds and near-black.
      if (l > 0.92 || l < 0.08) continue
      if (s < 0.12 && l > 0.75) continue

      const qr = Math.round(r / 24) * 24
      const qg = Math.round(g / 24) * 24
      const qb = Math.round(b / 24) * 24
      const key = `${qr},${qg},${qb}`
      const score = s * 1.6 + (1 - Math.abs(l - 0.45)) * 0.6
      const prev = buckets.get(key)
      if (prev) {
        prev.count += 1
        prev.r += r
        prev.g += g
        prev.b += b
        prev.score += score
      } else {
        buckets.set(key, { count: 1, r, g, b, score })
      }
    }

    const ranked = [...buckets.values()]
      .map((b) => ({
        count: b.count,
        r: b.r / b.count,
        g: b.g / b.count,
        b: b.b / b.count,
        weight: b.score,
      }))
      .sort((a, b) => b.weight - a.weight || b.count - a.count)

    if (!ranked.length) return null

    const primary = ranked[0]
    let accent = ranked.find((c) => {
      const dr = c.r - primary.r
      const dg = c.g - primary.g
      const db = c.b - primary.b
      return Math.sqrt(dr * dr + dg * dg + db * db) > 45
    })
    if (!accent) {
      // Slightly lighten primary for accent when logo is monochrome.
      accent = {
        ...primary,
        r: Math.min(255, primary.r + 28),
        g: Math.min(255, primary.g + 28),
        b: Math.min(255, primary.b + 28),
        weight: 0,
        count: 0,
      }
    }

    const out = {
      primary: toHex(primary.r, primary.g, primary.b),
      accent: toHex(accent.r, accent.g, accent.b),
    }
    if (!HEX.test(out.primary) || !HEX.test(out.accent)) return null
    return out
  } catch {
    return null
  }
}
