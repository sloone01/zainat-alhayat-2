import { BaseApiService } from './api'
import { authService } from './auth.service'

export type AttentionItem = {
  id: string
  kind: string
  title: string
  href: string
  created_at: string
}

export type AttentionFeed = {
  items: AttentionItem[]
  total: number
}

const CACHE_MS = 30_000

type CacheEntry = { at: number; userId: string; locale: string; data: AttentionFeed }

let cache: CacheEntry | null = null

class AttentionService extends BaseApiService {
  async feed(locale: 'en' | 'ar', force = false): Promise<AttentionFeed> {
    const userId = authService.getStoredUser()?.id || ''
    if (
      !force &&
      cache &&
      cache.userId === userId &&
      cache.locale === locale &&
      Date.now() - cache.at < CACHE_MS
    ) {
      return cache.data
    }
    const data = await this.get<AttentionFeed>('/attention', { locale })
    const feed: AttentionFeed = {
      items: Array.isArray(data?.items) ? data.items : [],
      total: Number(data?.total || 0),
    }
    cache = { at: Date.now(), userId, locale, data: feed }
    return feed
  }
}

export const attentionService = new AttentionService()
