<template>
  <nav
    class="mobile-bottom-nav"
    :aria-label="$t('mobileNav.barLabel')"
  >
    <router-link
      v-for="tab in tabs"
      :key="tab.id"
      :to="tab.route"
      class="mobile-bottom-nav__item"
      :class="{ 'mobile-bottom-nav__item--active': isActive(tab) }"
      :aria-current="isActive(tab) ? 'page' : undefined"
    >
      <span class="mobile-bottom-nav__icon" aria-hidden="true">
        <svg v-if="tab.id === 'activities'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="tab.id === 'home'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg v-else-if="tab.id === 'chats'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg v-else-if="tab.id === 'schedule'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </span>
      <span class="mobile-bottom-nav__label">{{ $t(`mobileNav.${tab.labelKey}`) }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import authService from '@/services/auth.service'
import {
  getMobileBottomNavTabs,
  isMobileTabActive,
  resolveMobilePersona,
  type MobileBottomNavTab,
} from '@/navigation/mobile-bottom-nav'

const route = useRoute()

const tabs = computed(() => getMobileBottomNavTabs(resolveMobilePersona(authService.getStoredUser())))

function isActive(tab: MobileBottomNavTab) {
  return isMobileTabActive(tab, route.path)
}
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 45;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  border-top: 1px solid rgb(229 231 235);
  background: rgb(255 255 255 / 0.96);
  backdrop-filter: blur(12px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -4px 16px rgb(10 33 71 / 0.06);
}

.mobile-bottom-nav__item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.5rem 0.25rem 0.375rem;
  color: rgb(107 114 128);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.mobile-bottom-nav__item--active {
  color: rgb(0 161 155);
}

.mobile-bottom-nav__icon {
  display: flex;
  height: 1.5rem;
  width: 1.5rem;
  align-items: center;
  justify-content: center;
}

.mobile-bottom-nav__label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
</style>
