<template>
  <DashboardLayout>
    <div
      class="flex h-[calc(100dvh-5.5rem)] min-h-[20rem] flex-col sm:h-[calc(100dvh-6rem)]"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <section
        class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.15rem] bg-navy-800 px-5 py-5 text-white sm:px-8 sm:py-7 lg:px-10"
        role="alert"
        aria-live="assertive"
      >
        <div class="relative z-[1] flex shrink-0 items-center justify-between gap-4">
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
            :aria-label="t('systemError.back')"
            @click="goBack"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center justify-end gap-3">
            <span class="text-xl font-bold tracking-[0.04em] text-white" dir="ltr">FIKR</span>
            <span class="grid grid-cols-3 gap-1" aria-hidden="true">
              <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/50" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400/70" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-transparent" />
              <i class="h-2.5 w-2.5 rounded-[2px] bg-primary-400" />
            </span>
          </div>
        </div>

        <div class="relative z-[1] flex min-h-0 flex-1 flex-col justify-center gap-8 py-6">
          <div class="max-w-2xl">
            <h1 class="text-[1.75rem] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[2.35rem] lg:text-[2.75rem] lg:leading-[1.15]">
              {{ t('systemError.title') }}
            </h1>
            <p class="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
              {{ t('systemError.message') }}
            </p>
          </div>

          <div class="max-w-2xl">
            <p class="m-0 text-[0.72rem] font-bold tracking-[0.14em] text-primary-300">
              {{ t('systemError.ticketLabel') }}
            </p>

            <template v-if="ticket">
              <p class="mt-2 break-all font-mono text-xl font-bold leading-snug tracking-[0.04em] text-white sm:text-2xl" dir="ltr">
                {{ ticket }}
              </p>
              <button
                type="button"
                class="mt-3 inline-flex w-fit items-center gap-2 bg-transparent p-0 text-sm font-bold text-primary-300 hover:text-white focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-primary-400/70"
                @click="copyTicket"
              >
                <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {{ copied ? t('systemError.copied') : t('systemError.copyTicket') }}
              </button>
            </template>
            <p v-else-if="issuing" class="mt-2 text-sm leading-relaxed text-white/70 sm:text-[0.95rem]">
              {{ t('systemError.issuingTicket') }}
            </p>
            <p v-else class="mt-2 text-sm leading-relaxed text-white/70 sm:text-[0.95rem]">
              {{ t('systemError.noTicket') }}
            </p>
          </div>
        </div>

        <div
          class="pointer-events-none absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-primary-500/10"
          aria-hidden="true"
        />
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
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
    user_type?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
  } | null
  if (user?.role === 'parent' || user?.user_type === 'parent') return '/parent/dashboard'
  if (user?.isSuperAdmin || user?.user_type === 'platform' || user?.isSystemUser) return '/platform/schools'
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
