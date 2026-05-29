<template>
  <div v-if="loading" class="text-sm text-gray-500">{{ $t('common.loading') }}</div>
  <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ $t('onlineSession.studentRoll') }}</h3>
      <p v-if="!studentRoll.length" class="text-sm text-gray-500">{{ $t('onlineSession.noAttendance') }}</p>
      <ul v-else class="space-y-2 text-sm max-h-64 overflow-y-auto">
        <li
          v-for="st in studentRoll"
          :key="st.student_id"
          class="flex justify-between gap-2 border-b border-gray-100 pb-2"
        >
          <span class="font-medium text-gray-900">{{ st.student_name || st.student_id }}</span>
          <span
            class="shrink-0 font-medium"
            :class="
              st.status === 'attended'
                ? 'text-green-700'
                : st.status === 'not_attended'
                  ? 'text-red-700'
                  : 'text-gray-500'
            "
          >
            {{ participationLabel(st.status) }}
          </span>
        </li>
      </ul>
    </div>
    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ $t('onlineSession.attendance') }}</h3>
      <p v-if="!presence.length" class="text-sm text-gray-500">{{ $t('onlineSession.noAttendance') }}</p>
      <ul v-else class="space-y-2 text-sm max-h-64 overflow-y-auto">
        <li v-for="p in presence" :key="p.id" class="border-b border-gray-100 pb-2">
          <div class="font-medium text-gray-900">{{ p.display_name || p.email || p.user_id }}</div>
          <div class="text-xs text-gray-500">
            {{ $t('onlineSession.joined') }}: {{ formatTs(p.joined_at) }}
            <span v-if="p.left_at"> · {{ $t('onlineSession.left') }}: {{ formatTs(p.left_at) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

type StudentRollItem = {
  id: string
  student_id: string
  status: string
  student_name: string | null
}

type PresenceItem = {
  id: string
  user_id: string
  display_name: string | null
  joined_at: string
  left_at: string | null
  email?: string
}

defineProps<{
  loading: boolean
  studentRoll: StudentRollItem[]
  presence: PresenceItem[]
  formatTs: (iso: string) => string
  participationLabel: (status: string) => string
}>()

const { t } = useI18n()
</script>
