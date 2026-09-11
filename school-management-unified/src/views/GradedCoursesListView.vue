<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('gradedCourses.title')"
        :subtitle="$t('gradedCourses.subtitle')"
      />

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('gradedCourses.listHeading') }}</h2>
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
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('gradedCourses.addCourse')"
                @click="router.push('/graded-courses/new')"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="courses.length">
            <p
              v-if="filteredCourses.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('gradedCourses.noFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="course in paginatedCourses"
                :key="course.id"
                class="relative rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                :class="!course.is_active ? 'opacity-75' : ''"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-center gap-3 p-5">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ course.name || course.title }}</h3>
                    <p class="mt-0.5 text-xs text-gray-500">{{ courseLevelLabel(course) }}</p>
                    <p class="mt-0.5 text-xs text-gray-500">{{ courseSecondary(course) }}</p>
                  </div>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="courseStatusClass(course)"
                  >
                    {{ courseStatusLabel(course) }}
                  </span>
                  <RowActionsMenu
                    :open="activeDropdown === course.id"
                    placement="up"
                    @toggle="toggleCourseActions(course.id)"
                  >
                    <RowActionsItem
                      v-if="course.status !== 'draft'"
                      icon="view"
                      @click="viewCourse(course)"
                    >
                      {{ $t('gradedCourses.openCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canEditCourse"
                      icon="edit"
                      @click="editCourse(course)"
                    >
                      {{ $t('courseManagement.editCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canCreateCourse && course.status !== 'draft'"
                      icon="clone"
                      @click="duplicateCourse(course)"
                    >
                      {{ $t('gradedCourses.duplicateCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canDeleteCourse && course.status === 'draft'"
                      icon="delete"
                      danger
                      @click="deleteDraftCourse(course)"
                    >
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('gradedCourses.courseName') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('gradedCourses.courseLevel') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('gradedCourses.aggregation') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="course in paginatedCourses" :key="'list-' + course.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ course.name || course.title }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">{{ courseLevelLabel(course) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">{{ courseSecondary(course) }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="courseStatusClass(course)"
                      >
                        {{ courseStatusLabel(course) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeDropdown === course.id"
                          placement="up"
                          @toggle="toggleCourseActions(course.id)"
                        >
                          <RowActionsItem
                            v-if="course.status !== 'draft'"
                            icon="view"
                            @click="viewCourse(course)"
                          >
                            {{ $t('gradedCourses.openCourse') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canEditCourse"
                            icon="edit"
                            @click="editCourse(course)"
                          >
                            {{ $t('courseManagement.editCourse') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canCreateCourse && course.status !== 'draft'"
                            icon="clone"
                            @click="duplicateCourse(course)"
                          >
                            {{ $t('gradedCourses.duplicateCourse') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="canDeleteCourse && course.status === 'draft'"
                            icon="delete"
                            danger
                            @click="deleteDraftCourse(course)"
                          >
                            {{ $t('common.delete') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredCourses.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('gradedCourses.noCourses') }}</p>
          </div>
        </div>
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
              <label class="fk-flabel" for="graded-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="graded-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('courseManagement.searchPlaceholder')"
              >
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="graded-status"><span>{{ $t('courseManagement.status') }}</span></label>
              <select id="graded-status" v-model="selectedStatus" class="fk-field">
                <option value="">{{ $t('courseManagement.allStatuses') }}</option>
                <option value="active">{{ $t('courseManagement.active') }}</option>
                <option value="draft">{{ $t('gradedCourses.draft') }}</option>
                <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="graded-level"><span>{{ $t('gradedCourses.courseLevel') }}</span></label>
              <select id="graded-level" v-model="selectedLevelId" class="fk-field">
                <option value="">{{ $t('gradedCourses.allCourseLevels') }}</option>
                <option v-for="lv in levels" :key="lv.id" :value="lv.id">
                  {{ levelOptionLabel(lv) }}
                </option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="graded-aggregation"><span>{{ $t('gradedCourses.aggregation') }}</span></label>
              <select id="graded-aggregation" v-model="selectedAggregation" class="fk-field">
                <option value="">{{ $t('gradedCourses.allAggregations') }}</option>
                <option value="average">{{ $t('gradedCourses.aggregationAverage') }}</option>
                <option value="sum">{{ $t('gradedCourses.aggregationSum') }}</option>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { useClaims } from '@/composables/useClaims'
import { useFeedback } from '@/composables/useFeedback'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'
import { paymentConfigService, type SchoolPaymentLevel } from '@/services/payment-config.service'

const { locale, t } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()
const { hasClaim, loadClaims } = useClaims()
const feedback = useFeedback()

const isRTL = computed(() => locale.value === 'ar')
const canEditCourse = computed(() => hasClaim('graded_courses', 'edit'))
const canDeleteCourse = computed(() => hasClaim('graded_courses', 'delete'))
const canCreateCourse = computed(() => hasClaim('graded_courses', 'create'))

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => String(currentUser.value?.school_id || ''))

const loading = ref(true)
const courses = ref<GradedCourseWithScheme[]>([])
const levels = ref<SchoolPaymentLevel[]>([])
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedLevelId = ref('')
const selectedAggregation = ref('')
const showFilters = ref(false)
const activeDropdown = ref<string | null>(null)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim().length > 0
  || selectedStatus.value !== ''
  || selectedLevelId.value !== ''
  || selectedAggregation.value !== '',
)

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedLevelId.value = ''
  selectedAggregation.value = ''
}

const filteredCourses = computed(() => {
  let list = courses.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) => {
      const name = (c.name || c.title || '').toLowerCase()
      const desc = (c.description || '').toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }
  if (selectedStatus.value === 'draft') {
    list = list.filter((c) => c.status === 'draft')
  } else if (selectedStatus.value === 'active') {
    list = list.filter((c) => c.is_active && c.status !== 'draft')
  } else if (selectedStatus.value === 'inactive') {
    list = list.filter((c) => !c.is_active && c.status !== 'draft')
  }
  if (selectedLevelId.value) {
    list = list.filter((c) => String(c.level_id || '') === selectedLevelId.value)
  }
  if (selectedAggregation.value) {
    list = list.filter(
      (c) => (c.graded_scheme?.aggregation_method || '') === selectedAggregation.value,
    )
  }
  return list
})

const {
  currentPage,
  paginatedItems: paginatedCourses,
  totalPages,
  goToPage,
} = useClientPagination(filteredCourses)

watch([searchQuery, selectedStatus, selectedLevelId, selectedAggregation], () => {
  currentPage.value = 1
})

function courseStatusLabel(course: GradedCourseWithScheme): string {
  if (course.status === 'draft') return t('gradedCourses.draft')
  return course.is_active ? t('courseManagement.active') : t('courseManagement.inactive')
}

function courseStatusClass(course: GradedCourseWithScheme): string {
  if (course.status === 'draft') return 'bg-amber-50 text-amber-900 ring-1 ring-amber-100'
  return course.is_active
    ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
    : 'bg-gray-100 text-gray-500'
}

function courseSecondary(course: GradedCourseWithScheme): string {
  const year = course.academicYear?.year
  const aggregation =
    course.graded_scheme?.aggregation_method === 'average'
      ? t('gradedCourses.aggregationAverage')
      : t('gradedCourses.aggregationSum')
  return year ? `${year} · ${aggregation}` : aggregation
}

function levelOptionLabel(lv: { code?: string; name?: string }): string {
  const code = (lv.code || '').trim()
  const name = (lv.name || '').trim()
  if (code && name && code !== name) return `${code} — ${name}`
  return name || code
}

function courseLevelLabel(course: GradedCourseWithScheme): string {
  const fromRelation = course.level
  const lv =
    fromRelation
    || levels.value.find((item) => item.id === course.level_id)
  if (!lv) return '—'
  return levelOptionLabel(lv)
}

function toggleCourseActions(courseId: string) {
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

function viewCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  router.push(`/graded-courses/${course.id}/edit`)
}

function editCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  router.push(`/graded-courses/${course.id}/edit`)
}

async function duplicateCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  try {
    const suffix = t('gradedCourses.copySuffix')
    const base = (course.title || course.name || '').trim()
    const newName = base ? `${base} ${suffix}` : undefined
    const created = await gradedAssessmentService.duplicate(
      String(course.id),
      schoolId.value,
      newName,
    )
    courses.value = [created, ...courses.value.filter((c) => c.id !== created.id)]
    feedback.success(t('gradedCourses.duplicateOk'), t('common.success'))
    router.push(`/graded-courses/${created.id}/edit`)
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String((err as Error).message)
        : t('gradedCourses.duplicateFailed')
    feedback.error(msg, t('common.error'))
  }
}

async function deleteDraftCourse(course: GradedCourseWithScheme) {
  activeDropdown.value = null
  if (course.status !== 'draft') return
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('gradedCourses.confirmDelete', {
      name: course.name || course.title || '',
    }),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  try {
    await gradedAssessmentService.deleteDraft(String(course.id), schoolId.value)
    courses.value = courses.value.filter((c) => c.id !== course.id)
    feedback.success(t('gradedCourses.deleteOk'), t('common.success'))
  } catch (err: unknown) {
    const msg =
      err && typeof err === 'object' && 'message' in err
        ? String((err as Error).message)
        : t('gradedCourses.deleteFailed')
    feedback.error(msg, t('common.error'))
  }
}

function handleClickOutside(event: Event) {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadClaims()
  loading.value = true
  try {
    const [list, schoolLevels] = await Promise.all([
      gradedAssessmentService.list(schoolId.value),
      schoolId.value
        ? paymentConfigService.listLevels(schoolId.value).catch(() => [] as SchoolPaymentLevel[])
        : Promise.resolve([] as SchoolPaymentLevel[]),
    ])
    courses.value = list
    levels.value = schoolLevels.filter((lv) => lv.is_active !== false)
  } catch (e) {
    console.error(e)
    courses.value = []
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
