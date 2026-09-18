<template>
  <DashboardLayout :sidebar-desktop="sidebarDesktopMode">
    <div class="fk-page" :dir="isRtl ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('attendanceManagement.title')"
        :subtitle="$t('attendanceManagement.description')"
      >
        <template #actions>
          <select
            id="group-select"
            v-model="selectedGroupId"
            class="fk-tt-pill max-w-[18rem]"
            :disabled="loadingGroups"
            :aria-label="$t('attendanceManagement.selectGroup')"
          >
            <option value="">
              {{
                loadingGroups
                  ? $t('attendanceManagement.loadingGroups')
                  : $t('attendanceManagement.selectGroupPlaceholder')
              }}
            </option>
            <option v-for="group in groups" :key="group.id" :value="String(group.id)">
              {{ group.name }}
            </option>
          </select>
          <input
            id="date-select"
            v-model="selectedDate"
            type="date"
            :max="today"
            class="fk-tt-pill min-w-[11rem]"
            :aria-label="$t('attendanceManagement.selectDate')"
          />
          <div class="hidden md:block">
            <ListViewModeToggle v-model="desktopView" />
          </div>
        </template>
      </FikrPageHeader>

      <!-- Mobile 5a — always the same list -->
      <section class="fk-elev p-0 md:hidden">
        <p v-if="groupsError" class="px-5 py-3 text-xs font-medium text-navy-800">{{ groupsError }}</p>

        <div class="flex flex-wrap items-center justify-end gap-2 border-b border-fikr-hairline px-5 py-3">
          <button
            v-if="selectedGroup"
            type="button"
            class="fk-btn fk-btn--mist"
            @click="markAllPresent"
          >
            {{ $t('attendanceManagement.actions.markAllPresent') }}
          </button>
          <button
            type="button"
            :disabled="!hasChanges || saving || !selectedGroupId"
            class="fk-btn fk-btn--navy"
            @click="saveAttendance"
          >
            {{ saveLabel }}
          </button>
        </div>

        <div v-if="!selectedGroup" class="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.selectGroupFirst') }}</h3>
        </div>
        <div v-else-if="loading" class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>
        <div v-else-if="filteredStudents.length === 0" class="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.noStudentsInGroup') }}</h3>
        </div>
        <div v-else class="px-5 py-4">
          <div class="mb-5">
            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-pill bg-fikr-mist px-3 py-2 text-sm font-medium text-navy-800">
                <span class="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
                {{ $t('attendanceManagement.status.present') }}
                <span dir="ltr">{{ attendanceStats.presentStudents }}</span>
              </span>
              <span class="rounded-pill bg-fikr-mist px-3 py-2 text-sm font-medium text-navy-800">
                {{ $t('attendanceManagement.status.absent') }}
                <span dir="ltr">{{ attendanceStats.absentStudents }}</span>
              </span>
              <span class="rounded-pill bg-fikr-mist px-3 py-2 text-sm font-medium text-navy-800">
                {{ $t('attendanceManagement.unrecorded') }}
                <span dir="ltr">{{ unrecordedCount }}</span>
              </span>
            </div>
            <div class="mt-4 flex h-1.5 gap-[3px] overflow-hidden rounded-pill" aria-hidden="true">
              <span v-if="attendanceStats.presentStudents" class="bg-primary-500" :style="{ flex: attendanceStats.presentStudents }" />
              <span v-if="attendanceStats.absentStudents" class="bg-navy-800" :style="{ flex: attendanceStats.absentStudents }" />
              <span v-if="unrecordedCount" class="bg-fikr-mist" :style="{ flex: unrecordedCount }" />
            </div>
          </div>
          <div
            v-for="student in paginatedStudents"
            :key="student.id"
            class="flex flex-wrap items-center gap-3 border-b border-fikr-hairline py-3 last:border-0"
          >
            <span
              class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fikr-mist text-base font-medium text-navy-800"
              aria-hidden="true"
            >{{ studentInitial(student) }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-base font-medium leading-5">{{ student.name }}</p>
              <p class="truncate text-xs leading-5 text-fikr-ink-muted">{{ attendanceNotes[student.id] || arrivalLabel(student) }}</p>
            </div>
            <div class="inline-flex w-full shrink-0 flex-nowrap items-center gap-1.5">
              <button
                v-for="status in attendanceStatuses"
                :key="status.value"
                type="button"
                :aria-pressed="getAttendanceStatus(student.id) === status.value"
                :class="statusPillClass(student.id, status)"
                @click="updateAttendance(student.id, status.value)"
              >
                {{ $t(`attendanceManagement.status.${status.value}`) }}
              </button>
            </div>
          </div>
          <FikrPagination
            :page="currentPage"
            :pages="totalPages"
            :show="filteredStudents.length > 0"
            @update:page="goToPage"
          />
        </div>
      </section>

      <!-- Desktop 5b — compact table -->
      <section v-if="desktopView === 'list'" class="hidden fk-elev p-0 md:block">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-8 py-4">
          <div class="min-w-0">
            <p class="text-xs leading-5 text-fikr-ink-muted">
              {{ formatDate(selectedDate) }} · {{ currentSessionCaption }}
            </p>
            <h2 class="fk-display truncate text-2xl font-bold leading-8 text-navy-800">
              {{ $t('attendanceManagement.takeAttendanceTitle') }}<template v-if="selectedGroup"> · {{ selectedGroup.name }}</template>
            </h2>
          </div>
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-3">
            <div v-if="selectedGroup" class="relative" data-export-menu>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('attendanceManagement.exportMenu')"
                :aria-expanded="showExportMenu"
                aria-haspopup="true"
                @click="toggleExportMenu"
              >
                <IconDownload />
              </button>
              <div
                v-if="showExportMenu"
                role="menu"
                class="absolute end-0 z-30 mt-1 w-44 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-lg"
              >
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-navy-800 hover:bg-fikr-mist" @click="onExport('word')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-fikr-mist text-[10px] font-bold text-navy-800">W</span>
                  {{ $t('attendanceManagement.exportAsWord') }}
                </button>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-navy-800 hover:bg-fikr-mist" @click="onExport('pdf')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-navy-800 text-[10px] font-bold text-white">PDF</span>
                  {{ $t('attendanceManagement.exportAsPdf') }}
                </button>
                <button type="button" role="menuitem" class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-navy-800 hover:bg-fikr-mist" @click="onExport('excel')">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary-500 text-[10px] font-bold text-white">XLS</span>
                  {{ $t('attendanceManagement.exportAsExcel') }}
                </button>
              </div>
            </div>
            <button
              v-if="selectedGroup"
              type="button"
              class="fk-btn fk-btn--mist"
              @click="markAllPresent"
            >
              {{ $t('attendanceManagement.actions.markAllPresent') }}
            </button>
            <button
              type="button"
              :disabled="!hasChanges || saving || !selectedGroupId"
              class="fk-btn fk-btn--navy"
              @click="saveAttendance"
            >
              {{ saveAndNotifyLabel }}
            </button>
          </div>
        </header>

        <div v-if="groupsError" class="px-8 py-3 text-xs font-medium text-navy-800">{{ groupsError }}</div>

        <div v-if="!selectedGroup" class="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.selectGroupFirst') }}</h3>
        </div>
        <div v-else-if="loading" class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>
        <div v-else-if="filteredStudents.length === 0" class="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.noStudentsInGroup') }}</h3>
        </div>
        <div v-else class="grid items-start gap-8 px-8 py-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div class="min-w-0 overflow-x-auto">
            <table class="fk-feetable min-w-full">
              <thead>
                <tr>
                  <th>{{ $t('attendanceManagement.childColumn') }}</th>
                  <th>{{ $t('attendanceManagement.arrival') }}</th>
                  <th>{{ $t('attendanceManagement.statusColumn') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in paginatedStudents" :key="student.id">
                  <td>
                    <div class="text-sm font-medium text-navy-800">{{ student.name }}</div>
                    <input
                      v-model="attendanceNotes[student.id]"
                      type="text"
                      :aria-label="$t('attendanceManagement.notes')"
                      class="mt-0.5 w-full border-0 bg-transparent p-0 text-xs text-fikr-ink-muted focus:outline-none focus-visible:ring-0"
                    />
                  </td>
                  <td class="whitespace-nowrap text-fikr-ink-muted">{{ arrivalLabel(student) }}</td>
                  <td class="whitespace-nowrap">
                    <div class="inline-flex shrink-0 flex-nowrap items-center gap-1.5">
                      <button
                        v-for="status in attendanceStatuses"
                        :key="status.value"
                        type="button"
                        :aria-pressed="getAttendanceStatus(student.id) === status.value"
                        :class="statusPillClass(student.id, status)"
                        @click="updateAttendance(student.id, status.value)"
                      >
                        {{ $t(`attendanceManagement.status.${status.value}`) }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredStudents.length > 0"
              @update:page="goToPage"
            />
          </div>
          <aside class="flex flex-col gap-4">
            <div class="fk-soft flex flex-col gap-2 !p-6">
              <p class="text-sm text-fikr-ink-muted">{{ $t('attendanceManagement.sessionSummary') }}</p>
              <p class="fk-display text-3xl font-bold leading-10 text-navy-800">
                <span dir="ltr">{{ attendanceStats.presentStudents }}</span>
                <span class="text-base font-medium text-fikr-ink-muted"> {{ $t('attendanceManagement.presentOfTotal', { total: attendanceStats.totalStudents }) }}</span>
              </p>
              <div class="flex h-1.5 gap-[3px] overflow-hidden rounded-pill" aria-hidden="true">
                <span v-if="attendanceStats.presentStudents" class="bg-primary-500" :style="{ flex: attendanceStats.presentStudents }" />
                <span v-if="attendanceStats.absentStudents" class="bg-navy-800" :style="{ flex: attendanceStats.absentStudents }" />
                <span v-if="attendanceStats.lateStudents" class="bg-white" :style="{ flex: attendanceStats.lateStudents }" />
              </div>
              <div class="mt-2 flex flex-col gap-1 text-sm leading-5">
                <div class="flex justify-between"><span class="text-fikr-ink-muted">{{ $t('attendanceManagement.status.late') }}</span><span class="font-medium tabular-nums" dir="ltr">{{ attendanceStats.lateStudents }}</span></div>
                <div class="flex justify-between"><span class="text-fikr-ink-muted">{{ $t('attendanceManagement.status.absent') }}</span><span class="font-medium tabular-nums" dir="ltr">{{ attendanceStats.absentStudents }}</span></div>
              </div>
            </div>
            <div class="fk-promo !p-6">
              <p class="fk-promo__eyebrow">{{ $t('attendanceManagement.onSave') }}</p>
              <p class="mt-1 text-base font-medium leading-6 text-white">{{ notifyCardBody }}</p>
              <button
                type="button"
                :disabled="!hasChanges || saving || !selectedGroupId"
                class="fk-btn fk-btn--white mt-4 w-full"
                @click="saveAttendance"
              >
                {{ saveAndNotifyLabel }}
              </button>
            </div>
          </aside>
        </div>
      </section>

      <!-- Desktop 4b — card roster -->
      <div v-else class="hidden md:block">
        <div class="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div class="min-w-0">
            <p class="text-sm leading-5 text-fikr-ink-muted">
              {{ formatDate(selectedDate) }} · {{ currentSessionCaption }}
            </p>
            <h1 class="fk-display mt-2 text-4xl font-bold leading-tight text-navy-800 xl:text-5xl xl:leading-[64px]">
              <template v-if="selectedGroup">{{ selectedGroup.name }} · {{ $t('attendanceManagement.childrenCount', { count: attendanceStats.totalStudents }) }}</template>
              <template v-else>{{ $t('attendanceManagement.takeAttendanceTitle') }}</template>
            </h1>
            <p v-if="selectedGroup" class="mt-2 text-lg font-medium leading-6 text-fikr-ink-muted">{{ heroStatsLine }}</p>
            <p v-if="groupsError" class="mt-3 text-xs font-medium text-navy-800">{{ groupsError }}</p>
          </div>
          <div class="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,.16)]">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4 text-base">
                <span class="text-fikr-ink-muted">{{ $t('attendanceManagement.periodLabel') }}</span>
                <select
                  v-if="isSessionBased"
                  id="session-select"
                  v-model.number="selectedSessionNumber"
                  class="min-w-0 border-0 bg-transparent text-end font-medium text-navy-800 focus:outline-none"
                  :disabled="loadingSessions"
                  :aria-label="$t('attendanceManagement.selectSession')"
                >
                  <option v-for="slot in sessionSlots" :key="slot.n" :value="slot.n">
                    {{ sessionLabel(slot) }}
                  </option>
                </select>
                <span v-else class="font-medium text-navy-800">{{ $t('systemSettings.attendanceModeOnceADay') }}</span>
              </div>
              <div class="flex items-center justify-between rounded-lg bg-fikr-mist px-4 py-4 text-base">
                <span class="text-fikr-ink-muted">{{ $t('attendanceManagement.defaultLabel') }}</span>
                <span class="font-medium text-navy-800">{{ $t('attendanceManagement.defaultAllPresent') }}</span>
              </div>
              <div class="mt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  :disabled="!hasChanges || saving || !selectedGroupId"
                  class="fk-btn fk-btn--navy"
                  @click="saveAttendance"
                >
                  {{ saveLabel }}
                </button>
                <button
                  type="button"
                  :disabled="!selectedGroup"
                  class="fk-btn fk-btn--mist"
                  @click="markAllPresent"
                >
                  {{ $t('attendanceManagement.actions.markAllPresent') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!selectedGroup" class="mt-10 flex flex-col items-center justify-center py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.selectGroupFirst') }}</h3>
        </div>
        <div v-else-if="loading" class="mt-10 flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>
        <div v-else-if="filteredStudents.length === 0" class="mt-10 flex flex-col items-center justify-center py-16 text-center">
          <h3 class="text-base font-semibold text-navy-800">{{ $t('attendanceManagement.messages.noStudentsInGroup') }}</h3>
        </div>
        <div v-else class="mt-10">
          <h2 class="fk-display text-2xl font-bold leading-8 text-navy-800">{{ $t('attendanceManagement.classRoster') }}</h2>
          <div class="mt-4 grid grid-cols-5 gap-3">
            <button
              v-for="student in filteredStudents"
              :key="student.id"
              type="button"
              class="flex flex-col gap-3 rounded-2xl bg-fikr-mist p-4 text-start text-navy-800"
              @click="cycleAttendance(student.id)"
            >
              <span
                class="grid h-11 w-11 place-items-center rounded-full bg-white text-base font-medium text-navy-800"
                aria-hidden="true"
              >{{ studentInitial(student) }}</span>
              <div>
                <p class="text-base font-medium leading-5">{{ student.name }}</p>
                <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ attendanceNotes[student.id] || arrivalLabel(student) }}</p>
              </div>
              <span
                class="rounded-pill px-4 py-2 text-center text-sm font-medium"
                :class="cardStatusChipClass(student.id)"
              >{{ cardStatusLabel(student.id) }}</span>
            </button>
          </div>

          <div class="mt-8 grid gap-8 lg:grid-cols-2">
            <div class="fk-promo !p-6">
              <p class="fk-promo__eyebrow">{{ $t('attendanceManagement.autoNotify') }}</p>
              <h2 class="fk-promo__title">{{ $t('attendanceManagement.notifyParentsOnSave') }}</h2>
              <p v-if="notifyAbsentDetail" class="fk-promo__body">{{ notifyAbsentDetail }}</p>
              <div class="fk-promo__actions">
                <button
                  type="button"
                  :disabled="!hasChanges || saving || !selectedGroupId"
                  class="fk-btn fk-btn--white"
                  @click="saveAttendance"
                >
                  {{ saveAndNotifyLabel }}
                </button>
              </div>
            </div>
            <div class="fk-soft flex flex-col gap-3">
              <h2 class="fk-display text-2xl font-bold leading-8 text-navy-800">{{ $t('attendanceManagement.thisWeek') }}</h2>
              <div class="flex items-center justify-between border-b border-fikr-hairline py-3">
                <span class="text-base font-medium text-navy-800">{{ $t('attendanceManagement.attendanceRate') }}</span>
                <span class="fk-display text-2xl font-bold text-navy-800" dir="ltr">{{ attendanceStats.attendanceRate }}%</span>
              </div>
              <div class="flex items-center justify-between py-3">
                <span class="text-base font-medium text-navy-800">{{ $t('attendanceManagement.status.absent') }}</span>
                <span class="text-sm text-fikr-ink-muted" dir="ltr">{{ attendanceStats.absentStudents }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import type { ListViewMode } from '@/composables/useListViewMode'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import { attendanceService } from '@/services/attendance.service'
import { studentService } from '@/services/student.service'
import { groupService } from '@/services/group.service'
import { scheduleService } from '@/services/schedule.service'
import { settingsService } from '@/services/settings.service'
import { authService } from '@/services'
import { useFeedback } from '@/composables/useFeedback'
import { normalizeScheduleDayKey } from '@/utils/schedule-display'
import * as XLSX from 'xlsx'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const route = useRoute()
const feedback = useFeedback()

/** Legacy shell: same attendance UI, collapsible desktop sidebar (see `/attendance/collapsible-layout`). */
const sidebarDesktopMode = computed<'pinned' | 'collapsible'>(() =>
  route.path === '/attendance/collapsible-layout' ? 'collapsible' : 'pinned'
)

const isRtl = computed(() => locale.value === 'ar')

const ATTENDANCE_VIEW_KEY = 'sm-attendance-desktop-view'
function readAttendanceView(): ListViewMode {
  try {
    const value = localStorage.getItem(ATTENDANCE_VIEW_KEY)
    if (value === 'cards' || value === 'list') return value
  } catch {
    /* ignore */
  }
  return 'list'
}
const desktopView = ref<ListViewMode>(readAttendanceView())
watch(desktopView, (value) => {
  try {
    localStorage.setItem(ATTENDANCE_VIEW_KEY, value)
  } catch {
    /* ignore */
  }
})

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilenameSegment(name: string): string {
  return String(name || 'group')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .trim()
    .slice(0, 80) || 'group'
}

/** Online-class automation used to write these into `attendances.notes`; keep daily remarks teacher-only in UI */
function stripOnlineSessionMirrorNotes(notes: string): string {
  let s = String(notes)
    .replace(/Online session \(auto-present\)/gi, '')
    .replace(/Online session \(auto-absent\)/gi, '')
  s = s.replace(/\s*;\s*/g, ';').replace(/^;+|;+$/g, '').trim()
  return s
}

// Reactive data
const selectedGroupId = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedSessionNumber = ref(1)
const attendanceMode = ref<'once_a_day' | 'session_based'>('once_a_day')
type SessionSlot = { n: number; start: string; end: string }
const sessionSlots = ref<SessionSlot[]>([{ n: 1, start: '', end: '' }])
const loadingSessions = ref(false)
const showExportMenu = ref(false)
const attendanceData = ref<Record<string, string>>({})
const attendanceNotes = ref<Record<string, string>>({})
const loading = ref(false)
const loadingGroups = ref(false)
const groupsError = ref('')
const saving = ref(false)

// Data from APIs
const groups = ref<any[]>([])
const students = ref<any[]>([])
const existingAttendance = ref<any[]>([])
const currentUser = ref<any>(null)

const isSessionBased = computed(() => attendanceMode.value === 'session_based')
const effectiveSessionNumber = computed(() =>
  isSessionBased.value ? Math.max(1, Number(selectedSessionNumber.value) || 1) : 1,
)
function schoolDayRange(): { start: string; end: string } {
  const periods = classPeriodSlots()
  const first = periods.find((s) => s.start)
  const last = [...periods].reverse().find((s) => s.end)
  if (first?.start && last?.end) return { start: first.start, end: last.end }
  try {
    const raw = localStorage.getItem('classSettings')
    if (raw) {
      const settings = JSON.parse(raw)
      const start = formatHm(settings.firstClassTime || settings.schoolStartTime || '')
      const end = formatHm(settings.schoolEndTime || '')
      if (start && end) return { start, end }
    }
  } catch {
    /* ignore */
  }
  return { start: '07:30', end: '08:15' }
}

const onceADayCaption = computed(() => {
  const range = schoolDayRange()
  return t('attendanceManagement.periodWithTime', {
    name: t('systemSettings.attendanceModeOnceADay'),
    start: displayHm(range.start),
    end: displayHm(range.end),
  })
})

const currentSessionCaption = computed(() => {
  if (!isSessionBased.value) return onceADayCaption.value
  const slot = sessionSlots.value.find((s) => s.n === effectiveSessionNumber.value) ?? sessionSlots.value[0]
  return slot ? sessionLabel(slot) : t('attendanceManagement.periodOrdinal.1')
})

function userRoles(user: any): string[] {
  if (!user) return []
  const roles = Array.isArray(user.roles)
    ? user.roles
    : typeof user.roles === 'string'
      ? user.roles.split(',').map((r: string) => r.trim())
      : []
  if (user.role && !roles.includes(user.role)) roles.push(user.role)
  return roles
}

function isTeacherUser(user: any): boolean {
  return userRoles(user).includes('teacher') && !userRoles(user).some((r) =>
    ['admin', 'school_admin', 'platform_admin', 'super_admin'].includes(r),
  )
}

const supervisorDisplayName = computed(() => {
  const u = currentUser.value
  if (!u) return '—'
  const fn = String(u.firstName ?? u.first_name ?? '').trim()
  const ln = String(u.lastName ?? u.last_name ?? '').trim()
  const full = `${fn} ${ln}`.trim()
  return full || String(u.email ?? '').trim() || '—'
})

// Get current user info
const getCurrentUser = async () => {
  try {
    const u = authService.getStoredUser()
    if (u) {
      currentUser.value = u
      return
    }
    currentUser.value = null
  } catch (error) {
    console.error('Error getting current user:', error)
    currentUser.value = null
  }
}

// Load groups based on user role and system settings
const loadGroups = async () => {
  try {
    loadingGroups.value = true
    groupsError.value = ''

    const systemSettings = await settingsService.getStructuredSettings()
    attendanceMode.value =
      systemSettings?.attendance?.mode === 'session_based' ? 'session_based' : 'once_a_day'
    if (!isSessionBased.value) {
      selectedSessionNumber.value = 1
      sessionSlots.value = [{ n: 1, start: '', end: '' }]
    }

    let list: any[] = []

    if (isTeacherUser(currentUser.value) && currentUser.value?.id) {
      list = await scheduleService.getGroupsForTeacher(currentUser.value.id)
    } else {
      // Staff/admin (and anyone allowed to take attendance) use school-scoped active groups
      const allowAll = systemSettings?.attendance?.allowAllUsersToTakeAttendance !== false
      if (allowAll || userRoles(currentUser.value).some((r) =>
        ['admin', 'school_admin', 'platform_admin', 'super_admin'].includes(r),
      )) {
        list = await groupService.getActive()
      }
    }

    groups.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('Error loading groups:', error)
    groups.value = []
    groupsError.value = t('attendanceManagement.messages.groupsLoadFailed')
  } finally {
    loadingGroups.value = false
  }
}

function weekdayKeyFromDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return keys[d.getDay()] || 'sunday'
}

function formatHm(raw: string): string {
  const part = String(raw || '').trim()
  return part.length >= 5 ? part.slice(0, 5) : part
}

function displayHm(raw: string): string {
  return formatHm(raw).replace(/^0/, '')
}

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = formatHm(hhmm).split(':').map((v) => Number(v) || 0)
  const total = h * 60 + m + minutes
  const hh = String(Math.floor(((total % 1440) + 1440) % 1440 / 60)).padStart(2, '0')
  const mm = String(((total % 1440) + 1440) % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function classPeriodSlots(): SessionSlot[] {
  try {
    const raw = localStorage.getItem('classSettings')
    if (!raw) return []
    const settings = JSON.parse(raw)
    const slots = Array.isArray(settings?.timeSlots) ? settings.timeSlots : []
    return slots
      .filter((s: { kind?: string }) => s?.kind !== 'break')
      .map((s: { startTime?: string; time?: string; duration?: number }, i: number) => {
        const start = formatHm(s.startTime || s.time || '')
        const dur = Number(s.duration) > 0 ? Number(s.duration) : 45
        return { n: i + 1, start, end: start ? addMinutes(start, dur) : '' }
      })
  } catch {
    return []
  }
}

function applySessionSlots(slots: SessionSlot[]) {
  sessionSlots.value = slots.length ? slots : [{ n: 1, start: '', end: '' }]
  if (!sessionSlots.value.some((s) => s.n === selectedSessionNumber.value)) {
    selectedSessionNumber.value = sessionSlots.value[0].n
  }
}

function sessionLabel(slot: SessionSlot): string {
  const name = t(`attendanceManagement.periodOrdinal.${slot.n}`)
  if (slot.start && slot.end) {
    return t('attendanceManagement.periodWithTime', {
      name,
      start: displayHm(slot.start),
      end: displayHm(slot.end),
    })
  }
  return name
}

async function refreshSessionOptions() {
  if (!isSessionBased.value) {
    selectedSessionNumber.value = 1
    sessionSlots.value = [{ n: 1, start: '', end: '' }]
    return
  }
  const fromSettings = classPeriodSlots()
  if (!selectedGroupId.value || !selectedDate.value) {
    applySessionSlots(fromSettings)
    return
  }

  loadingSessions.value = true
  try {
    const schedules = await scheduleService.getSchedulesByGroup(selectedGroupId.value)
    const day = weekdayKeyFromDate(selectedDate.value)
    const daySlots = (Array.isArray(schedules) ? schedules : [])
      .filter((s) => normalizeScheduleDayKey(s.day_of_week) === day)
      .sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
    const fromSchedule: SessionSlot[] = daySlots.map((s, i) => ({
      n: i + 1,
      start: formatHm(String(s.start_time || '')),
      end: formatHm(String(s.end_time || '')),
    }))
    applySessionSlots(fromSchedule.length >= fromSettings.length ? fromSchedule : fromSettings)
  } catch (error) {
    console.error('Error loading session options:', error)
    applySessionSlots(fromSettings)
  } finally {
    loadingSessions.value = false
  }
}

// Load students for selected group
const loadStudents = async (groupId: string) => {
  try {
    loading.value = true
    const groupStudents = await studentService.getByGroup(groupId)
    students.value = groupStudents.map(student => ({
      id: student.id,
      name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || '—',
      buses: student.buses || [],
      firstName: student.firstName,
      lastName: student.lastName,
    }))
    console.log('Students loaded:', students.value.length)
  } catch (error) {
    console.error('Error loading students:', error)
    students.value = []
  } finally {
    loading.value = false
  }
}

// Load existing attendance for the selected date, group, and session
const loadExistingAttendance = async (groupId: string, date: string) => {
  try {
    const attendance = await attendanceService.getByGroup(
      groupId,
      date,
      effectiveSessionNumber.value,
    )
    existingAttendance.value = attendance

    // Only populate attendance data from existing records if no current data exists
    // This prevents clearing user's current edits when reloading after save
    const hasCurrentData = Object.keys(attendanceData.value).length > 0

    if (!hasCurrentData) {
      attendanceData.value = {}
      attendanceNotes.value = {}
    }

    attendance.forEach(record => {
      // Only set if no current value exists (preserves user edits)
      if (!hasCurrentData || !attendanceData.value[record.student_id]) {
        attendanceData.value[record.student_id] = record.status === 'excused' ? 'absent' : record.status
      }
      if (record.notes != null && record.notes !== '' && (!hasCurrentData || !attendanceNotes.value[record.student_id])) {
        attendanceNotes.value[record.student_id] = stripOnlineSessionMirrorNotes(record.notes)
      }
    })

    console.log('Existing attendance loaded:', attendance.length, 'records')
  } catch (error) {
    console.error('Error loading existing attendance:', error)
    existingAttendance.value = []
    // Only clear data if no current edits exist
    if (Object.keys(attendanceData.value).length === 0) {
      attendanceData.value = {}
      attendanceNotes.value = {}
    }
  }
  applyDefaultPresent()
}

function applyDefaultPresent() {
  for (const student of students.value) {
    if (!attendanceData.value[student.id]) {
      attendanceData.value[student.id] = 'present'
    }
  }
}

const attendanceStatuses = [
  { value: 'present' },
  { value: 'late' },
  { value: 'absent' },
]

function statusPillClass(studentId: string, status: { value: string }) {
  return [
    'whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium leading-4 transition-colors',
    getAttendanceStatus(studentId) === status.value
      ? 'bg-primary-500 text-white'
      : 'bg-fikr-mist text-fikr-ink-muted hover:bg-fikr-surface-high',
  ]
}

function studentInitial(student: { name: string }) {
  return student.name.trim().charAt(0) || '—'
}

function arrivalLabel(student: { buses?: { title?: string }[] }) {
  const titles = (student.buses || [])
    .map((b) => String(b.title || '').trim())
    .filter(Boolean)
  return titles.join(' · ') || '—'
}

// Computed properties
const today = computed(() => new Date().toISOString().split('T')[0])

const selectedGroup = computed(() => {
  const sid = selectedGroupId.value
  if (!sid) return undefined
  return groups.value.find((group) => String(group.id) === String(sid))
})

const filteredStudents = computed(() => {
  return students.value
})

const {
  currentPage,
  paginatedItems: paginatedStudents,
  totalPages,
  goToPage,
} = useClientPagination(filteredStudents)

watch(selectedGroupId, () => {
  currentPage.value = 1
})

const attendanceStats = computed(() => {
  const total = filteredStudents.value.length
  const present = Object.values(attendanceData.value).filter(status => status === 'present').length
  const absent = Object.values(attendanceData.value).filter(status => status === 'absent').length
  const late = Object.values(attendanceData.value).filter(status => status === 'late').length
  const excused = Object.values(attendanceData.value).filter(status => status === 'excused').length
  const rate = total > 0 ? Math.round((present / total) * 100) : 0

  return {
    totalStudents: total,
    presentStudents: present,
    absentStudents: absent,
    lateStudents: late,
    excusedStudents: excused,
    attendanceRate: rate
  }
})

const hasChanges = computed(() => {
  return Object.keys(attendanceData.value).length > 0
})

const saveLabel = computed(() => {
  if (saving.value) return t('attendanceManagement.saving')
  return isAttendanceAlreadyTaken.value
    ? t('attendanceManagement.actions.updateAttendance')
    : t('attendanceManagement.actions.saveAttendance')
})

const saveAndNotifyLabel = computed(() => {
  if (saving.value) return t('attendanceManagement.saving')
  return t('attendanceManagement.actions.saveAndNotify')
})

const absentStudentNames = computed(() =>
  filteredStudents.value
    .filter((student) => attendanceData.value[student.id] === 'absent')
    .map((student) => student.name)
    .filter(Boolean),
)

const notifyCardBody = computed(() => {
  if (absentStudentNames.value.length) {
    return t('attendanceManagement.notifyAbsentBody', {
      names: absentStudentNames.value.slice(0, 2).join(' · '),
    })
  }
  return t('attendanceManagement.notifyParentsOnSave')
})

const notifyAbsentDetail = computed(() => {
  if (!absentStudentNames.value.length) return ''
  return t('attendanceManagement.notifyAbsentDetail', {
    names: absentStudentNames.value.slice(0, 2).join(' · '),
  })
})

const heroStatsLine = computed(() =>
  t('attendanceManagement.heroStats', {
    present: attendanceStats.value.presentStudents,
    late: attendanceStats.value.lateStudents,
    absent: attendanceStats.value.absentStudents,
  }),
)

/** Students in the roster without any status yet (white bar segment in mock 5b). */
const unrecordedCount = computed(() => {
  const s = attendanceStats.value
  return Math.max(
    0,
    s.totalStudents - s.presentStudents - s.absentStudents - s.lateStudents - s.excusedStudents,
  )
})

const isAttendanceAlreadyTaken = computed(() => {
  return existingAttendance.value.length > 0
})

// Methods
const onGroupChange = async () => {
  attendanceData.value = {}
  attendanceNotes.value = {}
  existingAttendance.value = []

  if (!selectedGroupId.value) {
    students.value = []
    return
  }

  await loadStudents(selectedGroupId.value)
  await refreshSessionOptions()
  await loadExistingAttendance(selectedGroupId.value, selectedDate.value)
}

const onDateChange = async () => {
  if (!selectedGroupId.value) return

  attendanceData.value = {}
  attendanceNotes.value = {}
  await refreshSessionOptions()
  await loadExistingAttendance(selectedGroupId.value, selectedDate.value)
}

const onSessionChange = async () => {
  if (!selectedGroupId.value) return
  attendanceData.value = {}
  attendanceNotes.value = {}
  await loadExistingAttendance(selectedGroupId.value, selectedDate.value)
}

watch(selectedGroupId, () => {
  void onGroupChange()
})

watch(selectedDate, () => {
  void onDateChange()
})

watch(selectedSessionNumber, () => {
  if (!isSessionBased.value) return
  void onSessionChange()
})

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

function onExport(format: 'word' | 'pdf' | 'excel') {
  showExportMenu.value = false
  if (format === 'word') exportAttendanceWord()
  else if (format === 'pdf') void printAttendance()
  else exportAttendance()
}

function handleExportMenuClickOutside(event: Event) {
  const target = event.target as Element
  if (showExportMenu.value && !target.closest('[data-export-menu]')) {
    showExportMenu.value = false
  }
}

// Save attendance records
const saveAttendance = async () => {
  if (!selectedGroupId.value || !currentUser.value) {
    feedback.error(t('attendanceManagement.messages.selectGroupBeforeSave'), t('common.error'))
    return
  }

  if (Object.keys(attendanceData.value).length === 0) {
    feedback.error(t('attendanceManagement.messages.markAtLeastOneStudent'), t('common.error'))
    return
  }

  try {
    saving.value = true

    // Prepare bulk attendance data
    const attendances = Object.entries(attendanceData.value).map(([studentId, status]) => ({
      student_id: studentId, // Keep as UUID string, don't convert to integer
      status: status,
      notes: attendanceNotes.value[studentId] || '',
      is_excused: status === 'excused'
    }))

    const bulkData = {
      attendance_date: selectedDate.value,
      group_id: selectedGroupId.value,
      session_number: effectiveSessionNumber.value,
      // recorded_by: currentUser.value.id, // Commented out since we don't have staff table setup
      attendances: attendances
    }

    console.log('Saving attendance:', bulkData)

    await attendanceService.createBulk(bulkData)

    // Reload existing attendance to show saved data without clearing current form data
    await loadExistingAttendance(selectedGroupId.value, selectedDate.value)

    feedback.success(t('attendanceManagement.messages.attendanceSaved'), t('common.success'))

  } catch (error) {
    console.error('Error saving attendance:', error)
    feedback.error(t('attendanceManagement.messages.saveAttendanceFailed'), t('common.error'))
  } finally {
    saving.value = false
  }
}

const getAttendanceStatus = (studentId: string) => {
  return attendanceData.value[studentId] || ''
}

function attendanceStatusLabel(studentId: string): string {
  const code = getAttendanceStatus(studentId)
  return code ? t(`attendanceManagement.status.${code}`) : '—'
}

function buildExportHeaders(): string[] {
  return [
    t('attendanceManagement.childColumn'),
    t('attendanceManagement.arrival'),
    t('attendanceManagement.statusColumn'),
    t('attendanceManagement.notes'),
  ]
}

function buildStudentExportRows(): (string | number)[][] {
  return filteredStudents.value.map((student) => [
    student.name,
    arrivalLabel(student),
    attendanceStatusLabel(student.id),
    attendanceNotes.value[student.id] || '',
  ])
}

function buildSummaryLabelValueRows(): (string | number)[][] {
  return [
    [t('attendanceManagement.totalStudents'), String(attendanceStats.value.totalStudents)],
    [t('attendanceManagement.presentStudents'), String(attendanceStats.value.presentStudents)],
    [t('attendanceManagement.absentStudents'), String(attendanceStats.value.absentStudents)],
    [t('attendanceManagement.attendanceRate'), `${attendanceStats.value.attendanceRate}%`],
    [],
    [t('attendanceManagement.attendanceDate'), formatDate(selectedDate.value)],
    [t('common.group'), selectedGroup.value!.name],
    [],
  ]
}

function applyRtlToExcel(wb: XLSX.WorkBook, ws: XLSX.WorkSheet, rtl: boolean) {
  if (!rtl) return
  ;(ws as XLSX.WorkSheet & { '!views'?: { RTL?: boolean }[] })['!views'] = [{ RTL: true }]
  wb.Workbook = { ...(wb.Workbook || {}), Views: [{ RTL: true }] }
}

function buildAttendancePdfInnerHtml(supervisor: string): string {
  const stats = attendanceStats.value
  const rtl = isRtl.value
  const ta = rtl ? 'right' : 'left'
  const tableRows = filteredStudents.value
    .map((student) => {
      const statusLabel = attendanceStatusLabel(student.id)
      const notes = attendanceNotes.value[student.id] || ''
      return `<tr>
        <td>${escapeHtml(student.name)}</td>
        <td>${escapeHtml(arrivalLabel(student))}</td>
        <td>${escapeHtml(statusLabel)}</td>
        <td>${escapeHtml(notes)}</td>
      </tr>`
    })
    .join('')

  return `
    <style>
      * { box-sizing: border-box; }
      .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; }
      h1 { font-size: 18px; margin: 0 0 12px; font-weight: 700; text-align: ${ta}; }
      .meta { font-size: 13px; color: #374151; margin-bottom: 16px; line-height: 1.55; text-align: ${ta}; }
      .meta strong { color: #111827; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
      .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; text-align: center; background: #f9fafb; }
      .card .n { font-size: 18px; font-weight: 700; color: #0f766e; }
      .card .l { font-size: 10px; color: #6b7280; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: ${ta}; }
      th { background: #f3f4f6; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #4b5563; }
      tr:nth-child(even) td { background: #fafafa; }
    </style>
    <div class="wrap">
      <h1>${escapeHtml(t('attendanceManagement.title'))}</h1>
      <div class="meta">
        <div><strong>${escapeHtml(t('common.group'))}</strong>: ${escapeHtml(selectedGroup.value!.name)}</div>
        <div><strong>${escapeHtml(t('attendanceManagement.attendanceDate'))}</strong>: ${escapeHtml(formatDate(selectedDate.value))}</div>
        <div><strong>${escapeHtml(t('attendanceManagement.supervisor'))}</strong>: ${escapeHtml(supervisor)}</div>
      </div>
      <div class="grid">
        <div class="card"><div class="n">${stats.totalStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.totalStudents'))}</div></div>
        <div class="card"><div class="n">${stats.presentStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.presentStudents'))}</div></div>
        <div class="card"><div class="n">${stats.absentStudents}</div><div class="l">${escapeHtml(t('attendanceManagement.absentStudents'))}</div></div>
        <div class="card"><div class="n">${stats.attendanceRate}%</div><div class="l">${escapeHtml(t('attendanceManagement.attendanceRate'))}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('attendanceManagement.childColumn'))}</th>
            <th>${escapeHtml(t('attendanceManagement.arrival'))}</th>
            <th>${escapeHtml(t('attendanceManagement.statusColumn'))}</th>
            <th>${escapeHtml(t('attendanceManagement.notes'))}</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `
}

const updateAttendance = (studentId: string, status: string) => {
  attendanceData.value[studentId] = status
}

const STATUS_CYCLE = ['present', 'late', 'absent'] as const

function cycleAttendance(studentId: string) {
  const current = getAttendanceStatus(studentId)
  const index = STATUS_CYCLE.indexOf(current as (typeof STATUS_CYCLE)[number])
  const next = index === -1 ? STATUS_CYCLE[0] : STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length]
  attendanceData.value[studentId] = next
}

function cardStatusLabel(studentId: string) {
  const status = getAttendanceStatus(studentId)
  return status
    ? t(`attendanceManagement.status.${status}`)
    : t('attendanceManagement.status.present')
}

function cardStatusChipClass(studentId: string) {
  const status = getAttendanceStatus(studentId)
  if (status === 'late') return 'bg-fikr-mist text-navy-800'
  if (status === 'absent') return 'bg-navy-800 text-white'
  return 'bg-primary-500 text-white'
}

const markAllPresent = () => {
  filteredStudents.value.forEach(student => {
    attendanceData.value[student.id] = 'present'
  })
}

const markAllAbsent = () => {
  filteredStudents.value.forEach(student => {
    attendanceData.value[student.id] = 'absent'
  })
}

const resetAttendance = () => {
  attendanceData.value = {}
  attendanceNotes.value = {}
}

const exportAttendance = () => {
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const summaryRows = [...buildSummaryLabelValueRows(), buildExportHeaders(), ...buildStudentExportRows()]

  const ws = XLSX.utils.aoa_to_sheet(summaryRows)
  const wb = XLSX.utils.book_new()
  applyRtlToExcel(wb, ws, isRtl.value)
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

  const fname = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.xlsx`
  XLSX.writeFile(wb, fname)
}

const exportAttendanceWord = () => {
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const supervisor =
    `${currentUser.value?.firstName || ''} ${currentUser.value?.lastName || ''}`.trim() || '—'
  const inner = buildAttendancePdfInnerHtml(supervisor)
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="${locale.value}" dir="${isRtl.value ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${escapeHtml(t('attendanceManagement.title'))}</title></head><body>${inner}</body></html>`
  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.doc`
  a.click()
  URL.revokeObjectURL(url)
}

const printAttendance = async () => {
  if (!selectedGroup.value) {
    alert(t('attendanceManagement.messages.selectGroupFirst'))
    return
  }
  if (filteredStudents.value.length === 0) {
    alert(t('attendanceManagement.messages.noStudentsInGroup'))
    return
  }

  const supervisor =
    `${currentUser.value?.firstName || ''} ${currentUser.value?.lastName || ''}`.trim() || '—'

  const host = document.createElement('div')
  host.setAttribute('dir', isRtl.value ? 'rtl' : 'ltr')
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:794px;padding:20px;background:#ffffff;z-index:-1;'
  host.innerHTML = buildAttendancePdfInnerHtml(supervisor)
  document.body.appendChild(host)

  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width

    let heightLeft = imgH
    let y = 0
    pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH

    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }

    const fname = `attendance_${sanitizeFilenameSegment(selectedGroup.value.name)}_${selectedDate.value}.pdf`
    pdf.save(fname)
  } catch (e) {
    console.error('PDF export failed:', e)
    alert(t('attendanceManagement.messages.pdfExportFailed'))
  } finally {
    host.remove()
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T12:00:00')
  const loc = locale.value === 'ar' ? 'ar-SA' : 'en-US'
  return date.toLocaleDateString(loc, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleExportMenuClickOutside)
  await getCurrentUser()
  await loadGroups()
  await refreshSessionOptions()
  if (groups.value.length > 0 && !selectedGroupId.value) {
    selectedGroupId.value = String(groups.value[0].id)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleExportMenuClickOutside)
})
</script>

