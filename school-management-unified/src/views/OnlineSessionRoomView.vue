<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ $t('onlineSession.title') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ $t('onlineSession.subtitle') }}</p>
        </div>
        <router-link
          to="/teacher-weekly-sessions"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ $t('onlineSession.back') }}
        </router-link>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-800">
        {{ error }}
      </div>

      <div v-if="loading && !error" class="flex items-center justify-center py-12 text-gray-600">
        {{ $t('onlineSession.loading') }}
      </div>

      <div v-if="!error" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2">
          <div
            ref="frameHost"
            class="w-full rounded-lg overflow-hidden border border-gray-200 bg-black"
            style="min-height: 480px"
          />
        </div>
        <div v-if="isOwner" class="space-y-4">
          <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-900 mb-1">{{ $t('onlineSession.studentRoll') }}</h2>
            <p class="text-xs text-gray-500 mb-3">{{ $t('onlineSession.studentRollHint') }}</p>
            <p v-if="!studentRoll.length" class="text-sm text-gray-500">{{ $t('onlineSession.noAttendance') }}</p>
            <ul v-else class="space-y-2 text-xs text-gray-700 max-h-[220px] overflow-y-auto">
              <li v-for="row in studentRoll" :key="row.id" class="flex justify-between border-b border-gray-100 pb-2">
                <span class="font-medium truncate pe-2">{{ row.student_name || row.student_id }}</span>
                <span
                  class="shrink-0 font-medium"
                  :class="
                    row.status === 'attended'
                      ? 'text-green-700'
                      : row.status === 'not_attended'
                        ? 'text-red-700'
                        : 'text-gray-500'
                  "
                >
                  {{
                    row.status === 'attended'
                      ? $t('onlineSession.attended')
                      : row.status === 'not_attended'
                        ? $t('onlineSession.notAttended')
                        : $t('onlineSession.awaitingFinalize')
                  }}
                </span>
              </li>
            </ul>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">{{ $t('onlineSession.attendance') }}</h2>
            <p v-if="!attendance.length" class="text-sm text-gray-500">{{ $t('onlineSession.noAttendance') }}</p>
            <ul v-else class="space-y-2 text-xs text-gray-700 max-h-[280px] overflow-y-auto">
              <li v-for="row in attendance" :key="row.id" class="border-b border-gray-100 pb-2">
                <div class="font-medium">{{ row.display_name || row.email || row.user_id }}</div>
                <div class="text-gray-500">
                  {{ $t('onlineSession.joined') }}: {{ formatTs(row.joined_at) }}
                  <span v-if="row.left_at"> · {{ $t('onlineSession.left') }}: {{ formatTs(row.left_at) }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DailyIframe from '@daily-co/daily-js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { onlineSessionService } from '@/services/online-session.service'

const route = useRoute()
const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const sessionId = computed(() => String(route.params.id || ''))

const loading = ref(true)
const error = ref('')
const isOwner = ref(false)
const attendance = ref<
  Array<{
    id: string
    user_id: string
    display_name: string | null
    joined_at: string
    left_at: string | null
    email?: string
    role?: string
  }>
>([])
const studentRoll = ref<
  Array<{ id: string; student_id: string; status: string; student_name: string | null; updated_at: string }>
>([])

const frameHost = ref<HTMLElement | null>(null)
let callFrame: ReturnType<typeof DailyIframe.createFrame> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

const formatTs = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar-SA' : undefined)
  } catch {
    return iso
  }
}

/** Daily `join()` often rejects with a plain `{ errorMsg, ... }`, not an Error — avoids `[object Object]` in the UI */
function formatUnknownError(e: unknown): string {
  if (e instanceof Error) return e.message || 'Request failed'
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    if (typeof o.errorMsg === 'string') return o.errorMsg
    if (typeof o.message === 'string') return o.message
    if (typeof o.error === 'string') return o.error
    try {
      return JSON.stringify(o)
    } catch {
      return 'Request failed'
    }
  }
  return String(e)
}

async function loadAttendance() {
  if (!isOwner.value || !sessionId.value) return
  try {
    const [pres, roll] = await Promise.all([
      onlineSessionService.attendance(sessionId.value),
      onlineSessionService.studentAttendance(sessionId.value),
    ])
    attendance.value = pres
    studentRoll.value = roll
  } catch {
    /* ignore poll errors */
  }
}

onMounted(async () => {
  const id = sessionId.value
  if (!id) {
    error.value = 'Missing session'
    loading.value = false
    return
  }

  try {
    const join = await onlineSessionService.join(id)
    isOwner.value = Boolean(join.is_owner)

    const u = new URL(join.room_url)
    u.searchParams.set('t', join.token)

    loading.value = false
    await nextTick()

    if (!frameHost.value) {
      error.value = 'No container'
      return
    }

    callFrame = DailyIframe.createFrame(frameHost.value, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        minHeight: '480px',
        border: '0',
      },
    })

    await callFrame.join({ url: u.toString() })

    try {
      await onlineSessionService.presence(id, 'join')
    } catch {
      /* non-fatal */
    }

    if (isOwner.value) {
      await loadAttendance()
      pollTimer = setInterval(loadAttendance, 15000)
    }
  } catch (e: unknown) {
    error.value = formatUnknownError(e) || 'Join failed'
    loading.value = false
  }
})

onBeforeUnmount(async () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  const id = sessionId.value
  if (id) {
    try {
      await onlineSessionService.presence(id, 'leave')
    } catch {
      /* ignore */
    }
  }
  if (callFrame) {
    try {
      callFrame.destroy()
    } catch {
      /* ignore */
    }
    callFrame = null
  }
})
</script>
