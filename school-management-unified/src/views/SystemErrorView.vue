<template>
  <div
    class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-gray-50 via-primary-50 to-secondary-100 px-3 py-4"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <div class="mx-auto w-full max-w-md">
      <div class="rounded-2xl border border-secondary-200/50 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
        <div class="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="t('systemError.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <LanguageSwitcher />
        </div>

        <div class="text-center">
          <p class="text-6xl font-bold text-primary-400">{{ t('systemError.code') }}</p>
          <h1 class="mt-3 text-xl font-semibold text-secondary-800">{{ t('systemError.title') }}</h1>
          <p class="mt-2 text-sm text-secondary-500">{{ t('systemError.message') }}</p>

          <div v-if="ticket" class="mt-5 rounded-xl border border-primary-100 bg-primary-50/80 px-4 py-3">
            <p class="text-[11px] font-medium uppercase tracking-wide text-primary-700">
              {{ t('systemError.ticketLabel') }}
            </p>
            <p class="mt-1 font-mono text-lg font-semibold tracking-wide text-secondary-900" dir="ltr">
              {{ ticket }}
            </p>
            <button
              type="button"
              class="mt-2 text-sm font-semibold text-primary-700 hover:text-primary-900"
              @click="copyTicket"
            >
              {{ copied ? t('systemError.copied') : t('systemError.copyTicket') }}
            </button>
          </div>
          <p v-else-if="issuing" class="mt-4 text-sm text-secondary-500">{{ t('systemError.issuingTicket') }}</p>
          <p v-else class="mt-4 text-sm text-secondary-500">{{ t('systemError.noTicket') }}</p>

          <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-primary-200 bg-white px-5 py-2.5 text-sm font-medium text-primary-800 shadow-sm hover:bg-primary-50"
              @click="goBack"
            >
              {{ t('systemError.tryAgain') }}
            </button>
            <router-link
              :to="homeLink"
              class="inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            >
              {{ t('systemError.goHome') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { authService } from '@/services'
import { rememberErrorTicket, readRememberedErrorTicket } from '@/utils/error-pages'
import { reportClientError } from '@/utils/error-reporting'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const copied = ref(false)
const issuedTicket = ref<string | null>(null)
const issuing = ref(false)

const isRTL = computed(() => locale.value === 'ar')

function ticketFromRouteOrStorage(): string | null {
  const q = route.query.ticket
  if (typeof q === 'string' && q.trim()) return q.trim()
  if (Array.isArray(q) && typeof q[0] === 'string' && q[0].trim()) return q[0].trim()
  return readRememberedErrorTicket()
}

const ticket = computed(() => issuedTicket.value || ticketFromRouteOrStorage())

function applyTicket(next: string): void {
  issuedTicket.value = next
  rememberErrorTicket(next)
  if (route.query.ticket !== next) {
    void router.replace({ name: 'system-error', query: { ticket: next } }).catch(() => undefined)
  }
}

async function ensureTicket(): Promise<void> {
  const existing = ticketFromRouteOrStorage()
  if (existing) {
    applyTicket(existing)
    return
  }
  if (issuing.value) return
  issuing.value = true
  try {
    const next = await reportClientError(new Error('Error page opened without a ticket'), {
      component: 'SystemErrorView',
      extra: {
        path: route.fullPath,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      },
    })
    if (!next) return
    applyTicket(next)
  } finally {
    issuing.value = false
  }
}

function onExternalTicket(event: Event): void {
  const detail = (event as CustomEvent<{ ticket?: string }>).detail
  const next = detail?.ticket?.trim()
  if (next) applyTicket(next)
}

onMounted(() => {
  window.addEventListener('fikr-error-ticket', onExternalTicket)
  void ensureTicket()
})

onUnmounted(() => {
  window.removeEventListener('fikr-error-ticket', onExternalTicket)
})

watch(
  () => route.query.ticket,
  (value) => {
    if (typeof value === 'string' && value.trim()) {
      issuedTicket.value = value.trim()
      rememberErrorTicket(value.trim())
    }
  },
)

const homeLink = computed(() => {
  if (!authService.isAuthenticated()) return '/'

  const user = authService.getStoredUser() as {
    role?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
  } | null

  if (user?.isSuperAdmin || user?.isSystemUser) return '/platform/schools'
  if (user?.role === 'parent') return '/parent/dashboard'
  return '/dashboard'
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push(homeLink.value)
}

const copyTicket = async () => {
  if (!ticket.value) return
  try {
    await navigator.clipboard.writeText(ticket.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    copied.value = false
  }
}
</script>
