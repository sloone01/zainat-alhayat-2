<template>
  <header class="aa-nav">
    <router-link to="/" class="aa-brand">
      <img src="/fikr-logo.png?v=5" :alt="$t('forSchools.logoAlt')" />
    </router-link>

    <nav class="aa-nav__links" aria-label="primary">
      <a :href="featuresHref">{{ $t('forSchools.navFeatures') }}</a>
      <a :href="pricingHref">{{ $t('forSchools.navPricing') }}</a>
      <router-link to="/docs" :class="{ 'aa-nav__active': isDocs }">{{ $t('forSchools.navDocs') }}</router-link>
      <router-link to="/demo" :class="{ 'aa-nav__active': isDemo }">{{ $t('forSchools.navDemo') }}</router-link>
      <router-link :to="demoSchoolPath">{{ $t('forSchools.visitDemoSchool') }}</router-link>
      <LanguageSwitcher flag-only class="aa-nav__lang" />
    </nav>

    <div class="aa-nav__actions">
      <LanguageSwitcher flag-only class="aa-nav__lang aa-nav__lang--mobile" />
      <router-link to="/login" class="aa-nav__signin aa-nav__signin--desktop">{{ $t('nav.signIn') }}</router-link>

      <button
        type="button"
        class="aa-nav__menu-btn"
        :aria-expanded="menuOpen"
        :aria-controls="'aa-nav-drawer'"
        :aria-label="$t('docs.mobileMenu')"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div
      v-if="menuOpen"
      id="aa-nav-drawer"
      class="aa-nav__drawer"
      role="navigation"
      :aria-label="$t('docs.mobileMenu')"
    >
      <a :href="featuresHref" @click="menuOpen = false">{{ $t('forSchools.navFeatures') }}</a>
      <a :href="pricingHref" @click="menuOpen = false">{{ $t('forSchools.navPricing') }}</a>
      <router-link to="/docs" @click="menuOpen = false">{{ $t('forSchools.navDocs') }}</router-link>
      <router-link to="/demo" @click="menuOpen = false">{{ $t('forSchools.navDemo') }}</router-link>
      <router-link :to="demoSchoolPath" @click="menuOpen = false">{{ $t('forSchools.visitDemoSchool') }}</router-link>
      <router-link to="/login" class="aa-nav__drawer-signin" @click="menuOpen = false">
        {{ $t('nav.signIn') }}
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const route = useRoute()
const menuOpen = ref(false)
const demoSchoolPath = '/s/zinat-al-haya'

const isHome = computed(() => route.path === '/')
const isDocs = computed(() => route.path === '/docs' || route.path.startsWith('/docs/'))
const isDemo = computed(() => route.path === '/demo' || route.path.startsWith('/demo/'))
const featuresHref = computed(() => (isHome.value ? '#gallery-features' : '/#gallery-features'))
const pricingHref = computed(() => (isHome.value ? '#gallery-pricing' : '/#gallery-pricing'))

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)
</script>

<style scoped>
.aa-nav {
  --aa-teal: #00a19b;
  --aa-teal-deep: #00847f;
  --aa-navy: #0a2147;
  --aa-hairline: #d5e0e0;
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  min-height: 72px;
  padding: 0.55rem 1.5rem;
  background: #fff;
  color: var(--aa-navy);
  border-bottom: 1px solid var(--aa-hairline);
}

.aa-brand {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.aa-brand img {
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

.aa-nav__links a:hover,
.aa-nav__active {
  color: var(--aa-teal);
}

.aa-nav__actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-inline-start: auto;
}

.aa-nav__lang--mobile {
  display: block;
}

.aa-nav__menu-btn {
  display: inline-flex;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--aa-hairline);
  background: #fff;
  color: var(--aa-navy);
  cursor: pointer;
}

.aa-nav__menu-btn:hover {
  color: var(--aa-teal);
  border-color: var(--aa-teal);
}

.aa-nav__signin {
  display: none;
  align-items: center;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--aa-navy);
  text-decoration: none;
  padding: 0;
}

.aa-nav__signin:hover {
  color: var(--aa-teal);
}

.aa-nav__drawer-signin {
  margin-top: 0.35rem;
  border-top: 1px solid var(--aa-hairline);
  padding-top: 0.85rem !important;
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

.aa-nav__drawer {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  width: 100%;
  padding: 0.5rem 0 0.35rem;
  border-top: 1px solid var(--aa-hairline);
}

.aa-nav__drawer a {
  display: block;
  padding: 0.7rem 0.15rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--aa-navy);
  text-decoration: none;
}

.aa-nav__drawer a:hover {
  color: var(--aa-teal);
}

@media (min-width: 768px) {
  .aa-nav {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    flex-wrap: nowrap;
    align-items: center;
  }
  .aa-brand {
    justify-self: start;
  }
  .aa-nav__links {
    display: flex;
    grid-column: 2;
    justify-self: center;
  }
  .aa-nav__actions {
    grid-column: 3;
    justify-self: end;
    margin-inline-start: 0;
    gap: 0.85rem;
  }
  .aa-nav__menu-btn,
  .aa-nav__drawer,
  .aa-nav__lang--mobile {
    display: none;
  }
  .aa-nav__signin {
    display: inline-flex;
  }
  .aa-brand img {
    height: 3.15rem;
    max-width: 13.5rem;
  }
}
</style>
