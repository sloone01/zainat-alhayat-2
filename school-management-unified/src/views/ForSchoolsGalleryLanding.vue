<template>
  <div class="aa" :dir="isRTL ? 'rtl' : 'ltr'">
    <header class="aa-nav">
      <router-link to="/" class="aa-brand">
        <img src="/fikr-logo.png?v=5" :alt="$t('forSchools.logoAlt')" />
      </router-link>
      <nav class="aa-nav__links" aria-label="primary">
        <a href="#gallery-features">{{ $t('forSchools.navFeatures') }}</a>
        <a href="#gallery-pricing">{{ $t('forSchools.navPricing') }}</a>
        <router-link :to="demoSchoolPath">{{ $t('forSchools.visitDemoSchool') }}</router-link>
        <LanguageSwitcher />
      </nav>
      <div class="aa-nav__actions">
        <router-link to="/login" class="aa-nav__signin">{{ $t('nav.signIn') }}</router-link>
        <router-link to="/subscribe" class="aa-nav__cta">{{ $t('forSchools.ctaPrimaryShort') }}</router-link>
      </div>
    </header>

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
        <figure class="aa-shot aa-shot--grades">
          <img src="/landing/shots/grades.png" alt="" />
        </figure>
        <figure class="aa-shot aa-shot--users">
          <img src="/landing/shots/users.png" alt="" />
        </figure>
        <figure class="aa-shot aa-shot--settings">
          <img src="/landing/shots/settings.png" alt="" />
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
      <div class="aa-life">
        <div class="aa-life__intro">
          <p class="aa-kicker aa-kicker--on-dark">{{ $t('forSchools.navFeatures') }}</p>
          <h2>{{ $t('forSchools.featuresTitle') }}</h2>
          <p class="aa-body aa-body--on-dark">{{ $t('forSchools.featuresSubtitle') }}</p>
        </div>
        <div class="aa-life__grid">
          <article
            v-for="item in offeringFeatures"
            :key="item.key"
            class="aa-life-card"
            :class="{ 'aa-life-card--wide': item.wide }"
          >
            <img :src="item.image" :alt="$t(`forSchools.bento.${item.key}.title`)" />
            <div class="aa-life-card__copy">
              <h3>{{ $t(`forSchools.bento.${item.key}.title`) }}</h3>
              <p>{{ $t(`forSchools.bento.${item.key}.body`) }}</p>
            </div>
          </article>
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
              :to="`/subscribe?plan=${plan.code}`"
              class="aa-btn aa-btn--primary aa-btn--block"
            >
              {{ plan.yearly != null ? $t('forSchools.gallery.register') : $t('forSchools.gallery.inquire') }}
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

    <section class="aa-tile aa-tile--white">
      <div class="aa-consult">
        <h2>{{ $t('forSchools.gallery.consultTitle') }}</h2>
        <p class="aa-body">{{ $t('forSchools.gallery.consultLead') }}</p>
        <form class="aa-form" @submit.prevent="requestConsult">
          <label>
            <span>{{ $t('forSchools.gallery.institution') }}</span>
            <input v-model="institution" type="text" :placeholder="$t('forSchools.gallery.institutionPh')" />
          </label>
          <label>
            <span>{{ $t('forSchools.gallery.email') }}</span>
            <input v-model="email" type="email" required :placeholder="$t('forSchools.gallery.emailPh')" />
          </label>
          <label class="aa-form__full">
            <span>{{ $t('forSchools.gallery.scope') }}</span>
            <select v-model="scope">
              <option value="small">{{ $t('forSchools.gallery.scopeSmall') }}</option>
              <option value="mid">{{ $t('forSchools.gallery.scopeMid') }}</option>
              <option value="large">{{ $t('forSchools.gallery.scopeLarge') }}</option>
            </select>
          </label>
          <button type="submit" class="aa-btn aa-btn--primary aa-btn--block aa-form__full">
            {{ $t('forSchools.gallery.request') }}
          </button>
        </form>
      </div>
    </section>

    <footer class="aa-footer">
      <div class="aa-footer__brand">
        <img src="/fikr-logo.png?v=5" :alt="$t('forSchools.logoAlt')" />
        <p>{{ $t('forSchools.footerCopyright') }}</p>
      </div>
      <nav>
        <a href="#gallery-features">{{ $t('forSchools.footerAbout') }}</a>
        <a href="#gallery-pricing">{{ $t('forSchools.navPricing') }}</a>
        <router-link to="/login">{{ $t('nav.signIn') }}</router-link>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import {
  platformBillingService,
  type PlatformModule,
  type PlatformPlan,
} from '@/services/platform-billing.service'

const { locale } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const demoSchoolPath = '/s/zinat-al-haya'

