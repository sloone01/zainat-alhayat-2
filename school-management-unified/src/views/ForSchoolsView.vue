<template>
  <div
    class="hub-page min-h-screen bg-hub-bg text-hub-ink selection:bg-hub-mint font-hubBody"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <!-- Nav -->
    <header class="sticky top-0 z-50 w-full border-b border-hub-outline/60 bg-hub-surface/95 backdrop-blur-md">
      <nav class="mx-auto flex max-w-hub items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <router-link to="/" class="font-hubDisplay text-lg font-bold text-hub-ink sm:text-xl">
          {{ $t('forSchools.brand') }}
        </router-link>

        <div class="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            class="text-sm font-medium text-hub-muted transition-colors hover:text-hub-primary"
          >
            {{ $t('forSchools.navFeatures') }}
          </a>
          <a
            href="#pricing"
            class="text-sm font-medium text-hub-muted transition-colors hover:text-hub-primary"
          >
            {{ $t('forSchools.navPricing') }}
          </a>
          <LanguageSwitcher />
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="md:hidden">
            <LanguageSwitcher />
          </div>
          <router-link
            to="/login"
            class="hidden rounded-lg border border-hub-outline px-4 py-2 text-sm font-medium text-hub-muted transition hover:bg-hub-surface-low sm:inline-flex"
          >
            {{ $t('nav.signIn') }}
          </router-link>
          <router-link
            to="/subscribe"
            class="rounded-lg bg-hub-primary-container px-3 py-2 text-xs font-semibold text-white shadow-hub-soft transition hover:opacity-90 sm:px-5 sm:text-sm"
          >
            {{ $t('forSchools.ctaPrimary') }}
          </router-link>
        </div>
      </nav>
    </header>

    <main>
      <!-- Hero -->
      <section class="relative overflow-hidden py-16 sm:py-20 lg:min-h-[80vh] lg:py-24">
        <div class="mx-auto grid max-w-hub items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div class="z-10 space-y-6 text-start">
            <div
              class="inline-flex items-center gap-2 rounded-full bg-hub-mint px-3 py-1 text-xs font-semibold text-hub-on-mint"
            >
              <span class="h-2 w-2 animate-pulse rounded-full bg-hub-primary" />
              {{ $t('forSchools.badge') }}
            </div>
            <h1
              class="font-hubDisplay text-4xl font-bold leading-tight tracking-tight text-hub-ink sm:text-5xl"
            >
              {{ $t('forSchools.heroTitleLead') }}
              <br />
              <span class="text-hub-primary">{{ $t('forSchools.heroTitleAccent') }}</span>
            </h1>
            <p class="max-w-xl text-lg leading-relaxed text-hub-muted">
              {{ $t('forSchools.heroSubtitle') }}
            </p>
            <div class="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <router-link
                to="/subscribe"
                class="inline-flex justify-center rounded-lg bg-hub-primary px-8 py-3.5 text-base font-semibold text-white shadow-hub transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {{ $t('forSchools.ctaPrimary') }}
              </router-link>
              <a
                href="#pricing"
                class="inline-flex justify-center rounded-lg border-2 border-hub-primary px-8 py-3.5 text-base font-semibold text-hub-primary transition hover:-translate-y-0.5 hover:bg-hub-mint/40"
              >
                {{ $t('forSchools.ctaSecondary') }}
              </a>
            </div>
            <div class="pt-2">
              <router-link
                :to="demoSchoolPath"
                class="group inline-flex items-center gap-2 text-sm font-medium text-hub-primary"
              >
                <span
                  class="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
                  aria-hidden="true"
                >arrow_back</span>
                {{ $t('forSchools.visitDemoSchool') }}
              </router-link>
            </div>
          </div>

          <div class="relative hidden lg:block">
            <div class="absolute -start-20 -top-20 h-80 w-80 rounded-full bg-hub-primary/5 blur-3xl" />
            <div class="absolute -bottom-20 -end-20 h-96 w-96 rounded-full bg-hub-mint/30 blur-3xl" />
            <div
              class="relative rotate-2 overflow-hidden rounded-2xl border border-hub-outline/40 shadow-2xl transition-transform duration-700 hover:rotate-0"
            >
              <img
                :src="heroImage"
                alt=""
                class="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div
              class="absolute start-0 top-12 flex animate-bounce items-center gap-4 rounded-xl border border-white/50 bg-white/80 p-4 shadow-xl backdrop-blur-md"
              style="animation-duration: 4s"
            >
              <div class="rounded-lg bg-hub-primary-container p-2 text-white">
                <span class="material-symbols-outlined" aria-hidden="true">groups</span>
              </div>
              <div>
                <p class="text-xs font-semibold text-hub-muted">{{ $t('forSchools.statStudents') }}</p>
                <p class="font-hubDisplay text-2xl font-semibold text-hub-ink">+1,240</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bento features -->
      <section id="features" class="scroll-mt-20 bg-hub-surface-low py-16 sm:py-20">
        <div class="mx-auto max-w-hub px-4 sm:px-6">
          <div class="mb-12 space-y-3 text-center sm:mb-16">
            <h2 class="font-hubDisplay text-2xl font-bold text-hub-ink sm:text-3xl">
              {{ $t('forSchools.featuresTitle') }}
            </h2>
            <p class="mx-auto max-w-2xl text-hub-muted">{{ $t('forSchools.featuresSubtitle') }}</p>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
            <!-- Attendance wide -->
            <div
              class="group rounded-2xl border border-hub-outline/50 bg-white p-6 shadow-sm transition hover:shadow-hub-soft md:col-span-8 md:p-8"
            >
              <div class="flex flex-col items-stretch gap-8 md:flex-row-reverse md:items-center">
                <div class="flex-1 text-start">
                  <span
                    class="material-symbols-outlined mb-4 inline-flex rounded-xl bg-hub-mint p-3 text-4xl text-hub-primary"
                    aria-hidden="true"
                  >how_to_reg</span>
                  <h3 class="font-hubDisplay mb-2 text-xl font-semibold">
                    {{ $t('forSchools.bento.attendance.title') }}
                  </h3>
                  <p class="text-hub-muted">{{ $t('forSchools.bento.attendance.body') }}</p>
                </div>
                <div class="w-full flex-1 rounded-xl bg-hub-surface-container p-3">
                  <img :src="attendanceImage" alt="" class="rounded-lg shadow-sm" />
                </div>
              </div>
            </div>

            <!-- Reports -->
            <div
              class="rounded-2xl border border-hub-outline/50 bg-white p-6 shadow-sm transition hover:shadow-hub-soft md:col-span-4 md:p-8"
            >
              <span
                class="material-symbols-outlined mb-4 inline-flex rounded-xl bg-hub-mint p-3 text-4xl text-hub-primary"
                aria-hidden="true"
              >analytics</span>
              <h3 class="font-hubDisplay mb-2 text-xl font-semibold">
                {{ $t('forSchools.bento.reports.title') }}
              </h3>
              <p class="text-hub-muted">{{ $t('forSchools.bento.reports.body') }}</p>
            </div>

            <!-- Fees -->
            <div
              class="rounded-2xl border border-hub-outline/50 bg-white p-6 shadow-sm transition hover:shadow-hub-soft md:col-span-4 md:p-8"
            >
              <span
                class="material-symbols-outlined mb-4 inline-flex rounded-xl bg-hub-mint p-3 text-4xl text-hub-primary"
                aria-hidden="true"
              >account_balance_wallet</span>
              <h3 class="font-hubDisplay mb-2 text-xl font-semibold">
                {{ $t('forSchools.bento.fees.title') }}
              </h3>
              <p class="text-hub-muted">{{ $t('forSchools.bento.fees.body') }}</p>
            </div>

            <!-- Messaging teal -->
            <div
              class="rounded-2xl bg-hub-primary-container p-6 text-white shadow-sm transition hover:shadow-hub-soft md:col-span-8 md:p-8"
            >
              <div class="flex flex-col items-stretch gap-8 md:flex-row-reverse md:items-center">
                <div class="flex-1 text-start">
                  <span
                    class="material-symbols-outlined mb-4 inline-flex rounded-xl bg-white/10 p-3 text-4xl text-hub-on-primary-container"
                    aria-hidden="true"
                  >chat</span>
                  <h3 class="font-hubDisplay mb-2 text-xl font-semibold">
                    {{ $t('forSchools.bento.messaging.title') }}
                  </h3>
                  <p class="text-hub-on-primary-container/90">
                    {{ $t('forSchools.bento.messaging.body') }}
                  </p>
                </div>
                <div
                  class="flex h-32 w-full flex-1 items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5"
                >
                  <span class="font-hubDisplay text-lg opacity-50">{{ $t('forSchools.bento.messaging.visual') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust -->
      <section class="border-y border-hub-outline/30 py-12">
        <div class="mx-auto max-w-hub px-4 sm:px-6">
          <p
            class="mb-8 text-center text-xs font-semibold uppercase tracking-widest text-hub-muted"
          >
            {{ $t('forSchools.trustTitle') }}
          </p>
          <div
            class="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale transition hover:grayscale-0 hover:opacity-70 sm:gap-14"
          >
            <img v-for="(logo, i) in trustLogos" :key="i" :src="logo" alt="" class="h-10 sm:h-12" />
          </div>
        </div>
      </section>

      <!-- Pricing (mockup layout) -->
      <section id="pricing" class="scroll-mt-20 bg-white py-16 sm:py-24">
        <div class="mx-auto max-w-hub px-4 sm:px-6">
          <div class="mx-auto mb-12 max-w-3xl space-y-4 text-center sm:mb-16">
            <h2 class="font-hubDisplay text-3xl font-bold tracking-tight text-hub-ink sm:text-4xl">
              {{ $t('landingPricing.title') }}
            </h2>
            <p class="text-base leading-relaxed text-hub-muted sm:text-lg">
              {{ $t('landingPricing.subtitle') }}
            </p>

            <!-- Billing period: monthly / semester / yearly / summer -->
            <div
              class="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full bg-hub-surface-low p-1.5 ring-1 ring-hub-outline/40"
              role="tablist"
            >
              <button
                v-for="period in displayPeriods"
                :key="period"
                type="button"
                role="tab"
                class="rounded-full px-3.5 py-2.5 text-sm font-semibold transition sm:px-5"
                :class="
                  selectedPeriod === period
                    ? 'bg-white text-hub-ink shadow-sm'
                    : 'text-hub-muted hover:text-hub-primary'
                "
                :aria-selected="selectedPeriod === period"
                @click="selectedPeriod = period"
              >
                {{ $t(`platformBilling.periods.${period}`) }}
                <span
                  v-if="period === 'yearly'"
                  class="ms-1.5 inline-flex rounded-full bg-hub-primary px-2 py-0.5 text-[10px] font-bold text-white"
                >
                  {{ $t('landingPricing.yearlyDiscount') }}
                </span>
              </button>
            </div>
          </div>

          <div v-if="plansLoading" class="py-10 text-center text-sm text-hub-muted">
            {{ $t('common.loading') }}
          </div>

          <div
            v-else
            class="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-6"
          >
            <article
              v-for="plan in orderedPlans"
              :key="plan.code"
              class="relative flex flex-col rounded-2xl bg-white p-8 pt-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              :class="
                plan.code === 'standard'
                  ? 'border-2 border-hub-primary md:-translate-y-2'
                  : 'border border-gray-200'
              "
            >
              <div
                v-if="plan.code === 'standard'"
                class="absolute -top-px left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-t-lg bg-hub-primary px-5 py-1.5 text-xs font-bold text-white"
              >
                {{ $t('landingPricing.popular') }}
              </div>

              <h3 class="font-hubDisplay text-xl font-bold text-hub-ink">
                {{ planDisplayName(plan) }}
              </h3>
              <p class="mt-2 min-h-[3rem] text-sm leading-relaxed text-hub-muted">
                {{ planDisplayDesc(plan) }}
              </p>

              <div class="mt-6">
                <template v-if="plan.code === 'complete'">
                  <p class="font-hubDisplay text-3xl font-bold text-hub-ink sm:text-4xl">
                    {{ $t('landingPricing.contactPrice') }}
                  </p>
                </template>
                <template v-else>
                  <p class="font-hubDisplay text-3xl font-bold tabular-nums text-hub-ink sm:text-4xl">
                    <span dir="ltr" class="inline-flex flex-wrap items-baseline gap-1.5">
                      <span>{{ displayAmount(plan) }}</span>
                      <span class="text-lg font-semibold text-hub-muted">{{ $t('landingPricing.currency') }}</span>
                      <span class="text-base font-medium text-hub-muted">/ {{ periodShortLabel }}</span>
                    </span>
                  </p>
                </template>
              </div>

              <ul class="mt-8 flex-1 space-y-3.5 text-sm text-hub-ink">
                <li
                  v-for="line in planHighlights(plan)"
                  :key="line"
                  class="flex gap-2.5"
                >
                  <span
                    class="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-hub-primary"
                    aria-hidden="true"
                  >check</span>
                  <span>{{ line }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="mt-8 w-full rounded-lg px-4 py-3.5 text-sm font-bold transition"
                :class="
                  plan.code === 'standard'
                    ? 'bg-hub-primary text-white hover:bg-hub-primary-container'
                    : 'border-2 border-hub-primary bg-white text-hub-primary hover:bg-hub-mint/40'
                "
                @click="onPlanCta(plan)"
              >
                {{
                  plan.code === 'complete'
                    ? $t('landingPricing.contactCta')
                    : plan.code === 'standard'
                      ? $t('landingPricing.subscribeCta')
                      : $t('landingPricing.startCta')
                }}
              </button>
            </article>
          </div>
        </div>

        <!-- Bottom banner -->
        <div class="mx-auto mt-16 max-w-hub px-4 sm:mt-20 sm:px-6">
          <div class="relative overflow-hidden rounded-3xl">
            <img
              :src="pricingBannerImage"
              alt=""
              class="h-64 w-full object-cover sm:h-80"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-hub-ink/85 via-hub-ink/45 to-hub-ink/20" />
            <div class="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white sm:p-12">
              <h3 class="font-hubDisplay max-w-3xl text-xl font-bold leading-snug sm:text-2xl md:text-3xl">
                {{ $t('forSchools.finalCtaTitle') }}
              </h3>
              <p class="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
                {{ $t('forSchools.finalCtaBody') }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white">
      <div class="h-px w-full bg-hub-surface-container" />
      <div
        class="mx-auto flex max-w-hub flex-col items-center justify-between gap-10 px-4 py-12 sm:px-6 md:flex-row"
      >
        <div class="flex max-w-xs flex-col items-center gap-3 text-center md:items-start md:text-start">
          <div class="font-hubDisplay text-xl font-bold text-hub-primary">{{ $t('forSchools.brand') }}</div>
          <p class="text-sm text-hub-muted">{{ $t('forSchools.footerTagline') }}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-6 text-xs font-semibold text-hub-muted">
          <a href="#features" class="hover:text-hub-primary">{{ $t('forSchools.footerAbout') }}</a>
          <a href="#pricing" class="hover:text-hub-primary">{{ $t('forSchools.navPricing') }}</a>
          <router-link :to="demoSchoolPath" class="hover:text-hub-primary">
            {{ $t('forSchools.visitDemoSchool') }}
          </router-link>
          <router-link to="/login" class="hover:text-hub-primary">{{ $t('nav.signIn') }}</router-link>
        </div>
        <div class="text-center text-xs text-hub-muted opacity-80">
          {{ $t('forSchools.footerCopyright') }}
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import {
  platformBillingService,
  type PlatformBillingPeriod,
  type PlatformPlan,
} from '@/services/platform-billing.service'

const demoSchoolPath = '/s/zinat-al-haya'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCzQ4HB16qCuv184yzLH5V8lSbLIRpYsCyUz-PWiQzyKb75dKOXxqwQH-pRSEptEu3i_Jgu_91g9Rpd4QB_4DICv3tOs-opPk7YcgUz_NsaoeKijIWg4suiyQ61Ldn4s_lzlb6_zq3SSnQVDLP0JZuhpmd3s5W1ObyDn-SrOe4iNl2XxuYfyyTv51pTNClRN6-AUwLwROTjZ6kWsC_I3Uv6D17cuJ0KuC7KBG0MPepBaIizDJ9uKgAX'
const attendanceImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDUnP4CVtU3pP5IfgISkifC3kU5eM7uDZwAm-n_Vd9cB5AgOCIY-Tlo2WYoKpgVrfwD_6Beqv52a6gIwEtXFxOmW8eZ8WrNxccxQSnNiaYYUjIm-eZLkTEQEm6cKqMr_p0tq_IEKKAz-na57FQFx77mjUpbZYXK68VvnMrGZm8SbCJauAe39q1p_7n3UXhLPYsqbLkZ7s5AlsIc3aXCOWNsxvHHyUai8iBD94mlbxbaEc6InwkB31lC'
const trustLogos = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAtcIzhRfG_zUQG6JCHjAPENUq2Z6-B0LNXni-rMWol4a2cERtLmWL3-0bXuhJ0cFC3Tfqm0kcR4nICsRXZRqmTvMB1Kf2phfec9De5l1HvGd8WUa82DDS-jPYo0Yhir4jGSWNPVf8h80GJoKv3pAXURWcy-Bra0guTc_QyFW3EZJv_ZFYLQssyJuuX0MaBPJvK4gCOmRJnTpoAl_J3YDD3buIOiPML1VGgsWO_mM0jcEAzFJbffpkF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA061y-BSniSrtkzF0ZN2Y1KguguHf6DVsevVr0SU_VmZ9MDEfkb_bXc3ryE_Ij7Y-4X8tmRt4xp_ejW6rFbdYzU9dbF0qapScniUbay8KsCwkSPEq2Ny1ek89MQ8E21aCInah3zoF6aWo49-pC1xUFwEFsVn-hOWmMrHeBCN3zLdyiE7qpzs3cELKOAVY4rl0AuOELXox3RzVWg6n3H7OdDcqY8gXG9s6z2fYXV5tk4iwgFOGE4pRR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCr_bimWmiEmCv94Xxt-CyP4HPyjIfAJajs12Rb7g1J7js99ulibRYjU70SjpXJKWE7qHJQbe03H_g0f_j3yWRwmY6F_pinx1qRnpKrH33EE2hzLxnU6ReDMqhMFjTuM1s-TGw6T6cT0iuCzzdUtD7Ni_KppU5HQ2u50hn-qjBbaSkypRJYXOoCdFLb-4LnW2ZXJXzCmy4C0H8mRZROeF1XPRGQnGykHsFodwhgiUz2hV0EjPuzXKiI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAfcg7nTMkKkiycmQPbTYY7uFPtKf8rIV-DyB1k6hTtdjttiR7kL6uc7wToE_PE8l04CmCTaSTLKExrZsimHRzQAEqargK8JYgQDkCNAzHDr7zytGgG2-EaQbLtRWxs7kz9QDp61FFTFLdmZ3AVf_D4FOx0ijIrLFPZ9TKuszaKbGrKcftG20UuqS3OBar-WqgPW7tF7u9jTxGOs0gyrA9nKGZt7Yb7CFaBz7lyiOwavksjHNjjXa6S',
]

const pricingBannerImage =
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80'

const router = useRouter()
const { locale, t, te, tm } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const displayPeriods: PlatformBillingPeriod[] = ['monthly', 'semester', 'yearly', 'summer']
const selectedPeriod = ref<PlatformBillingPeriod>('monthly')
const plans = ref<PlatformPlan[]>([])
const plansLoading = ref(true)

const orderedPlans = computed(() => {
  const order = ['essential', 'standard', 'complete']
  return [...plans.value].sort(
    (a, b) => order.indexOf(a.code) - order.indexOf(b.code),
  )
})

const periodShortLabel = computed(() => t(`platformBilling.periods.${selectedPeriod.value}`))

function displayAmount(plan: PlatformPlan) {
  const row = plan.prices.find((p) => p.billing_period === selectedPeriod.value)
  if (!row) return '—'
  const n = Number(row.amount_omr)
  return Number.isFinite(n) ? String(Math.round(n)) : String(row.amount_omr)
}

function planDisplayName(plan: PlatformPlan) {
  const key = `landingPricing.planNames.${plan.code}`
  return te(key) ? t(key) : locale.value === 'ar' ? plan.name_ar : plan.name_en
}

function planDisplayDesc(plan: PlatformPlan) {
  const key = `landingPricing.planDescs.${plan.code}`
  return te(key)
    ? t(key)
    : locale.value === 'ar'
      ? plan.description_ar || ''
      : plan.description_en || ''
}

function featureLabel(key: string) {
  const i18nKey = `forSchools.featureKeys.${key}`
  return te(i18nKey) ? t(i18nKey) : key.replace(/_/g, ' ')
}

function planHighlights(plan: PlatformPlan): string[] {
  const key = `forSchools.planHighlights.${plan.code}`
  const messages = tm(key)
  if (Array.isArray(messages) && messages.length) return messages.map(String)
  return plan.features.slice(0, 4).map(featureLabel)
}

function goSubscribe(planCode: string) {
  router.push({
    path: '/subscribe',
    query: { plan: planCode, period: selectedPeriod.value },
  })
}

function onPlanCta(plan: PlatformPlan) {
  if (plan.code === 'complete') {
    window.location.href =
      'mailto:hello@zinat.platform?subject=' +
      encodeURIComponent(t('landingPricing.contactMailSubject'))
    return
  }
  goSubscribe(plan.code)
}

onMounted(async () => {
  plansLoading.value = true
  try {
    const catalog = await platformBillingService.listPublicPlans()
    plans.value = catalog.plans
  } catch {
    plans.value = []
  } finally {
    plansLoading.value = false
  }
})
</script>

<style scoped>
.hub-page :deep(.material-symbols-outlined) {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-family: 'Material Symbols Outlined';
  line-height: 1;
}
.hub-page[dir='rtl'] h1,
.hub-page[dir='rtl'] h2,
.hub-page[dir='rtl'] h3 {
  font-family: 'Noto Sans Arabic', 'Be Vietnam Pro', sans-serif;
  line-height: 1.35;
}
</style>
