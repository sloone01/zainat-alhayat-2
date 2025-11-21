<template>
  <div class="min-h-screen bg-gradient-to-br from-kindergarten-50 via-white to-teal-50">
    <!-- Navigation -->
    <nav class="bg-white/80 backdrop-blur-md border-b border-kindergarten-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src="/zlogo.jpeg"
                  alt="Zinat Al-Haya Kindergarten Logo"
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="ml-3 text-xl font-bold text-gray-900" :class="{ 'ml-3': !isRTL, 'mr-3 ml-0': isRTL }">{{ $t('hero.brandName') }}</span>
            </div>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <a href="#features" class="text-gray-600 hover:text-kindergarten-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ $t('nav.features') }}
            </a>
            <a href="#testimonials" class="text-gray-600 hover:text-kindergarten-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ $t('nav.testimonials') }}
            </a>
            <a href="#pricing" class="text-gray-600 hover:text-kindergarten-600 px-3 py-2 text-sm font-medium transition-colors">
              {{ $t('nav.pricing') }}
            </a>
            <LanguageSwitcher />
            <button
              @click="navigateToLogin"
              class="btn-primary touch-button"
            >
              {{ $t('nav.getStarted') }}
            </button>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              @click="toggleMobileMenu"
              class="text-gray-600 hover:text-kindergarten-600 p-2 touch-button"
            >
              <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t border-purple-100">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a href="#features" class="block px-3 py-2 text-gray-600 hover:text-purple-600 touch-button">
            {{ $t('nav.features') }}
          </a>
          <a href="#testimonials" class="block px-3 py-2 text-gray-600 hover:text-purple-600 touch-button">
            {{ $t('nav.testimonials') }}
          </a>
          <a href="#pricing" class="block px-3 py-2 text-gray-600 hover:text-purple-600 touch-button">
            {{ $t('nav.pricing') }}
          </a>
          <button
            @click="navigateToLogin"
            class="w-full mt-2 btn-primary touch-button"
          >
            {{ $t('nav.getStarted') }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div class="space-y-6 md:space-y-8 text-center lg:text-left">
            <div class="space-y-4">
              <div class="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                {{ $t('hero.badge') }}
              </div>
              <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {{ $t('hero.title') }}
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {{ $t('hero.brandName') }}
                </span>
              </h1>
              <p class="text-lg md:text-xl text-gray-600 leading-relaxed">
                {{ $t('hero.description') }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                @click="navigateToLogin"
                class="btn-primary text-lg px-6 md:px-8 py-3 md:py-4 touch-button flex items-center justify-center"
              >
                {{ $t('hero.startTrial') }}
                <svg class="w-5 h-5 ml-2" :class="{ 'ml-2': !isRTL, 'mr-2 ml-0': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
                </svg>
              </button>
              <button class="btn-secondary text-lg px-6 md:px-8 py-3 md:py-4 touch-button flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" :class="{ 'mr-2': !isRTL, 'ml-2 mr-0': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('hero.watchDemo') }}
              </button>
            </div>

            <div class="flex items-center justify-center lg:justify-start gap-8 pt-4" :class="{ 'lg:justify-end': isRTL }">
              <div class="text-center">
                <div class="text-xl md:text-2xl font-bold text-gray-900">200+</div>
                <div class="text-sm text-gray-600">{{ $t('hero.stats.families') }}</div>
              </div>
              <div class="text-center">
                <div class="text-xl md:text-2xl font-bold text-gray-900">15+</div>
                <div class="text-sm text-gray-600">{{ $t('hero.stats.schools') }}</div>
              </div>
              <div class="text-center">
                <div class="text-xl md:text-2xl font-bold text-gray-900">98%</div>
                <div class="text-sm text-gray-600">{{ $t('hero.stats.uptime') }}</div>
              </div>
            </div>
          </div>

          <div class="relative mt-8 lg:mt-0">
            <div class="relative z-10">
              <img
                :src="childrenPlayingImage"
                :alt="$t('hero.title')"
                class="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
              />
              <div class="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-white rounded-xl p-3 md:p-4 shadow-lg">
                <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
                  <div class="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 md:w-6 md:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-semibold text-gray-900 text-sm md:text-base">{{ $t('hero.security.title') }}</div>
                    <div class="text-xs md:text-sm text-gray-600">{{ $t('hero.security.subtitle') }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Background decorations -->
            <div class="absolute top-10 -left-10 w-16 h-16 md:w-20 md:h-20 bg-purple-200 rounded-full opacity-50"></div>
            <div class="absolute bottom-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-pink-200 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-12 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center space-y-4 mb-12 md:mb-16">
          <div class="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
            {{ $t('features.badge') }}
          </div>
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            {{ $t('features.title') }}
          </h2>
          <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {{ $t('features.description') }}
          </p>
        </div>

        <div class="mobile-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="card hover:shadow-lg transition-shadow duration-300 border-purple-100"
          >
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <component :is="feature.icon" class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ $t(feature.titleKey) }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ $t(feature.descriptionKey) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mobile App Section -->
    <section class="py-12 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div class="space-y-6 text-center lg:text-left">
            <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              {{ $t('mobileApp.title') }}
            </h2>
            <p class="text-lg md:text-xl text-purple-100 leading-relaxed">
              {{ $t('mobileApp.description') }}
            </p>
            <div class="space-y-4">
              <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-white">{{ $t('mobileApp.features.realTimeUpdates') }}</span>
              </div>
              <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-white">{{ $t('mobileApp.features.photoSharing') }}</span>
              </div>
              <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-white">{{ $t('mobileApp.features.messaging') }}</span>
              </div>
              <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
                <svg class="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-white">{{ $t('mobileApp.features.notifications') }}</span>
              </div>
            </div>
            <button class="bg-white text-purple-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors touch-button">
              {{ $t('mobileApp.downloadApp') }}
            </button>
          </div>

          <div class="relative mt-8 lg:mt-0">
            <img
              :src="schoolAppImage"
              :alt="$t('mobileApp.title')"
              class="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[3/4] max-w-md mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-12 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="space-y-6 md:space-y-8">
          <h2 class="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {{ $t('cta.title') }}
          </h2>
          <p class="text-lg md:text-xl text-purple-100 leading-relaxed">
            {{ $t('cta.description') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="navigateToLogin"
              class="bg-white text-purple-600 hover:bg-gray-100 font-medium text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg transition-colors touch-button flex items-center justify-center"
            >
              {{ $t('cta.startTrial') }}
              <svg class="w-5 h-5 ml-2" :class="{ 'ml-2': !isRTL, 'mr-2 ml-0': isRTL }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isRTL ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
              </svg>
            </button>
            <button class="border-2 border-white text-white hover:bg-white/10 font-medium text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg transition-colors touch-button">
              {{ $t('cta.scheduleDemo') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

// Import images
import childrenPlayingImage from '@/assets/children-playing.jpeg'
import schoolAppImage from '@/assets/school-app.jpg'

const router = useRouter()
const { locale } = useI18n()

const isMobileMenuOpen = ref(false)
const isRTL = computed(() => locale.value === 'ar')

// Features data
const features = [
  {
    icon: 'UsersIcon',
    titleKey: 'features.items.studentManagement.title',
    descriptionKey: 'features.items.studentManagement.description'
  },
  {
    icon: 'CalendarIcon',
    titleKey: 'features.items.activityTracking.title',
    descriptionKey: 'features.items.activityTracking.description'
  },
  {
    icon: 'CameraIcon',
    titleKey: 'features.items.photoSharing.title',
    descriptionKey: 'features.items.photoSharing.description'
  },
  {
    icon: 'ShieldIcon',
    titleKey: 'features.items.secureCheckin.title',
    descriptionKey: 'features.items.secureCheckin.description'
  },
  {
    icon: 'MessageCircleIcon',
    titleKey: 'features.items.parentCommunication.title',
    descriptionKey: 'features.items.parentCommunication.description'
  },
  {
    icon: 'ClockIcon',
    titleKey: 'features.items.realTimeUpdates.title',
    descriptionKey: 'features.items.realTimeUpdates.description'
  }
]

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const navigateToLogin = () => {
  router.push('/login')
}

// Icon components (simplified SVG icons)
const UsersIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>`
}

const CalendarIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
}

const CameraIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`
}

const ShieldIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>`
}

const MessageCircleIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`
}

const ClockIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
}
</script>

