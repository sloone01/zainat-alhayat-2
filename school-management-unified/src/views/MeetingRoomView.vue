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

      <div v-if="loading && !error" class="flex items-center justify-center py-12 text-gray-600">
        {{ $t('meetingRooms.joining') }}
      </div>

      <div v-if="!error" class="w-full">
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
import DailyIframe from '@daily-co/daily-js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { meetingRoomService } from '@/services/meeting-room.service'
import { authService } from '@/services'

const route = useRoute()
const { locale } = useI18n()

const isRTL = computed(() => locale.value === 'ar')
const meetingId = computed(() => String(route.params.id || ''))

const loading = ref(true)
const error = ref('')

const backTo = computed(() => {
  const u = authService.getStoredUser() as { role?: string } | null
  if (u?.role === 'parent') return '/parent/dashboard'
  if (u?.role === 'admin') return '/admin/meeting-rooms'
  return '/my-meeting-rooms'
})

const frameHost = ref<HTMLElement | null>(null)
let callFrame: ReturnType<typeof DailyIframe.createFrame> | null = null

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

onMounted(async () => {
  const id = meetingId.value
  if (!id) {
    error.value = 'Missing meeting'
    loading.value = false
    return
  }

  try {
    const join = await meetingRoomService.join(id)

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
  } catch (e: unknown) {
    error.value = formatUnknownError(e) || 'Join failed'
    loading.value = false
  }
})

onBeforeUnmount(() => {
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
