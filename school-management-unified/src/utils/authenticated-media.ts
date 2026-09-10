import { apiClient } from '@/services/api'

/**
 * Protected `/api/files/...` URLs need the JWT Authorization header.
 * A plain window.open / <a href> only sends cookies, so the API returns 401 JSON.
 * Fetch with the shared axios client, then open an object URL.
 */
export async function fetchAuthenticatedMediaObjectUrl(path: string): Promise<string> {
  if (/^https?:\/\//i.test(path)) return path
  const apiPath = path.replace(/^\/api/, '')
  const res = await apiClient.get(apiPath, { responseType: 'blob' })
  const blob = res.data as Blob
  if (blob.type && blob.type.includes('application/json')) {
    const text = await blob.text()
    let message = 'Could not open file'
    try {
      const parsed = JSON.parse(text) as { message?: string }
      if (parsed.message) message = parsed.message
    } catch {
      /* keep default */
    }
    throw new Error(message)
  }
  return URL.createObjectURL(blob)
}

/** Opens a protected media path in a new tab. Returns false if the popup was blocked. */
export async function openAuthenticatedMedia(path: string | null | undefined): Promise<boolean> {
  if (!path) return false
  if (/^https?:\/\//i.test(path)) {
    return Boolean(window.open(path, '_blank', 'noopener'))
  }
  const objectUrl = await fetchAuthenticatedMediaObjectUrl(path)
  const opened = window.open(objectUrl, '_blank', 'noopener')
  if (!opened) {
    URL.revokeObjectURL(objectUrl)
    return false
  }
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  return true
}
