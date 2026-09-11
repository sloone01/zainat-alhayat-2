<template>
  <div class="relative">
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-fikr-ink-muted hover:text-primary-600 transition-colors touch-button"
      :class="{ 'space-x-reverse': isRTL, 'px-2': flagOnly }"
      :aria-expanded="isDropdownOpen"
      :aria-label="currentLanguage.name"
    >
      <span class="text-lg leading-none" aria-hidden="true">{{ currentLanguage.flag }}</span>
      <span v-if="!flagOnly">{{ currentLanguage.name }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isDropdownOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="isDropdownOpen"
      class="absolute top-full mt-1 w-32 bg-white rounded-xl border border-fikr-hairline shadow-product z-50"
      :class="isRTL ? 'left-0' : 'right-0'"
      role="listbox"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        type="button"
        role="option"
        :aria-selected="currentLocale === lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full flex items-center space-x-2 px-3 py-2 text-sm text-fikr-ink-muted hover:bg-primary-50 hover:text-primary-600 transition-colors touch-button"
        :class="{
          'space-x-reverse': isRTL,
          'bg-primary-50 text-primary-700': currentLocale === lang.code,
        }"
      >
        <span class="text-lg leading-none" aria-hidden="true">{{ lang.flag }}</span>
        <span>{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    /** Closed trigger shows flag (+ chevron) only; menu still lists full names. */
    flagOnly?: boolean
  }>(),
  { flagOnly: false },
)

const { locale } = useI18n()
const isDropdownOpen = ref(false)

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇴🇲' },
]

const currentLocale = computed(() => locale.value)
const isRTL = computed(() => locale.value === 'ar')

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === currentLocale.value) || languages[0]
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const changeLanguage = (langCode: string) => {
  locale.value = langCode
  localStorage.setItem('language', langCode)

  document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = langCode === 'ar' ? 'ar-OM' : langCode

  isDropdownOpen.value = false
}

const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.documentElement.dir = isRTL.value ? 'rtl' : 'ltr'
  document.documentElement.lang = currentLocale.value === 'ar' ? 'ar-OM' : currentLocale.value

  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>
