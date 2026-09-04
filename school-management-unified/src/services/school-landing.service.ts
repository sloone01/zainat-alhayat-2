import { BaseApiService } from './api'

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
  school_id?: number
  landing_slug: string | null
  logo_url: string | null
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

class SchoolLandingApiService extends BaseApiService {
  getPublicDefault(): Promise<SchoolLandingContent | null> {
    return this.get('/public/landing')
  }

  getPublicBySlug(slug: string): Promise<SchoolLandingContent> {
    return this.get(`/public/landing/${encodeURIComponent(slug)}`)
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
