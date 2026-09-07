<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <FikrPageHeader
        :eyebrow="$t('settings.eyebrow')"
        :title="$t('settings.title')"
        :subtitle="$t('settings.subtitle')"
      />

      <div class="fk-grid--4">
        <div class="fk-stat fk-stat--navy">
          <div class="fk-stat__label">{{ $t('settings.stats.totalYears') }}</div>
          <div class="fk-stat__value">{{ yearStats.total }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.activeYears') }}</div>
          <div class="fk-stat__value text-primary-600">{{ yearStats.active }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.semesters') }}</div>
          <div class="fk-stat__value">{{ yearStats.semesters }}</div>
        </div>
        <div class="fk-stat">
          <div class="fk-stat__label">{{ $t('settings.stats.archivedYears') }}</div>
          <div class="fk-stat__value text-fikr-ink-soft">{{ yearStats.archived }}</div>
        </div>
      </div>

      <div class="overflow-hidden fk-card p-5 sm:p-6">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="fk-card__title">{{ $t('systemSettings.schoolInfo') }}</h2>
          </div>
          <button
            type="button"
            :disabled="savingSchoolInfo"
            class="fk-btn fk-btn--primary"
            @click="saveSchoolInfo"
          >
            {{ savingSchoolInfo ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
        <p v-if="schoolInfoError" class="mb-4 text-sm text-red-600">{{ schoolInfoError }}</p>
        <p v-else-if="schoolInfoOk" class="mb-4 text-sm text-emerald-700">{{ schoolInfoOk }}</p>
        <div class="space-y-4">
          <div>
            <label class="fk-label">{{ $t('common.name') }}</label>
            <input
              v-model="schoolInfo.name"
              type="text"
              class="fk-input"
            >
          </div>
          <div>
            <label class="fk-label">{{ $t('students.address') }}</label>
            <input
              v-model="schoolInfo.address"
              type="text"
              class="fk-input"
            >
          </div>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="fk-label">{{ $t('students.phone') }}</label>
              <input
                v-model="schoolInfo.phone"
                type="tel"
                class="fk-input"
              >
            </div>
            <div>
              <label class="fk-label">{{ $t('students.email') }}</label>
              <input
                v-model="schoolInfo.email"
                type="email"
                class="fk-input"
              >
            </div>
          </div>
          <div>
            <label class="fk-label">{{ $t('systemSettings.website') }}</label>
            <input
              v-model="schoolInfo.website"
              type="url"
              class="fk-input"
            >
          </div>
        </div>
      </div>

      <div class="fk-card p-5 sm:p-6">
        <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 class="fk-card__title">{{ $t('settings.academicYears') }}</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative min-w-[12rem] flex-1 sm:flex-none">
              <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fikr-ink-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="$t('settings.searchYears')"
                class="fk-input fk-input--search ps-10"
              >
            </div>
            <select
              v-model="statusFilter"
              :dir="isRTL ? 'rtl' : 'ltr'"
              class="fk-input w-auto"
            >
              <option value="all">{{ $t('settings.allStatuses') }}</option>
              <option value="active">{{ $t('settings.active') }}</option>
              <option value="inactive">{{ $t('settings.inactive') }}</option>
              <option value="archived">{{ $t('settings.archived') }}</option>
            </select>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              @click="showAddYearModal = true"
            >
              {{ $t('settings.addYear') }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12 text-sm text-fikr-ink-soft">
          {{ $t('common.loading') }}
        </div>

        <div v-else-if="filteredYears.length" class="fk-table-wrap overflow-visible">
          <table class="fk-table">
            <thead>
              <tr>
                <th>{{ $t('settings.yearName') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th>{{ $t('settings.period') }}</th>
                <th class="text-center">{{ $t('settings.semesters') }}</th>
                <th class="text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="year in filteredYears" :key="year.id" class="bg-white">
                <td>
                  <div class="font-medium text-fikr-ink">{{ year.year }}</div>
                  <div v-if="year.description" class="fk-card__meta">{{ year.description }}</div>
                </td>
                <td>
                  <span
                    class="fk-chip"
                    :class="yearStatusClass(year)"
                  >
                    {{ $t(`settings.${yearStatus(year)}`) }}
                  </span>
                </td>
                <td class="text-fikr-ink-muted">
                  <div
                    class="flex flex-col gap-0.5"
                    :class="isRTL ? 'items-start text-right' : 'items-start text-left'"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <span>{{ formatDate(year.start_date) }}</span>
                    <span>{{ formatDate(year.end_date) }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="flex w-full justify-center tabular-nums text-fikr-ink-muted">
                    {{ year.semesters?.length || 0 }}
                  </div>
                </td>
                <td class="text-end">
                  <RowActionsMenu
                    :open="activeYearDropdown === year.id"
                    @toggle="toggleYearDropdown(year.id)"
                  >
                    <RowActionsItem icon="edit" @click="editYear(year)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="!year.is_active"
                      icon="activate"
                      @click="activateYear(year)"
                    >
                      {{ $t('settings.activateYear') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="yearStatus(year) !== 'archived'"
                      icon="archive"
                      @click="archiveYear(year)"
                    >
                      {{ $t('settings.archiveYear') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="yearStatus(year) === 'archived'"
                      icon="restore"
                      @click="restoreYear(year)"
                    >
                      {{ $t('settings.restoreYear') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="fk-empty">
          <h3 class="text-sm font-medium text-fikr-ink">{{ $t('settings.noYears') }}</h3>
          <p class="mt-1 text-sm text-fikr-ink-soft">{{ $t('settings.noYearsDescription') }}</p>
          <button
            type="button"
            class="fk-btn fk-btn--primary mt-4"
            @click="showAddYearModal = true"
          >
            {{ $t('settings.createFirstYear') }}
          </button>
        </div>
      </div>

      <div class="fk-card p-5 sm:p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="fk-card__title">{{ $t('settings.semesters') }}</h2>
            <p v-if="semesterYear" class="mt-1 text-sm text-fikr-ink-soft">
              {{ $t('settings.semestersForYear', { year: semesterYear.year }) }}
            </p>
          </div>
          <button
            type="button"
            :disabled="!semesterYear"
            class="fk-btn fk-btn--primary"
            @click="openSemesterModal(semesterYear)"
          >
            {{ $t('settings.addSemester') }}
          </button>
        </div>

        <p v-if="!semesterYear" class="rounded-xl border border-dashed border-fikr-outline bg-fikr-pearl px-4 py-4 text-center text-sm text-fikr-ink-soft">
          {{ $t('settings.activateYearToAddSemesters') }}
        </p>
        <div v-else-if="semesterYear.semesters?.length" class="fk-table-wrap overflow-visible">
          <table class="fk-table">
            <thead>
              <tr>
                <th>{{ $t('settings.semesterTitle') }}</th>
                <th>{{ $t('settings.period') }}</th>
                <th class="text-end">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="semester in semesterYear.semesters" :key="semester.id">
                <td class="font-medium text-fikr-ink">{{ semester.title }}</td>
                <td class="text-fikr-ink-muted">
                  <div
                    class="flex flex-col gap-0.5"
                    :class="isRTL ? 'items-start text-right' : 'items-start text-left'"
                    :dir="isRTL ? 'rtl' : 'ltr'"
                  >
                    <span>{{ formatDate(semester.start_date) }}</span>
                    <span>{{ formatDate(semester.end_date) }}</span>
                  </div>
                </td>
                <td class="text-end">
                  <RowActionsMenu
                    :open="activeSemesterDropdown === semester.id"
                    @toggle="toggleSemesterDropdown(semester.id)"
                  >
                    <RowActionsItem icon="edit" @click="editSemester(semester, semesterYear)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="deleteSemester(semester)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="rounded-xl border border-dashed border-fikr-outline bg-fikr-pearl px-4 py-4 text-center text-sm text-fikr-ink-soft">
          {{ $t('settings.noSemesters') }}
        </p>
      </div>

      <!-- Class Settings Section -->
      <div class="fk-card p-5 sm:p-6">
        <div class="mb-6">
          <h2 class="fk-card__title">{{ $t('classSettings.title') }}</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
          <div class="fk-card--pearl p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.durations.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm fk-btn--tool shrink-0"
                @click="showAddDurationModal = true"
              >
                {{ $t('classSettings.durations.addDuration') }}
              </button>
            </div>
            <p v-if="!classDurations.length" class="rounded-xl border border-dashed border-fikr-outline bg-fikr-pearl px-4 py-4 text-center text-sm text-fikr-ink-soft">
              {{ $t('classSettings.durations.empty') }}
            </p>
            <div v-else class="fk-table-wrap overflow-visible">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('common.name') }}</th>
                    <th class="text-end">{{ $t('common.minutes') }}</th>
                    <th class="text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="duration in classDurations" :key="duration.id">
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-fikr-ink">{{ duration.name }}</span>
                        <span
                          v-if="duration.isDefault"
                          class="fk-chip fk-chip--outline"
                        >
                          {{ $t('classSettings.durations.isDefault') }}
                        </span>
                      </div>
                    </td>
                    <td class="text-end tabular-nums text-fikr-ink-muted">{{ duration.minutes }}</td>
                    <td class="text-end">
                      <RowActionsMenu
                        :open="activeDurationDropdown === duration.id"
                        @toggle="toggleDurationDropdown(duration.id)"
                      >
                        <RowActionsItem icon="edit" @click="editDuration(duration)">
                          {{ $t('common.edit') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="!duration.inUse"
                          icon="delete"
                          danger
                          @click="confirmDeleteDuration(duration)"
                        >
                          {{ $t('common.delete') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="fk-card--pearl p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.startTimes.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm fk-btn--tool shrink-0"
                @click="showStartTimesModal = true"
              >
                {{ $t('common.edit') }}
              </button>
            </div>
            <dl class="divide-y divide-fikr-hairline overflow-hidden rounded-xl border border-fikr-hairline bg-white">
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.schoolStartTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ schoolStartTime }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.firstClassTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ firstClassTime }}</dd>
              </div>
              <div class="flex items-center justify-between gap-4 px-4 py-3">
                <dt class="text-sm text-fikr-ink-muted">{{ $t('classSettings.startTimes.endTime') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ schoolEndTime }}</dd>
              </div>
            </dl>
          </div>

          <div class="fk-card--pearl p-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-fikr-ink">{{ $t('classSettings.timeSlots.title') }}</h3>
              </div>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm fk-btn--tool"
                @click="regenerateTimeSlots"
              >
                {{ $t('classSettings.timeSlots.regenerate') }}
              </button>
            </div>
            <p v-if="!generatedTimeSlots.length" class="rounded-xl border border-dashed border-fikr-outline bg-fikr-pearl px-4 py-4 text-center text-sm text-fikr-ink-soft">
              {{ $t('classSettings.timeSlots.empty') }}
            </p>
            <div v-else class="overflow-hidden rounded-xl border border-fikr-hairline bg-white">
              <table class="fk-table">
                <thead>
                  <tr>
                    <th>{{ $t('classSettings.timeSlots.slot') }}</th>
                    <th>{{ $t('common.time') }}</th>
                    <th class="text-end">{{ $t('common.minutes') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(slot, index) in generatedTimeSlots" :key="slot.id">
                    <td class="tabular-nums text-fikr-ink-soft">{{ index + 1 }}</td>
                    <td class="font-medium tabular-nums text-fikr-ink">{{ slot.startTime }}</td>
                    <td class="text-end tabular-nums text-fikr-ink-muted">{{ slot.duration }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Year Modal -->
      <YearModal
        v-if="showAddYearModal || showEditYearModal"
        :show="showAddYearModal || showEditYearModal"
        :year="editingYear"
        @close="closeYearModal"
        @save="saveYear"
      />

      <!-- Add/Edit Semester Modal -->
      <SemesterModal
        v-if="showSemesterModal"
        :show="showSemesterModal"
        :semester="editingSemester"
        :year="selectedYear"
        @close="closeSemesterModal"
        @save="saveSemester"
      />

      <!-- Progress Dialog -->
      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        :error-message="errorMessage"
        @close="showProgressDialog = false"
      />

      <!-- Duration Modal -->
      <DurationModal
        v-if="showAddDurationModal"
        :duration="editingDuration"
        @close="showAddDurationModal = false; editingDuration = null"
        @save="saveDuration"
      />

      <!-- Start Times Modal -->
      <StartTimesModal
        v-if="showStartTimesModal"
        @close="showStartTimesModal = false"
        @save="saveStartTimes"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import YearModal from '@/components/YearModal.vue'
import SemesterModal from '@/components/SemesterModal.vue'
import DurationModal from '@/components/DurationModal.vue'
import StartTimesModal from '@/components/StartTimesModal.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import {
  academicYearService,
  semesterService,
  classSettingsService,
  scheduleService,
  type AcademicYear,
  type CreateAcademicYearDto,
  type UpdateAcademicYearDto,
  type CreateSemesterDto,
  type UpdateSemesterDto,
  type ClassSettings
} from '@/services'
import { settingsService } from '@/services/settings.service'

const { locale, t } = useI18n()

const schoolInfo = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
  website: '',
})
const savingSchoolInfo = ref(false)
const schoolInfoError = ref('')
const schoolInfoOk = ref('')

async function loadSchoolInfo() {
  try {
    const loaded = await settingsService.getStructuredSettings()
    schoolInfo.value = {
      name: loaded.schoolInfo?.name || '',
      address: loaded.schoolInfo?.address || '',
      phone: loaded.schoolInfo?.phone || '',
      email: loaded.schoolInfo?.email || '',
      website: loaded.schoolInfo?.website || '',
    }
  } catch (err) {
    console.error('Error loading school info:', err)
  }
}

async function saveSchoolInfo() {
  savingSchoolInfo.value = true
  schoolInfoError.value = ''
  schoolInfoOk.value = ''
  try {
    await settingsService.bulkUpdate(
      Object.entries(schoolInfo.value).map(([key, value]) => ({
        key: `schoolInfo.${key}`,
        value,
      })),
    )
    schoolInfoOk.value = t('common.savedSuccessfully')
  } catch (err) {
    console.error('Error saving school info:', err)
    schoolInfoError.value = t('systemSettings.paymentFlagsSaveError')
  } finally {
    savingSchoolInfo.value = false
  }
}

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('all')
const activeYearDropdown = ref<string | null>(null)
const activeSemesterDropdown = ref<string | null>(null)
const activeDurationDropdown = ref<string | number | null>(null)

type YearStatus = 'active' | 'inactive' | 'archived'

const yearStatus = (year: AcademicYear): YearStatus => {
  if (year.is_active) return 'active'
  if (new Date(year.end_date) < new Date()) return 'archived'
  return 'inactive'
}

const yearStatusClass = (year: AcademicYear) => {
  const status = yearStatus(year)
  if (status === 'active') return 'fk-chip--green'
  if (status === 'archived') return 'fk-chip--neutral'
  return 'fk-chip--amber'
}

const showAddYearModal = ref(false)
const showEditYearModal = ref(false)
const showSemesterModal = ref(false)
const editingYear = ref(null)
const editingSemester = ref(null)
const selectedYear = ref(null)

// Class Settings data
const showAddDurationModal = ref(false)
const showStartTimesModal = ref(false)
const editingDuration = ref(null)

// Class settings data (loaded from API)
const classSettings = ref<ClassSettings[]>([])
const usedDurationMinutes = ref<Set<number>>(new Set())
const classDurations = computed(() =>
  classSettings.value
    .filter(setting => setting.setting_type === 'duration')
    .map(setting => ({
      id: setting.id,
      name: setting.name,
      minutes: setting.duration_minutes || 0,
      isDefault: setting.is_default,
      inUse:
        setting.in_use === true ||
        usedDurationMinutes.value.has(setting.duration_minutes || 0),
      color: setting.color || 'blue'
    }))
)

// Start times data
const schoolStartTime = ref('07:30')
const firstClassTime = ref('08:00')
const schoolEndTime = ref('15:00')

// Generated time slots
const generatedTimeSlots = ref([
  { id: '1', startTime: '08:00', duration: 45 },
  { id: '2', startTime: '08:45', duration: 45 },
  { id: '3', startTime: '09:30', duration: 15 },
  { id: '4', startTime: '09:45', duration: 45 },
  { id: '5', startTime: '10:30', duration: 45 },
  { id: '6', startTime: '11:15', duration: 45 },
  { id: '7', startTime: '12:00', duration: 45 },
  { id: '8', startTime: '12:45', duration: 45 },
  { id: '9', startTime: '13:30', duration: 45 },
  { id: '10', startTime: '14:15', duration: 45 }
])

// Academic years data (loaded from API)
const years = ref<AcademicYear[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const activeYear = computed(() => years.value.find(year => year.is_active))
const semesterYear = computed(() => activeYear.value || years.value[0] || null)

const yearStats = computed(() => ({
  total: years.value.length,
  active: years.value.filter((y) => y.is_active).length,
  archived: years.value.filter((y) => new Date(y.end_date) < new Date()).length,
  semesters: activeYear.value?.semesters?.length || 0,
}))

const filteredYears = computed(() => {
  let filtered = years.value

  // Filter by search query
  if (searchQuery.value) {
    filtered = filtered.filter(year =>
      year.year.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      year.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(year => yearStatus(year) === statusFilter.value)
  }

  return filtered
})

// Methods
const stripBidiMarks = (value: string) =>
  value.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  const formatted = date.toLocaleDateString(locale.value === 'ar' ? 'ar-OM-u-ca-gregory' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory'
  })
  return stripBidiMarks(formatted)
}

// API methods
const loadAcademicYears = async () => {
  try {
    loading.value = true
    error.value = null
    years.value = await academicYearService.getAll(1) // Assuming school_id = 1
  } catch (err: any) {
    error.value = err.message || 'Failed to load academic years'
    console.error('Error loading academic years:', err)
  } finally {
    loading.value = false
  }
}

const loadClassSettings = async () => {
  try {
    classSettings.value = await classSettingsService.getAll()
  } catch (err: any) {
    console.error('Error loading class settings:', err)
    // Fallback to empty array if class settings table doesn't exist yet
    classSettings.value = []
  }

  try {
    const schedules = await scheduleService.getAllSchedules()
    usedDurationMinutes.value = new Set(
      (schedules || [])
        .map((schedule) => Number(schedule.duration_minutes))
        .filter((minutes) => Number.isFinite(minutes) && minutes > 0)
    )
  } catch (err) {
    console.error('Error loading schedule duration usage:', err)
  }
}

const toggleYearDropdown = (yearId: string) => {
  activeSemesterDropdown.value = null
  activeDurationDropdown.value = null
  activeYearDropdown.value = activeYearDropdown.value === yearId ? null : yearId
}

const toggleSemesterDropdown = (semesterId: string) => {
  activeYearDropdown.value = null
  activeDurationDropdown.value = null
  activeSemesterDropdown.value = activeSemesterDropdown.value === semesterId ? null : semesterId
}

const toggleDurationDropdown = (durationId: string | number) => {
  activeYearDropdown.value = null
  activeSemesterDropdown.value = null
  activeDurationDropdown.value = activeDurationDropdown.value === durationId ? null : durationId
}

const editYear = (year: any) => {
  editingYear.value = { ...year }
  showEditYearModal.value = true
  activeYearDropdown.value = null
}

const activateYear = async (year: AcademicYear) => {
  try {
    await academicYearService.activate(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to activate year'
    console.error('Error activating year:', err)
  }
  activeYearDropdown.value = null
}

const archiveYear = async (year: AcademicYear) => {
  try {
    await academicYearService.archive(year.id)
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to archive year'
    console.error('Error archiving year:', err)
  }
  activeYearDropdown.value = null
}

const restoreYear = async (year: AcademicYear) => {
  try {
    // For restore, we update to make it active again
    await academicYearService.update(year.id, { is_active: false }) // Just make it inactive, not archived
    await loadAcademicYears() // Reload data
  } catch (err: any) {
    error.value = err.message || 'Failed to restore year'
    console.error('Error restoring year:', err)
  }
  activeYearDropdown.value = null
}

const openSemesterModal = (year: any) => {
  if (!year) return
  selectedYear.value = year
  editingSemester.value = null
  showSemesterModal.value = true
}

const editSemester = (semester: any, year?: AcademicYear) => {
  editingSemester.value = { ...semester }
  selectedYear.value = year || years.value.find((item) => item.id === semester.academic_year_id) || activeYear.value
  showSemesterModal.value = true
  activeSemesterDropdown.value = null
}

const deleteSemester = async (semester: any) => {
  if (confirm('هل أنت متأكد من حذف هذا الفصل الدراسي؟')) {
    try {
      await semesterService.remove(semester.id)
      await loadAcademicYears() // Reload data
    } catch (err: any) {
      error.value = err.message || 'Failed to delete semester'
      console.error('Error deleting semester:', err)
    }
  }
  activeSemesterDropdown.value = null
}

const closeYearModal = () => {
  showAddYearModal.value = false
  showEditYearModal.value = false
  editingYear.value = null
}

const closeSemesterModal = () => {
  showSemesterModal.value = false
  editingSemester.value = null
  selectedYear.value = null
}

const saveYear = async (yearData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingYear.value ? 'تحديث السنة الأكاديمية' : 'إنشاء سنة أكاديمية جديدة'
  progressMessage.value = editingYear.value ? 'جاري تحديث بيانات السنة الأكاديمية...' : 'جاري إنشاء السنة الأكاديمية الجديدة...'

  try {
    if (editingYear.value) {
      // Update existing year
      const updateData: UpdateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.setAsActive || yearData.isActive || yearData.is_active
      }
      await academicYearService.update(editingYear.value.id, updateData)
      progressMessage.value = 'تم تحديث السنة الأكاديمية بنجاح'
    } else {
      // Add new year
      const createData: CreateAcademicYearDto = {
        year: yearData.name || yearData.year,
        start_date: yearData.startDate || yearData.start_date,
        end_date: yearData.endDate || yearData.end_date,
        description: yearData.description,
        is_active: yearData.setAsActive || yearData.isActive || yearData.is_active || false,
        school_id: 1 // Assuming school_id = 1
      }
      await academicYearService.create(createData)
      progressMessage.value = 'تم إنشاء السنة الأكاديمية بنجاح'
    }

    await loadAcademicYears() // Reload data
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeYearModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving year:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

const saveSemester = async (semesterData: any) => {
  showProgressDialog.value = true
  progressState.value = 'loading'
  progressTitle.value = editingSemester.value ? 'تحديث الفصل الدراسي' : 'إنشاء فصل دراسي جديد'
  progressMessage.value = editingSemester.value ? 'جاري تحديث بيانات الفصل الدراسي...' : 'جاري إنشاء الفصل الدراسي الجديد...'

  try {
    if (editingSemester.value) {
      // Update existing semester
      const updateData: UpdateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        is_active: semesterData.isActive || semesterData.is_active
      }
      await semesterService.update(editingSemester.value.id, updateData)
      progressMessage.value = 'تم تحديث الفصل الدراسي بنجاح'
    } else {
      // Add new semester
      const createData: CreateSemesterDto = {
        title: semesterData.title,
        start_date: semesterData.startDate || semesterData.start_date,
        end_date: semesterData.endDate || semesterData.end_date,
        description: semesterData.description,
        academic_year_id: selectedYear.value.id,
        is_active: semesterData.isActive || semesterData.is_active || true
      }
      await semesterService.create(createData)
      progressMessage.value = 'تم إنشاء الفصل الدراسي بنجاح'
    }

    await loadAcademicYears() // Reload data to get updated semesters
    progressState.value = 'success'

    setTimeout(() => {
      showProgressDialog.value = false
      closeSemesterModal()
    }, 1500)

  } catch (err: any) {
    console.error('Error saving semester:', err)
    progressState.value = 'error'
    errorMessage.value = err.message || 'حدث خطأ أثناء العملية'
    progressMessage.value = 'فشل في العملية'

    setTimeout(() => {
      showProgressDialog.value = false
    }, 3000)
  }
}

// Class Settings Methods
const editDuration = (duration: any) => {
  editingDuration.value = duration
  showAddDurationModal.value = true
  activeDurationDropdown.value = null
}

const saveDuration = async (durationData: any) => {
  try {
    if (editingDuration.value?.id) {
      await classSettingsService.updateDuration(editingDuration.value.id, {
        duration: durationData.minutes,
        name: durationData.name,
      })
    } else {
      await classSettingsService.addDuration(durationData.minutes, durationData.name)
    }

    if (durationData.isDefault) {
      await classSettingsService.setDefaultDuration(durationData.minutes)
    }

    await loadClassSettings()
    regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || 'Failed to save duration'
    console.error('Error saving duration:', err)
  }

  showAddDurationModal.value = false
  editingDuration.value = null
}

const confirmDeleteDuration = (duration: any) => {
  activeDurationDropdown.value = null
  if (duration.inUse) return
  if (!confirm(t('classSettings.durations.confirmDelete'))) return
  void deleteDuration(duration)
}

const deleteDuration = async (duration: any) => {
  if (duration?.inUse) {
    error.value = t('classSettings.durations.inUseCannotDelete')
    return
  }

  try {
    await classSettingsService.removeDuration(duration.minutes)
    await loadClassSettings()
    regenerateTimeSlots()
  } catch (err: any) {
    error.value = err.message || t('classSettings.durations.inUseCannotDelete')
    console.error('Error deleting duration:', err)
  }
  showAddDurationModal.value = false
  editingDuration.value = null
}

const saveStartTimes = (startTimesData: any) => {
  schoolStartTime.value = startTimesData.schoolStartTime
  firstClassTime.value = startTimesData.firstClassTime
  schoolEndTime.value = startTimesData.schoolEndTime
  
  showStartTimesModal.value = false
  regenerateTimeSlots()
}

const regenerateTimeSlots = async () => {
  try {
    // Get time slots from API
    const timeSlotData = await classSettingsService.getTimeSlots()

    // Clear existing slots
    generatedTimeSlots.value = []

    // Get default duration
    const defaultDuration = timeSlotData.defaultDuration || 45

    // Generate time slots from first class time to school end time
    const startTime = new Date(`2000-01-01 ${firstClassTime.value}`)
    const endTime = new Date(`2000-01-01 ${schoolEndTime.value}`)

    let currentTime = new Date(startTime)
    let slotId = 1

    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5)

      // Check if we have enough time for a full slot
      const nextTime = new Date(currentTime.getTime() + defaultDuration * 60000)
      if (nextTime <= endTime) {
        generatedTimeSlots.value.push({
          id: slotId.toString(),
          startTime: timeString,
          duration: defaultDuration
        })
      }

      currentTime = nextTime
      slotId++
    }

    // Also save to localStorage for backward compatibility
    try {
      const settingsData = {
        timeSlots: generatedTimeSlots.value,
        classDurations: classDurations.value,
        schoolStartTime: schoolStartTime.value,
        firstClassTime: firstClassTime.value,
        schoolEndTime: schoolEndTime.value
      }
      localStorage.setItem('classSettings', JSON.stringify(settingsData))
    } catch (error) {
      console.warn('Failed to save class settings to localStorage:', error)
    }
  } catch (err: any) {
    console.error('Error regenerating time slots:', err)
    // Fallback to original implementation if API fails
    regenerateTimeSlotsLocal()
  }
}

const regenerateTimeSlotsLocal = () => {
  // Clear existing slots
  generatedTimeSlots.value = []

  // Get default duration
  const defaultDuration = classDurations.value.find(d => d.isDefault)?.minutes || 45

  // Generate time slots from first class time to school end time
  const startTime = new Date(`2000-01-01 ${firstClassTime.value}`)
  const endTime = new Date(`2000-01-01 ${schoolEndTime.value}`)

  let currentTime = new Date(startTime)
  let slotId = 1

  while (currentTime < endTime) {
    const timeString = currentTime.toTimeString().slice(0, 5)

    // Check if we have enough time for a full slot
    const nextTime = new Date(currentTime.getTime() + defaultDuration * 60000)
    if (nextTime <= endTime) {
      generatedTimeSlots.value.push({
        id: slotId.toString(),
        startTime: timeString,
        duration: defaultDuration
      })
    }

    currentTime = nextTime
    slotId++
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (!(event.target as Element).closest('.relative')) {
    activeYearDropdown.value = null
    activeSemesterDropdown.value = null
    activeDurationDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadAcademicYears()
  await loadClassSettings()
  await loadSchoolInfo()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

