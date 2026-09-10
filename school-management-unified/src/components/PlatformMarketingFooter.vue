<template>
  <footer class="aa-footer">
    <div class="aa-footer__brand">
      <img src="/fikr-logo.png?v=5" :alt="$t('forSchools.logoAlt')" />
      <p>{{ $t('forSchools.footerCopyright') }}</p>
    </div>
    <nav>
      <a :href="featuresHref">{{ $t('forSchools.footerAbout') }}</a>
      <a :href="pricingHref">{{ $t('forSchools.navPricing') }}</a>
      <router-link to="/docs">{{ $t('forSchools.navDocs') }}</router-link>
      <router-link to="/login">{{ $t('nav.signIn') }}</router-link>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isHome = computed(() => route.path === '/')
const featuresHref = computed(() => (isHome.value ? '#gallery-features' : '/#gallery-features'))
const pricingHref = computed(() => (isHome.value ? '#gallery-pricing' : '/#gallery-pricing'))
</script>

<style scoped>
.aa-footer {
  --aa-teal: #00a19b;
  --aa-muted: #5a6b80;
  --aa-hairline: #d5e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  border-top: 1px solid var(--aa-hairline);
  background: #fff;
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
</style>
