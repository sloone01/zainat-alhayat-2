<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('meetingRooms.myMeetingsTitle')"
        :subtitle="$t('meetingRooms.myMeetingsSubtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('meetingRooms.myMeetingsTitle') }}</h2>
          </div>
        </header>
        <div class="p-4 sm:p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <span class="fk-spinner" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="!rooms.length" class="fk-empty">
            <p class="fk-empty__desc">{{ $t('meetingRooms.noInvites') }}</p>
          </div>
          <ul v-else class="divide-y divide-fikr-hairline">
            <li
              v-for="r in rooms"
              :key="r.id"
              class="flex flex-col gap-2 px-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="font-semibold text-fikr-ink">{{ r.title }}</p>
                <p class="text-xs text-fikr-ink-soft tabular-nums">{{ formatDate(r.scheduled_at ?? r.created_at) }}</p>
              </div>
              <router-link
                :to="{ name: 'meeting-room', params: { id: r.id } }"
                class="fk-btn fk-btn--primary shrink-0"
              >
                {{ $t('meetingRooms.openRoom') }}
              </router-link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { authService } from '@/services'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import { formatTeamsLikeDateTime } from '@/utils/meeting-datetime'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: string } | null)?.school_id ?? 1))

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
