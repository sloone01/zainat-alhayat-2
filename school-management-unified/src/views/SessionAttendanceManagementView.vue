<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRtl ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('sessionAttendance.title')"
        :subtitle="$t('sessionAttendance.description')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-display truncate text-lg font-bold leading-7 text-navy-800">{{ $t('sessionAttendance.title') }}</h2>
            <p class="mt-0.5 text-xs text-fikr-ink-muted">
              <template v-if="records.length">
                {{ $t('common.paginationShowing', { from: paginationFrom, to: paginationTo, total: records.length }) }}
              </template>
              <template v-else>{{ $t('sessionAttendance.emptyMeta') }}</template>
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
          </div>
        </header>

        <div v-if="loading" class="flex min-h-[16rem] flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>

        <div
          v-else-if="!records.length"
          class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
        >
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fikr-mist text-navy-800">
            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-navy-800">{{ $t('sessionAttendance.empty') }}</h3>
          <p class="mx-auto mt-1 max-w-md text-sm text-fikr-ink-muted">{{ $t('sessionAttendance.emptyHint') }}</p>
        </div>

        <template v-else>
          <!-- Desktop table -->
          <div class="hidden overflow-visible px-5 pt-4 md:block sm:px-6">
            <table class="fk-feetable min-w-full">
              <thead>
                <tr>
                  <th>{{ $t('sessionAttendance.colDate') }}</th>
                  <th>{{ $t('sessionAttendance.colGroup') }}</th>
                  <th>{{ $t('sessionAttendance.colSlot') }}</th>
                  <th>{{ $t('sessionAttendance.colSummary') }}</th>
                  <th class="whitespace-nowrap !text-center">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in paginatedRecords" :key="row.id">
                  <tr class="hover:bg-fikr-mist/40">
                    <td class="whitespace-nowrap font-medium">{{ formatDate(row.session_date) }}</td>
                    <td>{{ row.group_name || '—' }}</td>
                    <td>
                      <div>{{ dayLabel(row.day_of_week) }}</div>
                      <div class="text-xs text-fikr-ink-muted" dir="ltr">{{ formatTimeRange(row.start_time, row.end_time) }}</div>
                      <div v-if="row.course_name" class="text-xs text-fikr-ink-muted">{{ row.course_name }}</div>
                    </td>
                    <td>
                      <SessionAttendanceSummaryBadges :row="row" />
                    </td>
                    <td>
                      <div class="flex justify-center">
                        <SessionAttendanceActionsDropdown
                          :open="activeMenuId === row.id"
                          :isRTL="isRtl"
                          :session-id="row.id"
                          :details-expanded="expandedId === row.id"
                          @toggle="toggleMenu(row.id)"
                          @toggle-details="onToggleDetails(row)"
                          @navigate="closeMenu"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr v-if="expandedId === row.id" class="bg-fikr-mist/60">
                    <td colspan="5" class="!py-4">
                      <SessionAttendanceDetailPanel
                        :loading="detailLoading === row.id"
                        :student-roll="detailStudentRoll"
                        :presence="detailPresence"
                        :format-ts="formatTs"
                        :participation-label="participationLabel"
                      />
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Mobile list: hairline rows with monogram circle -->
          <div class="px-4 md:hidden sm:px-5">
            <article
              v-for="row in paginatedRecords"
              :key="'session-card-' + row.id"
              class="fk-sched__row flex-wrap gap-y-3 !items-start"
            >
              <span class="fk-sched__dot fk-sched__dot--wait" aria-hidden="true">
                {{ (row.group_name || '—').charAt(0) }}
              </span>
              <div class="min-w-0 flex-1">
                <h3 class="fk-sched__title">{{ formatDate(row.session_date) }}</h3>
                <p class="fk-sched__meta">{{ row.group_name || '—' }}</p>
                <p class="fk-sched__meta">
                  {{ dayLabel(row.day_of_week) }} · {{ formatTimeRange(row.start_time, row.end_time) }}
                </p>
                <p v-if="row.course_name" class="fk-sched__meta">{{ row.course_name }}</p>
              </div>
              <SessionAttendanceActionsDropdown
                :open="activeMenuId === row.id"
                :isRTL="isRtl"
                :session-id="row.id"
                :details-expanded="expandedId === row.id"
                @toggle="toggleMenu(row.id)"
                @toggle-details="onToggleDetails(row)"
                @navigate="closeMenu"
              />
              <div class="w-full">
                <SessionAttendanceSummaryBadges :row="row" />
                <p class="mt-2 text-xs text-fikr-ink-muted">
                  {{ $t('sessionAttendance.presenceJoins', { count: row.presence_join_count }) }}
                </p>
              </div>
              <div
                v-if="expandedId === row.id"
                class="w-full rounded-2xl bg-fikr-mist px-4 py-4"
              >
                <SessionAttendanceDetailPanel
                  :loading="detailLoading === row.id"
                  :student-roll="detailStudentRoll"
                  :presence="detailPresence"
                  :format-ts="formatTs"
                  :participation-label="participationLabel"
                />
              </div>
            </article>
          </div>

          <FikrPagination
            :page="currentPage"
            :pages="totalPages"
            :show="records.length > 0"
            @update:page="goToPage"
          />
        </template>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('common.filter')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRtl ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('common.filter') }}</h3>
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
            <label class="fk-flabel" for="sa-group"><span>{{ $t('sessionAttendance.filterGroup') }}</span></label>
            <select
              id="sa-group"
              v-model="selectedGroupId"
              class="fk-field"
              @change="onFiltersChange"
            >
              <option value="">{{ $t('sessionAttendance.allGroups') }}</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="sa-from"><span>{{ $t('sessionAttendance.fromDate') }}</span></label>
            <input
              id="sa-from"
              v-model="fromDate"
              type="date"
              class="fk-field"
              @change="onFiltersChange"
            />
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="sa-to"><span>{{ $t('sessionAttendance.toDate') }}</span></label>
            <input
              id="sa-to"
              v-model="toDate"
              type="date"
              class="fk-field"
              @change="onFiltersChange"
            />
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--mist" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--navy" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import SessionAttendanceActionsDropdown from '@/components/SessionAttendanceActionsDropdown.vue'
import SessionAttendanceDetailPanel from '@/components/SessionAttendanceDetailPanel.vue'
import SessionAttendanceSummaryBadges from '@/components/SessionAttendanceSummaryBadges.vue'
import groupService, { type Group } from '@/services/group.service'
import scheduleService from '@/services/schedule.service'
import { onlineSessionService, type SessionAttendanceRecordRow } from '@/services/online-session.service'
import { useClientPagination } from '@/composables/useClientPagination'
import FikrLoader from '@/components/FikrLoader.vue'


