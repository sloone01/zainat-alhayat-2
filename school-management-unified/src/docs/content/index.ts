import type { DocsAudience, DocsArticle } from '../types'
import { docsAr } from './ar'
import { docsEn } from './en'
import { isKnownSlug } from '../catalog'

export function getDocsArticle(locale: string, slug: string): DocsArticle | null {
  const map = locale.startsWith('ar') ? docsAr : docsEn
  return map[slug] ?? null
}

export function audienceForSlug(slug: string): DocsAudience | null {
  if (isKnownSlug('staff', slug)) return 'staff'
  if (isKnownSlug('parents', slug)) return 'parents'
  return null
}
