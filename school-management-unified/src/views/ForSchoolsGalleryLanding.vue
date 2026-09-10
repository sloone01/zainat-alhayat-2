<template>
  <div class="aa" :dir="isRTL ? 'rtl' : 'ltr'">
    <PlatformMarketingNav />

    <section class="aa-hero">
      <div class="aa-hero__pixels" aria-hidden="true">
        <span v-for="n in 16" :key="n" />
      </div>
      <div class="aa-hero__copy">
        <p class="aa-hero__badge">{{ $t('forSchools.badge') }}</p>
        <h1>
          {{ $t('forSchools.heroTitleLead') }}
          <span>{{ $t('forSchools.heroTitleAccent') }}</span>
        </h1>
        <p>{{ $t('forSchools.heroSubtitle') }}</p>
        <div class="aa-hero__actions">
          <router-link to="/subscribe" class="aa-btn aa-btn--primary">{{ $t('forSchools.ctaPrimary') }}</router-link>
          <a href="#gallery-pricing" class="aa-btn aa-btn--ghost-navy">{{ $t('forSchools.ctaSecondary') }}</a>
        </div>
      </div>
      <div class="aa-hero__shots" aria-hidden="true">
        <figure class="aa-shot aa-shot--web">
          <div class="aa-browser">
            <div class="aa-browser__chrome" aria-hidden="true">
              <span /><span /><span />
            </div>
            <img src="/landing/shots/dashboard.png?v=14" alt="" />
          </div>
        </figure>
        <figure class="aa-shot aa-shot--phone aa-shot--phone-a">
          <img src="/landing/features/attendance-phone.png?v=14" alt="" />
        </figure>
        <figure class="aa-shot aa-shot--phone aa-shot--phone-b">
          <img src="/landing/features/fees-phone.png?v=14" alt="" />
        </figure>
      </div>
    </section>

    <section id="gallery-tools" class="aa-tile aa-tile--white">
      <div class="aa-split">
        <img
          class="aa-photo"
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=70"
          :alt="$t('forSchools.gallery.mgmtTitle')"
        />
        <div class="aa-copy">
          <p class="aa-kicker">{{ $t('forSchools.gallery.mgmtKicker') }}</p>
          <h2>{{ $t('forSchools.gallery.mgmtTitle') }}</h2>
          <p class="aa-body">{{ $t('forSchools.gallery.mgmtBody') }}</p>
          <ul>
            <li>
              <svg class="aa-check" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
              {{ $t('forSchools.gallery.mgmtItem1') }}
            </li>
            <li>
              <svg class="aa-check" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
              {{ $t('forSchools.gallery.mgmtItem2') }}
            </li>
            <li>
              <svg class="aa-check" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
              {{ $t('forSchools.gallery.mgmtItem3') }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section id="gallery-features" class="aa-tile aa-tile--dark">
      <div class="aa-features">
        <div class="aa-features__intro">
          <h2>{{ $t('forSchools.featuresTitle') }}</h2>
          <p class="aa-body aa-body--on-dark">{{ $t('forSchools.featuresSubtitle') }}</p>
        </div>
        <div class="aa-features__grid">
          <router-link
            v-for="item in offeringFeatures"
            :key="item.key"
            :to="item.docsTo"
            class="aa-feature-card"
          >
            <span class="aa-feature-card__corner" aria-hidden="true">
              <span /><span /><span /><span />
            </span>
            <div class="aa-feature-card__head">
              <div class="aa-feature-card__icon" aria-hidden="true">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
                </svg>
              </div>
              <h3>{{ $t(`forSchools.bento.${item.key}.title`) }}</h3>
            </div>
            <p>{{ $t(`forSchools.bento.${item.key}.body`) }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <section class="aa-tile aa-tile--parchment">
      <div class="aa-split">
        <img
          class="aa-photo"
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=70"
          :alt="$t('forSchools.gallery.precisionTitle')"
        />
        <div class="aa-copy">
          <p class="aa-kicker">{{ $t('forSchools.gallery.precisionKicker') }}</p>
          <h2>{{ $t('forSchools.gallery.precisionTitle') }}</h2>
          <p class="aa-body">{{ $t('forSchools.gallery.precisionBody') }}</p>
          <div class="aa-stats">
            <div>
              <p class="aa-stat">12M+</p>
              <p class="aa-stat-label">{{ $t('forSchools.gallery.statRecords') }}</p>
            </div>
            <div>
              <p class="aa-stat">99%</p>
              <p class="aa-stat-label">{{ $t('forSchools.gallery.statAccuracy') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="gallery-pricing" class="aa-tile aa-tile--white">
      <div class="aa-enroll">
        <h2 class="aa-center-title">{{ $t('forSchools.gallery.pricingTitle') }}</h2>
        <p v-if="plansLoading" class="aa-body aa-center-title">{{ $t('common.loading') }}…</p>

        <div v-else-if="pricingPlans.length" class="aa-prices">
          <article
            v-for="plan in pricingPlans"
            :key="plan.code"
            class="aa-price"
            :class="{ 'aa-price--featured': plan.featured }"
          >
            <span v-if="plan.featured" class="aa-price__badge">
              {{ $t('forSchools.gallery.mostPopular') }}
            </span>
            <h3>{{ plan.name }}</h3>
            <p class="aa-price__amount">
              <template v-if="plan.yearly != null">
                {{ formatOmr(plan.yearly) }} <span>{{ $t('forSchools.gallery.perYear') }}</span>
              </template>
              <template v-else>{{ $t('forSchools.gallery.custom') }}</template>
            </p>
            <p v-if="plan.description" class="aa-price__desc">{{ plan.description }}</p>
            <p v-if="plan.seats" class="aa-price__desc">
              {{ $t('landingPricing.includedSeats', { count: plan.seats }) }}
            </p>
            <p v-if="plan.addsOnBaseline" class="aa-price__adds">
              {{ $t('landingPricing.everythingInEntryPlus') }}
            </p>
            <ul v-if="plan.bullets.length" class="aa-price__features">
              <li v-for="bullet in plan.bullets" :key="bullet">{{ bullet }}</li>
            </ul>
            <p v-if="plan.extraCount > 0" class="aa-price__desc">
              {{ $t('landingPricing.andMoreModules', { count: plan.extraCount }) }}
            </p>
            <router-link
              v-if="!plan.contactOnly"
              :to="`/subscribe?plan=${plan.code}`"
              class="aa-btn aa-btn--primary aa-btn--block aa-price__cta"
            >
              {{ $t('forSchools.gallery.register') }}
            </router-link>
            <router-link
              v-else
              to="/custom-plan"
              class="aa-btn aa-btn--ghost aa-btn--block aa-price__cta"
            >
              {{ $t('forSchools.gallery.chooseModules') }}
            </router-link>
          </article>
        </div>
      </div>
    </section>

    <section class="aa-tile aa-tile--parchment">
      <div class="aa-mission">
        <div class="aa-copy">
          <h2>{{ $t('forSchools.gallery.missionTitle') }}</h2>
          <p class="aa-body">{{ $t('forSchools.gallery.missionBody') }}</p>
          <div class="aa-mission__points">
            <div>
              <p class="aa-point-title">{{ $t('forSchools.gallery.securityTitle') }}</p>
              <p class="aa-body">{{ $t('forSchools.gallery.securityBody') }}</p>
            </div>
            <div>
              <p class="aa-point-title">{{ $t('forSchools.gallery.legacyTitle') }}</p>
              <p class="aa-body">{{ $t('forSchools.gallery.legacyBody') }}</p>
            </div>
          </div>
        </div>
        <div class="aa-mission__photos">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=70"
            alt=""
          />
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=70"
            alt=""
          />
        </div>
      </div>
    </section>

    <section id="gallery-consult" class="aa-tile aa-tile--white">
      <div class="aa-consult">
        <h2>{{ $t('forSchools.gallery.consultTitle') }}</h2>
        <p class="aa-body">{{ $t('forSchools.gallery.consultLead') }}</p>
        <div v-if="consultSent" class="aa-consult__thanks" role="status">
          <p class="aa-consult__thanks-title">{{ $t('forSchools.gallery.consultThanksTitle') }}</p>
          <p class="aa-body">{{ $t('forSchools.gallery.consultThanks') }}</p>
        </div>
        <form v-else class="aa-form" @submit.prevent="requestConsult">
          <label>
            <span>{{ $t('forSchools.gallery.institution') }}</span>
            <input
              v-model="institution"
              type="text"
              required
              minlength="2"
              maxlength="200"
              :placeholder="$t('forSchools.gallery.institutionPh')"
            />
          </label>
          <label>
            <span>{{ $t('forSchools.gallery.email') }}</span>
            <input v-model="email" type="email" required maxlength="255" :placeholder="$t('forSchools.gallery.emailPh')" />
          </label>
          <label>
            <span>{{ $t('forSchools.gallery.phone') }}</span>
            <input
              v-model="phone"
              type="tel"
              required
              minlength="5"
              maxlength="30"
              autocomplete="tel"
              :placeholder="$t('forSchools.gallery.phonePh')"
            />
          </label>
          <label>
            <span>{{ $t('forSchools.gallery.scope') }}</span>
            <select v-model="scope">
              <option value="small">{{ $t('forSchools.gallery.scopeSmall') }}</option>
              <option value="mid">{{ $t('forSchools.gallery.scopeMid') }}</option>
              <option value="large">{{ $t('forSchools.gallery.scopeLarge') }}</option>
            </select>
          </label>
          <p v-if="consultError" class="aa-form__error aa-form__full" role="alert">{{ consultError }}</p>
          <button
            type="submit"
            class="aa-btn aa-btn--primary aa-btn--block aa-form__full"
            :disabled="consultSubmitting"
          >
            {{ consultSubmitting ? $t('forSchools.gallery.requesting') : $t('forSchools.gallery.request') }}
          </button>
        </form>
      </div>
    </section>

    <PlatformMarketingFooter />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PlatformMarketingNav from '@/components/PlatformMarketingNav.vue'
import PlatformMarketingFooter from '@/components/PlatformMarketingFooter.vue'
import {
  platformBillingService,
  type PlatformModule,
  type PlatformPlan,
} from '@/services/platform-billing.service'
import { schoolSubscriptionService } from '@/services/school-subscription.service'

const { locale, t, messages } = useI18n()

/** vue-i18n `t()` cannot return arrays — it prints the key. Read the list from locale JSON. */
function planHighlightLines(code: 'essential' | 'standard' | 'complete'): string[] {
  const bag = messages.value[locale.value] as {
    forSchools?: { planHighlights?: Record<string, unknown> }
  }
  const raw = bag?.forSchools?.planHighlights?.[code]
  if (!Array.isArray(raw)) return []
  return raw
    .map((line) => String(line).trim())
    .filter((line) => line && !line.startsWith('forSchools.'))
}
const isRTL = computed(() => locale.value === 'ar')

const offeringFeatures = [
  {
    key: 'transport',
    docsTo: '/docs/staff/fleet-assignment',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.038v-.991c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v.991M16.5 7.712v4.788',
  },
  {
    key: 'attendance',
    docsTo: '/docs/staff/daily-attendance',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'courses',
    docsTo: '/docs/staff/milestone-courses',
    icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  },
  {
    key: 'activities',
    docsTo: '/docs/staff/activities',
    icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
  },
  {
    key: 'comms',
    docsTo: '/docs/staff/group-chat',
    icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
  },
  {
    key: 'fees',
    docsTo: '/docs/staff/catalogs-packages',
    icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  },
] as const

/** How many modules to name on a card before collapsing the rest into a "+N" line. */
const MAX_PLAN_BULLETS = 5

const plans = ref<PlatformPlan[]>([])
const moduleCatalog = ref<PlatformModule[]>([])
const plansLoading = ref(true)

const formatOmr = (amount: number) =>
  new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
    style: 'currency',
    currency: 'OMR',
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * Cards are built from the plans the platform actually sells, so editing a plan in
 * /platform/plans changes this page. Prefer marketing bullets from the plan editor;
 * otherwise fall back to module names.
 */
const pricingPlans = computed(() => {
  const ar = locale.value === 'ar'
  const labels = new Map(
    moduleCatalog.value.map((m) => [m.code, (ar ? m.name_ar : m.name_en) || m.code]),
  )
  const ordered = [...plans.value].sort((a, b) => a.sort_order - b.sort_order)
  const mostSeats = Math.max(...ordered.map((p) => p.included_student_seats || 0), 0)
  const bulletText = (p: PlatformPlan) => {
    const fromFeatures = (p.features || [])
      .map((f) => (ar ? f.label_ar : f.label_en) || f.label_en || f.label_ar)
      .map((s) => (s || '').trim())
      .filter(Boolean)
    if (fromFeatures.length) return fromFeatures
    return (p.module_codes || []).map((c) => labels.get(c)).filter((x): x is string => Boolean(x))
  }
  // The entry tier is the shared baseline; higher tiers lead with what they add, or every
  // card would open with the same bullets and read as identical.
  const baseline = ordered.length ? new Set(bulletText(ordered[0])) : new Set<string>()

  const cards = ordered.map((plan, index) => {
    const all = bulletText(plan)
    const distinctive = index === 0 ? all : all.filter((line) => !baseline.has(line))
    const shown = distinctive.length ? distinctive : all
    const yearly = plan.prices.find((p) => p.billing_period === 'yearly')?.amount_omr
    return {
      code: plan.code,
      name: (ar ? plan.name_ar : plan.name_en) || plan.code,
      description: (ar ? plan.description_ar : plan.description_en) || '',
      seats: plan.included_student_seats || 0,
      yearly: yearly ?? null,
      contactOnly: yearly == null,
      addsOnBaseline: index > 0 && distinctive.length > 0,
      bullets: shown.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, shown.length - MAX_PLAN_BULLETS),
      // Highlight the middle of the range rather than a hardcoded tier name.
      featured: ordered.length > 2 && plan.included_student_seats > 0 &&
        plan.included_student_seats !== mostSeats &&
        plan.sort_order === ordered[Math.floor(ordered.length / 2)].sort_order,
    }
  })

  // Pricing grid is three columns — keep a visible “Talk to us” enterprise card when the
  // catalog only returns priced subscribe plans (otherwise inquire never appears).
  const hasContactCard = cards.some((c) => c.contactOnly)
  if (!hasContactCard) {
    const bullets = planHighlightLines('complete')
    cards.push({
      code: 'contact',
      name: t('landingPricing.planNames.complete'),
      description: t('landingPricing.planDescs.complete'),
      seats: 0,
      yearly: null,
      contactOnly: true,
      addsOnBaseline: false,
      bullets: bullets.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, bullets.length - MAX_PLAN_BULLETS),
      featured: false,
    })
  }

  return cards
})

onMounted(async () => {
  try {
    const catalog = await platformBillingService.listPublicPlans()
    plans.value = catalog.plans || []
    moduleCatalog.value = catalog.modules || []
  } catch (err) {
    console.error('Error loading plans:', err)
    plans.value = []
  } finally {
    plansLoading.value = false
  }
})

const institution = ref('')
const email = ref('')
const phone = ref('')
const scope = ref<'small' | 'mid' | 'large'>('small')
const consultSubmitting = ref(false)
const consultSent = ref(false)
const consultError = ref('')

async function requestConsult() {
  consultError.value = ''
  consultSubmitting.value = true
  try {
    await schoolSubscriptionService.submitInquiry({
      school_name: institution.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      scope: scope.value,
      locale: locale.value === 'en' ? 'en' : 'ar',
    })
    consultSent.value = true
  } catch (err) {
    consultError.value =
      err instanceof Error && err.message
        ? err.message
        : t('forSchools.gallery.consultError')
  } finally {
    consultSubmitting.value = false
  }
}

</script>

<style scoped>
.aa {
  --aa-teal: #00a19b;
  --aa-teal-deep: #00847f;
  --aa-navy: #0a2147;
  --aa-on-dark: #7ee8e3;
  --aa-ink: #0a2147;
  --aa-muted: #5a6b80;
  --aa-parchment: #f3f7f7;
  --aa-pearl: #f7fbfb;
  --aa-hairline: #d5e0e0;
  --aa-dark: #0a2147;
  background: #ffffff;
  color: var(--aa-ink);
  font-family: Inter, 'Be Vietnam Pro', 'Noto Sans Arabic', system-ui, sans-serif;
  overflow-x: hidden;
}

.aa-hero {
  position: relative;
  display: grid;
  gap: 2rem;
  align-items: center;
  overflow: hidden;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 2.25rem 1.5rem;
  border-radius: 0;
  background: var(--aa-navy);
  color: #fff;
}

.aa-hero__pixels {
  pointer-events: none;
  position: absolute;
  top: -0.5rem;
  inset-inline-end: -0.5rem;
  display: grid;
  grid-template-columns: repeat(4, 0.875rem);
  gap: 0.375rem;
  opacity: 0.9;
}

.aa-hero__pixels span {
  display: block;
  height: 0.875rem;
  width: 0.875rem;
  border-radius: 3px;
  background: #1db3ab;
}

.aa-hero__pixels span:nth-child(2n) { background: rgba(0, 161, 155, 0.6); }
.aa-hero__pixels span:nth-child(3n) { background: rgba(255, 255, 255, 0.25); }
.aa-hero__pixels span:nth-child(5n) { background: transparent; }

.aa-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 34rem;
}

.aa-hero__badge {
  display: inline-flex;
  margin: 0 0 1rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(0, 161, 155, 0.22);
  color: #b8f3ef;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.aa-hero__copy h1 {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 3.15rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.aa-hero__copy h1 span {
  color: #7ee8e3;
}

.aa-hero__copy > p:not(.aa-hero__badge) {
  margin: 1.15rem 0 0;
  font-size: clamp(1.05rem, 1.6vw, 1.2rem);
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.aa-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.aa-hero__shots {
  position: relative;
  z-index: 1;
  min-height: 22rem;
  height: min(70vh, 36rem);
  overflow: hidden;
  padding: 1.75rem 1.25rem 2rem;
  box-sizing: border-box;
}

.aa-shot {
  position: absolute;
  margin: 0;
}

.aa-shot--web {
  width: min(90%, 36rem);
  top: 8%;
  inset-inline-start: 0;
  z-index: 1;
  transform: rotate(-1.25deg);
}

.aa-browser {
  overflow: hidden;
  border-radius: 14px;
  background: #0b1220;
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 26px 56px rgba(8, 24, 52, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.aa-browser__chrome {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 1.85rem;
  padding: 0 0.75rem;
  background: linear-gradient(180deg, #243044 0%, #1a2436 100%);
}

.aa-browser__chrome span {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 9999px;
  background: #4b5563;
}

.aa-browser__chrome span:nth-child(1) { background: #ff5f57; }
.aa-browser__chrome span:nth-child(2) { background: #febc2e; }
.aa-browser__chrome span:nth-child(3) { background: #28c840; }

.aa-browser img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top center;
  background: #f3f4f6;
}

.aa-shot--phone {
  box-sizing: border-box;
  overflow: hidden;
  aspect-ratio: 390 / 844;
  border: 9px solid #111827;
  border-radius: 1.75rem;
  background: #0b1220;
  box-shadow: 0 22px 48px rgba(10, 33, 71, 0.38);
}

.aa-shot--phone img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: top center;
  background: #f8fafc;
}

.aa-shot--phone-a {
  width: min(34%, 11rem);
  top: 0;
  inset-inline-end: 1%;
  z-index: 3;
  transform: rotate(5deg);
}

.aa-shot--phone-b {
  width: min(32%, 10.25rem);
  bottom: 0;
  inset-inline-end: 18%;
  z-index: 2;
  transform: rotate(-4deg);
}

@media (min-width: 1024px) {
  .aa-hero {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    min-height: calc(100vh - 72px);
    padding: 3rem 4vw;
    overflow: hidden;
  }
  .aa-hero__shots {
    min-height: 0;
    height: min(78vh, 40rem);
    align-self: center;
    overflow: hidden;
    padding: 2rem 1.5rem 2.25rem;
  }
  .aa-shot--web {
    width: min(86%, 36rem);
    top: 12%;
    inset-inline-start: 2%;
  }
  .aa-shot--phone-a {
    width: min(30%, 11rem);
    top: 4%;
    inset-inline-end: 2%;
  }
  .aa-shot--phone-b {
    width: min(28%, 10.25rem);
    bottom: 6%;
    inset-inline-end: 22%;
  }
}

.aa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.7rem 2rem;
  border-radius: 9999px;
  font-size: 17px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  transition: transform 120ms ease;
}

.aa-btn:active {
  transform: scale(0.95);
}

.aa-btn:focus-visible {
  outline: 2px solid var(--aa-teal);
  outline-offset: 2px;
}

.aa-btn--primary {
  background: var(--aa-teal);
  color: #fff;
}

.aa-btn--ghost {
  background: var(--aa-pearl);
  border: 3px solid var(--aa-hairline);
  color: var(--aa-ink);
}

.aa-btn--ghost-navy {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.55);
  color: #fff;
}

.aa-btn--ghost-navy:hover {
  background: rgba(255, 255, 255, 0.1);
}

.aa-btn--on-dark {
  background: var(--aa-on-dark);
  color: var(--aa-dark);
  margin-top: 1rem;
}

.aa-btn--block {
  width: 100%;
}

.aa-tile {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0;
  padding: 3rem 1.5rem;
  scroll-margin-top: 5.5rem;
}

@media (min-width: 768px) {
  .aa-tile {
    padding: 5rem 4vw;
  }
}

.aa-tile--white { background: #fff; }
.aa-tile--parchment { background: var(--aa-parchment); }
.aa-tile--pearl { background: var(--aa-pearl); }
.aa-tile--dark { background: var(--aa-dark); color: #fff; }

.aa-split,
.aa-mission {
  display: grid;
  width: 100%;
  max-width: 1440px;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 768px) {
  .aa-split {
    grid-template-columns: 1fr 1fr;
  }
  .aa-mission {
    grid-template-columns: 5fr 7fr;
  }
}

.aa-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0;
}

.aa-photo--square {
  aspect-ratio: 1;
}

.aa-kicker {
  margin: 0 0 0.5rem;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--aa-teal);
}

.aa-kicker--on-dark {
  color: var(--aa-on-dark);
}

.aa-copy h2,
.aa-center-title,
.aa-consult h2 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.aa-center-title {
  width: 100%;
  margin: 0 0 3rem;
  text-align: center;
}

.aa-enroll {
  width: 100%;
  max-width: 1024px;
}

.aa-features {
  width: 100%;
  max-width: 1120px;
}

.aa-features__intro {
  max-width: 42rem;
  margin: 0 auto 3rem;
  text-align: center;
}

.aa-features__intro h2 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #fff;
}

.aa-tile--dark .aa-features__intro h2 {
  color: #fff;
}

.aa-features__intro .aa-body {
  margin: 0 auto;
  max-width: 40rem;
}

.aa-tile--dark .aa-feature-card {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
}

.aa-tile--dark .aa-feature-card:hover {
  border-color: color-mix(in srgb, var(--aa-teal) 55%, rgba(255, 255, 255, 0.2));
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.32);
}

.aa-features__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .aa-features__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .aa-features__grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.aa-feature-card {
  position: relative;
  display: block;
  overflow: hidden;
  border: 1px solid var(--aa-hairline);
  border-radius: 18px;
  background: #fff;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(10, 33, 71, 0.04);
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.aa-feature-card:hover {
  border-color: color-mix(in srgb, var(--aa-teal) 35%, var(--aa-hairline));
  box-shadow: 0 10px 28px rgba(10, 33, 71, 0.08);
}

/* Soft FIKR pixel cluster in the far corner — shape only, barely tinted */
.aa-feature-card__corner {
  pointer-events: none;
  position: absolute;
  top: 0.85rem;
  inset-inline-end: 0.85rem;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(2, 0.55rem);
  gap: 0.28rem;
  opacity: 0.55;
}

.aa-feature-card__corner span {
  display: block;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 2px;
  background: color-mix(in srgb, var(--aa-teal) 22%, #e8f4f3);
}

.aa-feature-card__corner span:nth-child(2) {
  background: color-mix(in srgb, var(--aa-teal) 12%, #f3f8f8);
}

.aa-feature-card__corner span:nth-child(3) {
  background: color-mix(in srgb, var(--aa-navy) 10%, #eef3f6);
}

.aa-feature-card__corner span:nth-child(4) {
  background: transparent;
}

.aa-feature-card__head,
.aa-feature-card p {
  position: relative;
  z-index: 1;
}

.aa-feature-card__head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 0.75rem;
}

.aa-feature-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--aa-teal) 12%, white);
  color: var(--aa-teal-deep);
}

.aa-feature-card h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 650;
  line-height: 1.3;
  color: var(--aa-ink);
}

.aa-feature-card p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--aa-muted);
}

