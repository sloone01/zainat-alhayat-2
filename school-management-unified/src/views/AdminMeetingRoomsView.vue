<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('meetingRooms.adminTitle') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('meetingRooms.adminSubtitle') }}</p>
        </div>
      </section>

      <div v-if="flashError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">{{ flashError }}</div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('meetingRooms.roomsListTitle') }}</h2>
              <p v-if="!pageLoading && !roomsLoading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('meetingRooms.roomsCount', { count: rooms.length }) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="text-xs font-medium text-primary-700 hover:text-primary-900"
                :disabled="roomsLoading"
                @click="loadRooms"
              >
                {{ $t('meetingRooms.refreshList') }}
              </button>
              <ListViewModeToggle v-model="viewMode" />
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="!pageLoading" class="mb-5 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              @click="openNew"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('meetingRooms.newRoom') }}
            </button>
          </div>

          <div v-if="pageLoading || roomsLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="rooms.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="r in rooms"
                :key="r.id"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ r.title }}</h3>
                      <p class="mt-1 text-xs text-gray-500">
                        {{ $t('meetingRooms.colScheduled') }}:
                        <span class="font-medium text-gray-700 tabular-nums">{{ formatDate(r.scheduled_at ?? r.created_at) }}</span>
                      </p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-1.5">
                    <span class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-sky-800 ring-1 ring-sky-100">
                      {{ r.invitee_count }} {{ $t('meetingRooms.colInvitees') }}
                    </span>
                    <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {{ formatDate(r.created_at) }}
                    </span>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <router-link
                    :to="{ name: 'meeting-room', params: { id: r.id } }"
                    class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ $t('meetingRooms.openRoom') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </router-link>
                </div>
              </article>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('meetingRooms.colTitle') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colScheduled') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colInvitees') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('meetingRooms.colCreated') }}</th>
                    <th class="px-4 py-3 text-end font-semibold">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="r in rooms" :key="'list-' + r.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ r.title }}</td>
                    <td class="px-4 py-3 text-gray-700 whitespace-nowrap tabular-nums">
                      {{ formatDate(r.scheduled_at ?? r.created_at) }}
                    </td>
                    <td class="px-4 py-3 text-gray-700 tabular-nums">{{ r.invitee_count }}</td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">{{ formatDate(r.created_at) }}</td>
                    <td class="px-4 py-3 text-end whitespace-nowrap">
                      <router-link
                        :to="{ name: 'meeting-room', params: { id: r.id } }"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ $t('meetingRooms.openRoom') }}
                        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.noRoomsYet') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('meetingRooms.emptyHint') }}</p>
                <button
                  type="button"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                  @click="openNew"
                >
                  {{ $t('meetingRooms.createFirstRoom') }}
                </button>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <div
          v-if="sheetOpen"
          class="fixed inset-0 z-[60] flex justify-end bg-black/40"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('meetingRooms.sheetTitle')"
          @click.self="closeSheet"
        >
          <div
            class="h-full w-full max-w-4xl overflow-y-auto bg-white shadow-xl"
            :class="isRTL ? 'border-s border-gray-200' : 'border-e border-gray-200'"
            @click.stop
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <h2 class="text-lg font-semibold text-gray-900">{{ $t('meetingRooms.sheetTitle') }}</h2>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                :aria-label="$t('common.close')"
                @click="closeSheet"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 pb-28">
              <div class="lg:col-span-7 space-y-4">
                <div class="space-y-4">
                  <label class="block text-xs font-medium text-gray-500" for="meeting-scheduled-at">{{
                    $t('meetingRooms.scheduledAtLabel')
                  }}</label>
                  <input
                    id="meeting-scheduled-at"
                    v-model="scheduledAtLocal"
                    type="datetime-local"
                    step="60"
                    class="block w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 font-mono tabular-nums"
                    style="direction: ltr"
                  />
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.scheduledAtHint') }}</p>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('meetingRooms.roomTitle') }}</label>
                  <input
                    v-model="title"
                    type="text"
                    maxlength="255"
                    class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="$t('meetingRooms.roomTitlePlaceholder')"
                  />
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-4">
                  <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.rolesCardTitle') }}</h3>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.audienceHeading') }}</p>
                  <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <label
                      v-for="opt in roleOptions"
                      :key="opt.key"
                      class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors"
                      :class="
                        opt.model.value
                          ? 'border-primary-300 bg-primary-50 text-primary-900'
                          : 'border-gray-200 bg-gray-50/80 text-gray-700 hover:border-gray-300'
                      "
                    >
                      <input v-model="opt.model" type="checkbox" class="rounded border-gray-300 text-primary-600 shrink-0" />
                      <span class="text-sm font-medium">{{ opt.label }}</span>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.groupsCardTitle') }}</h3>
                    <button
                      v-if="selectedGroupIds.length"
                      type="button"
                      class="text-xs font-medium text-primary-600 hover:text-primary-800"
                      @click="clearGroups"
                    >
                      {{ $t('meetingRooms.clearGroups') }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.groupsHint') }}</p>
                  <div v-if="!groups.length" class="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                    {{ $t('meetingRooms.noGroups') }}
                  </div>
                  <div v-else class="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="g in groups"
                      :key="`grp-${g.id}-${selectionTick}`"
                      class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="selectedGroupIds.includes(g.id) ? 'bg-primary-50/50' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedGroupIds.includes(g.id)"
                        @change="toggleGroup(g.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm text-gray-900 font-medium">{{ g.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.usersCardTitle') }}</h3>
                    <button
                      v-if="selectedUserIds.length"
                      type="button"
                      class="text-xs font-medium text-primary-600 hover:text-primary-800"
                      @click="clearUsers"
                    >
                      {{ $t('meetingRooms.clearUsers') }}
                    </button>
                  </div>
                  <p class="text-xs text-gray-500">{{ $t('meetingRooms.usersHint') }}</p>
                  <input
                    v-model="userSearch"
                    type="search"
                    class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="$t('meetingRooms.userSearchPlaceholder')"
                  />
                  <div class="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="u in filteredUsers"
                      :key="`usr-${u.id}-${selectionTick}`"
                      class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      :class="selectedUserIds.includes(u.id) ? 'bg-indigo-50/60' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedUserIds.includes(u.id)"
                        @change="toggleUser(u.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm text-gray-900 flex-1 min-w-0">
                        <span class="font-medium">{{ u.firstName }} {{ u.lastName }}</span>
                        <span class="text-gray-500"> · {{ roleLabel(u.role) }}</span>
                      </span>
                      <span class="text-xs text-gray-400 truncate max-w-[9rem]">{{ u.email }}</span>
                    </label>
                  </div>
                </div>

                <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
                <p v-else-if="!hasAnySelection" class="text-sm text-amber-700">{{ $t('meetingRooms.selectAudienceHint') }}</p>
              </div>

              <div class="lg:col-span-5">
                <div class="rounded-lg border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-20">
                  <div class="bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-4 text-white">
                    <h3 class="text-base font-semibold">{{ $t('meetingRooms.summaryPanelTitle') }}</h3>
                    <p class="text-xs text-primary-100 mt-1">{{ $t('meetingRooms.summaryPanelSubtitle') }}</p>
                  </div>
                  <div class="p-4 space-y-4 bg-white">
                    <div v-if="!title.trim()" class="text-sm text-gray-500 italic">{{ $t('meetingRooms.summaryNoTitle') }}</div>
                    <div v-else class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.roomTitle') }}</p>
                      <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ title.trim() }}</p>
                    </div>
                    <div v-if="scheduledAtValid" class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.summaryScheduledLabel') }}</p>
                      <p class="text-sm font-semibold text-gray-900 mt-0.5 tabular-nums">{{ scheduledDisplayFull }}</p>
                    </div>
                    <div v-else class="text-sm text-amber-800 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
                      {{ $t('meetingRooms.scheduledAtInvalid') }}
                    </div>
                    <div v-if="!hasAnySelection" class="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg">
                      {{ $t('meetingRooms.summaryEmpty') }}
                    </div>
                    <ul v-else class="space-y-2 text-sm text-gray-800">
                      <li
                        v-for="(line, idx) in summaryLines"
                        :key="`sum-${selectionTick}-${idx}`"
                        class="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                      >
                        <span class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                        <span>{{ line }}</span>
                      </li>
                    </ul>
                    <div
                      v-if="hasAnySelection"
                      class="rounded-lg border border-primary-100 bg-primary-50/90 px-3 py-2.5 text-sm text-primary-900"
                    >
                      <span class="font-semibold tabular-nums">{{ estimatedInviteHint }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
              <button type="button" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" @click="closeSheet">
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="saving || !title.trim() || !hasAnySelection || !scheduledAtValid"
                @click="onCreate"
              >
                {{ saving ? $t('meetingRooms.creating') : $t('meetingRooms.createButton') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import { groupService, type Group } from '@/services/group.service'
import userService, { type User } from '@/services/user.service'
import { meetingRoomService, type MeetingRoomListRow } from '@/services/meeting-room.service'
import { formatTeamsLikeDateTime, formatFullLocalDateTime, defaultScheduledDatetimeLocal } from '@/utils/meeting-datetime'

const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: number } | null)?.school_id ?? 1))

