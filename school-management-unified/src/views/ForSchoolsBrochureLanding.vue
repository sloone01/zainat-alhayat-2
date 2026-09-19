<template>
  <div ref="root" class="fb" :dir="isRTL ? 'rtl' : 'ltr'">
    <PlatformMarketingNav />

    <!-- HERO: split layout — copy on the start side, screenshot panel wiping in on the end side -->
    <section class="fb-hero">
      <div class="fb-hero__copy">
        <div class="fb-hero__main">
          <span class="fb-kicker fb-kicker--teal" data-reveal>{{ $t('forSchools.badge') }}</span>
          <h1 data-reveal style="--d: 1">
            {{ $t('forSchools.heroTitleLead') }}<br />
            <span>{{ $t('forSchools.heroTitleAccent') }}</span>
          </h1>
          <div class="fb-hero__rule" aria-hidden="true" data-reveal style="--d: 2"></div>
          <p data-reveal style="--d: 3">{{ $t('forSchools.heroSubtitle') }}</p>
          <div class="fb-actions" data-reveal style="--d: 4">
            <router-link to="/subscribe" class="fb-btn fb-btn--teal">{{ $t('forSchools.ctaPrimary') }}</router-link>
            <a href="#fb-pricing" class="fb-link">{{ $t('forSchools.ctaSecondary') }}<span aria-hidden="true">←</span></a>
          </div>
        </div>
        <ul class="fb-contact" data-reveal style="--d: 5">
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            <span dir="ltr">{{ $t('forSchools.gallery.contactSite') }}</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>
            <span dir="ltr">{{ $t('forSchools.gallery.contactEmail') }}</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <span dir="ltr">{{ $t('forSchools.gallery.contactPhone') }}</span>
          </li>
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            <span dir="ltr">{{ $t('forSchools.gallery.contactPhoneAlt') }}</span>
          </li>
        </ul>
      </div>

      <div class="fb-hero__panel" aria-hidden="true">
        <div class="fb-pixels fb-pixels--hero"><span v-for="n in 12" :key="n" /></div>
        <div class="fb-hero__watermark">فكر</div>
        <div class="fb-hero__stage" data-reveal>
          <div class="fb-phone fb-phone--slim fb-hero__phone-main"><div><img src="/landing/features/attendance-phone.webp?v=19" alt="" /></div></div>
          <div class="fb-live fb-live--a"><span class="fb-live__dot" />{{ $t('forSchools.gallery.liveAttendance') }}</div>
          <div class="fb-live fb-live--b"><span class="fb-live__dot fb-live__dot--gold" />{{ $t('forSchools.gallery.liveFees') }}</div>
        </div>
      </div>
    </section>

    <!-- OPERATIONS -->
    <section id="gallery-tools" class="fb-ops">
      <div class="fb-wrap fb-ops__grid">
        <div class="fb-numbered">
          <div class="fb-numeral fb-numeral--mint" aria-hidden="true">٠١</div>
          <div class="fb-numbered__body">
            <span class="fb-kicker fb-kicker--teal" data-reveal>{{ $t('forSchools.gallery.mgmtKicker') }}</span>
            <h2 data-reveal style="--d: 1">{{ $t('forSchools.gallery.mgmtTitle') }}</h2>
            <p class="fb-body" data-reveal style="--d: 2">{{ $t('forSchools.gallery.mgmtBody') }}</p>
            <ul class="fb-list" data-reveal style="--d: 3">
              <li>{{ $t('forSchools.gallery.mgmtItem1') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem2') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem3') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem4') }}</li>
              <li>{{ $t('forSchools.gallery.mgmtItem5') }}</li>
            </ul>
          </div>
        </div>
        <div class="fb-ops__shot" aria-hidden="true" data-reveal style="--d: 2">
          <div class="fb-ops__frame"><img src="/landing/shots/feature-users.webp?v=19" alt="" /></div>
          <div class="fb-ops__chip">{{ $t('forSchools.gallery.mgmtChip') }}</div>
        </div>
      </div>
      <div class="fb-ops__bar" aria-hidden="true"></div>
    </section>

    <!-- FEATURES -->
    <section id="gallery-features" class="fb-features">
      <div class="fb-wrap">
        <div class="fb-features__head">
          <div data-reveal>
            <span class="fb-kicker fb-kicker--teal">{{ $t('forSchools.navFeatures') }}</span>
            <h2>{{ $t('forSchools.featuresTitle') }}</h2>
          </div>
          <p class="fb-body fb-body--on-dark" data-reveal style="--d: 1">{{ $t('forSchools.featuresSubtitle') }}</p>
        </div>
        <div class="fb-board">
          <router-link :to="docsTo('attendance')" class="fb-tile fb-tile--teal fb-tile--attendance" data-reveal style="--d: 0">
            <div class="fb-tile__shot"><img src="/landing/shots/attendance.webp?v=19" alt="" /></div>
            <div class="fb-tile__copy">
              <h3>{{ $t('forSchools.bento.attendance.title') }}</h3>
              <p>{{ $t('forSchools.bento.attendance.body') }}</p>
            </div>
          </router-link>
          <router-link :to="docsTo('fees')" class="fb-tile fb-tile--white fb-tile--fees" data-reveal style="--d: 1">
            <div class="fb-tile__copy">
              <h3>{{ $t('forSchools.bento.fees.title') }}</h3>
              <p>{{ $t('forSchools.bento.fees.body') }}</p>
            </div>
            <div class="fb-tile__phone"><img src="/landing/features/fees-phone.webp?v=19" alt="" /></div>
          </router-link>
          <router-link :to="docsTo('transport')" class="fb-tile fb-tile--navy2" data-reveal style="--d: 2">
            <h3>{{ $t('forSchools.bento.transport.title') }}</h3>
            <p>{{ $t('forSchools.bento.transport.body') }}</p>
          </router-link>
          <router-link :to="docsTo('courses')" class="fb-tile fb-tile--mint" data-reveal style="--d: 3">
            <h3>{{ $t('forSchools.bento.courses.title') }}</h3>
            <p>{{ $t('forSchools.bento.courses.body') }}</p>
          </router-link>
          <router-link :to="docsTo('activities')" class="fb-tile fb-tile--navy2" data-reveal style="--d: 4">
            <h3>{{ $t('forSchools.bento.activities.title') }}</h3>
            <p>{{ $t('forSchools.bento.activities.body') }}</p>
          </router-link>
          <router-link :to="docsTo('comms')" class="fb-tile fb-tile--white fb-tile--comms" data-reveal style="--d: 5">
            <div class="fb-tile__copy">
              <h3>{{ $t('forSchools.bento.comms.title') }}</h3>
              <p>{{ $t('forSchools.bento.comms.body') }}</p>
            </div>
            <div class="fb-tile__screen-side"><img src="/landing/shots/messages.webp?v=19" alt="" /></div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- FAMILIES -->
    <section class="fb-families">
      <div class="fb-families__diag" aria-hidden="true"></div>
      <div class="fb-wrap fb-families__grid">
        <div class="fb-numbered fb-families__title">
          <div class="fb-numeral fb-numeral--ghost" aria-hidden="true">٠٢</div>
          <div class="fb-numbered__body">
            <span class="fb-kicker" data-reveal>{{ $t('forSchools.gallery.precisionKicker') }}</span>
            <h2 data-reveal style="--d: 1">{{ $t('forSchools.gallery.precisionTitle') }}</h2>
          </div>
        </div>
        <div class="fb-families__copy">
          <p class="fb-body fb-families__body" data-reveal>{{ $t('forSchools.gallery.precisionBody') }}</p>
          <div class="fb-stats" data-reveal style="--d: 1">
            <div><p class="fb-stat" dir="ltr">12M+</p><p class="fb-stat__label">{{ $t('forSchools.gallery.statRecords') }}</p></div>
            <div><p class="fb-stat" dir="ltr">99%</p><p class="fb-stat__label">{{ $t('forSchools.gallery.statAccuracy') }}</p></div>
          </div>
        </div>
        <div class="fb-families__shots" aria-hidden="true">
          <!-- three-card fan: side cards spread out from the centre as they come into view -->
          <div class="fb-fan" data-reveal style="--d: 1">
            <div class="fb-fan__card fb-phone fb-phone--slim"><div><img src="/landing/features/fees-phone.webp?v=19" alt="" /></div></div>
            <div class="fb-fan__card fb-fan__card--main fb-phone fb-phone--slim"><div><img src="/landing/features/attendance-phone.webp?v=19" alt="" /></div></div>
            <div class="fb-fan__card fb-phone fb-phone--slim"><div><img src="/landing/features/reports-phone.webp?v=19" alt="" /></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- PRICING (live) -->
    <section id="gallery-pricing" class="fb-pricing">
      <span id="fb-pricing" class="fb-anchor"></span>
      <div class="fb-pricing__watermark" dir="ltr" aria-hidden="true">3</div>
      <div class="fb-wrap">
        <div class="fb-head" data-reveal>
          <span class="fb-kicker fb-kicker--teal">{{ $t('forSchools.navPricing') }}</span>
          <h2>{{ $t('forSchools.gallery.pricingTitle') }}</h2>
        </div>
        <div class="fb-pricing__cards" data-reveal style="--d: 1">
          <PlatformPricingCards :cards="pricingPlans" :loading="plansLoading" />
        </div>
      </div>
    </section>

    <!-- MISSION -->
    <section class="fb-mission">
      <div class="fb-wrap fb-mission__grid">
        <div class="fb-mission__copy">
          <div class="fb-quote-mark" aria-hidden="true" data-reveal>“</div>
          <h2 data-reveal style="--d: 1">{{ $t('forSchools.gallery.missionTitle') }}</h2>
          <p class="fb-body fb-body--on-teal" data-reveal style="--d: 2">{{ $t('forSchools.gallery.missionBody') }}</p>
          <div class="fb-mission__points" data-reveal style="--d: 3">
            <div class="fb-point fb-point--navy">
              <p class="fb-point__title">{{ $t('forSchools.gallery.securityTitle') }}</p>
              <p>{{ $t('forSchools.gallery.securityBody') }}</p>
            </div>
            <div class="fb-point fb-point--white">
              <p class="fb-point__title">{{ $t('forSchools.gallery.legacyTitle') }}</p>
              <p>{{ $t('forSchools.gallery.legacyBody') }}</p>
            </div>
          </div>
        </div>
        <div class="fb-mission__shots" aria-hidden="true" data-reveal style="--d: 2">
          <div class="fb-browser fb-mission__browser">
            <div class="fb-browser__chrome"><span /><span /><span /></div>
            <img src="/landing/shots/feature-settings.webp?v=19" alt="" />
          </div>
          <div class="fb-phone fb-phone--slim fb-mission__phone"><div><img src="/landing/shots/settings.webp?v=19" alt="" /></div></div>
        </div>
      </div>
    </section>

    <!-- CONSULT -->
    <section id="gallery-consult" class="fb-consult">
      <div class="fb-pixels fb-pixels--consult" aria-hidden="true"><span v-for="n in 5" :key="n" /></div>
      <div class="fb-wrap fb-consult__grid">
        <div class="fb-consult__copy">
          <h2 data-reveal>{{ $t('forSchools.gallery.consultTitle') }}</h2>
          <p class="fb-body fb-body--on-dark" data-reveal style="--d: 1">{{ $t('forSchools.gallery.consultLead') }}</p>
        </div>
        <div v-if="consultSent" class="fb-form fb-form--thanks" role="status">
          <p class="fb-form__thanks-title">{{ $t('forSchools.gallery.consultThanksTitle') }}</p>
          <p>{{ $t('forSchools.gallery.consultThanks') }}</p>
        </div>
        <form v-else class="fb-form" data-reveal style="--d: 2" @submit.prevent="requestConsult">
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
          <p v-if="consultError" class="fb-form__error fb-form__full" role="alert">{{ consultError }}</p>
          <button type="submit" class="fb-btn fb-btn--teal fb-btn--block fb-form__full" :disabled="consultSubmitting">
            {{ consultSubmitting ? $t('forSchools.gallery.requesting') : $t('forSchools.gallery.request') }}
          </button>
        </form>
      </div>
    </section>

    <PlatformMarketingFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PlatformMarketingNav from '@/components/PlatformMarketingNav.vue'
import PlatformMarketingFooter from '@/components/PlatformMarketingFooter.vue'
import PlatformPricingCards from '@/components/PlatformPricingCards.vue'
import { buildPublicPricingCards } from '@/utils/public-pricing-cards'
import {
  platformBillingService,
  type PlatformModule,
  type PlatformPlan,
} from '@/services/platform-billing.service'
import { schoolSubscriptionService } from '@/services/school-subscription.service'

const { locale, t, messages } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

/* ---------- Scroll reveal (no deps): [data-reveal] elements get .fb-in once in view.
   --d on the element staggers siblings (100ms steps). Reduced motion → shown at once. ---------- */
const root = ref<HTMLElement | null>(null)
let revealObserver: IntersectionObserver | null = null
let revealMutations: MutationObserver | null = null
let revealDisabled = false

/** Observe every [data-reveal] under root that isn't tracked yet (safe to call repeatedly). */
function observeReveals() {
  const targets = root.value?.querySelectorAll<HTMLElement>('[data-reveal]:not(.fb-in):not([data-reveal-tracked])') ?? []
  targets.forEach((el) => {
    el.setAttribute('data-reveal-tracked', '')
    if (revealDisabled || !revealObserver) el.classList.add('fb-in')
    else revealObserver.observe(el)
  })
}

onMounted(() => {
  revealDisabled =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined'
  if (!revealDisabled) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('fb-in')
          revealObserver?.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 },
    )
  }
  observeReveals()
  // Content that arrives later (live pricing cards, the form → thanks swap) gets picked up here.
  if (root.value && typeof MutationObserver !== 'undefined') {
    revealMutations = new MutationObserver(() => observeReveals())
    revealMutations.observe(root.value, { childList: true, subtree: true })
  }
})

