<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="t('systemError.title')" :subtitle="t('systemError.message')">
        <template #leading>
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
        </template>
      </FikrPageHeader>

      <section class="fk-card" role="alert" aria-live="assertive">
        <div class="px-5 py-6 sm:px-6">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            {{ t('systemError.code') }}
          </p>

          <div v-if="ticket" class="mt-5 border-y border-rose-200/90 py-5">
            <p class="text-[11px] font-medium uppercase tracking-wide text-rose-800">
              {{ t('systemError.ticketLabel') }}
            </p>
            <p class="mt-2 font-mono text-2xl font-semibold tracking-wide text-navy-950 sm:text-3xl" dir="ltr">
              {{ ticket }}
            </p>
            <button
              type="button"
              class="mt-3 text-sm font-semibold text-rose-800 underline decoration-rose-300 underline-offset-4 hover:text-rose-950"
              @click="copyTicket"
            >
              {{ copied ? t('systemError.copied') : t('systemError.copyTicket') }}
            </button>
          </div>
          <p v-else-if="issuing" class="mt-5 text-sm text-navy-600">{{ t('systemError.issuingTicket') }}</p>
          <p v-else class="mt-5 text-sm text-navy-600">{{ t('systemError.noTicket') }}</p>

          <div class="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="text-sm font-semibold text-navy-900 underline decoration-navy-300 underline-offset-4 hover:text-navy-700"
              @click="goBack"
            >
              {{ t('systemError.tryAgain') }}
            </button>
            <router-link
              :to="homeLink"
              class="text-sm font-semibold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:text-primary-950"
            >
              {{ t('systemError.goHome') }}
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
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

async function ensureTicket(): Promise<void> {
  const existing = ticketFromRouteOrStorage()
  if (existing) {
    issuedTicket.value = existing
    rememberErrorTicket(existing)
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
    issuedTicket.value = next
    rememberErrorTicket(next)
  } finally {
    issuing.value = false
  }
}

onMounted(() => {
  void ensureTicket()
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
  void router.push(homeLink.value)
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
