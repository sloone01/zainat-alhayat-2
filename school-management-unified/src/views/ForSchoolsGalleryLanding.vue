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
      <div class="aa-hero__glow" aria-hidden="true" />
      <div class="aa-hero__pixels" aria-hidden="true">
        <span v-for="n in 16" :key="n" />
      </div>
      <div class="aa-hero__copy">
        <p class="aa-hero__brand">{{ isRTL ? $t('forSchools.brandAr') : $t('forSchools.brand') }}</p>
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
      <div class="aa-hero__shots">
        <figure class="aa-shot aa-shot--grades aa-shot--desktop">
          <img src="/landing/shots/grades.png" :alt="$t('forSchools.gallery.shotGradesAlt')" loading="eager" />
        </figure>
        <figure class="aa-shot aa-shot--users aa-shot--desktop">
          <img src="/landing/shots/users.png" :alt="$t('forSchools.gallery.shotUsersAlt')" loading="eager" />
        </figure>
        <figure class="aa-shot aa-shot--settings aa-shot--desktop">
          <img src="/landing/shots/settings.png" :alt="$t('forSchools.gallery.shotSettingsAlt')" loading="eager" />
        </figure>
      </div>
    </section>

    <section class="aa-trust" aria-label="trust">
      <p class="aa-trust__title">{{ $t('forSchools.trustTitle') }}</p>
      <ul class="aa-trust__list">
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
          {{ $t('forSchools.trustStrip.bilingual') }}
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
          {{ $t('forSchools.trustStrip.roles') }}
        </li>
        <li>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1.1 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 5.2-5.2 1.4 1.4-6.6 6.6z"/></svg>
          {{ $t('forSchools.trustStrip.ops') }}
        </li>
      </ul>
    </section>

    <section id="gallery-tools" class="aa-tile aa-tile--white">
      <div class="aa-split">
        <img
          class="aa-photo"
          src="/landing/shots/grades.png"
          :alt="$t('forSchools.gallery.mgmtTitle')"
          loading="lazy"
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
            <img :src="item.image" :alt="$t(`forSchools.bento.${item.key}.title`)" loading="lazy" />
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
          src="/landing/shots/users.png"
          :alt="$t('forSchools.gallery.precisionTitle')"
          loading="lazy"
        />
        <div class="aa-copy">
          <p class="aa-kicker">{{ $t('forSchools.gallery.precisionKicker') }}</p>
          <h2>{{ $t('forSchools.gallery.precisionTitle') }}</h2>
          <p class="aa-body">{{ $t('forSchools.gallery.precisionBody') }}</p>
          <div class="aa-stats">
            <div>
              <p class="aa-stat">{{ $t('forSchools.gallery.statBilingualValue') }}</p>
              <p class="aa-stat-label">{{ $t('forSchools.gallery.statBilingual') }}</p>
            </div>
            <div>
              <p class="aa-stat">{{ $t('forSchools.gallery.statScopedValue') }}</p>
              <p class="aa-stat-label">{{ $t('forSchools.gallery.statScoped') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="gallery-pricing" class="aa-tile aa-tile--white">
      <div class="aa-enroll">
        <h2 class="aa-center-title">{{ $t('forSchools.gallery.pricingTitle') }}</h2>
        <div class="aa-prices">
          <article
            v-for="plan in pricingPlans"
            :key="plan.id"
            class="aa-price"
            :class="{ 'aa-price--featured': plan.featured }"
          >
            <span v-if="plan.featured" class="aa-price__badge">{{ $t('forSchools.gallery.mostPopular') }}</span>
            <h3>{{ $t(plan.nameKey) }}</h3>
            <p class="aa-price__amount">
              <template v-if="plan.amount">{{ plan.amount }} <span>{{ $t('forSchools.gallery.perYear') }}</span></template>
              <template v-else>{{ $t('forSchools.gallery.custom') }}</template>
            </p>
            <p class="aa-price__desc">{{ $t(plan.descKey) }}</p>
            <ul class="aa-price__features">
              <li v-for="(line, idx) in plan.features" :key="idx">{{ line }}</li>
            </ul>
            <router-link :to="plan.to" class="aa-btn aa-btn--primary aa-btn--block">
              {{ $t(plan.ctaKey) }}
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
            src="/landing/shots/users.png"
            :alt="$t('forSchools.gallery.shotUsersAlt')"
            loading="lazy"
          />
          <img
            src="/landing/shots/settings.png"
            :alt="$t('forSchools.gallery.shotSettingsAlt')"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <section class="aa-tile aa-tile--cta">
      <div class="aa-final">
        <h2>{{ $t('forSchools.finalCtaTitle') }}</h2>
        <p>{{ $t('forSchools.finalCtaBody') }}</p>
        <router-link to="/subscribe" class="aa-btn aa-btn--primary">{{ $t('forSchools.finalCtaButton') }}</router-link>
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
        <p class="aa-footer__tagline">{{ $t('forSchools.footerTagline') }}</p>
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { locale, tm } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const demoSchoolPath = '/s/zinat-al-haya'

const offeringFeatures = [
  { key: 'attendance', wide: true, image: '/landing/shots/feature-wide.png' },
  { key: 'reports', wide: false, image: '/landing/shots/feature-users.png' },
  { key: 'fees', wide: false, image: '/landing/shots/feature-settings.png' },
] as const

const pricingPlans = computed(() => {
  const essential = tm('forSchools.planHighlights.essential') as string[]
  const standard = tm('forSchools.planHighlights.standard') as string[]
  const complete = tm('forSchools.planHighlights.complete') as string[]
  return [
    {
      id: 'essential',
      nameKey: 'forSchools.gallery.planFoundation',
      descKey: 'forSchools.gallery.planFoundationDesc',
      amount: '$4,200',
      features: Array.isArray(essential) ? essential : [],
      to: '/subscribe?plan=essential',
      ctaKey: 'forSchools.gallery.register',
      featured: false,
    },
    {
      id: 'standard',
      nameKey: 'forSchools.gallery.planInstitutional',
      descKey: 'forSchools.gallery.planInstitutionalDesc',
      amount: '$12,500',
      features: Array.isArray(standard) ? standard : [],
      to: '/subscribe?plan=standard',
      ctaKey: 'forSchools.gallery.register',
      featured: true,
    },
    {
      id: 'complete',
      nameKey: 'forSchools.gallery.planLegacy',
      descKey: 'forSchools.gallery.planLegacyDesc',
      amount: '',
      features: Array.isArray(complete) ? complete : [],
      to: '/subscribe?plan=complete',
      ctaKey: 'forSchools.gallery.inquire',
      featured: false,
    },
  ]
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
  display: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--aa-navy);
  text-decoration: none;
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
  cursor: pointer;
  transition: background-color 180ms ease-out, transform 180ms ease-out;
}

.aa-nav__cta:hover {
  background: var(--aa-teal-deep);
  transform: translateY(-1px);
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
  background:
    radial-gradient(ellipse 80% 60% at 85% 20%, rgba(0, 161, 155, 0.28), transparent 55%),
    radial-gradient(ellipse 50% 40% at 10% 90%, rgba(126, 232, 227, 0.12), transparent 50%),
    var(--aa-navy);
  color: #fff;
}

.aa-hero__glow {
  pointer-events: none;
  position: absolute;
  inset: auto -10% -30% 40%;
  height: 70%;
  background: radial-gradient(circle, rgba(0, 161, 155, 0.35), transparent 65%);
  filter: blur(40px);
  opacity: 0.85;
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
  animation: aa-rise 420ms ease-out both;
}

.aa-hero__brand {
  margin: 0 0 0.65rem;
  font-size: clamp(1.65rem, 3.2vw, 2.35rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #7ee8e3;
  line-height: 1;
}

.aa[dir='ltr'] .aa-hero__brand {
  text-transform: uppercase;
  letter-spacing: 0.18em;
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
  animation: aa-rise 520ms ease-out 80ms both;
}

.aa-shot {
  position: absolute;
  margin: 0;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 18px 44px rgba(10, 33, 71, 0.28);
  transition: transform 220ms ease-out, box-shadow 220ms ease-out;
}

.aa-shot img {
  display: block;
  width: 100%;
  height: auto;
}

.aa-shot--desktop {
  border-radius: 14px;
}

.aa-shot.aa-phone {
  overflow: visible;
  background: #0b1220;
  border-radius: 1.65rem;
  padding: 0.45rem;
  box-shadow:
    0 22px 48px rgba(10, 33, 71, 0.38),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.aa-phone__bezel {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
}

.aa-phone__notch {
  position: absolute;
  top: 0.55rem;
  left: 50%;
  transform: translateX(-50%);
  width: 34%;
  height: 0.55rem;
  border-radius: 9999px;
  background: #05070d;
}

.aa-shot.aa-phone img {
  border-radius: 1.25rem;
  width: 100%;
  height: auto;
  display: block;
}

.aa-shot--grades {
  width: min(72%, 32rem);
  top: 18%;
  inset-inline-start: 14%;
  z-index: 2;
  transform: rotate(-2deg);
  animation: aa-float-a 7s ease-in-out infinite;
}

.aa-shot--users {
  width: min(40%, 16.5rem);
  top: 8%;
  inset-inline-end: 6%;
  z-index: 3;
  transform: rotate(6deg);
  animation: aa-float-b 8s ease-in-out infinite;
}

.aa-shot--settings {
  width: min(38%, 15.5rem);
  bottom: 8%;
  inset-inline-start: 6%;
  z-index: 3;
  transform: rotate(-7deg);
  animation: aa-float-c 6.5s ease-in-out infinite;
}

@keyframes aa-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes aa-float-a {
  0%, 100% { transform: rotate(-2deg) translateY(0); }
  50% { transform: rotate(-2deg) translateY(-8px); }
}

@keyframes aa-float-b {
  0%, 100% { transform: rotate(6deg) translateY(0); }
  50% { transform: rotate(6deg) translateY(6px); }
}

@keyframes aa-float-c {
  0%, 100% { transform: rotate(-7deg) translateY(0); }
  50% { transform: rotate(-7deg) translateY(-6px); }
}

.aa-trust {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.35rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid var(--aa-hairline);
}

.aa-trust__title {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--aa-muted);
}

.aa-trust__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.aa-trust__list li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--aa-navy);
}

.aa-trust__list svg {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--aa-teal);
  flex-shrink: 0;
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
  transition: transform 180ms ease-out, background-color 180ms ease-out, box-shadow 180ms ease-out;
}