const offeringFeatures = [
  { key: 'attendance', wide: true, image: '/landing/attendance.jpg' },
  { key: 'reports', wide: false, image: '/landing/reports.jpg' },
  { key: 'fees', wide: false, image: '/landing/fees.jpg' },
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

  return ordered.map((plan, index) => {
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
      addsOnBaseline: index > 0 && distinctive.length > 0,
      bullets: shown.slice(0, MAX_PLAN_BULLETS),
      extraCount: Math.max(0, shown.length - MAX_PLAN_BULLETS),
      // Highlight the middle of the range rather than a hardcoded tier name.
      featured: ordered.length > 2 && plan.included_student_seats > 0 &&
        plan.included_student_seats !== mostSeats &&
        plan.sort_order === ordered[Math.floor(ordered.length / 2)].sort_order,
    }
  })
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
const scope = ref('small')

function requestConsult() {
  router.push({
    path: '/subscribe',
    query: {
      institution: institution.value || undefined,
      email: email.value || undefined,
      scope: scope.value,
    },
  })
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

.aa-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 72px;
  padding: 0.55rem 1.5rem;
  background: #fff;
  color: var(--aa-navy);
  border-bottom: 1px solid var(--aa-hairline);
}

.aa-brand,
.aa-logo {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.aa-brand img,
.aa-logo img {
  height: 2.75rem;
  width: auto;
  max-width: 12rem;
  object-fit: contain;
}

.aa-nav__links {
  display: none;
  align-items: center;
  gap: 1.75rem;
}

.aa-nav__links a {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--aa-navy);
  text-decoration: none;
}

.aa-nav__links a:hover {
  color: var(--aa-teal);
}

.aa-nav__actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.aa-nav__signin {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--aa-navy);
  text-decoration: none;
  padding: 0.35rem 0.5rem;
}

.aa-nav__signin:hover {
  color: var(--aa-teal);
}

.aa-nav__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0.45rem 1.1rem;
  border-radius: 9999px;
  background: var(--aa-teal);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
}

.aa-nav__cta:hover {
  background: var(--aa-teal-deep);
}

.aa-nav :deep(button) {
  color: var(--aa-navy);
}

.aa-nav :deep(button:hover) {
  color: var(--aa-teal);
}

.aa-nav :deep(.absolute) {
  color: var(--aa-navy);
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
  min-height: 20rem;
}

.aa-shot {
  position: absolute;
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(10, 33, 71, 0.28);
}

.aa-shot img {
  display: block;
  width: 100%;
  height: auto;
}

.aa-shot--grades {
  width: min(72%, 32rem);
  top: 18%;
  inset-inline-start: 14%;
  z-index: 2;
  transform: rotate(-2deg);
}

.aa-shot--users {
  width: min(40%, 16.5rem);
  top: 8%;
  inset-inline-end: 6%;
  z-index: 3;
  transform: rotate(6deg);
}

.aa-shot--settings {
  width: min(38%, 15.5rem);
  bottom: 8%;
  inset-inline-start: 6%;
  z-index: 3;
  transform: rotate(-7deg);
}

@media (min-width: 1024px) {
  .aa-hero {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
    min-height: calc(100vh - 72px);
    padding: 3rem 4vw;
  }
  .aa-hero__shots {
    min-height: 28rem;
    height: 100%;
  }
  .aa-shot--grades {
    width: 68%;
    top: 16%;
  }
  .aa-shot--users {
    width: 38%;
  }
  .aa-shot--settings {
    width: 36%;
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
  .aa-nav__links {
    display: flex;
  }
  .aa-nav__signin {
    font-size: 0.875rem;
    padding: 0;
  }
  .aa-brand img,
  .aa-logo img {
    height: 3.15rem;
    max-width: 13.5rem;
  }
  .aa-tile {
    padding: 5rem 4vw;
  }
}

.aa-tile--white { background: #fff; }
.aa-tile--parchment { background: var(--aa-parchment); }
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

.aa-footer__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  text-align: center;
}

.aa-footer__brand img {
  height: 2.5rem;
  width: auto;
  max-width: 10rem;
  object-fit: contain;
}

.aa-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--aa-hairline);
  background: #fff;
}

.aa-footer p,
.aa-footer a {
  margin: 0.25rem 0 0;
  font-size: 14px;
  color: var(--aa-muted);
  text-decoration: none;
}

.aa-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.aa-footer a:hover {
  color: var(--aa-teal);
}

@media (min-width: 768px) {
  .aa-footer {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aa-btn {
    transition: none;
  }
  .aa-shot--grades,
  .aa-shot--users,
  .aa-shot--settings {
    transform: none;
  }
}
</style>
