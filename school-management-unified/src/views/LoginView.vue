<template>
  <div
    class="flex min-h-screen flex-col justify-center px-3 py-4"
    :class="
      isSchoolLogin
        ? 'bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-100'
        : 'bg-hub-bg font-hubBody'
    "
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <div
      v-if="!isSchoolLogin"
      class="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,_rgba(201,234,221,0.55),_transparent_65%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-sm">
      <div
        class="rounded-2xl border p-5 shadow-2xl backdrop-blur-sm"
        :class="
          isSchoolLogin
            ? 'border-secondary-200/50 bg-white/95'
            : 'border-hub-outline/50 bg-white/95 shadow-hub'
        "
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <router-link
            :to="backLink"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('login.back')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <LanguageSwitcher />
        </div>

        <div class="mb-5 text-center">
          <!-- School-branded login (from /s/:slug/login) -->
          <template v-if="isSchoolLogin">
            <div class="mx-auto mb-4 h-28 w-28">
              <img
                :src="schoolLogo"
                :alt="displayTitle"
                class="h-full w-full rounded-full border-3 border-white object-cover shadow-lg"
              />
            </div>
            <h1 class="mb-1 text-lg font-bold text-secondary-800">{{ displayTitle }}</h1>
            <p class="text-sm text-secondary-600">{{ $t('login.schoolSubtitle') }}</p>
          </template>

          <!-- General platform login (/login) -->
          <template v-else>
            <router-link to="/" class="mx-auto mb-4 inline-flex max-w-[18rem] sm:max-w-[20rem]">
              <img
                src="/fikr-logo.png?v=4"
                :alt="$t('forSchools.logoAlt')"
                class="h-16 w-full bg-transparent object-contain sm:h-20"
              >
            </router-link>
            <p class="text-sm text-hub-muted">{{ $t('login.platformSubtitle') }}</p>
          </template>
        </div>

        <form class="space-y-3" @submit.prevent="handleLogin">
          <div>
            <label
              for="email"
              class="mb-2 block text-sm font-semibold"
              :class="isSchoolLogin ? 'text-secondary-700' : 'text-hub-ink'"
            >
              {{ $t('login.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full rounded-lg border px-3 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2"
              :class="
                isSchoolLogin
                  ? 'border-secondary-300 bg-secondary-50/50 focus:border-primary-400 focus:ring-primary-400'
                  : 'border-hub-outline/70 bg-white focus:border-hub-primary focus:ring-hub-primary/25'
              "
              :placeholder="$t('login.emailPlaceholder')"
            />
          </div>

          <div>
            <label
              for="password"
              class="mb-2 block text-sm font-semibold"
              :class="isSchoolLogin ? 'text-secondary-700' : 'text-hub-ink'"
            >
              {{ $t('login.password') }}
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full rounded-lg border px-3 py-3 pe-12 text-base transition-all duration-200 focus:outline-none focus:ring-2"
                :class="
                  isSchoolLogin
                    ? 'border-secondary-300 bg-secondary-50/50 focus:border-primary-400 focus:ring-primary-400'
                    : 'border-hub-outline/70 bg-white focus:border-hub-primary focus:ring-hub-primary/25'
                "
                :placeholder="$t('login.passwordPlaceholder')"
              />
              <button
                type="button"
                class="absolute inset-y-0 end-0 flex items-center pe-4 text-gray-400 transition-colors duration-200 hover:text-gray-600"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <input
                id="remember"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-400"
              />
              <label for="remember" :class="isSchoolLogin ? 'text-secondary-700' : 'text-hub-muted'">
                {{ $t('login.rememberMe') }}
              </label>
            </div>
            <button
              type="button"
              class="font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
            >
              {{ $t('login.forgotPassword') }}
            </button>
          </div>

          <p v-if="error" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            :class="
              isSchoolLogin
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600'
                : 'bg-hub-primary hover:bg-hub-primary-container'
            "
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <FikrLoader v-if="!isSchoolLogin" size="xs" />
              <svg
                v-else
                class="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ $t('login.signingIn') }}
            </span>
            <span v-else>{{ $t('login.signIn') }}</span>
          </button>
        </form>

        <p v-if="!isSchoolLogin" class="mt-4 text-center text-xs text-hub-muted">
          <router-link to="/subscribe" class="font-semibold text-hub-primary hover:underline">
            {{ $t('login.subscribeSchool') }}
          </router-link>
        </p>
      </div>

      <div class="mt-4 text-center">
        <p class="text-xs" :class="isSchoolLogin ? 'text-secondary-500' : 'text-hub-muted'">
          © {{ year }} {{ isSchoolLogin ? displayTitle : $t('forSchools.brand') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { authService } from '@/services'
import { schoolLandingService } from '@/services/school-landing.service'

const { locale, t } = useI18n()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const schoolBrand = ref('')
const schoolLogo = ref('/zlogo.jpeg')

const isRTL = computed(() => locale.value === 'ar')
const year = new Date().getFullYear()

const schoolSlug = computed(() => {
  const slug = route.params.slug
  return typeof slug === 'string' && slug.trim() ? slug.trim() : ''
})

const isSchoolLogin = computed(() => route.name === 'school-login' && !!schoolSlug.value)

const backLink = computed(() =>
  isSchoolLogin.value ? `/s/${schoolSlug.value}` : '/',
)

const displayTitle = computed(() => {
  if (isSchoolLogin.value) {
    return schoolBrand.value || t('hero.brandName')
  }
  return t('forSchools.brand')
})

onMounted(async () => {
  if (!isSchoolLogin.value) return
  try {
    const cms = await schoolLandingService.getPublicBySlug(schoolSlug.value)
    schoolBrand.value =
      locale.value === 'ar'
        ? cms.brand_name_ar || cms.brand_name_en || ''
        : cms.brand_name_en || cms.brand_name_ar || ''
    if (cms.logo_url) schoolLogo.value = cms.logo_url
  } catch {
    schoolBrand.value = t('hero.brandName')
    schoolLogo.value = '/zlogo.jpeg'
  }
})

const handleLogin = async () => {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = t('login.fillRequired')
    return
  }

  try {
    loading.value = true
    const response = await authService.login({
      email: email.value,
      password: password.value,
    })

    const user = response.user as {
      role?: string
      isSuperAdmin?: boolean
      isSystemUser?: boolean
    }
    if (user?.isSuperAdmin || user?.isSystemUser) {
      router.push('/platform/schools')
    } else if (user?.role === 'parent') {
      router.push('/parent/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m)
      ? m.join(', ')
      : m || ax.message || t('login.failed')
  } finally {
    loading.value = false
  }
}
</script>
