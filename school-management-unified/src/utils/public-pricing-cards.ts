import type { PlatformModule, PlatformPlan } from '@/services/platform-billing.service'

const MAX_PLAN_BULLETS = 5
const PACKAGE_BULLET_KEYS = ['students', 'staff', 'teaching', 'transport', 'chat'] as const

export type PublicPricingCard = {
  code: string
  name: string
  description: string
  bandLabel: string
  /** Yearly rate per active student; null when the plan is a flat price. */
  perStudentYearly: number | null
  /** Per-student rate over a year when paying by semester / monthly. */
  perStudentYearlyBySemester: number | null
  perStudentYearlyByMonth: number | null
  /** Yearly minimum fee (or flat yearly price). */
  yearly: number | null
  monthly: number | null
  startingMonthly: number | null
  contactOnly: boolean
  addsOnBaseline: boolean
  /** Name of the next smaller plan when the bullets only list what this plan adds. */
  previousName: string
  bullets: string[]
  extraCount: number
  featured: boolean
}

type Period = 'yearly' | 'monthly' | 'semester'

function positive(raw: unknown): number | null {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function amountOf(plan: PlatformPlan, period: Period): number | null {
  return positive(plan.prices.find((p) => p.billing_period === period)?.amount_omr)
}

function rateOf(plan: PlatformPlan, period: Period): number | null {
  return positive(plan.prices.find((p) => p.billing_period === period)?.per_student_omr)
}

function annualized(rate: number | null, periodsPerYear: number): number | null {
  return rate == null ? null : Math.round(rate * periodsPerYear * 100) / 100
}

function startingMonthly(yearly: number | null, monthly: number | null): number | null {
  if (monthly != null) return monthly
  if (yearly != null) return Math.round(yearly / 12)
  return null
}

function bandLabel(
  plan: PlatformPlan,
  t: (key: string, params?: Record<string, unknown>) => string,
): string {
  const min = plan.min_students ?? 0
  const max = plan.max_students
  if (max != null && min > 0) return t('landingPricing.studentBandRange', { min, max })
  if (max != null) return t('landingPricing.studentBandUpTo', { max })
  if (min > 0) return t('landingPricing.studentBandFrom', { min })
  return ''
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

  const bulletText = (p: PlatformPlan) => {
    const fromFeatures = (p.features || [])
      .map((f) => {
        if (typeof f === 'string') return f
        return (ar ? f.label_ar : f.label_en) || f.label_en || f.label_ar || ''
      })
      .map((s) => (s || '').trim())
      .filter((s) => s.includes(' ') || s.includes('—') || s.length >= 20)
    if (fromFeatures.length) return fromFeatures
    const moduleLines = (p.module_codes || []).map((c) => labels.get(c)).filter((x): x is string => Boolean(x))
    if (modulesDiffer && moduleLines.length) return moduleLines
    const marketing = PACKAGE_BULLET_KEYS.map((key) => t(`landingPricing.packageBullets.${key}`)).filter(Boolean)
    if (marketing.length) return marketing
    return moduleLines
  }
  const moduleKey = (p: PlatformPlan) => [...(p.module_codes || [])].sort().join(',')
  const modulesDiffer = new Set(ordered.map(moduleKey)).size > 1

  const bulletsByPlan = ordered.map(bulletText)
  const cards = ordered.map((plan, index) => {
    const all = bulletsByPlan[index]
    const previous = index > 0 ? new Set(bulletsByPlan[index - 1]) : null
    const distinctive = previous ? all.filter((line) => !previous.has(line)) : all
    const shown = distinctive.length ? distinctive : all
    const previousPlan = index > 0 ? ordered[index - 1] : null
    const yearly = amountOf(plan, 'yearly')
    const monthly = amountOf(plan, 'monthly')
    const perStudentYearly = rateOf(plan, 'yearly')
    return {
      code: plan.code,
      name: (ar ? plan.name_ar : plan.name_en) || plan.code,
      description: (ar ? plan.description_ar : plan.description_en) || '',
      bandLabel: bandLabel(plan, t),
      perStudentYearly,
      perStudentYearlyBySemester: annualized(rateOf(plan, 'semester'), 2),
      perStudentYearlyByMonth: annualized(rateOf(plan, 'monthly'), 12),
      yearly,
      monthly,
      startingMonthly: startingMonthly(yearly, monthly),
      contactOnly: yearly == null && perStudentYearly == null,
      addsOnBaseline: index > 0 && distinctive.length > 0,
      previousName: previousPlan ? (ar ? previousPlan.name_ar : previousPlan.name_en) || previousPlan.code : '',
      bullets: shown.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, shown.length - MAX_PLAN_BULLETS),
      featured: ordered.length > 2 && index === Math.floor(ordered.length / 2),
    }
  })

  if (!cards.some((c) => c.contactOnly)) {
    const bullets = highlightLines('complete')
    cards.push({
      code: 'contact',
      name: t('landingPricing.planNames.complete'),
      description: t('landingPricing.planDescs.complete'),
      bandLabel: '',
      perStudentYearly: null,
      perStudentYearlyBySemester: null,
      perStudentYearlyByMonth: null,
      yearly: null,
      monthly: null,
      startingMonthly: null,
      contactOnly: true,
      addsOnBaseline: false,
      previousName: '',
      bullets: bullets.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, bullets.length - MAX_PLAN_BULLETS),
      featured: false,
    })
  }

  return cards
}