.aa-life {
  width: 100%;
  max-width: 1120px;
}

.aa-life__intro {
  max-width: 40rem;
  margin-bottom: 2.5rem;
}

.aa-life__intro h2 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.aa-life__grid {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 768px) {
  .aa-life__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.aa-life-card {
  position: relative;
  display: flex;
  min-height: 22rem;
  overflow: hidden;
  border-radius: 18px;
  box-shadow: rgba(0, 0, 0, 0.28) 3px 8px 28px 0;
}

.aa-life-card--wide {
  min-height: 26rem;
}

@media (min-width: 768px) {
  .aa-life-card--wide {
    grid-column: 1 / -1;
    min-height: 28rem;
  }
}

.aa-life-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aa-life-card__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  padding: 4.5rem 1.5rem 1.5rem;
  background: linear-gradient(180deg, rgba(16, 16, 18, 0) 12%, rgba(16, 16, 18, 0.9) 78%);
  color: #fff;
}

.aa-life-card h3 {
  margin: 0;
  font-size: clamp(1.25rem, 2vw, 1.65rem);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.aa-life-card p {
  margin: 0.45rem 0 0;
  max-width: 40rem;
  font-size: 16px;
  line-height: 1.5;
  color: #e4e4e7;
  overflow-wrap: anywhere;
}

.aa-body {
  margin: 0.85rem 0 0;
  font-size: 17px;
  line-height: 1.47;
  color: var(--aa-muted);
}

.aa-body--on-dark {
  color: #c1c6d5;
}

.aa-copy ul {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.aa-copy li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 17px;
}

.aa-check {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: var(--aa-teal);
}

.aa-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.25rem;
}