.aa-btn:hover {
  transform: translateY(-1px);
}

.aa-btn:active {
  transform: scale(0.97);
}

.aa-btn:focus-visible {
  outline: 2px solid var(--aa-teal);
  outline-offset: 2px;
}

.aa-btn--primary {
  background: var(--aa-teal);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 161, 155, 0.28);
}

.aa-btn--primary:hover {
  background: var(--aa-teal-deep);
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
    display: inline-flex;
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
.aa-tile--cta {
  background:
    radial-gradient(ellipse 70% 80% at 80% 20%, rgba(0, 161, 155, 0.35), transparent 55%),
    var(--aa-navy);
  color: #fff;
}

.aa-final {
  width: 100%;
  max-width: 40rem;
  text-align: center;
}

.aa-final h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
}

.aa-final p {
  margin: 1rem 0 1.75rem;
  font-size: 1.05rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.8);
}

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
  transition: transform 220ms ease-out, box-shadow 220ms ease-out;
}

.aa-life-card:hover {
  transform: translateY(-4px);
  box-shadow: rgba(0, 0, 0, 0.34) 4px 14px 34px 0;
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
  object-position: top center;
  transition: transform 280ms ease-out;
}

.aa-life-card:hover img {
  transform: scale(1.03);
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
  transition: transform 200ms ease-out, box-shadow 200ms ease-out, border-color 200ms ease-out;
}

