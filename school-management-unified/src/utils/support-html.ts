import DOMPurify from 'dompurify'
import { fetchAuthenticatedMediaObjectUrl } from '@/utils/authenticated-media'

const SUPPORT_FILE_PREFIX = '/api/files/support/'

/**
 * Support request HTML stores images as protected `/api/files/support/...` paths.
 * <img> cannot send the JWT, so fetch each one and swap in an object URL for display.
 * Returns the display HTML plus the object URLs the caller must revoke later.
 */
export async function resolveSupportHtml(html: string): Promise<{ html: string; objectUrls: string[] }> {
  const clean = DOMPurify.sanitize(html || '')
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement
  const objectUrls: string[] = []
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (!src.startsWith(SUPPORT_FILE_PREFIX)) return
      try {
        const objectUrl = await fetchAuthenticatedMediaObjectUrl(src)
        objectUrls.push(objectUrl)
        img.setAttribute('src', objectUrl)
        img.removeAttribute('width')
        img.removeAttribute('height')
        img.setAttribute('loading', 'lazy')
        img.setAttribute('decoding', 'async')
      } catch {
        img.removeAttribute('src')
        img.setAttribute('alt', img.getAttribute('alt') || 'image unavailable')
      }
    }),
  )
  return { html: root.innerHTML, objectUrls }
}

export function revokeObjectUrls(urls: string[]): void {
  for (const url of urls) URL.revokeObjectURL(url)
}
