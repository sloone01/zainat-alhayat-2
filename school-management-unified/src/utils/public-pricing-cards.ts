import type { PlatformModule, PlatformPlan } from '@/services/platform-billing.service'

const MAX_PLAN_BULLETS = 5
const PACKAGE_BULLET_KEYS = ['students', 'staff', 'teaching', 'transport', 'chat'] as const

export type PublicPricingCard = {
  code: string
  name: string
  description: string
  seats: number
  seatsLabel: string
  overage: number
  yearly: number | null
  monthly: number | null
  startingMonthly: number | null
  contactOnly: boolean
  addsOnBaseline: boolean
  bullets: string[]
  extraCount: number
  featured: boolean
}

function amountOf(plan: PlatformPlan, period: 'yearly' | 'monthly' | 'semester'): number | null {
  const raw = plan.prices.find((p) => p.billing_period === period)?.amount_omr
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function startingMonthly(yearly: number | null, monthly: number | null): number | null {
  if (monthly != null) return monthly
  if (yearly != null) return Math.round(yearly / 12)
  return null
}

export function buildPublicPricingCards(opts: {
  plans: PlatformPlan[]
  modules: PlatformModule[]
  locale: string
  t: (key: string, params?: Record<string, unknown>) => string
  highlightLines: (code: 'essential' | 'standard' | 'complete') => string[]
}): PublicPricingCard[] {
  const { plans, modules, locale, t, highlightLines } = opts
  const ar = locale === 'ar'
  const labels = new Map(modules.map((m) => [m.code, (ar ? m.name_ar : m.name_en) || m.code]))
  const ordered = [...plans].sort((a, b) => a.sort_order - b.sort_order)
  const mostSeats = Math.max(...ordered.map((p) => p.included_student_seats || 0), 0)

  const bulletText = (p: PlatformPlan) => {
    const fromFeatures = (p.features || [])
      .map((f) => {
        if (typeof f === 'string') return f
        return (ar ? f.label_ar : f.label_en) || f.label_en || f.label_ar || ''
      })
      .map((s) => (s || '').trim())
      .filter((s) => s.includes(' ') || s.includes('—') || s.length >= 20)
    if (fromFeatures.length) return fromFeatures
    const marketing = PACKAGE_BULLET_KEYS.map((key) => t(`landingPricing.packageBullets.${key}`)).filter(Boolean)
    if (marketing.length) return marketing
    return (p.module_codes || []).map((c) => labels.get(c)).filter((x): x is string => Boolean(x))
  }

  const baseline = ordered.length ? new Set(bulletText(ordered[0])) : new Set<string>()
  const cards = ordered.map((plan, index) => {
    const all = bulletText(plan)
    const distinctive = index === 0 ? all : all.filter((line) => !baseline.has(line))
    const shown = distinctive.length ? distinctive : all
    const yearly = amountOf(plan, 'yearly')
    const monthly = amountOf(plan, 'monthly')
    return {
      code: plan.code,
      name: (ar ? plan.name_ar : plan.name_en) || plan.code,
      description: (ar ? plan.description_ar : plan.description_en) || '',
      seats: plan.included_student_seats || 0,
      seatsLabel:
        (plan.included_student_seats || 0) >= 1200
          ? t('landingPricing.includedSeatsOver', { count: plan.included_student_seats })
          : t('landingPricing.includedSeats', { count: plan.included_student_seats || 0 }),
      overage: Number(plan.overage_per_student_omr) || 0,
      yearly,
      monthly,
      startingMonthly: startingMonthly(yearly, monthly),
      contactOnly: yearly == null,
      addsOnBaseline: index > 0 && distinctive.length > 0,
      bullets: shown.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, shown.length - MAX_PLAN_BULLETS),
      featured:
        ordered.length > 2 &&
        plan.included_student_seats > 0 &&
        plan.included_student_seats !== mostSeats &&
        plan.sort_order === ordered[Math.floor(ordered.length / 2)].sort_order,
    }
  })

  if (!cards.some((c) => c.contactOnly)) {
    const bullets = highlightLines('complete')
    cards.push({
      code: 'contact',
      name: t('landingPricing.planNames.complete'),
      description: t('landingPricing.planDescs.complete'),
      seats: 0,
      seatsLabel: '',
      overage: 0,
      yearly: null,
      monthly: null,
      startingMonthly: null,
      contactOnly: true,
      addsOnBaseline: false,
      bullets: bullets.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, bullets.length - MAX_PLAN_BULLETS),
      featured: false,
    })
  }

  return cards
}
