<template>
  <section v-if="classes.length" class="fk-card">
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
      <h2 class="fk-card__title truncate">{{ $t('parent.onlineClasses') }}</h2>
    </header>
    <ul class="divide-y divide-fikr-hairline">
      <li
        v-for="row in classes"
        :key="row.id"
        class="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div class="min-w-0">
          <p class="font-semibold text-fikr-ink">{{ row.course_name || $t('parent.onlineClasses') }}</p>
          <p class="text-xs text-fikr-ink-soft">
            <span v-if="row.group_name">{{ row.group_name }} · </span>
            <span dir="ltr">{{ row.session_date }}<template v-if="clock(row.start_time)"> · {{ clock(row.start_time) }}</template></span>
            · {{ row.status === 'live' ? $t('parent.onlineClassLive') : $t('parent.onlineClassInvited') }}
          </p>
        </div>
        <router-link
          :to="{ name: 'online-session-room', params: { id: row.id } }"
          class="fk-btn fk-btn--primary fk-btn--live-join shrink-0"
        >
          {{ $t('parent.joinOnlineClass') }}
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { ParentOnlineClassRow } from '@/services/online-session.service'

defineProps<{
  classes: ParentOnlineClassRow[]
}>()

function clock(time: string | null | undefined): string {
  if (!time) return ''
  return String(time).slice(0, 5)
}
</script>
