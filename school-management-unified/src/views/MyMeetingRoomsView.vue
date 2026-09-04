<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div>
        <h1 class="text-xl font-bold text-gray-900">{{ $t('meetingRooms.myMeetingsTitle') }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('meetingRooms.myMeetingsSubtitle') }}</p>
      </div>

      <div v-if="loading" class="text-center py-12 text-gray-600">{{ $t('common.loading') }}…</div>
      <div v-else-if="error" class="rounded-md bg-red-50 p-4 text-sm text-red-800">{{ error }}</div>
      <div v-else-if="!rooms.length" class="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 text-sm">
        {{ $t('meetingRooms.noInvites') }}
      </div>
      <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <ul class="divide-y divide-gray-100">
          <li
            v-for="r in rooms"
            :key="r.id"
            class="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div :class="isRTL ? 'text-right' : 'text-left'">
              <p class="font-semibold text-gray-900">{{ r.title }}</p>
              <p class="text-xs text-gray-500 tabular-nums">{{ formatDate(r.scheduled_at ?? r.created_at) }}</p>
            </div>
            <router-link
              :to="{ name: 'meeting-room', params: { id: r.id } }"
              class="inline-flex justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 shrink-0"
            >
              {{ $t('meetingRooms.openRoom') }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import { formatTeamsLikeDateTime } from '@/utils/meeting-datetime'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: number } | null)?.school_id ?? 1))

const loading = ref(true)
const error = ref('')
const rooms = ref<MeetingRoomMineRow[]>([])

const formatDate = (iso?: string) => formatTeamsLikeDateTime(iso, locale.value, t)

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    rooms.value = await meetingRoomService.mine(schoolId.value)
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      const data = e.response?.data as { message?: string | string[] }
      const m = data?.message
      error.value =
        typeof m === 'string'
          ? m
          : Array.isArray(m)
            ? m.join('; ')
            : e.message || t('meetingRooms.loadFailed')
    } else {
      error.value = e instanceof Error ? e.message : t('meetingRooms.loadFailed')
    }
  } finally {
    loading.value = false
  }
})
</script>
