<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-100 flex flex-col justify-center px-3 py-4" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="w-full max-w-sm mx-auto">
      <!-- Login Form -->
      <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-secondary-200/50 p-5">
        <!-- Language Switcher -->
        <div class="flex justify-end mb-3">
          <LanguageSwitcher />
        </div>

        <!-- Logo and Title -->
        <div class="text-center mb-5">
          <!-- Actual Logo -->
          <div class="w-28 h-28 mx-auto mb-4">
            <img
              src="/zlogo.jpeg"
              alt="Zinat Al-Haya Kindergarten Logo"
              class="w-full h-full object-cover rounded-full shadow-lg border-3 border-white"
            />
          </div>

          <!-- Title -->
          <h1 class="text-lg font-bold text-secondary-800 mb-1">{{ $t('hero.brandName') }}</h1>
          <p class="text-sm text-secondary-600">تسجيل الدخول إلى نظام إدارة الروضة</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-3">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-semibold text-secondary-700 mb-2">
              {{ $t('login.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-3 py-3 text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 bg-secondary-50/50"
              :placeholder="$t('login.emailPlaceholder')"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-semibold text-secondary-700 mb-2">
              {{ $t('login.password') }}
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-3 py-3 text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 pr-12 transition-all duration-200 bg-secondary-50/50"
                :placeholder="$t('login.passwordPlaceholder')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me and Forgot Password -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center">
              <input
                id="remember"
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 text-primary-500 border-secondary-300 rounded focus:ring-primary-400"
              />
              <label for="remember" class="ml-2 text-secondary-700">
                {{ $t('login.rememberMe') }}
              </label>
            </div>
            <button
              type="button"
              class="text-primary-500 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              {{ $t('login.forgotPassword') }}
            </button>
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-md hover:shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ $t('login.signingIn') || 'Signing in...' }}
            </span>
            <span v-else>{{ $t('login.signIn') }}</span>
          </button>
        </form>

      </div>

      <!-- Footer -->
      <div class="text-center mt-4">
        <p class="text-xs text-secondary-500">
          © 2024 {{ $t('hero.brandName') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { authService } from '@/services'

const { locale } = useI18n()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const isRTL = computed(() => locale.value === 'ar')

const handleLogin = async () => {
  // DEVELOPMENT MODE: Skip validation and authentication, go directly to dashboard
  console.log('🚧 DEVELOPMENT MODE: Redirecting directly to dashboard')
  loading.value = true

  // Simulate a brief loading for UX
  setTimeout(async () => {
    console.log('✅ Redirecting to dashboard without authentication')
    await router.push('/dashboard')
    loading.value = false
  }, 500)

  // PRODUCTION CODE (commented out for development):
  /*
  if (!email.value || !password.value) {
    alert('Please enter both email and password')
    return
  }

  try {
    loading.value = true

    console.log('Starting login process...')

    // Call the real authentication service
    const response = await authService.login({
      email: email.value,
      password: password.value
    })

    console.log('Login successful:', response)
    console.log('Stored token:', authService.getStoredToken())
    console.log('Is authenticated:', authService.isAuthenticated())
    console.log('Stored user:', authService.getStoredUser())

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    alert('Login failed. Please check your credentials and try again.')
  } finally {
    loading.value = false
  }
  */
}
</script>