.aa-stats > div {
  border-inline-start: 2px solid var(--aa-teal);
  padding-inline-start: 1rem;
}

.aa-stat {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}

.aa-stat-label {
  margin: 0.2rem 0 0;
  font-size: 14px;
  color: var(--aa-muted);
}

.aa-prices {
  display: grid;
  width: 100%;
  gap: 1.5rem;
  align-items: stretch;
}

@media (min-width: 768px) {
  .aa-prices {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.aa-price {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  min-height: 20rem;
  padding: 2rem;
  border: 1px solid var(--aa-hairline);
  border-radius: 18px;
  background: #fff;
}

.aa-price--featured {
  border: 2px solid var(--aa-teal);
  padding-top: 2.35rem;
}

.aa-price__badge {
  position: absolute;
  top: 0;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: var(--aa-teal);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.85rem;
  white-space: nowrap;
}

.aa-price h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--aa-muted);
}

.aa-price--featured h3 {
  color: var(--aa-teal);
}

.aa-price__amount {
  margin: 0.5rem 0 0;
  font-size: 2rem;
  font-weight: 600;
}

.aa-price__amount span,
.aa-price__desc {
  font-size: 14px;
  font-weight: 400;
  color: var(--aa-muted);
}

.aa-price__desc {
  margin: 0.75rem 0 0.75rem;
}