.aa-price:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(10, 33, 71, 0.08);
}

.aa-price--featured {
  border: 2px solid var(--aa-teal);
  padding-top: 2.35rem;
  box-shadow: 0 10px 28px rgba(0, 161, 155, 0.12);
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
  margin: 0.75rem 0 1rem;
}

.aa-price__features {
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex-grow: 1;
  width: 100%;
}

.aa-price__features li {
  position: relative;
  padding-inline-start: 1.15rem;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--aa-ink);
}

.aa-price__features li::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  top: 0.45rem;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: var(--aa-teal);
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

.aa-footer__tagline {
  max-width: 22rem;
  font-size: 0.85rem !important;
  line-height: 1.45;
  color: var(--aa-muted);
}

.aa-mission__photos img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 18px;
  filter: grayscale(0.35) saturate(0.9);
  transition: filter 220ms ease-out, transform 220ms ease-out;
}

.aa-mission__photos img:hover {
  filter: grayscale(0) saturate(1);
  transform: translateY(-2px);
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
  .aa-btn,
  .aa-shot,
  .aa-life-card,
  .aa-life-card img,
  .aa-mission__photos img {
    transition: none;
  }
  .aa-hero__copy,
  .aa-hero__shots,
  .aa-shot--grades,
  .aa-shot--users,
  .aa-shot--settings {
    animation: none;
    transform: none;
  }
  .aa-life-card:hover,
  .aa-price:hover,
  .aa-btn:hover,
  .aa-life-card:hover img {
    transform: none;
  }
}
</style>
