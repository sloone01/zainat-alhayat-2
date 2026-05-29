<template>
  <div class="flex flex-wrap gap-2 text-xs">
    <span class="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">
      {{ $t('onlineSession.attended') }}: {{ row.attended_count }}
    </span>
    <span class="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800">
      {{ $t('onlineSession.notAttended') }}: {{ row.not_attended_count }}
    </span>
    <span
      v-if="row.pending_count > 0"
      class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700"
    >
      {{ $t('onlineSession.awaitingFinalize') }}: {{ row.pending_count }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { SessionAttendanceRecordRow } from '@/services/online-session.service'

defineProps<{
  row: SessionAttendanceRecordRow
}>()
</script>