.aa-price__adds {
  margin: 0 0 0.4rem;
  font-size: 13px;
  font-weight: 600;
  color: var(--aa-muted);
}

.aa-price__features {
  margin: 0 0 1.25rem;
  padding: 0;
  list-style: none;
  flex-grow: 1;
  display: grid;
  gap: 0.4rem;
  font-size: 14px;
  color: var(--aa-muted);
}

.aa-price__features li {
  position: relative;
  padding-inline-start: 1.1rem;
}

.aa-price__features li::before {
  content: '✓';
  position: absolute;
  inset-inline-start: 0;
  color: var(--aa-accent, currentColor);
  font-weight: 700;
}

.aa-price__cta {
  margin-top: auto;
  width: 100%;
  justify-content: center;
  text-align: center;
}

.aa-mission__points {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.aa-point-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.aa-mission__photos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.aa-mission__photos img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 18px;
  filter: grayscale(1);
}

.aa-mission__photos img:last-child {
  margin-top: 3rem;
}

.aa-consult {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.aa-form {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  text-align: start;
}

@media (min-width: 768px) {
  .aa-form {
    grid-template-columns: 1fr 1fr;
  }
}

.aa-form__full {
  grid-column: 1 / -1;
}

.aa-form__error {
  margin: 0;
  font-size: 14px;
  color: #b42318;
}

.aa-consult__thanks {
  margin-top: 2rem;
  padding: 1.5rem 1.25rem;
  border-radius: 16px;
  background: var(--aa-pearl);
  border: 1px solid var(--aa-hairline);
}

.aa-consult__thanks-title {
  margin: 0 0 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--aa-teal-deep);
}

.aa-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 14px;
  color: var(--aa-muted);
}

.aa-form input,
.aa-form select {
  min-height: 48px;
  padding: 0.7rem 1.5rem;
  border: 1px solid var(--aa-hairline);
  border-radius: 9999px;
  background: var(--aa-pearl);
  font-size: 17px;
  color: var(--aa-ink);
}

.aa-form input:focus,
.aa-form select:focus {
  outline: 2px solid var(--aa-teal);
  outline-offset: 1px;
}

@media (prefers-reduced-motion: reduce) {
  .aa-btn {
    transition: none;
  }
  .aa-shot--web,
  .aa-shot--phone-a,
  .aa-shot--phone-b {
    transform: none;
  }
}
</style>
