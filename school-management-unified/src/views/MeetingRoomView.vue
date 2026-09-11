<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ $t('meetingRooms.joinTitle') }}</h1>
          <p class="text-sm text-gray-600 mt-1">{{ $t('meetingRooms.joinSubtitle') }}</p>
        </div>
        <router-link
          :to="backTo"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {{ $t('meetingRooms.back') }}
        </router-link>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-800">
        {{ error }}
      </div>

      <div v-if="waitingForStaff && !error" class="flex items-center justify-center py-12 text-gray-600">
        {{ $t('meetingRooms.joinWhenStarted') }}
      </div>

      <div v-if="loading && !error && !waitingForStaff && !inCall" class="flex items-center justify-center py-12 text-gray-600">
        {{ $t('meetingRooms.joining') }}
      </div>

      <div v-if="inCall && !error" class="w-full">
        <div
          ref="frameHost"
          class="w-full rounded-lg overflow-hidden border border-gray-200 bg-black"
          style="min-height: 480px"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DailyIframe from '@daily-co/daily-js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { meetingRoomService } from '@/services/meeting-room.service'
import { authService } from '@/services'
import { isMeetingStaffHost, canInviteeJoinMeeting, meetingRoomPresence } from '@/utils/meeting-host'

const route = useRoute()
const { locale, t } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const meetingId = computed(() => String(route.params.id || ''))

const loading = ref(true)
const waitingForStaff = ref(false)
const inCall = ref(false)
const error = ref('')

const backTo = computed(() => {
  const u = authService.getStoredUser() as { role?: string } | null
  if (u?.role === 'parent') return '/parent/dashboard'
  if (u?.role === 'admin') return '/admin/meeting-rooms'
  return '/my-meeting-rooms'
})

const frameHost = ref<HTMLElement | null>(null)
let callFrame: ReturnType<typeof DailyIframe.createFrame> | null = null
let waitTimer: ReturnType<typeof setTimeout> | null = null
let stopped = false

function formatUnknownError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { code?: string; message?: string | string[] } | undefined
    const m = data?.message
    if (data?.code === 'MEETING_NOT_STARTED' || m === 'MEETING_NOT_STARTED') {
      return t('meetingRooms.joinWhenStarted')
    }
    if (typeof m === 'string') return m
    if (Array.isArray(m)) return m.join('; ')
  }
  if (e instanceof Error) return e.message || t('meetingRooms.joinFailed')
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    if (typeof o.errorMsg === 'string') return o.errorMsg
    if (typeof o.message === 'string') return o.message
    if (typeof o.error === 'string') return o.error
    try {
      return JSON.stringify(o)
    } catch {
      return t('meetingRooms.joinFailed')
    }
  }
  return String(e)
}

async function joinCall() {
  const join = await meetingRoomService.join(meetingId.value)
  if (!join.room_url) {
    throw new Error(t('meetingRooms.draftBlocked'))
  }

  const u = new URL(join.room_url)
  u.searchParams.set('t', join.token)

  waitingForStaff.value = false
  loading.value = false
  inCall.value = true
  await nextTick()

  if (!frameHost.value) {
    error.value = t('meetingRooms.joinFailed')
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

  if (isMeetingStaffHost(authService.getStoredUser())) {
    callFrame.on('left-meeting', () => {
      void meetingRoomService.end(meetingId.value).catch(() => undefined)
    })
  }
}

async function waitThenJoin() {
  if (stopped) return
  try {
    const room = await meetingRoomService.getOne(meetingId.value)
    if (room.status === 'draft') {
      waitingForStaff.value = false
      loading.value = false
      error.value = t('meetingRooms.draftBlocked')
      return
    }
    if (room.ended_at || meetingRoomPresence(room) === 'expired') {
      waitingForStaff.value = false
      loading.value = false
      error.value = t('meetingRooms.statusExpired')
      return
    }
    if (canInviteeJoinMeeting(room)) {
      await joinCall()
      return
    }
    waitingForStaff.value = true
    loading.value = false
    waitTimer = setTimeout(() => {
      void waitThenJoin()
    }, 5000)
  } catch (e: unknown) {
    error.value = formatUnknownError(e) || t('meetingRooms.joinFailed')
    waitingForStaff.value = false
    loading.value = false
    inCall.value = false
  }
}

onMounted(async () => {
  const id = meetingId.value
  if (!id) {
    error.value = t('meetingRooms.joinFailed')
    loading.value = false
    return
  }

  try {
    if (isMeetingStaffHost(authService.getStoredUser())) {
      await joinCall()
    } else {
      await waitThenJoin()
    }
  } catch (e: unknown) {
    error.value = formatUnknownError(e) || t('meetingRooms.joinFailed')
    waitingForStaff.value = false
    loading.value = false
    inCall.value = false
  }
})

onBeforeUnmount(() => {
  stopped = true
  if (waitTimer) clearTimeout(waitTimer)
  if (isMeetingStaffHost(authService.getStoredUser()) && meetingId.value) {
    void meetingRoomService.end(meetingId.value).catch(() => undefined)
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
