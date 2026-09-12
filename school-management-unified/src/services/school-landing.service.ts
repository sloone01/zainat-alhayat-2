import axios from 'axios'
import { BaseApiService, type ApiResponse } from './api'
import { getApiBaseUrl } from '@/config/public-config'

export interface LandingFeatureItem {
  title_en?: string
  title_ar?: string
  body_en?: string
  body_ar?: string
  icon?: string
}

export interface LandingTestimonialItem {
  quote_en?: string
  quote_ar?: string
  author_en?: string
  author_ar?: string
  role_en?: string
  role_ar?: string
}

export interface SchoolLandingContent {
  id?: number
  school_id?: string
  landing_slug: string | null
  logo_url: string | null
  brand_primary_color?: string | null
  brand_accent_color?: string | null
  hero_image_url: string | null
  brand_name_en: string | null
  brand_name_ar: string | null
  badge_en: string | null
  badge_ar: string | null
  hero_title_en: string | null
  hero_title_ar: string | null
  hero_subtitle_en: string | null
  hero_subtitle_ar: string | null
  cta_primary_en: string | null
  cta_primary_ar: string | null
  cta_secondary_en: string | null
  cta_secondary_ar: string | null
  features: LandingFeatureItem[]
  testimonials: LandingTestimonialItem[]
  phone: string | null
  email: string | null
  address_en: string | null
  address_ar: string | null
  is_published: boolean
  updated_at?: string
}

export interface SchoolLandingMeta {
  id: string
  name: string
  logo_url: string | null
  brand_primary_color?: string | null
  brand_accent_color?: string | null
  landing_slug: string | null
}

/** Public landing GETs must not send JWT — expired tokens can 401 and break enrollment branding. */
const publicLandingClient = (() => {
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })
  client.interceptors.request.use((config) => {
    config.baseURL = getApiBaseUrl()
    return config
  })
  return client
})()

async function publicGet<T>(url: string): Promise<T> {
  const response = await publicLandingClient.get<ApiResponse<T>>(url)
  if (response.data.success) {
    return response.data.data as T
  }
  throw new Error(response.data.message || 'API request failed')
}

class SchoolLandingApiService extends BaseApiService {
  getPublicDefault(): Promise<SchoolLandingContent | null> {
    return publicGet('/public/landing')
  }

  getPublicBySlug(slug: string): Promise<SchoolLandingContent> {
    return publicGet(`/public/landing/${encodeURIComponent(slug)}`)
  }

  /** School UUID for a landing slug (works even when CMS landing is unpublished). */
  getSchoolMetaBySlug(slug: string): Promise<SchoolLandingMeta> {
    return publicGet(`/public/landing/school/${encodeURIComponent(slug)}`)
  }

  /** School name + logo for enrollment form (by school UUID). */
  getSchoolMetaById(schoolId: string): Promise<SchoolLandingMeta> {
    return publicGet(`/public/landing/school-id/${encodeURIComponent(schoolId)}`)
  }

  getAdmin(): Promise<SchoolLandingContent> {
    return this.get('/school-landing')
  }

  saveAdmin(payload: Partial<SchoolLandingContent>): Promise<SchoolLandingContent> {
    return this.put('/school-landing', payload)
  }
}

export const schoolLandingService = new SchoolLandingApiService()
export default schoolLandingService
