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
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('meetingRooms.roomsCount', { count: filteredRooms.length }) }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
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

          <template v-else>
            <p
              v-if="filteredRooms.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('meetingRooms.noFilterResults') }}
            </p>

            <div
              v-else-if="isCards"
              class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3"
            >
              <KanbanCard
                v-for="r in paginatedRooms"
                :key="r.id"
                :title="r.title"
                :priority="presenceLabel(r) ? 'medium' : undefined"
                :priority-label="presenceLabel(r)"
              >
                <template #meta>
                  <KanbanMeta icon="calendar">{{ formatDate(r.scheduled_at ?? r.created_at) }}</KanbanMeta>
                </template>
                <div>
                  <router-link
                    v-if="canOpenRoom(r)"
                    :to="{ name: 'meeting-room', params: { id: r.id } }"
                    class="text-sm font-semibold text-primary-700 hover:text-primary-900"
                  >
                    {{ canStartRooms ? $t('meetingRooms.openRoom') : $t('meetingRooms.join') }}
                  </router-link>
                  <span v-else class="text-sm font-medium text-gray-400">
                    {{ joinBlockedLabel(r) }}
                  </span>
                </div>
              </KanbanCard>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table w-full table-fixed">
                <thead>
                  <tr>
                    <th class="w-[42%]">{{ $t('meetingRooms.colTitle') }}</th>
                    <th class="w-[28%]">{{ $t('meetingRooms.colScheduled') }}</th>
                    <th class="w-[15%]">{{ $t('common.status') }}</th>
                    <th class="w-[15%] text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in paginatedRooms"
                    :key="'list-' + r.id"
                    class="hover:bg-fikr-pearl"
                  >
                    <td class="min-w-0">
                      <span class="block truncate font-medium text-fikr-ink">{{ r.title }}</span>
                    </td>
                    <td class="whitespace-nowrap text-sm text-fikr-ink-soft tabular-nums">
                      {{ formatDate(r.scheduled_at ?? r.created_at) }}
                    </td>
                    <td>
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        :class="presenceChipClass(r)"
                      >
                        {{ presenceLabel(r) }}
                      </span>
                    </td>
                    <td class="text-end whitespace-nowrap">
                      <router-link
                        v-if="canOpenRoom(r)"
                        :to="{ name: 'meeting-room', params: { id: r.id } }"
                        class="text-sm font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ canStartRooms ? $t('meetingRooms.openRoom') : $t('meetingRooms.join') }}
                      </router-link>
                      <span v-else class="text-sm text-gray-400">{{ joinBlockedLabel(r) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredRooms.length > 0"
              @update:page="goToPage"
            />
          </template>
        </div>
      </section>

      <div
        v-if="showFilters"
        class="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('meetingRooms.filtersTitle')"
      >
        <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
        <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
          <div class="fk-drawer__header items-start">
            <div>
              <h3 class="fk-form__title">{{ $t('meetingRooms.filtersTitle') }}</h3>
            </div>
            <button
              type="button"
              class="fk-modal__close"
              :aria-label="$t('common.close')"
              @click="showFilters = false"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="fk-drawer__body">
            <div class="fk-form__row">
              <label class="fk-flabel" for="my-meetings-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="my-meetings-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('meetingRooms.searchPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="my-meetings-status"><span>{{ $t('common.status') }}</span></label>
              <select
                id="my-meetings-status"
                v-model="statusFilter"
                class="fk-field"
              >
                <option value="all">{{ $t('meetingRooms.allStatuses') }}</option>
                <option value="live">{{ $t('meetingRooms.statusLive') }}</option>
                <option value="waiting">{{ $t('meetingRooms.statusWaiting') }}</option>
                <option value="expired">{{ $t('meetingRooms.statusExpired') }}</option>
              </select>
            </div>
          </div>
          <div class="px-4 pb-4">
            <div class="flex items-center justify-end gap-2">
              <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
              <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClientPagination } from '@/composables/useClientPagination'
import { authService } from '@/services'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import { formatExactLocalDateTime } from '@/utils/meeting-datetime'
import {
  canInviteeJoinMeeting,
  isMeetingStaffHost,
  meetingRoomPresence,
  type MeetingRoomPresence,
} from '@/utils/meeting-host'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const raw = (authService.getStoredUser() as { school_id?: string | null } | null)?.school_id
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null
})

const canStartRooms = computed(() => isMeetingStaffHost(authService.getStoredUser()))

const { viewMode, isCards } = useListViewMode()
const showFilters = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'all' | 'live' | 'waiting' | 'expired'>('all')

const loading = ref(true)
const error = ref('')
const rooms = ref<MeetingRoomMineRow[]>([])
let pollTimer: ReturnType<typeof setInterval> | null = null

const formatDate = (iso?: string) => formatExactLocalDateTime(iso, locale.value)

function presenceOf(r: MeetingRoomMineRow): MeetingRoomPresence {
  return meetingRoomPresence(r)
}

function presenceLabel(r: MeetingRoomMineRow) {
  const p = presenceOf(r)
  if (p === 'live') return t('meetingRooms.statusLive')
  if (p === 'expired') return t('meetingRooms.statusExpired')
  if (p === 'draft') return t('meetingRooms.statusDraft')
  return t('meetingRooms.statusWaiting')
}

function presenceChipClass(r: MeetingRoomMineRow) {
  const p = presenceOf(r)
  if (p === 'live') return 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
  if (p === 'expired') return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
  if (p === 'draft') return 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
  return 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
}

function presenceAccent(r: MeetingRoomMineRow) {
  const p = presenceOf(r)
  if (p === 'live') return 'bg-emerald-500'
  if (p === 'expired') return 'bg-gray-400'
  return 'bg-amber-400'
}

function presenceIconClass(r: MeetingRoomMineRow) {
  const p = presenceOf(r)
  if (p === 'live') return 'bg-emerald-100 text-emerald-800'
  if (p === 'expired') return 'bg-gray-100 text-gray-600'
  return 'bg-amber-100 text-amber-800'
}

/** Staff may open/start any non-draft room; invitees only after the host has started (and not expired). */
function canOpenRoom(r: MeetingRoomMineRow) {
  if (r.status === 'draft') return false
  if (canStartRooms.value) return true
  return canInviteeJoinMeeting(r)
}

function joinBlockedLabel(r: MeetingRoomMineRow) {
  if (presenceOf(r) === 'expired') return t('meetingRooms.statusExpired')
  return t('meetingRooms.joinWhenStarted')
}

const hasActiveFilters = computed(
  () => searchQuery.value.trim().length > 0 || statusFilter.value !== 'all',
)

const filteredRooms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return rooms.value.filter((r) => {
    if (q && !r.title.toLowerCase().includes(q)) return false
    const presence = presenceOf(r)
    if (statusFilter.value === 'live' && presence !== 'live') return false
    if (statusFilter.value === 'waiting' && presence !== 'waiting') return false
    if (statusFilter.value === 'expired' && presence !== 'expired') return false
    return true
  })
})

const {
  currentPage,
  totalPages,
  paginatedItems: paginatedRooms,
  goToPage,
} = useClientPagination(filteredRooms)

watch([searchQuery, statusFilter], () => {
  goToPage(1)
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

async function loadRooms() {
  rooms.value = await meetingRoomService.mine(schoolId.value)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await loadRooms()
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
  pollTimer = setInterval(() => {
    void loadRooms().catch(() => undefined)
  }, 8000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
