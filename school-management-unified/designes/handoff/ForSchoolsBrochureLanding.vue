<template>
  <div class="fk" :dir="isRTL ? 'rtl' : 'ltr'">
    <PlatformMarketingNav />

    <!-- HERO -->
    <section class="fk-hero">
      <div class="fk-pixels fk-pixels--hero" aria-hidden="true">
        <span v-for="n in 12" :key="n" />
      </div>
      <div class="fk-hero__watermark" aria-hidden="true">فكر</div>
      <div class="fk-wrap fk-hero__grid">
        <div class="fk-hero__copy">
          <span class="fk-kicker fk-kicker--underline">{{ $t('forSchools.badge') }}</span>
          <h1>
            {{ $t('forSchools.heroTitleLead') }}<br />
            <span>{{ $t('forSchools.heroTitleAccent') }}</span>
          </h1>
          <p>{{ $t('forSchools.heroSubtitle') }}</p>
          <div class="fk-actions">
            <router-link to="/subscribe" class="fk-btn fk-btn--teal">{{ $t('forSchools.ctaPrimary') }}</router-link>
            <a href="#fk-pricing" class="fk-btn fk-btn--ghost">{{ $t('forSchools.ctaSecondary') }}</a>
          </div>
        </div>
        <div class="fk-hero__shots" aria-hidden="true">
          <div class="fk-browser">
            <div class="fk-browser__chrome"><span /><span /><span /></div>
            <img src="/landing/shots/dashboard.png?v=14" alt="" />
          </div>
          <div class="fk-phone fk-phone--teal fk-hero__phone-a"><div><img src="/landing/features/attendance-phone.png?v=14" alt="" /></div></div>
          <div class="fk-phone fk-phone--white fk-hero__phone-b"><div><img src="/landing/features/fees-phone.png?v=14" alt="" /></div></div>
        </div>
      </div>
      <div class="fk-ticker" aria-hidden="true">
        <div class="fk-ticker__track">
          <div v-for="k in 2" :key="k" class="fk-ticker__row">
            <template v-for="item in offeringFeatures" :key="item.key">
              <span>{{ $t(`forSchools.bento.${item.key}.title`) }}</span><span>·</span>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- OPERATIONS -->
    <section id="gallery-tools" class="fk-ops">
      <div class="fk-wrap fk-ops__grid">
        <div class="fk-numbered">
          <div class="fk-numeral fk-numeral--mint" aria-hidden="true">٠١</div>
          <div class="fk-numbered__body">
            <span class="fk-kicker fk-kicker--teal">{{ $t('forSchools.gallery.mgmtKicker') }}</span>
            <h2>{{ $t('forSchools.gallery.mgmtTitle') }}</h2>
            <p class="fk-body">{{ $t('forSchools.gallery.mgmtBody') }}</p>
            <ul class="fk-list">
              <li>{{ $t('forSchools.gallery.mgmtItem1') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem2') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem3') }}</li>
            </ul>
          </div>
        </div>
        <div class="fk-ops__shot">
          <div class="fk-tilt"><img src="/landing/shots/users.png?v=14" alt="" /></div>
        </div>
      </div>
      <div class="fk-ops__bar" aria-hidden="true" />
    </section>

    <!-- FEATURES -->
    <section id="gallery-features" class="fk-features">
      <div class="fk-wrap">
        <div class="fk-features__head">
          <div>
            <span class="fk-kicker fk-kicker--teal">{{ $t('forSchools.navFeatures') }}</span>
            <h2>{{ $t('forSchools.featuresTitle') }}</h2>
          </div>
          <p class="fk-body fk-body--on-dark">{{ $t('forSchools.featuresSubtitle') }}</p>
        </div>
        <div class="fk-board">
          <router-link :to="docsTo('attendance')" class="fk-tile fk-tile--teal fk-tile--attendance">
            <img src="/landing/shots/attendance.png?v=14" alt="" class="fk-tile__shot" />
            <div class="fk-tile__copy">
              <h3>{{ $t('forSchools.bento.attendance.title') }}</h3>
              <p>{{ $t('forSchools.bento.attendance.body') }}</p>
            </div>
          </router-link>
          <router-link :to="docsTo('fees')" class="fk-tile fk-tile--white fk-tile--fees">
            <div class="fk-tile__copy">
              <h3>{{ $t('forSchools.bento.fees.title') }}</h3>
              <p>{{ $t('forSchools.bento.fees.body') }}</p>
            </div>
            <img src="/landing/features/fees-phone.png?v=14" alt="" class="fk-tile__phone" />
          </router-link>
          <router-link :to="docsTo('transport')" class="fk-tile fk-tile--navy2">
            <h3>{{ $t('forSchools.bento.transport.title') }}</h3>
            <p>{{ $t('forSchools.bento.transport.body') }}</p>
          </router-link>
          <router-link :to="docsTo('courses')" class="fk-tile fk-tile--mint">
            <h3>{{ $t('forSchools.bento.courses.title') }}</h3>
            <p>{{ $t('forSchools.bento.courses.body') }}</p>
          </router-link>
          <router-link :to="docsTo('activities')" class="fk-tile fk-tile--navy2">
            <h3>{{ $t('forSchools.bento.activities.title') }}</h3>
            <p>{{ $t('forSchools.bento.activities.body') }}</p>
          </router-link>
          <router-link :to="docsTo('comms')" class="fk-tile fk-tile--white fk-tile--comms">
            <div>
              <h3>{{ $t('forSchools.bento.comms.title') }}</h3>
              <p>{{ $t('forSchools.bento.comms.body') }}</p>
            </div>
            <img src="/landing/features/messaging-phone.png?v=14" alt="" class="fk-tile__phone-side" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- FAMILIES -->
    <section class="fk-families">
      <div class="fk-families__diag" aria-hidden="true" />
      <div class="fk-wrap fk-families__grid">
        <div class="fk-numbered">
          <div class="fk-numeral fk-numeral--ghost" aria-hidden="true">٠٢</div>
          <div class="fk-numbered__body fk-families__title">
            <span class="fk-kicker">{{ $t('forSchools.gallery.precisionKicker') }}</span>
            <h2>{{ $t('forSchools.gallery.precisionTitle') }}</h2>
          </div>
          <p class="fk-body fk-families__body">{{ $t('forSchools.gallery.precisionBody') }}</p>
          <div class="fk-stats">
            <div><p class="fk-stat" dir="ltr">12M+</p><p class="fk-stat__label">{{ $t('forSchools.gallery.statRecords') }}</p></div>
            <div><p class="fk-stat" dir="ltr">99%</p><p class="fk-stat__label">{{ $t('forSchools.gallery.statAccuracy') }}</p></div>
          </div>
        </div>
        <div class="fk-families__shots" aria-hidden="true">
          <div class="fk-phone fk-phone--navy fk-families__phone-a"><div><img src="/landing/features/progress-phone.png?v=14" alt="" /></div></div>
          <div class="fk-phone fk-phone--navy fk-families__phone-b"><div><img src="/landing/features/mobile-dashboard.png?v=14" alt="" /></div></div>
        </div>
      </div>
    </section>

    <!-- PRICING (live) -->
    <section id="gallery-pricing" class="fk-pricing">
      <span id="fk-pricing" class="fk-anchor" />
      <div class="fk-pricing__watermark" dir="ltr" aria-hidden="true">3</div>
      <div class="fk-wrap">
        <span class="fk-kicker fk-kicker--teal">{{ $t('forSchools.navPricing') }}</span>
        <h2>{{ $t('forSchools.gallery.pricingTitle') }}</h2>
        <p v-if="plansLoading" class="fk-body">{{ $t('common.loading') }}…</p>
        <div v-else-if="pricingPlans.length" class="fk-prices">
          <article v-for="plan in pricingPlans" :key="plan.code" class="fk-price" :class="{ 'fk-price--featured': plan.featured }">
            <span v-if="plan.featured" class="fk-price__badge">{{ $t('forSchools.gallery.mostPopular') }}</span>
            <p class="fk-price__name">{{ plan.name }}</p>
            <p class="fk-price__amount" :dir="plan.yearly != null ? 'ltr' : undefined">
              <template v-if="plan.yearly != null">{{ formatOmr(plan.yearly) }} <span>{{ $t('forSchools.gallery.perYear') }}</span></template>
              <template v-else>{{ $t('forSchools.gallery.custom') }}</template>
            </p>
            <p v-if="plan.description" class="fk-price__desc">{{ plan.description }}</p>
            <p v-if="plan.seats" class="fk-price__desc">{{ $t('landingPricing.includedSeats', { count: plan.seats }) }}</p>
            <p v-if="plan.addsOnBaseline" class="fk-price__adds">{{ $t('landingPricing.everythingInEntryPlus') }}</p>
            <ul v-if="plan.bullets.length" class="fk-list fk-list--sm">
              <li v-for="bullet in plan.bullets" :key="bullet">{{ bullet }}</li>
            </ul>
            <p v-if="plan.extraCount > 0" class="fk-price__desc">{{ $t('landingPricing.andMoreModules', { count: plan.extraCount }) }}</p>
            <router-link
              v-if="!plan.contactOnly"
              :to="{ path: '/subscribe', query: { plan: plan.code }, hash: '#subscribe-plan' }"
              class="fk-btn fk-btn--block"
              :class="plan.featured ? 'fk-btn--teal' : 'fk-btn--outline'"
            >{{ $t('forSchools.gallery.register') }}</router-link>
            <router-link v-else to="/custom-plan" class="fk-btn fk-btn--outline fk-btn--block">{{ $t('forSchools.gallery.chooseModules') }}</router-link>
          </article>
        </div>
      </div>
    </section>

    <!-- MISSION -->
    <section class="fk-mission">
      <div class="fk-wrap fk-mission__grid">
        <div>
          <div class="fk-quote-mark" aria-hidden="true">“</div>
          <h2>{{ $t('forSchools.gallery.missionTitle') }}</h2>
          <p class="fk-body fk-body--on-teal">{{ $t('forSchools.gallery.missionBody') }}</p>
          <div class="fk-mission__points">
            <div class="fk-point fk-point--navy">
              <p class="fk-point__title">{{ $t('forSchools.gallery.securityTitle') }}</p>
              <p>{{ $t('forSchools.gallery.securityBody') }}</p>
            </div>
            <div class="fk-point fk-point--white">
              <p class="fk-point__title">{{ $t('forSchools.gallery.legacyTitle') }}</p>
              <p>{{ $t('forSchools.gallery.legacyBody') }}</p>
            </div>
          </div>
        </div>
        <div class="fk-mission__shots" aria-hidden="true">
          <div class="fk-mission__tall"><img src="/landing/shots/hero-web.png?v=14" alt="" /></div>
          <div><img src="/landing/shots/grades.png?v=14" alt="" /></div>
          <div class="fk-mission__logo"><img src="/fikr-logo-white.png" alt="" /></div>
        </div>
      </div>
    </section>

    <!-- CONSULT -->
    <section id="gallery-consult" class="fk-consult">
      <div class="fk-pixels fk-pixels--consult" aria-hidden="true"><span v-for="n in 5" :key="n" /></div>
      <div class="fk-wrap fk-consult__grid">
        <div>
          <h2>{{ $t('forSchools.gallery.consultTitle') }}</h2>
          <p class="fk-body fk-body--on-dark">{{ $t('forSchools.gallery.consultLead') }}</p>
        </div>
        <div v-if="consultSent" class="fk-form fk-form--thanks" role="status">
          <p class="fk-form__thanks-title">{{ $t('forSchools.gallery.consultThanksTitle') }}</p>
          <p>{{ $t('forSchools.gallery.consultThanks') }}</p>
        </div>
        <form v-else class="fk-form" @submit.prevent="requestConsult">
          <label><span>{{ $t('forSchools.gallery.institution') }}</span>
            <input v-model="institution" type="text" required minlength="2" maxlength="200" :placeholder="$t('forSchools.gallery.institutionPh')" /></label>
          <label><span>{{ $t('forSchools.gallery.email') }}</span>
            <input v-model="email" type="email" required maxlength="255" dir="ltr" :placeholder="$t('forSchools.gallery.emailPh')" /></label>
          <label><span>{{ $t('forSchools.gallery.phone') }}</span>
            <input v-model="phone" type="tel" required minlength="5" maxlength="30" autocomplete="tel" dir="ltr" /></label>
          <label><span>{{ $t('forSchools.gallery.scope') }}</span>
            <select v-model="scope">
              <option value="small">{{ $t('forSchools.gallery.scopeSmall') }}</option>
              <option value="mid">{{ $t('forSchools.gallery.scopeMid') }}</option>
              <option value="large">{{ $t('forSchools.gallery.scopeLarge') }}</option>
            </select></label>
          <p v-if="consultError" class="fk-form__error fk-form__full" role="alert">{{ consultError }}</p>
          <button type="submit" class="fk-btn fk-btn--teal fk-btn--block fk-form__full" :disabled="consultSubmitting">
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
const isRTL = computed(() => locale.value === 'ar')

