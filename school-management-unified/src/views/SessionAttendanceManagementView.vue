<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRtl ? 'rtl' : 'ltr'">
      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('sessionAttendance.title') }}</h1>
        <p class="mt-1 text-sm text-gray-600">{{ $t('sessionAttendance.description') }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="sa-group" class="mb-2 block text-sm font-medium text-gray-700">
              {{ $t('sessionAttendance.filterGroup') }}
            </label>
            <select
              id="sa-group"
              v-model="selectedGroupId"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              @change="onFiltersChange"
            >
              <option value="">{{ $t('sessionAttendance.allGroups') }}</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label for="sa-from" class="mb-2 block text-sm font-medium text-gray-700">
              {{ $t('sessionAttendance.fromDate') }}
            </label>
            <input
              id="sa-from"
              v-model="fromDate"
              type="date"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              @change="onFiltersChange"
            />
          </div>
          <div>
            <label for="sa-to" class="mb-2 block text-sm font-medium text-gray-700">
              {{ $t('sessionAttendance.toDate') }}
            </label>
            <input
              id="sa-to"
              v-model="toDate"
              type="date"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              @change="onFiltersChange"
            />
          </div>
        </div>
      </div>

      <div v-if="loading" class="rounded-xl border border-gray-200 bg-white py-16 text-center">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p class="mt-3 text-sm text-gray-600">{{ $t('common.loading') }}…</p>
      </div>
      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{{ error }}</div>

      <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div v-if="!records.length" class="p-12 text-center text-gray-500">
          {{ $t('sessionAttendance.empty') }}
        </div>

        <template v-else>
          <!-- Desktop table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold text-gray-700">{{ $t('sessionAttendance.colDate') }}</th>
                  <th class="px-4 py-3 text-start font-semibold text-gray-700">{{ $t('sessionAttendance.colGroup') }}</th>
                  <th class="px-4 py-3 text-start font-semibold text-gray-700">{{ $t('sessionAttendance.colSlot') }}</th>
                  <th class="px-4 py-3 text-start font-semibold text-gray-700">{{ $t('sessionAttendance.colSummary') }}</th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-700 whitespace-nowrap">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="row in paginatedRecords" :key="row.id">
                  <tr class="border-t border-gray-100 hover:bg-gray-50/80">
                    <td class="px-4 py-3 whitespace-nowrap text-gray-900">{{ formatDate(row.session_date) }}</td>
                    <td class="px-4 py-3 text-gray-800">{{ row.group_name || '—' }}</td>
                    <td class="px-4 py-3 text-gray-700">
                      <div>{{ dayLabel(row.day_of_week) }}</div>
                      <div class="text-xs text-gray-500">{{ formatTimeRange(row.start_time, row.end_time) }}</div>
                      <div v-if="row.course_name" class="text-xs text-gray-500">{{ row.course_name }}</div>
                    </td>
                    <td class="px-4 py-3">
                      <SessionAttendanceSummaryBadges :row="row" />
                    </td>
                    <td class="px-4 py-3">
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
                  <tr v-if="expandedId === row.id" class="border-t border-gray-100 bg-gray-50/60">
                    <td colspan="5" class="px-4 py-4">
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

          <!-- Mobile cards -->
          <div class="md:hidden p-4 space-y-3">
            <article
              v-for="row in paginatedRecords"
              :key="'session-card-' + row.id"
              class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
            >
              <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <h3 class="text-base font-semibold text-gray-900">{{ formatDate(row.session_date) }}</h3>
                    <p class="mt-0.5 text-sm text-gray-700">{{ row.group_name || '—' }}</p>
                    <p class="mt-1 text-xs text-gray-500">
                      {{ dayLabel(row.day_of_week) }} · {{ formatTimeRange(row.start_time, row.end_time) }}
                    </p>
                    <p v-if="row.course_name" class="text-xs text-gray-500">{{ row.course_name }}</p>
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
                </div>
              </div>
              <div class="px-4 py-3">
                <SessionAttendanceSummaryBadges :row="row" />
                <p class="mt-2 text-xs text-gray-500">
                  {{ $t('sessionAttendance.presenceJoins', { count: row.presence_join_count }) }}
                </p>
              </div>
              <div
                v-if="expandedId === row.id"
                class="border-t border-gray-100 bg-gray-50/60 px-4 py-4"
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

          <!-- Pagination -->
          <div class="border-t border-gray-200 px-4 py-3 sm:px-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-gray-600">
                {{ $t('common.paginationShowing', { from: paginationFrom, to: paginationTo, total: records.length }) }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <label class="inline-flex items-center gap-2 text-sm text-gray-600">
                  <span class="whitespace-nowrap">{{ $t('common.perPage') }}</span>
                  <select
                    v-model.number="pageSize"
                    class="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                </label>
                <button
                  type="button"
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage <= 1"
                  @click="goToPreviousPage"
                >
                  {{ $t('common.previous') }}
                </button>
                <span class="text-sm text-gray-600 whitespace-nowrap">
                  {{ $t('common.pageOf', { current: currentPage, total: totalPages }) }}
                </span>
                <button
                  type="button"
                  class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="currentPage >= totalPages"
                  @click="goToNextPage"
                >
                  {{ $t('common.next') }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SessionAttendanceActionsDropdown from '@/components/SessionAttendanceActionsDropdown.vue'
import SessionAttendanceDetailPanel from '@/components/SessionAttendanceDetailPanel.vue'
import SessionAttendanceSummaryBadges from '@/components/SessionAttendanceSummaryBadges.vue'
import groupService, { type Group } from '@/services/group.service'
import scheduleService from '@/services/schedule.service'
import { onlineSessionService, type SessionAttendanceRecordRow } from '@/services/online-session.service'


const { t, locale, te } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  try {
    return Number(JSON.parse(localStorage.getItem('user_data') || '{}')?.school_id || 1)
  } catch {
    return 1
  }
})

const groups = ref<Group[]>([])
const selectedGroupId = ref('')
const fromDate = ref('')
const toDate = ref('')
const records = ref<SessionAttendanceRecordRow[]>([])
const loading = ref(false)
const error = ref('')

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 20, 50]

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

const totalPages = computed(() => Math.max(1, Math.ceil(records.value.length / pageSize.value)))

const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return records.value.slice(start, start + pageSize.value)
})

const paginationFrom = computed(() => {
  if (!records.value.length) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const paginationTo = computed(() =>
  Math.min(currentPage.value * pageSize.value, records.value.length),
)

watch(pageSize, () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

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

function goToPreviousPage() {
  if (currentPage.value > 1) currentPage.value--
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
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