const pageLoading = ref(true)
const sheetOpen = ref(false)
const flashError = ref('')
const title = ref('')
const invAllParents = ref(false)
const invAllTeachers = ref(false)
const invAllStudents = ref(false)
const selectedGroupIds = ref<string[]>([])
const selectedUserIds = ref<string[]>([])
const selectionTick = ref(0)

const userSearch = ref('')
const groups = ref<Group[]>([])
const users = ref<User[]>([])

const saving = ref(false)
const createError = ref('')
const rooms = ref<MeetingRoomListRow[]>([])
const roomsLoading = ref(false)

const scheduledAtLocal = ref(defaultScheduledDatetimeLocal())
const scheduledAtValid = computed(() => {
  const v = scheduledAtLocal.value
  if (!v?.trim()) return false
  const d = new Date(v)
  return !Number.isNaN(d.getTime())
})
const scheduledDisplayFull = computed(() => {
  if (!scheduledAtValid.value) return ''
  return formatFullLocalDateTime(new Date(scheduledAtLocal.value), locale.value)
})

const roleOptions = computed(() => [
  { key: 'parents', label: t('meetingRooms.optAllParents'), model: invAllParents },
  { key: 'teachers', label: t('meetingRooms.optAllTeachers'), model: invAllTeachers },
  { key: 'students', label: t('meetingRooms.optAllStudents'), model: invAllStudents },
])

