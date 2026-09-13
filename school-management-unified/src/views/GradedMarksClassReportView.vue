<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('reports.gradedClassTitle')"
        :subtitle="$t('reports.gradedClassDesc')"
      >
        <template #leading>
          <router-link
            to="/reports/academic"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToReports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ report?.course_name || $t('reports.gradedClassTitle') }}</h2>
            <p v-if="report" class="fk-card__meta">
              {{ report.group_name }} · {{ $t('gradedMarksGrid.courseTotalMarks') }}: {{ report.total_marks }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :disabled="!groupId || !courseId || loading"
              @click="loadReport"
            >
              {{ loading ? $t('common.loading') : $t('reports.runReport') }}
            </button>
          </div>
        </header>

        <div v-if="report">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-start font-semibold">{{ $t('progressTracking.studentName') }}</th>
                  <th
                    v-for="c in report.criteria"
                    :key="c.id"
                    class="px-2 py-3 text-center font-semibold"
                    :title="c.label"
                  >
                    <div class="mx-auto max-w-[100px] truncate normal-case">{{ c.label }}</div>
                    <div class="font-normal text-gray-400">/{{ c.max_marks }}</div>
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-emerald-800">{{ $t('reports.calculatedScore') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in report.students" :key="s.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.name }}</td>
                  <td
                    v-for="c in report.criteria"
                    :key="`${s.id}-${c.id}`"
                    class="px-2 py-3 text-center tabular-nums text-gray-700"
                  >
                    {{ s.marks[c.id] == null ? '—' : s.marks[c.id] }}
                  </td>
                  <td class="px-4 py-3 text-center font-semibold tabular-nums text-emerald-800">
                    {{ s.course_score }} / {{ s.course_max }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!report.students.length" class="py-12 text-center text-sm text-gray-500">
            {{ $t('gradedMarksGrid.noStudents') }}
          </div>
        </div>
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
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
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
            <label class="fk-flabel" for="class-report-group"><span>{{ $t('progressTracking.selectGroup') }}</span></label>
            <select id="class-report-group" v-model="groupId" class="fk-field" @change="onGroupChange">
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="class-report-course"><span>{{ $t('gradedMarksGrid.selectCourse') }}</span></label>
            <select id="class-report-course" v-model="courseId" class="fk-field" :disabled="!groupId">
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.title }}</option>
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
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { groupService } from '@/services/group.service'
import { scheduleService } from '@/services/schedule.service'
import authService from '@/services/auth.service'
import gradedCriterionMarksService, {
  type ClassMarksReport,
} from '@/services/graded-criterion-marks.service'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const groups = ref<{ id: string; name: string }[]>([])
const courses = ref<{ id: string; title: string }[]>([])
const groupId = ref('')
const courseId = ref('')
const loading = ref(false)
const error = ref('')
const report = ref<ClassMarksReport | null>(null)
const showFilters = ref(false)

const hasActiveFilters = computed(() => Boolean(groupId.value || courseId.value))

function clearFilters() {
  groupId.value = ''
  courseId.value = ''
  courses.value = []
}

async function loadGroups() {
  const all = await groupService.getAll()
  groups.value = all.map((g) => ({ id: g.id, name: g.name }))
}

async function onGroupChange() {
  courseId.value = ''
  courses.value = []
  report.value = null
  if (!groupId.value) return
  const schedules = await scheduleService.getSchedulesByGroup(groupId.value)
  const map = new Map<string, { id: string; title: string }>()
  for (const s of schedules) {
    if (!s.course_id || s.course?.course_kind !== 'graded') continue
    if (map.has(s.course_id)) continue
    map.set(s.course_id, {
      id: s.course_id,
      title: s.course?.name || s.course?.title || s.course_id,
    })
  }
  courses.value = [...map.values()]
}

async function loadReport() {
  if (!groupId.value || !courseId.value) return
  loading.value = true
  error.value = ''
  try {
    report.value = await gradedCriterionMarksService.classReport({
      schoolId: schoolId.value,
      groupId: groupId.value,
      courseId: courseId.value,
    })
  } catch (e: unknown) {
    report.value = null
    error.value = (e as { message?: string })?.message || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadGroups()
})
</script>
