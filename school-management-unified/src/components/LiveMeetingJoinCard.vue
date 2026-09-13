<template>
  <section v-if="rooms.length" class="fk-card">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
      <h2 class="fk-card__title truncate">{{ $t('meetingRooms.liveMeetings') }}</h2>
    </header>
    <ul class="divide-y divide-fikr-hairline">
      <li
        v-for="room in rooms"
        :key="room.id"
        class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div class="min-w-0">
          <p class="font-semibold text-fikr-ink">{{ room.title }}</p>
          <p class="text-xs text-fikr-ink-soft tabular-nums">{{ formatDate(room.scheduled_at ?? room.created_at) }}</p>
        </div>
        <router-link
          :to="{ name: 'meeting-room', params: { id: room.id } }"
          class="fk-btn fk-btn--primary fk-btn--live-join shrink-0"
        >
          {{ $t('meetingRooms.join') }}
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MeetingRoomMineRow } from '@/services/meeting-room.service'
import { formatTeamsLikeDateTime } from '@/utils/meeting-datetime'

defineProps<{
  rooms: MeetingRoomMineRow[]
}>()

const { locale, t } = useI18n()
const formatDate = (iso?: string | null) => formatTeamsLikeDateTime(iso ?? undefined, locale.value, t)
</script>
