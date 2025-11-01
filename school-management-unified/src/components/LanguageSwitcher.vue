<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors touch-button"
      :class="{ 'space-x-reverse': isRTL }"
    >
      <span class="text-lg">{{ currentLanguage.flag }}</span>
      <span>{{ currentLanguage.name }}</span>
      <svg 
        class="w-4 h-4 transition-transform" 
        :class="{ 'rotate-180': isDropdownOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isDropdownOpen"
      class="absolute top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      :class="isRTL ? 'left-0' : 'right-0'"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors touch-button"
        :class="{ 
          'space-x-reverse': isRTL,
          'bg-purple-50 text-purple-600': currentLocale === lang.code 
        }"
      >
        <span class="text-lg">{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const isDropdownOpen = ref(false)

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇴🇲' }
]

const currentLocale = computed(() => locale.value)
const isRTL = computed(() => locale.value === 'ar')

const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === currentLocale.value) || languages[0]
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const changeLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('language', langCode)
  
  // Update document direction and lang attribute
  document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = langCode
  
  isDropdownOpen.value = false
}

const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  // Set initial direction
  document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
  document.documentElement.lang = currentLocale.value
  
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