onUnmounted(() => {
  revealObserver?.disconnect()
  revealMutations?.disconnect()
  revealObserver = null
  revealMutations = null
})

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
const plans = ref<PlatformPlan[]>([])
const moduleCatalog = ref<PlatformModule[]>([])
const plansLoading = ref(true)

const pricingPlans = computed(() =>
  buildPublicPricingCards({
    plans: plans.value,
    modules: moduleCatalog.value,
    locale: locale.value,
    t: (key, params) => t(key, params as never),
    highlightLines: planHighlightLines,
  }),
)

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
/* =====================================================================
   Brochure system — navy / teal / mint, square blocks, giant numerals.
   Every composition is proportional (aspect-ratio + % sizing) so it
   keeps the brochure proportions from 360px up to 4K instead of
   drifting with fixed pixel heights.
   ===================================================================== */
.fb {
  --navy: #0b2a4a; --navy-2: #153a5e; --navy-deep: #06192f;
  --teal: #0e9c8c; --teal-deep: #0b7e71; --mint: #e9f5f3;
  --ink: #0b2a4a; --ink-soft: #4b5b6b; --on-dark: #c9d6e3; --hair: #e6e9ee;
  --wrap: 1280px;
  --gutter: clamp(20px, 4vw, 48px);
  --sect: clamp(64px, 8vw, 112px);        /* section vertical rhythm */
  --shadow-lg: 0 30px 60px rgba(4, 20, 40, .35);
  --shadow-md: 0 18px 40px rgba(11, 42, 74, .22);
  --ease: cubic-bezier(.22, 1, .36, 1);
  background: #fff; color: var(--ink);
  font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;
  overflow-x: clip;
}
.fb h1, .fb h2, .fb h3, .fb p { margin: 0; }
.fb h2 { font-size: clamp(28px, 2.9vw, 42px); line-height: 1.2; font-weight: 700; text-wrap: balance; margin-top: 12px; }
.fb-wrap { max-width: var(--wrap); margin: 0 auto; padding-inline: var(--gutter); }
.fb-head { max-width: 640px; }
.fb-body { margin-top: 18px; font-size: clamp(15px, 1.15vw, 17px); line-height: 1.75; color: var(--ink-soft); max-width: 500px; text-wrap: pretty; }
.fb-body--on-dark { color: var(--on-dark); }
.fb-body--on-teal { color: #fff; }
.fb-kicker { font-size: 13px; font-weight: 600; letter-spacing: .08em; }
.fb-kicker--teal { color: var(--teal); }
.fb-kicker--underline { display: inline-block; color: var(--teal); border-bottom: 2px solid var(--teal); padding-bottom: 6px; }
.fb-anchor { position: relative; top: -80px; display: block; }
.fb img { max-width: 100%; }

/* reveal: blur + rise, staggered by --d (0..n) */
.fb [data-reveal] { opacity: 0; transform: translateY(14px); filter: blur(6px); transition: opacity .55s var(--ease), transform .55s var(--ease), filter .55s var(--ease); transition-delay: calc(var(--d, 0) * 100ms); will-change: opacity, transform, filter; }
.fb [data-reveal].fb-in { opacity: 1; transform: none; filter: none; will-change: auto; }
.fb .fb-tile[data-reveal] { transition: opacity .55s var(--ease), transform .55s var(--ease), filter .55s var(--ease), background .15s; }

/* buttons */
.fb-btn { display: inline-block; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 26px; border: 2px solid transparent; cursor: pointer; font-family: inherit; text-align: center; transition: background .15s, border-color .15s, color .15s; }
.fb-btn--teal { background: var(--teal); color: #fff; border-color: var(--teal); }
.fb-btn--teal:hover { background: var(--teal-deep); border-color: var(--teal-deep); }
.fb-btn--ghost { border-color: rgba(255,255,255,.4); color: #fff; }
.fb-btn--ghost:hover { border-color: #fff; }
.fb-btn--outline { border-color: var(--navy); color: var(--navy); }
.fb-btn--outline:hover { background: var(--navy); color: #fff; }
.fb-price--featured .fb-btn--outline { border-color: #fff; color: #fff; }
.fb-btn--block { display: block; }
.fb-btn:disabled { opacity: .5; cursor: default; }
.fb-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }

/* lists */
.fb-list { list-style: none; padding: 0; margin: 26px 0 0; display: grid; gap: 12px; font-size: 16px; line-height: 1.5; }
.fb-list li { display: flex; gap: 12px; align-items: flex-start; }
.fb-list li::before { content: ''; width: 10px; height: 10px; background: var(--teal); flex: none; margin-top: 8px; }
.fb-list--sm { margin: 6px 0 0; gap: 10px; font-size: 15px; flex: 1; }
.fb-list--sm li::before { width: 8px; height: 8px; }

/* pixel decorations */
.fb-pixels { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(16, 1fr); grid-template-rows: repeat(9, 1fr); gap: 6px; padding: 6px; pointer-events: none; }
.fb-pixels span { background: var(--teal); }
.fb-pixels--hero span:nth-child(1) { grid-area: 1/16; animation: fb-blink 4s ease-in-out infinite; }
.fb-pixels--hero span:nth-child(2) { grid-area: 1/15; opacity: .5; }
.fb-pixels--hero span:nth-child(3) { grid-area: 2/16; opacity: .7; }
.fb-pixels--hero span:nth-child(4) { grid-area: 2/14; opacity: .3; animation: fb-blink 5s ease-in-out infinite 1s; }
.fb-pixels--hero span:nth-child(5) { grid-area: 3/15; opacity: .4; }
.fb-pixels--hero span:nth-child(6) { grid-area: 4/16; opacity: .2; }
.fb-pixels--hero span:nth-child(7) { grid-area: 9/16; }
.fb-pixels--hero span:nth-child(8) { grid-area: 9/15; opacity: .5; animation: fb-blink 6s ease-in-out infinite 2s; }
.fb-pixels--hero span:nth-child(9) { grid-area: 8/16; opacity: .7; }
.fb-pixels--hero span:nth-child(10) { grid-area: 8/14; opacity: .3; }
.fb-pixels--hero span:nth-child(11) { grid-area: 7/15; opacity: .4; }
.fb-pixels--hero span:nth-child(12) { grid-area: 6/16; opacity: .2; }
.fb-pixels--consult { grid-template-rows: repeat(8, 1fr); }
.fb-pixels--consult span:nth-child(1) { grid-area: 8/16; }
.fb-pixels--consult span:nth-child(2) { grid-area: 8/15; opacity: .5; }
.fb-pixels--consult span:nth-child(3) { grid-area: 7/16; opacity: .7; }
.fb-pixels--consult span:nth-child(4) { grid-area: 7/14; opacity: .3; }
.fb-pixels--consult span:nth-child(5) { grid-area: 6/15; opacity: .4; }

/* device frames — all sized in % of their stage so they scale together */
.fb-browser { position: absolute; background: #fff; box-shadow: var(--shadow-lg); overflow: hidden; }
.fb-browser__chrome { height: 6%; min-height: 18px; background: var(--hair); display: flex; gap: 5px; align-items: center; padding: 0 10px; }
.fb-browser__chrome span { width: 7px; height: 7px; border-radius: 50%; background: var(--on-dark); }
.fb-browser img { width: 100%; display: block; }
.fb-phone { position: absolute; aspect-ratio: 1170 / 2532; border-radius: 8% / 3.7%; padding: 1.6%; box-shadow: var(--shadow-lg); }
.fb-phone > div { width: 100%; height: 100%; border-radius: 6.8% / 3.1%; overflow: hidden; background: #f5f6f8; }
.fb-phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.fb-phone--teal { background: var(--teal); }
.fb-phone--white { background: #fff; }
.fb-phone--slim { background: #fff; outline: 1px solid rgba(11, 42, 74, .12); }

/* numerals */
.fb-numbered { position: relative; }
.fb-numbered__body { position: relative; }
.fb-numeral { position: absolute; inset-inline-start: -8px; top: -.55em; font-size: clamp(88px, 10vw, 150px); line-height: 1; font-weight: 700; pointer-events: none; }
.fb-numeral--mint { color: #fff; }
.fb-numeral--ghost { color: #fff; opacity: .25; }

/* ---------------- HERO (split) ---------------- */
.fb-hero { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); min-height: min(760px, 90vh); background: #fff; overflow: hidden; }
.fb-hero__copy { display: flex; flex-direction: column; justify-content: space-between; gap: 40px; min-width: 0; padding-block: clamp(44px, 6vw, 88px); padding-inline-end: clamp(24px, 4vw, 64px); padding-inline-start: max(var(--gutter), calc((100vw - var(--wrap)) / 2)); }
.fb-hero__main { max-width: 600px; }
.fb-hero__copy h1 { margin-top: 20px; font-size: clamp(36px, 4.4vw, 62px); line-height: 1.12; font-weight: 700; text-wrap: balance; color: var(--navy); }
.fb-hero__copy h1 span { color: var(--teal); }
.fb-hero__rule { width: 80px; height: 4px; background: var(--teal); margin-block: 24px; }
.fb-hero__copy p { font-size: clamp(15px, 1.2vw, 18px); line-height: 1.75; color: var(--ink-soft); max-width: 480px; text-wrap: pretty; }
.fb-hero .fb-actions { align-items: center; gap: 12px 28px; }
.fb-link { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: var(--teal); font-weight: 700; letter-spacing: .12em; font-size: 14px; text-transform: uppercase; transition: color .15s, gap .2s; }
.fb-link:hover { color: var(--teal-deep); gap: 12px; }
[dir='ltr'] .fb-link span { display: inline-block; transform: scaleX(-1); }
/* contact row */
.fb-contact { list-style: none; margin: 0; padding: 20px 0 0; border-top: 1px solid var(--hair); display: flex; flex-wrap: wrap; gap: 14px 32px; font-size: 13px; font-weight: 500; color: var(--ink-soft); }
.fb-contact li { display: inline-flex; align-items: center; gap: 10px; }
.fb-contact svg { width: 20px; height: 20px; color: var(--teal); flex: none; }
/* navy panel with a diagonal inner edge; wipes in from the outer edge on load */
.fb-hero__panel { position: relative; min-width: 0; background: var(--navy); color: #fff; overflow: hidden; clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%); animation: fb-wipe 1.2s cubic-bezier(0, .55, .45, 1) both; }
[dir='rtl'] .fb-hero__panel { clip-path: polygon(0 0, 75% 0, 100% 100%, 0 100%); animation-name: fb-wipe-rtl; }
.fb-hero__panel .fb-pixels { inset-inline-start: auto; inset-inline-end: 0; width: 60%; }
.fb-hero__watermark { position: absolute; inset-inline-end: -4%; top: -6%; font-size: clamp(200px, 26vw, 420px); line-height: .85; font-weight: 700; opacity: .05; pointer-events: none; }
/* stage keeps clear of the clipped triangle (inner edge) */
.fb-hero__stage { position: absolute; inset: 9% 6% 8% 20%; max-width: 640px; }
[dir='rtl'] .fb-hero__stage { inset: 9% 20% 8% 6%; }
/* single featured phone — one recent app screenshot, centered */
.fb-hero__phone-main { left: 50%; top: 50%; translate: -50% -50%; width: min(46%, 252px); }
.fb-hero__stage[data-reveal] { transition-delay: .6s; }
/* live chips */
.fb-live { position: absolute; z-index: 3; display: inline-flex; align-items: center; gap: 8px; background: #fff; color: var(--navy); font-size: 13px; font-weight: 600; padding: 10px 14px; box-shadow: var(--shadow-md); white-space: nowrap; opacity: 0; translate: 0 12px; scale: .92; transition: opacity .5s var(--ease), translate .5s var(--ease), scale .5s var(--ease); }
.fb-live__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 0 rgba(14,156,140,.5); animation: fb-pulse 2.4s ease-out infinite; }
.fb-live__dot--gold { background: #f2b544; box-shadow: 0 0 0 0 rgba(242,181,68,.5); animation-delay: 1.2s; }
.fb-live--a { inset-inline-end: 4%; top: 20%; animation: fb-float 7s ease-in-out infinite .4s; }
.fb-live--b { inset-inline-start: 2%; bottom: 16%; animation: fb-float 8s ease-in-out infinite 1.6s; }
.fb-hero__stage.fb-in .fb-live { opacity: 1; translate: 0 0; scale: 1; }
.fb-hero__stage.fb-in .fb-live--a { transition-delay: 1.2s; }
.fb-hero__stage.fb-in .fb-live--b { transition-delay: 1.6s; }

/* ---------------- OPERATIONS ---------------- */
.fb-ops { position: relative; background: var(--mint); overflow: hidden; }
.fb-ops__grid { padding-block: var(--sect) calc(var(--sect) * .8); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: clamp(28px, 4vw, 56px); align-items: center; }
.fb-ops__shot { position: relative; min-width: 0; padding-bottom: 28px; }
.fb-ops__frame { aspect-ratio: 16 / 10; background: #fff; overflow: hidden; box-shadow: var(--shadow-md); outline: 1px solid rgba(11,42,74,.08); transform: rotate(-3deg); transform-origin: top right; }
[dir='ltr'] .fb-ops__frame { transform: rotate(3deg); transform-origin: top left; }
.fb-ops__frame img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.fb-ops__chip { position: absolute; bottom: 0; inset-inline-start: 6%; background: var(--navy); color: #fff; font-size: 14px; font-weight: 600; padding: 14px 20px; display: flex; align-items: center; gap: 10px; box-shadow: var(--shadow-md); }
.fb-ops__chip::before { content: ''; width: 10px; height: 10px; background: var(--teal); flex: none; }
.fb-ops__bar { position: absolute; inset-inline-end: 0; bottom: 0; width: 22%; height: 22px; background: var(--navy); }

/* ---------------- FEATURES ---------------- */
.fb-features { background: var(--navy); color: #fff; }
.fb-features .fb-wrap { padding-block: var(--sect); max-width: 1400px; }
.fb-features__head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px 48px; align-items: end; margin-bottom: 36px; }
.fb-features__head .fb-body { margin-top: 0; justify-self: end; text-align: end; }
.fb-board { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: clamp(150px, 11.5vw, 220px); gap: 10px; }
.fb-tile { position: relative; overflow: hidden; text-decoration: none; padding: 22px; display: flex; flex-direction: column; justify-content: flex-end; grid-column: span 2; transition: background .15s; min-width: 0; }
.fb-tile h3 { font-size: clamp(17px, 1.4vw, 22px); font-weight: 700; }
.fb-tile p { font-size: clamp(14px, 1vw, 15px); margin-top: 6px; line-height: 1.55; }
.fb-tile--teal { background: var(--teal); color: #fff; }
.fb-tile--teal:hover { background: var(--teal-deep); }
.fb-tile--navy2 { background: var(--navy-2); color: #fff; }
.fb-tile--navy2:hover { background: #1b4670; }
.fb-tile--navy2 p { color: var(--on-dark); }
.fb-tile--mint { background: var(--mint); color: var(--ink); }
.fb-tile--mint:hover { background: #d8efeb; }
.fb-tile--mint p { color: var(--ink-soft); }
.fb-tile--white { background: #fff; color: var(--ink); }
.fb-tile--white p { color: var(--ink-soft); }
/* attendance — big tile with a tilted, clipped desktop shot */
.fb-tile--attendance { grid-column: span 4; grid-row: span 2; padding: 26px; }
.fb-tile--attendance h3 { font-size: clamp(20px, 1.8vw, 26px); }
.fb-tile--attendance .fb-tile__copy { position: relative; max-width: 44%; }
.fb-tile__shot { position: absolute; inset-inline-end: -10%; top: 7%; width: 60%; aspect-ratio: 16 / 11; background: #fff; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,.35); transform: rotate(-5deg); transform-origin: top right; }
[dir='ltr'] .fb-tile__shot { transform: rotate(5deg); transform-origin: top left; }
.fb-tile__shot img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
/* fees — copy on top, phone peeking from the bottom */
.fb-tile--fees { grid-row: span 2; justify-content: flex-start; }
.fb-tile__phone { position: absolute; left: 50%; transform: translateX(-50%); top: 50%; width: 44%; aspect-ratio: 1170 / 2532; border-radius: 8% / 3.7%; overflow: hidden; background: #fff; outline: 1px solid rgba(11, 42, 74, .12); box-shadow: 0 20px 40px rgba(11,42,74,.3); }
.fb-tile__phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
/* comms — full-width row, phone tucked into the corner */
.fb-tile--comms { grid-column: span 6; padding: 26px; justify-content: center; }
.fb-tile--comms .fb-tile__copy { max-width: 62%; }
.fb-tile--comms p { max-width: 520px; }
.fb-tile__screen-side { position: absolute; inset-inline-end: 4%; top: 14%; width: 34%; aspect-ratio: 16 / 10; overflow: hidden; background: #fff; box-shadow: 0 20px 40px rgba(11,42,74,.25); border: 1px solid var(--hair); transform: rotate(-3deg); }
[dir='ltr'] .fb-tile__screen-side { transform: rotate(3deg); }
.fb-tile__screen-side img { width: 100%; height: 100%; object-fit: cover; object-position: right top; display: block; }

/* ---------------- FAMILIES ---------------- */
.fb-families { position: relative; background: #fff; overflow: hidden; }
/* teal wedge: fixed 300px deep on the copy side so the title always sits inside it,
   sloping down towards the phones */
.fb-families__diag { position: absolute; inset: 0; background: var(--teal); clip-path: polygon(0 0, 100% 0, 100% 300px, 0 calc(300px + 18vw)); }
[dir='ltr'] .fb-families__diag { clip-path: polygon(0 0, 100% 0, 100% calc(300px + 18vw), 0 300px); }
.fb-families__grid { position: relative; padding-block: var(--sect); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto 1fr; grid-template-areas: "title stage" "copy stage"; gap: 0 clamp(28px, 4vw, 56px); }
.fb-families__title { grid-area: title; color: #fff; }
.fb-families__copy { grid-area: copy; align-self: end; padding-top: 40px; }
.fb-families__shots { grid-area: stage; }
.fb-families__body { margin-top: 0; max-width: 440px; }
.fb-stats { display: flex; gap: 48px; margin-top: 32px; flex-wrap: wrap; }
.fb-stat { font-size: clamp(40px, 4vw, 56px); font-weight: 700; line-height: 1; text-align: start; }
.fb-stat__label { font-size: 14px; color: var(--ink-soft); margin-top: 6px; border-top: 2px solid var(--teal); padding-top: 6px; }
.fb-families__shots { min-width: 0; align-self: center; }
/* fan: centre card on top, side cards rotated ±6° and overlapping; they start tucked
   towards the centre (--fx) and spread out once the fan gets .fb-in */
.fb-fan { display: flex; align-items: center; justify-content: center; width: 100%; max-width: 520px; margin-inline: auto; padding-block: 24px; }
.fb-fan .fb-phone { position: relative; flex: none; }
.fb-fan__card { --r: 0deg; --fx: 0px; --ty: 0px; width: 36%; z-index: 1; transform: translate(var(--fx), var(--ty)) rotate(var(--r)); transition: transform .6s var(--ease); }
.fb-fan__card:first-child { --r: -6deg; --fx: 12%; --ty: 24px; margin-inline-end: -7%; transition-delay: .1s; }
.fb-fan__card:last-child { --r: 6deg; --fx: -12%; --ty: 24px; margin-inline-start: -7%; transition-delay: .2s; }
[dir='rtl'] .fb-fan__card:first-child { --r: 6deg; --fx: -12%; }
[dir='rtl'] .fb-fan__card:last-child { --r: -6deg; --fx: 12%; }
.fb-fan__card--main { --ty: -8px; width: 42%; z-index: 2; }
.fb-fan.fb-in .fb-fan__card { --fx: 0px; }
.fb-fan__card:hover { z-index: 3; --ty: -14px; }

/* ---------------- PRICING ---------------- */
.fb-pricing { position: relative; background: #f4f7f9; overflow: hidden; }
.fb-pricing .fb-wrap { position: relative; padding-block: var(--sect); }
.fb-pricing__cards { margin-top: 40px; }
.fb-pricing__watermark { position: absolute; inset-inline-end: -3vw; bottom: -8vw; font-size: clamp(200px, 24vw, 380px); line-height: .8; font-weight: 700; color: #e9eef2; letter-spacing: -.06em; pointer-events: none; }
.fb-prices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: stretch; margin-top: 40px; }
.fb-price { position: relative; border: 2px solid #fff; background: #fff; box-shadow: 0 10px 30px rgba(11,42,74,.06); padding: clamp(22px, 2.4vw, 32px); display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.fb-price--featured { background: var(--navy); color: #fff; border-color: var(--navy); transform: translateY(-12px); }
.fb-price__badge { position: absolute; top: 0; inset-inline-start: clamp(22px, 2.4vw, 32px); background: var(--teal); color: #fff; font-size: 12px; font-weight: 600; padding: 6px 12px; }
.fb-price__name { font-size: 14px; font-weight: 600; color: var(--teal); letter-spacing: .06em; }
.fb-price--featured .fb-price__name { margin-top: 10px; }
.fb-price__amount { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; font-size: clamp(30px, 2.8vw, 42px); font-weight: 700; line-height: 1; text-align: start; }
.fb-price__amount span { font-size: 15px; font-weight: 500; color: var(--ink-soft); white-space: nowrap; }
.fb-price--featured .fb-price__amount span, .fb-price--featured .fb-price__desc { color: var(--on-dark); }
.fb-price__desc { font-size: 15px; color: var(--ink-soft); }
.fb-price__adds { font-size: 13px; color: var(--teal); font-weight: 600; }
.fb-price .fb-btn { margin-top: auto; }

/* ---------------- MISSION ---------------- */
.fb-mission { background: var(--teal); color: #fff; position: relative; overflow: hidden; }
.fb-mission__grid { padding-block: var(--sect); display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: clamp(28px, 4vw, 56px); align-items: center; }
.fb-quote-mark { font-size: 110px; line-height: .5; font-weight: 700; color: var(--navy); }
.fb-mission h2 { margin-top: 24px; font-size: clamp(28px, 3vw, 44px); }
.fb-mission__points { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 36px; }
.fb-point { padding: 22px; }
.fb-point p { font-size: 14px; line-height: 1.6; margin-top: 8px; }
.fb-point__title { font-size: 17px; font-weight: 700; margin-top: 0 !important; }
.fb-point--navy { background: var(--navy); color: #fff; }
.fb-point--navy p:not(.fb-point__title) { color: var(--on-dark); }
.fb-point--white { background: #fff; color: var(--ink); }
.fb-point--white p:not(.fb-point__title) { color: var(--ink-soft); }
/* flat browser + phone pair: calm, no tilt — the point here is trust */
.fb-mission__shots { position: relative; width: 100%; max-width: 600px; margin-inline: auto; aspect-ratio: 5 / 4; }
.fb-mission__browser { inset-inline-start: 0; top: 0; width: 86%; aspect-ratio: 16 / 10; }
.fb-mission__browser img { width: 100%; height: calc(100% - 22px); object-fit: cover; object-position: top; }
.fb-mission__phone { inset-inline-end: 0; bottom: 0; width: 31%; }

/* ---------------- CONSULT ---------------- */
.fb-consult { position: relative; background: var(--navy); color: #fff; overflow: hidden; }
.fb-consult__grid { position: relative; padding-block: var(--sect); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: clamp(28px, 4vw, 56px); align-items: center; }
.fb-consult h2 { margin-top: 0; font-size: clamp(30px, 3.4vw, 50px); line-height: 1.15; }
.fb-form { position: relative; background: #fff; color: var(--ink); padding: clamp(22px, 2.6vw, 36px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: end; min-width: 0; }
.fb-form label { display: grid; gap: 8px; font-size: 14px; font-weight: 600; min-width: 0; }
.fb-form input, .fb-form select { width: 100%; min-width: 0; box-sizing: border-box; font: inherit; font-weight: 400; font-size: 16px; padding: 13px 14px; border: 2px solid var(--hair); background: #fff; color: var(--ink); outline: none; text-align: start; }
.fb-form input:focus-visible, .fb-form select:focus-visible { border-color: var(--teal); }
.fb-form__full { grid-column: 1 / -1; }
.fb-form .fb-btn { margin-top: 8px; font-size: 17px; padding: 16px 24px; }
.fb-form__error { color: #b42318; font-size: 14px; }
.fb-form--thanks { display: block; }
.fb-form__thanks-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }

/* motion */
@keyframes fb-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
@keyframes fb-wipe { from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); } to { clip-path: polygon(25% 0, 100% 0, 100% 100%, 0 100%); } }
@keyframes fb-wipe-rtl { from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); } to { clip-path: polygon(0 0, 75% 0, 100% 100%, 0 100%); } }
@keyframes fb-wipe-top { from { clip-path: polygon(0 0, 100% 0, 100% 0, 0 0); } to { clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%); } }
@keyframes fb-pulse { 0% { box-shadow: 0 0 0 0 rgba(14,156,140,.45); } 70% { box-shadow: 0 0 0 10px rgba(14,156,140,0); } 100% { box-shadow: 0 0 0 0 rgba(14,156,140,0); } }
@keyframes fb-blink { 0%, 100% { opacity: .15; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .fb * { animation: none !important; transition: none !important; }
  .fb [data-reveal] { opacity: 1; transform: none; filter: none; }
}

/* ---------------- responsive ---------------- */
@media (max-width: 1024px) {
  .fb-tile--attendance .fb-tile__copy { max-width: 52%; }
  .fb-tile__shot { width: 60%; }
}
@media (max-width: 860px) {
  .fb-hero, .fb-ops__grid, .fb-features__head, .fb-families__grid, .fb-mission__grid, .fb-consult__grid { grid-template-columns: 1fr; }
  .fb-hero { min-height: 0; }
  .fb-hero__copy { padding-inline: var(--gutter); gap: 32px; }
  .fb-hero__panel, [dir='rtl'] .fb-hero__panel { min-height: 440px; clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%); animation-name: fb-wipe-top; }
  .fb-hero__stage, [dir='rtl'] .fb-hero__stage { inset: 16% 8% 6% 8%; max-width: 520px; margin-inline: auto; }
  .fb-live { font-size: 12px; padding: 8px 11px; }
  .fb-live--a { inset-inline-end: 0; bottom: 40%; }
  .fb-live--b { inset-inline-end: 0; bottom: 8%; }
  .fb-features__head .fb-body { justify-self: start; text-align: start; }
  .fb-ops__grid { align-items: start; }
  .fb-ops__shot { padding-bottom: 32px; }
  .fb-ops__frame { transform: rotate(-2deg); }
  [dir='ltr'] .fb-ops__frame { transform: rotate(2deg); }
  .fb-board { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(150px, auto); }
  .fb-tile--attendance { grid-column: span 2; grid-row: span 1; min-height: 300px; }
  .fb-tile--attendance .fb-tile__copy { max-width: 100%; }
  .fb-tile__shot { position: relative; inset: auto; width: 100%; max-width: 380px; margin: 0 auto 18px; transform: none; aspect-ratio: 16 / 9; }
  .fb-tile--fees { grid-row: span 1; min-height: 360px; }
  .fb-tile__phone { top: 46%; width: 40%; max-width: 170px; }
  .fb-tile--comms { grid-column: span 2; min-height: 180px; }
  .fb-tile--comms .fb-tile__copy { max-width: 70%; }
  .fb-tile__screen-side { width: 30%; top: 10%; }
  .fb-families__grid { grid-template-areas: "title" "stage" "copy"; grid-template-rows: auto auto auto; gap: 0; }
  .fb-families__diag { clip-path: polygon(0 0, 100% 0, 100% 300px, 0 calc(300px + 30vw)); }
  [dir='ltr'] .fb-families__diag { clip-path: polygon(0 0, 100% 0, 100% calc(300px + 30vw), 0 300px); }
  .fb-fan { max-width: 380px; margin-top: 12px; }
  .fb-fan__card { width: 32%; }
  .fb-fan__card--main { width: 40%; }
  .fb-fan__card:first-child { margin-inline-end: -5%; }
  .fb-fan__card:last-child { margin-inline-start: -5%; }
  .fb-families__copy { padding-top: 36px; }
  .fb-prices { grid-template-columns: 1fr; max-width: 520px; margin-inline: auto; }
  .fb-price--featured { transform: none; }
  .fb-mission__points { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .fb-board { grid-template-columns: 1fr; }
  .fb-tile--attendance, .fb-tile--comms { grid-column: span 1; }
  .fb-tile--fees { min-height: 330px; }
  .fb-tile--comms { min-height: 0; }
  .fb-tile--comms .fb-tile__copy { max-width: 100%; }
  .fb-tile__screen-side { display: none; }
  .fb-hero__panel, [dir='rtl'] .fb-hero__panel { min-height: 400px; }
  .fb-contact { gap: 10px 20px; }
  .fb-stats { gap: 28px; }
  .fb-form { grid-template-columns: 1fr; }
  .fb-mission__shots { aspect-ratio: 5 / 4.4; }
  .fb-mission__browser { width: 90%; }
  .fb-mission__phone { width: 34%; }
}
</style>