// Same feature keys + docs routes as ForSchoolsGalleryLanding.vue
const offeringFeatures = [
  { key: 'transport', docsTo: '/docs/staff/fleet-assignment' },
  { key: 'attendance', docsTo: '/docs/staff/daily-attendance' },
  { key: 'courses', docsTo: '/docs/staff/milestone-courses' },
  { key: 'activities', docsTo: '/docs/staff/activities' },
  { key: 'comms', docsTo: '/docs/staff/group-chat' },
  { key: 'fees', docsTo: '/docs/staff/catalogs-packages' },
] as const
type FeatureKey = (typeof offeringFeatures)[number]['key']
const docsTo = (key: FeatureKey) => offeringFeatures.find((f) => f.key === key)!.docsTo

/* ---------- Pricing: identical logic to ForSchoolsGalleryLanding.vue ---------- */
function planHighlightLines(code: 'essential' | 'standard' | 'complete'): string[] {
  const bag = messages.value[locale.value] as { forSchools?: { planHighlights?: Record<string, unknown> } }
  const raw = bag?.forSchools?.planHighlights?.[code]
  if (!Array.isArray(raw)) return []
  return raw.map((line) => String(line).trim()).filter((line) => line && !line.startsWith('forSchools.'))
}
const MAX_PLAN_BULLETS = 5
const plans = ref<PlatformPlan[]>([])
const moduleCatalog = ref<PlatformModule[]>([])
const plansLoading = ref(true)
const formatOmr = (amount: number) =>
  new Intl.NumberFormat(locale.value === 'ar' ? 'ar-OM' : 'en-OM', { style: 'currency', currency: 'OMR', maximumFractionDigits: 0 }).format(amount)

