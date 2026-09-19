<template>
  <nav
    class="mobile-bottom-nav"
    :aria-label="$t('mobileNav.barLabel')"
  >
    <template v-for="tab in tabs" :key="tab.id">
      <button
        v-if="tab.id === 'more'"
        type="button"
        class="mobile-bottom-nav__item"
        :class="{ 'mobile-bottom-nav__item--active': moreActive }"
        :aria-expanded="moreOpen"
        :aria-controls="moreOpen ? 'mobile-more-sheet' : undefined"
        @click="moreOpen = !moreOpen"
      >
        <span class="mobile-bottom-nav__icon" aria-hidden="true">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </span>
        <span class="mobile-bottom-nav__label">{{ $t('mobileNav.more') }}</span>
      </button>
      <router-link
        v-else
        :to="tab.route"
        class="mobile-bottom-nav__item"
        :class="{ 'mobile-bottom-nav__item--active': isActive(tab) }"
        :aria-current="isActive(tab) ? 'page' : undefined"
        @click="moreOpen = false"
      >
        <span class="mobile-bottom-nav__icon" aria-hidden="true">
          <svg v-if="tab.id === 'home'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <svg v-else-if="tab.id === 'students'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else-if="tab.id === 'chats'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg v-else-if="tab.id === 'schedule'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <svg v-else-if="tab.id === 'attendance'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <svg v-else-if="tab.id === 'fees'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <svg v-else-if="tab.id === 'dailyLog'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <svg v-else-if="tab.id === 'fleet'" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 17a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0zM4 11V7a2 2 0 012-2h9l3 4v6M5 11h10" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </span>
        <span class="mobile-bottom-nav__label">{{ $t(`mobileNav.${tab.labelKey}`) }}</span>
      </router-link>
    </template>
  </nav>

  <MobileMoreSheet
    :open="moreOpen"
    :tiles="moreTiles"
    @close="moreOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import authService from '@/services/auth.service'
import MobileMoreSheet from '@/components/MobileMoreSheet.vue'
import {
  getMobileBottomNavTabs,
  getMobileMoreTiles,
  isMobileMoreRouteActive,
  isMobileTabActive,
  resolveMobileAppFlavor,
  type MobileBottomNavTab,
} from '@/navigation/mobile-bottom-nav'

const route = useRoute()
const moreOpen = ref(false)

const flavor = computed(() => resolveMobileAppFlavor(authService.getStoredUser()))
const tabs = computed(() => getMobileBottomNavTabs(flavor.value))
const moreTiles = computed(() => getMobileMoreTiles(flavor.value))

const moreActive = computed(
  () => moreOpen.value || isMobileMoreRouteActive(flavor.value, route.path),
)

function isActive(tab: MobileBottomNavTab) {
  if (moreOpen.value) return false
  return isMobileTabActive(tab, route.path)
}

watch(
  () => route.fullPath,
  () => {
    moreOpen.value = false
  },
)
</script>