const { t, locale, te } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  try {
    const raw = JSON.parse(localStorage.getItem('user_data') || '{}')?.school_id
    return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
  } catch {
    return undefined
  }
})

const groups = ref<Group[]>([])
const selectedGroupId = ref('')
const fromDate = ref('')
const toDate = ref('')
const records = ref<SessionAttendanceRecordRow[]>([])
const loading = ref(false)
const error = ref('')
const showFilters = ref(false)

const activeMenuId = ref<string | null>(null)
const expandedId = ref<string | null>(null)
const detailLoading = ref<string | null>(null)
const detailStudentRoll = ref<
  Array<{ id: string; student_id: string; status: string; student_name: string | null }>
>([])
const detailPresence = ref<
  Array<{
    id: string
    user_id: string
    display_name: string | null
    joined_at: string
    left_at: string | null
    email?: string
  }>
>([])

const {
  currentPage,
  paginatedItems: paginatedRecords,
  totalPages,
  paginationFrom,
  paginationTo,
  goToPage,
} = useClientPagination(records)

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenu() {
  activeMenuId.value = null
}

function onFiltersChange() {
  currentPage.value = 1
  void loadRecords()
}

const hasActiveFilters = computed(() =>
  Boolean(selectedGroupId.value) || fromDate.value !== defaultFromDate() || toDate.value !== todayKey(),
)

function clearFilters() {
  selectedGroupId.value = ''
  fromDate.value = defaultFromDate()
  toDate.value = todayKey()
  onFiltersChange()
}

function defaultFromDate() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

const dayLabel = (day?: string | null) => {
  if (!day) return '—'
  const key = `scheduleManagement.days.${String(day).toLowerCase()}`
  return te(key) ? t(key) : day
}

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar' : 'en', { dateStyle: 'medium' })
  } catch {
    return d
  }
}

const formatTimeRange = (start?: string | null, end?: string | null) => {
  const s = start ? String(start).slice(0, 5) : '--:--'
  const e = end ? String(end).slice(0, 5) : '--:--'
  return `${s} – ${e}`
}

const formatTs = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function participationLabel(status: string) {
  if (status === 'attended') return t('onlineSession.attended')
  if (status === 'not_attended') return t('onlineSession.notAttended')
  return t('onlineSession.awaitingFinalize')
}

async function loadGroups() {
  const role = JSON.parse(localStorage.getItem('user_data') || '{}')?.role
  const uid = JSON.parse(localStorage.getItem('user_data') || '{}')?.id
  if (role === 'teacher' && uid) {
    groups.value = await scheduleService.getGroupsForTeacher(uid)
  } else {
    groups.value = await groupService.getAll(schoolId.value)
  }
}

async function loadRecords() {
  loading.value = true
  error.value = ''
  expandedId.value = null
  closeMenu()
  try {
    records.value = await onlineSessionService.listAttendanceRecords({
      school_id: schoolId.value,
      group_id: selectedGroupId.value || undefined,
      from_date: fromDate.value || undefined,
      to_date: toDate.value || undefined,
    })
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('sessionAttendance.loadError')
    records.value = []
  } finally {
    loading.value = false
  }
}

async function onToggleDetails(row: SessionAttendanceRecordRow) {
  closeMenu()
  await toggleDetail(row.id)
}

async function toggleDetail(sessionId: string) {
  if (expandedId.value === sessionId) {
    expandedId.value = null
    return
  }
  expandedId.value = sessionId
  detailLoading.value = sessionId
  detailStudentRoll.value = []
  detailPresence.value = []
  try {
    const [roll, presence] = await Promise.all([
      onlineSessionService.studentAttendance(sessionId),
      onlineSessionService.attendance(sessionId),
    ])
    detailStudentRoll.value = roll
    detailPresence.value = presence
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('sessionAttendance.detailError')
  } finally {
    detailLoading.value = null
  }
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenu()
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  fromDate.value = defaultFromDate()
  toDate.value = todayKey()
  await loadGroups()
  await loadRecords()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