const usersInSchool = computed(() => {
  const sid = schoolId.value
  return users.value.filter((u) => {
    const usid = u.school_id
    if (usid != null && Number(usid) !== sid) return false
    if (u.role === 'admin') return false
    if (!u.isActive) return false
    return true
  })
})

function countRole(role: 'parent' | 'teacher' | 'student'): number {
  return usersInSchool.value.filter((u) => u.role === role).length
}

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  const list = usersInSchool.value
  if (!q) return list
  return list.filter((u) => {
    const blob = `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase()
    return blob.includes(q)
  })
})

const hasAnySelection = computed(() => {
  return (
    invAllParents.value ||
    invAllTeachers.value ||
    invAllStudents.value ||
    selectedGroupIds.value.length > 0 ||
    selectedUserIds.value.length > 0
  )
})

const summaryLines = computed(() => {
  const lines: string[] = []
  if (invAllParents.value) {
    lines.push(t('meetingRooms.summaryLineAllParents', { n: countRole('parent') }))
  }
  if (invAllTeachers.value) {
    lines.push(t('meetingRooms.summaryLineAllTeachers', { n: countRole('teacher') }))
  }
  if (invAllStudents.value) {
    lines.push(t('meetingRooms.summaryLineAllStudents', { n: countRole('student') }))
  }
  for (const gid of selectedGroupIds.value) {
    const g = groups.value.find((x) => x.id === gid)
    lines.push(t('meetingRooms.summaryLineGroup', { name: g?.name ?? gid.slice(0, 8) }))
  }
  if (selectedUserIds.value.length) {
    lines.push(t('meetingRooms.summaryLineUsers', { n: selectedUserIds.value.length }))
  }
  return lines
})

const estimatedInviteHint = computed(() => {
  let n = 0
  if (invAllParents.value) n += countRole('parent')
  if (invAllTeachers.value) n += countRole('teacher')
  if (invAllStudents.value) n += countRole('student')
  n += selectedUserIds.value.length
  const g = selectedGroupIds.value.length
  if (g > 0) {
    return t('meetingRooms.summaryEstimateWithGroups', { base: n, groups: g })
  }
  return t('meetingRooms.summaryEstimate', { n })
})

function bumpSelection() {
  selectionTick.value += 1
}

function roleLabel(role: string) {
  const key = `dashboard.${role}`
  const tr = t(key)
  return tr === key ? role : tr
}

function toggleGroup(id: string, on: boolean) {
  const arr = [...selectedGroupIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedGroupIds.value = arr
  bumpSelection()
}

function toggleUser(id: string, on: boolean) {
  const arr = [...selectedUserIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedUserIds.value = arr
  bumpSelection()
}

function clearGroups() {
  selectedGroupIds.value = []
  bumpSelection()
}

function clearUsers() {
  selectedUserIds.value = []
  bumpSelection()
}

function resetForm() {
  title.value = ''
  invAllParents.value = false
  invAllTeachers.value = false
  invAllStudents.value = false
  selectedGroupIds.value = []
  selectedUserIds.value = []
  userSearch.value = ''
  scheduledAtLocal.value = defaultScheduledDatetimeLocal()
  createError.value = ''
  bumpSelection()
}

function openNew() {
  resetForm()
  sheetOpen.value = true
}

function closeSheet() {
  sheetOpen.value = false
  createError.value = ''
}

const formatDate = (iso?: string) => formatTeamsLikeDateTime(iso, locale.value, t)

async function loadRooms() {
  roomsLoading.value = true
  flashError.value = ''
  try {
    rooms.value = await meetingRoomService.list(schoolId.value)
  } catch (e: unknown) {
    flashError.value = e instanceof Error ? e.message : t('meetingRooms.loadFailed')
    rooms.value = []
  } finally {
    roomsLoading.value = false
  }
}

async function onCreate() {
  createError.value = ''
  saving.value = true
  try {
    const invite = {
      allParents: invAllParents.value || undefined,
      allTeachers: invAllTeachers.value || undefined,
      allStudents: invAllStudents.value || undefined,
      groupIds: selectedGroupIds.value.length ? [...selectedGroupIds.value] : undefined,
      userIds: selectedUserIds.value.length ? [...selectedUserIds.value] : undefined,
    }
    const created = await meetingRoomService.create({
      school_id: schoolId.value,
      title: title.value.trim(),
      scheduled_at: new Date(scheduledAtLocal.value).toISOString(),
      invite,
    })
    closeSheet()
    await loadRooms()
    await router.push({ name: 'meeting-room', params: { id: created.id } })
  } catch (e: unknown) {
    createError.value = e instanceof Error ? e.message : t('meetingRooms.createFailed')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    const [g, u] = await Promise.all([groupService.getAll(schoolId.value), userService.getAllUsers()])
    groups.value = g
    users.value = u
    await loadRooms()
  } catch (e: unknown) {
    flashError.value = e instanceof Error ? e.message : t('meetingRooms.loadFailed')
  } finally {
    pageLoading.value = false
  }
})
</script>