const pricingPlans = computed(() => {
  const ar = locale.value === 'ar'
  const labels = new Map(moduleCatalog.value.map((m) => [m.code, (ar ? m.name_ar : m.name_en) || m.code]))
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
      featured:
        ordered.length > 2 &&
        plan.included_student_seats > 0 &&
        plan.included_student_seats !== mostSeats &&
        plan.sort_order === ordered[Math.floor(ordered.length / 2)].sort_order,
    }
  })
  if (!cards.some((c) => c.contactOnly)) {
    const bullets = planHighlightLines('complete')
    cards.push({
      code: 'contact',
      name: t('landingPricing.planNames.complete'),
      description: t('landingPricing.planDescs.complete'),
      seats: 0, yearly: null, contactOnly: true, addsOnBaseline: false,
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

/* ---------- Consult form: identical logic ---------- */
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
    consultError.value = err instanceof Error && err.message ? err.message : t('forSchools.gallery.consultError')
  } finally {
    consultSubmitting.value = false
  }
}
</script>

<style scoped>
/* ===== Brochure system: navy / teal / mint, zero radius on blocks, giant numerals ===== */
.fk {
  --navy: #0b2a4a; --navy-2: #153a5e; --navy-deep: #06192f;
  --teal: #0e9c8c; --teal-deep: #0b7e71; --mint: #e9f5f3;
  --ink: #0b2a4a; --ink-soft: #4b5b6b; --on-dark: #c9d6e3; --hair: #e6e9ee;
  background: #fff; color: var(--ink);
  font-family: 'IBM Plex Sans Arabic', Inter, 'Noto Sans Arabic', system-ui, sans-serif;
  overflow-x: clip;
}
.fk h1, .fk h2, .fk h3, .fk p { margin: 0; }
.fk h2 { font-size: clamp(30px, 3.2vw, 46px); line-height: 1.2; font-weight: 700; text-wrap: balance; margin-top: 12px; }
.fk-wrap { max-width: 1240px; margin: 0 auto; padding-inline: 24px; }
.fk-body { margin-top: 18px; font-size: 17px; line-height: 1.7; color: var(--ink-soft); max-width: 520px; text-wrap: pretty; }
.fk-body--on-dark { color: var(--on-dark); }
.fk-body--on-teal { color: #fff; }
.fk-kicker { font-size: 13px; font-weight: 600; letter-spacing: .1em; }
.fk-kicker--teal { color: var(--teal); }
.fk-kicker--underline { display: inline-block; color: var(--teal); border-bottom: 2px solid var(--teal); padding-bottom: 6px; }
.fk-anchor { position: relative; top: -80px; display: block; }

/* buttons */
.fk-btn { display: inline-block; text-decoration: none; font-size: 17px; font-weight: 600; padding: 14px 26px; border: 2px solid transparent; cursor: pointer; font-family: inherit; text-align: start; transition: background .15s, border-color .15s, color .15s; }
.fk-btn--teal { background: var(--teal); color: #fff; border-color: var(--teal); }
.fk-btn--teal:hover { background: var(--teal-deep); border-color: var(--teal-deep); }
.fk-btn--ghost { border-color: rgba(255,255,255,.35); color: #fff; }
.fk-btn--ghost:hover { border-color: #fff; }
.fk-btn--outline { border-color: var(--navy); color: var(--navy); }
.fk-btn--outline:hover { background: var(--navy); color: #fff; }
.fk-btn--block { display: block; }
.fk-btn:disabled { opacity: .5; cursor: default; }
.fk-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 36px; }

/* lists */
.fk-list { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 14px; font-size: 16px; line-height: 1.5; }
.fk-list li { display: flex; gap: 12px; align-items: flex-start; }
.fk-list li::before { content: ''; width: 10px; height: 10px; background: var(--teal); flex: none; margin-top: 8px; }
.fk-list--sm { margin: 8px 0 0; gap: 10px; font-size: 15px; flex: 1; }
.fk-list--sm li::before { width: 8px; height: 8px; }

/* pixels */
.fk-pixels { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(16, 1fr); grid-template-rows: repeat(9, 1fr); gap: 6px; padding: 6px; pointer-events: none; }
.fk-pixels span { background: var(--teal); }
.fk-pixels--hero span:nth-child(1) { grid-area: 1/16; animation: fk-blink 4s ease-in-out infinite; }
.fk-pixels--hero span:nth-child(2) { grid-area: 1/15; opacity: .5; }
.fk-pixels--hero span:nth-child(3) { grid-area: 2/16; opacity: .7; }
.fk-pixels--hero span:nth-child(4) { grid-area: 2/14; opacity: .3; animation: fk-blink 5s ease-in-out infinite 1s; }
.fk-pixels--hero span:nth-child(5) { grid-area: 3/15; opacity: .4; }
.fk-pixels--hero span:nth-child(6) { grid-area: 4/16; opacity: .2; }
.fk-pixels--hero span:nth-child(7) { grid-area: 9/1; }
.fk-pixels--hero span:nth-child(8) { grid-area: 9/2; opacity: .5; animation: fk-blink 6s ease-in-out infinite 2s; }
.fk-pixels--hero span:nth-child(9) { grid-area: 8/1; opacity: .7; }
.fk-pixels--hero span:nth-child(10) { grid-area: 8/3; opacity: .3; }
.fk-pixels--hero span:nth-child(11) { grid-area: 7/2; opacity: .4; }
.fk-pixels--hero span:nth-child(12) { grid-area: 6/1; opacity: .2; }
.fk-pixels--consult { grid-template-rows: repeat(8, 1fr); }
.fk-pixels--consult span:nth-child(1) { grid-area: 8/16; }
.fk-pixels--consult span:nth-child(2) { grid-area: 8/15; opacity: .5; }
.fk-pixels--consult span:nth-child(3) { grid-area: 7/16; opacity: .7; }
.fk-pixels--consult span:nth-child(4) { grid-area: 7/14; opacity: .3; }
.fk-pixels--consult span:nth-child(5) { grid-area: 6/15; opacity: .4; }

/* devices */
.fk-browser { position: absolute; inset-inline-start: 0; inset-inline-end: 90px; top: 30px; background: #fff; box-shadow: 0 40px 80px rgba(0,0,0,.45); transform: rotate(-4deg); transform-origin: top left; overflow: hidden; }
[dir='ltr'] .fk-browser { transform: rotate(4deg); transform-origin: top right; }
.fk-browser__chrome { height: 26px; background: var(--hair); display: flex; gap: 6px; align-items: center; padding: 0 10px; }
.fk-browser__chrome span { width: 8px; height: 8px; border-radius: 50%; background: var(--on-dark); }
.fk-browser img { width: 100%; display: block; }
.fk-phone { position: absolute; aspect-ratio: 1170 / 2532; border-radius: 30px; padding: 8px; box-shadow: 0 40px 80px rgba(0,0,0,.45); }
.fk-phone > div { width: 100%; height: 100%; border-radius: 24px; overflow: hidden; background: #f5f6f8; }
.fk-phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.fk-phone--teal { background: var(--teal); }
.fk-phone--white { background: #fff; }
.fk-phone--navy { background: #0b1a2e; }
.fk-tilt { transform: rotate(-5deg); transform-origin: top right; box-shadow: 0 40px 80px rgba(11,42,74,.3); background: #fff; overflow: hidden; margin-inline-end: -90px; }
[dir='ltr'] .fk-tilt { transform: rotate(5deg); transform-origin: top left; }
.fk-tilt img { width: 100%; display: block; }

/* numerals */
.fk-numbered { position: relative; }
.fk-numbered__body { position: relative; }
.fk-numeral { position: absolute; inset-inline-start: -8px; top: -80px; font-size: clamp(90px, 11vw, 160px); line-height: 1; font-weight: 700; }
.fk-numeral--mint { color: var(--mint); }
.fk-numeral--ghost { color: #fff; opacity: .25; }

/* HERO */
.fk-hero { position: relative; background: var(--navy); color: #fff; overflow: hidden; }
.fk-hero__watermark { position: absolute; inset-inline-start: -1vw; top: -6vw; font-size: clamp(260px, 34vw, 560px); line-height: .85; font-weight: 700; opacity: .04; pointer-events: none; }
.fk-hero__grid { position: relative; padding-top: 96px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 40px; align-items: end; }
.fk-hero__copy { position: relative; z-index: 2; min-width: 0; padding-bottom: 110px; animation: fk-rise .8s ease-out both; }
.fk-hero__copy h1 { margin-top: 22px; font-size: clamp(40px, 5.2vw, 78px); line-height: 1.1; font-weight: 700; text-wrap: balance; }
.fk-hero__copy h1 span { color: var(--teal); }
.fk-hero__copy p { margin-top: 24px; font-size: clamp(16px, 1.3vw, 20px); line-height: 1.75; color: var(--on-dark); max-width: 540px; text-wrap: pretty; }
.fk-hero__shots { position: relative; height: 600px; min-width: 0; }
.fk-hero__phone-a { inset-inline-end: 0; bottom: -20px; width: min(220px, 40%); animation: fk-float 6s ease-in-out infinite; }
.fk-hero__phone-b { inset-inline-end: 40%; bottom: -60px; width: min(200px, 36%); animation: fk-float 7s ease-in-out infinite 1.2s; }
.fk-ticker { position: relative; background: var(--teal); color: #fff; overflow: hidden; padding: 14px 0; font-size: 15px; font-weight: 600; letter-spacing: .04em; white-space: nowrap; }
.fk-ticker__track { display: inline-flex; width: max-content; animation: fk-marquee 40s linear infinite; direction: ltr; }
.fk-ticker__row { display: inline-flex; gap: 40px; padding-inline: 20px; direction: rtl; }
[dir='ltr'] .fk-ticker__row { direction: ltr; }

/* OPERATIONS */
.fk-ops { position: relative; background: #fff; overflow: hidden; }
.fk-ops__grid { padding-top: 120px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.15fr); gap: 48px; align-items: start; }
.fk-ops__shot { position: relative; min-width: 0; padding-bottom: 90px; }
.fk-ops__bar { position: absolute; inset-inline-end: 0; bottom: 0; width: 22%; height: 24px; background: var(--navy); }

/* FEATURES */
.fk-features { background: var(--navy); color: #fff; }
.fk-features .fk-wrap { padding-block: 110px 120px; }
.fk-features__head { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 32px; align-items: end; margin-bottom: 44px; }
.fk-features__head .fk-body { margin-top: 0; }
.fk-board { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); grid-auto-rows: 150px; gap: 10px; }
.fk-tile { position: relative; overflow: hidden; text-decoration: none; padding: 24px; display: flex; flex-direction: column; justify-content: flex-end; grid-column: span 2; transition: background .15s; }
.fk-tile h3 { font-size: 20px; font-weight: 700; }
.fk-tile p { font-size: 14px; margin-top: 6px; line-height: 1.55; }
.fk-tile--teal { background: var(--teal); color: #fff; }
.fk-tile--teal:hover { background: var(--teal-deep); }
.fk-tile--navy2 { background: var(--navy-2); color: #fff; }
.fk-tile--navy2:hover { background: #1b4670; }
.fk-tile--navy2 p { color: var(--on-dark); }
.fk-tile--mint { background: var(--mint); color: var(--ink); }
.fk-tile--mint:hover { background: #d8efeb; }
.fk-tile--mint p { color: var(--ink-soft); }
.fk-tile--white { background: #fff; color: var(--ink); }
.fk-tile--white p { color: var(--ink-soft); }
.fk-tile--attendance { grid-column: span 4; grid-row: span 2; padding: 28px; }
.fk-tile--attendance h3 { font-size: 26px; }
.fk-tile--attendance .fk-tile__copy { position: relative; max-width: 46%; }
.fk-tile__shot { position: absolute; inset-inline-end: -10%; top: 24px; width: 70%; box-shadow: 0 20px 50px rgba(0,0,0,.35); transform: rotate(-6deg); }
.fk-tile--fees { grid-row: span 2; justify-content: flex-start; padding: 24px 24px 0; }
.fk-tile--fees h3 { font-size: 22px; }
.fk-tile__phone { position: absolute; left: 50%; transform: translateX(-50%); bottom: -22%; height: 62%; width: auto; border-radius: 22px; box-shadow: 0 20px 40px rgba(11,42,74,.3); }
.fk-tile--comms { grid-column: span 6; padding: 28px; display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 24px; align-items: center; }
.fk-tile--comms h3 { font-size: 22px; }
.fk-tile--comms p { max-width: 560px; }
.fk-tile__phone-side { height: 260px; width: auto; border-radius: 22px; box-shadow: 0 20px 40px rgba(11,42,74,.3); margin: -80px 0 -120px; transform: rotate(6deg); }

/* FAMILIES */
.fk-families { position: relative; background: #fff; overflow: hidden; }
.fk-families__diag { position: absolute; inset: 0; background: var(--teal); clip-path: polygon(0 0, 100% 0, 100% 34%, 0 66%); }
[dir='ltr'] .fk-families__diag { clip-path: polygon(0 0, 100% 0, 100% 66%, 0 34%); }
.fk-families__grid { position: relative; padding-block: 100px 90px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 48px; align-items: start; }
.fk-families__title { color: #fff; }
.fk-families__body { margin-top: 230px; max-width: 440px; }
.fk-stats { display: flex; gap: 48px; margin-top: 36px; flex-wrap: wrap; }
.fk-stat { font-size: 56px; font-weight: 700; line-height: 1; text-align: start; }
.fk-stat__label { font-size: 14px; color: var(--ink-soft); margin-top: 6px; border-top: 2px solid var(--teal); padding-top: 6px; }
.fk-families__shots { position: relative; height: 640px; min-width: 0; }
.fk-families__phone-a { inset-inline-end: 8%; top: 0; width: min(280px, 46%); border-radius: 34px; }
.fk-families__phone-a > div, .fk-families__phone-b > div { border-radius: 28px; }
.fk-families__phone-b { inset-inline-start: 4%; top: 130px; width: min(280px, 46%); border-radius: 34px; animation: fk-float 7s ease-in-out infinite; }

/* PRICING */
.fk-pricing { position: relative; background: #fff; overflow: hidden; }
.fk-pricing .fk-wrap { position: relative; padding-block: 100px; }
.fk-pricing__watermark { position: absolute; inset-inline-end: -4vw; bottom: -10vw; font-size: clamp(220px, 26vw, 420px); line-height: .8; font-weight: 700; color: #f2f6f5; letter-spacing: -.06em; pointer-events: none; }
.fk-prices { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; align-items: stretch; margin-top: 40px; }
.fk-price { position: relative; border: 2px solid var(--hair); background: #fff; padding: 32px; display: flex; flex-direction: column; gap: 18px; }
.fk-price--featured { background: var(--navy); color: #fff; border-color: var(--navy); transform: translateY(-12px); }
.fk-price__badge { position: absolute; top: 0; inset-inline-start: 32px; background: var(--teal); color: #fff; font-size: 12px; font-weight: 600; padding: 6px 12px; }
.fk-price__name { font-size: 14px; font-weight: 600; color: var(--teal); letter-spacing: .08em; }
.fk-price--featured .fk-price__name { margin-top: 10px; }
.fk-price__amount { font-size: 44px; font-weight: 700; line-height: 1; text-align: start; }
.fk-price__amount span { font-size: 16px; font-weight: 500; color: var(--ink-soft); }
.fk-price--featured .fk-price__amount span, .fk-price--featured .fk-price__desc { color: var(--on-dark); }
.fk-price__desc { font-size: 15px; color: var(--ink-soft); }
.fk-price__adds { font-size: 13px; color: var(--teal); font-weight: 600; }
.fk-price .fk-btn { margin-top: auto; }

/* MISSION */
.fk-mission { background: var(--teal); color: #fff; position: relative; overflow: hidden; }
.fk-mission__grid { padding-block: 100px; display: grid; grid-template-columns: minmax(0,1.1fr) minmax(0,1fr); gap: 56px; align-items: center; }
.fk-quote-mark { font-size: 120px; line-height: .5; font-weight: 700; color: var(--navy); }
.fk-mission h2 { margin-top: 24px; font-size: clamp(30px, 3.4vw, 50px); }
.fk-mission__points { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 24px; margin-top: 40px; }
.fk-point { padding: 24px; }
.fk-point p { font-size: 14px; line-height: 1.6; margin-top: 8px; }
.fk-point__title { font-size: 18px; font-weight: 700; margin-top: 0 !important; }
.fk-point--navy { background: var(--navy); color: #fff; }
.fk-point--navy p:not(.fk-point__title) { color: var(--on-dark); }
.fk-point--white { background: #fff; color: var(--ink); }
.fk-point--white p:not(.fk-point__title) { color: var(--ink-soft); }
.fk-mission__shots { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); grid-auto-rows: 200px; gap: 10px; min-width: 0; }
.fk-mission__shots > div { background: var(--navy); overflow: hidden; }
.fk-mission__shots img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.fk-mission__tall { grid-row: span 2; filter: grayscale(1); }
.fk-mission__tall img { opacity: .9; }
.fk-mission__logo { display: flex; align-items: center; justify-content: center; padding: 24px; }
.fk-mission__logo img { width: 70%; height: auto; object-fit: contain; }

/* CONSULT */
.fk-consult { position: relative; background: var(--navy); color: #fff; overflow: hidden; }
.fk-consult__grid { position: relative; padding-block: 110px; display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 56px; align-items: center; }
.fk-consult h2 { margin-top: 0; font-size: clamp(34px, 3.8vw, 58px); line-height: 1.15; }
.fk-form { background: #fff; color: var(--ink); padding: 36px; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; align-items: end; min-width: 0; }
.fk-form label { display: grid; gap: 8px; font-size: 14px; font-weight: 600; }
.fk-form input, .fk-form select { width: 100%; min-width: 0; box-sizing: border-box; font: inherit; font-weight: 400; font-size: 16px; padding: 14px; border: 2px solid var(--hair); background: #fff; color: var(--ink); outline: none; text-align: start; }
.fk-form input:focus-visible, .fk-form select:focus-visible { border-color: var(--teal); }
.fk-form__full { grid-column: 1 / -1; }
.fk-form .fk-btn { margin-top: 8px; font-size: 18px; padding: 18px 24px; }
.fk-form__error { color: #b42318; font-size: 14px; }
.fk-form--thanks { display: block; }
.fk-form__thanks-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }

/* motion */
@keyframes fk-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }
@keyframes fk-rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes fk-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes fk-blink { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .fk * { animation: none !important; } }

/* responsive */
@media (max-width: 900px) {
  .fk-hero__grid, .fk-ops__grid, .fk-features__head, .fk-families__grid, .fk-mission__grid, .fk-consult__grid { grid-template-columns: 1fr; }
  .fk-hero__copy { padding-bottom: 40px; }
  .fk-hero__shots { height: 420px; }
  .fk-ops__shot { padding-bottom: 60px; }
  .fk-tilt { margin-inline-end: -24px; }
  .fk-board { grid-template-columns: repeat(2, minmax(0,1fr)); grid-auto-rows: 170px; }
  .fk-tile--attendance { grid-column: span 2; }
  .fk-tile--attendance .fk-tile__copy { max-width: 100%; }
  .fk-tile__shot { display: none; }
  .fk-tile--comms { grid-column: span 2; grid-template-columns: 1fr; }
  .fk-tile__phone-side { display: none; }
  .fk-families__diag { clip-path: polygon(0 0, 100% 0, 100% 22%, 0 34%); }
  .fk-families__body { margin-top: 32px; }
  .fk-families__shots { height: 560px; }
  .fk-prices { grid-template-columns: 1fr; }
  .fk-price--featured { transform: none; }
  .fk-mission__points { grid-template-columns: 1fr; }
  .fk-form { grid-template-columns: 1fr; padding: 24px; }
}
</style>
