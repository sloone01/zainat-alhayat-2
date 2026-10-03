<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
      />

      <div
        v-if="errorMessage && !loading"
        class="fk-alert fk-alert--error"
      >
        {{ errorMessage }}
      </div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ listHeading }}</h2>
            <p class="fk-card__meta">{{ $t('courseManagement.coursesCount', { count: courseTotal }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrToolbarSearch
              v-model="searchQuery"
              :placeholder="$t('courseManagement.searchPlaceholder')"
              :aria-label="$t('common.search')"
              id="courses-search"
            />
            <FikrFilterButton
              :expanded="showFilters"
              :count="drawerFilterCount"
              @click="showFilters = true"
            />
            <div class="relative" data-export-menu>
              <button
                type="button"
                class="fk-iconbtn"
                :aria-label="$t('courseManagement.exportMenu')"
                :aria-expanded="showExportMenu"
                aria-haspopup="true"
                :disabled="exporting"
                @click="toggleExportMenu"
              >
                <IconDownload />
              </button>
              <div
                v-if="showExportMenu"
                role="menu"
                class="absolute end-0 z-30 mt-1 w-44 rounded-xl border border-fikr-hairline bg-white py-1 text-start shadow-product"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
                  @click="onExport('word')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-fikr-mist text-[10px] font-bold text-navy-800">W</span>
                  {{ $t('courseManagement.exportAsWord') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
                  @click="onExport('pdf')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-navy-800 text-[10px] font-bold text-white">PDF</span>
                  {{ $t('courseManagement.exportAsPdf') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-fikr-mist"
                  @click="onExport('excel')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-primary-500 text-[10px] font-bold text-white">XLS</span>
                  {{ $t('courseManagement.exportAsExcel') }}
                </button>
              </div>
            </div>
            <ListViewModeToggle v-model="viewMode" />
            <button
              v-if="canCreateCourse"
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="courseKind === 'standalone' ? $t('standaloneCourses.create') : $t('courseManagement.addCourse')"
              @click="router.push(`${coursesBasePath}/new`)"
            >
              <IconPlus />
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="courseTotal > 0">
            <template>
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <KanbanCard
                v-for="course in paginatedCourses"
                :key="course.id"
                :title="course.title"
                :description="course.description"
              >
                <template #tags>
                  <KanbanTag :dot="courseLifecycleStatus(course) === 'draft' ? 'amber' : 'emerald'">
                    {{ courseDisplayLabel(course) }}
                  </KanbanTag>
                  <KanbanTag dot="sky">
                    {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                  </KanbanTag>
                  <KanbanTag v-if="course.academicYear" dot="primary">
                    {{ course.academicYear.year }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeDropdown === course.id"
                    @toggle="toggleCourseActions(course.id)"
                  >
                    <RowActionsItem
                      v-if="courseLifecycleStatus(course) !== 'draft'"
                      icon="view"
                      @click="viewCourse(course)"
                    >
                      {{ $t('courseManagement.openCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canEditCourse"
                      icon="edit"
                      @click="editCourse(course)"
                    >
                      {{ $t('courseManagement.editCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="courseKind === 'standalone' && courseLifecycleStatus(course) !== 'draft'"
                      icon="view"
                      @click="openMaterials(course)"
                    >
                      {{ $t('courseMaterials.navTitle') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canCreateCourse && courseLifecycleStatus(course) !== 'draft'"
                      icon="clone"
                      @click="duplicateCourse(course)"
                    >
                      {{ $t('courseManagement.duplicateCourse') }}
                    </RowActionsItem>
                    <RowActionsItem
                      v-if="canDeleteCourse && courseLifecycleStatus(course) === 'draft'"
                      icon="delete"
                      danger
                      @click="deleteDraftCourse(course)"
                    >
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
                <template #meta>
                  <KanbanMeta icon="check">{{ phaseCount(course) }} {{ $t('courseManagement.phases') }}</KanbanMeta>
                  <KanbanMeta icon="check">{{ milestoneCount(course) }} {{ $t('courseManagement.milestones') }}</KanbanMeta>
                  <KanbanMeta icon="calendar">{{ course.totalDuration || 0 }} {{ $t('courseManagement.weeks') }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>

            <!-- List -->
            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('courseManagement.courseTitle') }}</th>
                    <th>{{ $t('courseManagement.category') }}</th>
                    <th>{{ $t('courseManagement.status') }}</th>
                    <th>{{ $t('courseManagement.phases') }}</th>
                    <th>{{ $t('courseManagement.milestones') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="course in paginatedCourses"
                    :key="'list-' + course.id"
                  >
                    <td>
                      <div class="font-medium text-gray-900">{{ course.title }}</div>
                      <div v-if="course.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ course.description }}</div>
                    </td>
                    <td class="text-xs text-gray-500">
                      {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                    </td>
                    <td>
                      <span
                        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        :class="getCourseDisplayBadge(course)"
                      >
                        {{ courseDisplayLabel(course) }}
                      </span>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            class="h-full rounded-full bg-primary-500"
                            :style="{ width: `${meterPct(phaseCount(course), maxPhases)}%` }"
                          />
                        </div>
                        <span class="w-6 text-end text-xs tabular-nums text-gray-500">{{ phaseCount(course) }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            class="h-full rounded-full bg-primary-500"
                            :style="{ width: `${meterPct(milestoneCount(course), maxMilestones)}%` }"
                          />
                        </div>
                        <span class="w-6 text-end text-xs tabular-nums text-gray-500">{{ milestoneCount(course) }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="flex justify-end">
                      <RowActionsMenu
                        :open="activeDropdown === course.id"
                        placement="up"
                        @toggle="toggleCourseActions(course.id)"
                      >
                        <RowActionsItem
                          v-if="courseLifecycleStatus(course) !== 'draft'"
                          icon="view"
                          @click="viewCourse(course)"
                        >
                          {{ $t('courseManagement.openCourse') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditCourse"
                          icon="edit"
                          @click="editCourse(course)"
                        >
                          {{ $t('courseManagement.editCourse') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="courseKind === 'standalone' && courseLifecycleStatus(course) !== 'draft'"
                          icon="view"
                          @click="openMaterials(course)"
                        >
                          {{ $t('courseMaterials.navTitle') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canCreateCourse && courseLifecycleStatus(course) !== 'draft'"
                          icon="clone"
                          @click="duplicateCourse(course)"
                        >
                          {{ $t('courseManagement.duplicateCourse') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canDeleteCourse && courseLifecycleStatus(course) === 'draft'"
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
              :show="courseTotal > 0"
              @update:page="goToPage"
            />
            </template>
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ hasActiveFilters ? noFilterMessage : emptyMessage }}</p>
          </div>
        </div>
      </section>

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
              <label class="fk-flabel" for="courses-status"><span>{{ $t('courseManagement.status') }}</span></label>
              <select id="courses-status" v-model="selectedStatus" class="fk-field">
                <option value="">{{ $t('courseManagement.allStatuses') }}</option>
                <option value="active">{{ $t('courseManagement.active') }}</option>
                <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
                <option value="draft">{{ $t('courseManagement.draft') }}</option>
                <option value="published">{{ $t('courseManagement.published') }}</option>
                <option value="archived">{{ $t('courseManagement.archived') }}</option>
              </select>
            </div>
            <div class="fk-form__row">
              <label class="fk-flabel" for="courses-category"><span>{{ $t('courseManagement.category') }}</span></label>
              <select id="courses-category" v-model="selectedCategory" class="fk-field">
                <option value="">{{ $t('courseManagement.allCategories') }}</option>
                <option value="language">{{ $t('courseManagement.language') }}</option>
                <option value="mathematics">{{ $t('courseManagement.mathematics') }}</option>
                <option value="science">{{ $t('courseManagement.science') }}</option>
                <option value="art">{{ $t('courseManagement.art') }}</option>
                <option value="music">{{ $t('courseManagement.music') }}</option>
                <option value="physicalEducation">{{ $t('courseManagement.physicalEducation') }}</option>
                <option value="socialStudies">{{ $t('courseManagement.socialStudies') }}</option>
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

      <ProgressDialog
        :show="showProgressDialog"
        :state="progressState"
        :title="progressTitle"
        :message="progressMessage"
        :error-message="errorMessage"
        @close="showProgressDialog = false"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { useClaims } from '@/composables/useClaims'
import { useFeedback } from '@/composables/useFeedback'
import courseService, { type Course } from '@/services/course.service'
import { courseDisplayStatus, courseLifecycleStatus } from '@/utils/course-status'
import { exportCourseList, type CourseExportKey } from '@/utils/course-list-export'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const { hasClaim, loadClaims } = useClaims()
const feedback = useFeedback()
const canEditCourse = computed(() => hasClaim('courses', 'edit'))
const canCreateCourse = computed(() => hasClaim('courses', 'create'))
const canDeleteCourse = computed(() => hasClaim('courses', 'delete'))

/** Existing product flag: milestone curriculum vs standalone (independent / institute) curriculum. */
const courseKind = computed<'milestone' | 'standalone'>(() =>
  route.meta.courseKind === 'standalone' ? 'standalone' : 'milestone',
)
const coursesBasePath = computed(() =>
  courseKind.value === 'standalone' ? '/standalone-courses' : '/courses',
)
const pageTitle = computed(() =>
  courseKind.value === 'standalone' ? t('standaloneCourses.title') : t('courseManagement.title'),
)
const pageSubtitle = computed(() =>
  courseKind.value === 'standalone'
    ? t('standaloneCourses.subtitle')
    : t('courseManagement.subtitle'),
)
const listHeading = computed(() =>
  courseKind.value === 'standalone'
    ? t('standaloneCourses.listHeading')
    : t('courseManagement.listHeading'),
)
const emptyMessage = computed(() =>
  courseKind.value === 'standalone'
    ? t('standaloneCourses.empty')
    : t('courseManagement.noCourses'),
)
const noFilterMessage = computed(() =>
  courseKind.value === 'standalone'
    ? t('standaloneCourses.noFilterResults')
    : t('courseManagement.noFilterResults'),
)

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => {
  const raw = currentUser.value?.school_id
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined
})

const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const showFilters = ref(false)
const showExportMenu = ref(false)
const exporting = ref(false)
const activeDropdown = ref<string | number | null>(null)

const drawerFilterCount = computed(() =>
  Number(selectedStatus.value !== '') + Number(selectedCategory.value !== ''),
)
const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || drawerFilterCount.value > 0,
)

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
}
const showProgressDialog = ref(false)
const progressState = ref('loading')
const progressTitle = ref('')
const progressMessage = ref('')
const errorMessage = ref('')

const {
  items: paginatedCourses,
  total: courseTotal,
  loading,
  currentPage,
  totalPages,
  goToPage,
  reload: reloadCourses,
} = useServerPagination<Course, { q: string; status: string; category: string; course_kind: string; school_id?: string }>(
  async (params) => {
    errorMessage.value = ''
    const page = await courseService.listPage(params)
    return {
      ...page,
      items: (page.items || []).map((course) => ({
        ...course,
        title: course.name || course.title,
        status: courseLifecycleStatus(course),
        category: course.category || 'general',
      })),
    }
  },
  {
    filters: () => ({
      q: searchQuery.value,
      status: selectedStatus.value,
      category: selectedCategory.value,
      course_kind: courseKind.value,
      school_id: schoolId.value,
    }),
    debounceKeys: ['q'],
    onError: (err) => {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('does not exist')) {
        errorMessage.value = 'Database tables not found. Please run database migrations.'
      } else if (message.includes('connect')) {
        errorMessage.value = 'Cannot connect to database. Please check database connection.'
      } else {
        errorMessage.value = `Database error: ${message || t('courseManagement.loadError')}`
      }
    },
  },
)

watch(courseKind, () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
})

const getCourseDisplayBadge = (course: Course) => {
  const display = courseDisplayStatus(course)
  if (display === 'draft') return 'border-transparent bg-amber-500 text-white'
  if (display === 'inactive') return 'border-transparent bg-slate-400 text-white'
  return 'border-transparent bg-primary-500 text-white'
}

const phaseCount = (course: Course) => {
  if (typeof course.phase_count === 'number') return course.phase_count
  return course.phases?.length || 0
}

const milestoneCount = (course: Course) => {
  if (typeof course.milestone_count === 'number') return course.milestone_count
  return (
    course.phases?.reduce((total, phase) => total + (phase.milestones?.length || 0), 0) || 0
  )
}

const maxPhases = computed(() =>
  Math.max(1, ...paginatedCourses.value.map((course) => phaseCount(course))),
)
const maxMilestones = computed(() =>
  Math.max(1, ...paginatedCourses.value.map((course) => milestoneCount(course))),
)

function meterPct(value: number, max: number) {
  if (max <= 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

const courseDisplayLabel = (course: Course) => {
  const display = courseDisplayStatus(course)
  if (display === 'draft') return t('courseManagement.draft')
  if (display === 'inactive') return t('courseManagement.notActive')
  return t('courseManagement.active')
}

const toggleCourseActions = (courseId: string | number) => {
  showExportMenu.value = false
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
}

function toggleExportMenu() {
  activeDropdown.value = null
  showExportMenu.value = !showExportMenu.value
}

function exportColumnLabel(key: CourseExportKey) {
  if (key === 'title') return t('courseManagement.courseTitle')
  if (key === 'category') return t('courseManagement.category')
  if (key === 'status') return t('courseManagement.status')
  if (key === 'phases') return t('courseManagement.phases')
  return t('courseManagement.milestones')
}

function exportCell(course: Course, key: CourseExportKey) {
  if (key === 'title') return course.title || course.name || ''
  if (key === 'category') {
    return course.category
      ? t(`courseManagement.${course.category}`)
      : t('courseManagement.general')
  }
  if (key === 'status') return courseDisplayLabel(course)
  if (key === 'phases') return String(phaseCount(course))
  return String(milestoneCount(course))
}

async function coursesForExport(): Promise<Course[]> {
  const collected: Course[] = []
  let page = 1
  let pages = 1
  do {
    const result = await courseService.listPage({
      page,
      limit: 100,
      q: searchQuery.value,
      status: selectedStatus.value,
      category: selectedCategory.value,
      course_kind: courseKind.value,
      school_id: schoolId.value,
    })
    collected.push(
      ...(result.items || []).map((course) => ({
        ...course,
        title: course.name || course.title,
        status: courseLifecycleStatus(course),
        category: course.category || 'general',
      })),
    )
    pages = result.pages || 1
    page += 1
  } while (page <= pages && page <= 50)
  return collected
}

async function onExport(format: 'word' | 'pdf' | 'excel') {
  showExportMenu.value = false
  if (exporting.value) return
  exporting.value = true
  try {
    const rows = await coursesForExport()
    const dateSeg = new Date().toISOString().slice(0, 10)
    const stem = courseKind.value === 'standalone' ? 'standalone-courses' : 'courses'
    const result = await exportCourseList({
      format,
      rows,
      locale: locale.value === 'ar' ? 'ar' : 'en',
      rtl: isRTL.value,
      title: pageTitle.value,
      subtitle: listHeading.value,
      filename: `${stem}_${dateSeg}`,
      header: exportColumnLabel,
      cell: exportCell,
    })
    if (result === 'empty') {
      feedback.error(t('courseManagement.exportEmpty'), t('common.error'))
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    feedback.error(message || t('courseManagement.exportFailed'), t('common.error'))
  } finally {
    exporting.value = false
  }
}

const viewCourse = (course: Course) => {
  activeDropdown.value = null
  router.push(`${coursesBasePath.value}/${course.id}`)
}

const editCourse = (course: Course) => {
  router.push(`${coursesBasePath.value}/${course.id}/edit`)
  activeDropdown.value = null
}

const openMaterials = (course: Course) => {
  router.push({ path: '/course-materials', query: { course: String(course.id) } })
  activeDropdown.value = null
}

const duplicateCourse = async (course: Course) => {
  activeDropdown.value = null
  try {
    const suffix = t('courseManagement.copySuffix')
    const base = (course.title || course.name || '').trim()
    const newName = base ? `${base} ${suffix}` : undefined
    const created = await courseService.duplicateCourse(String(course.id), newName)
    await reloadCourses()
    feedback.success(t('courseManagement.duplicateOk'), t('common.success'))
    router.push(`${coursesBasePath.value}/${created.id}/edit`)
  } catch (err: any) {
    feedback.error(err?.message || t('courseManagement.duplicateFailed'), t('common.error'))
  }
}

const deleteDraftCourse = async (course: Course) => {
  activeDropdown.value = null
  if (courseLifecycleStatus(course) !== 'draft') return
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('courseManagement.confirmDelete', { name: course.title }),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  try {
    await courseService.deleteCourse(String(course.id))
    await reloadCourses()
    feedback.success(t('courseManagement.deleteOk'), t('common.success'))
  } catch (err: any) {
    feedback.error(err?.message || t('courseManagement.deleteFailed'), t('common.error'))
  }
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (activeDropdown.value && !target.closest('.relative')) {
    activeDropdown.value = null
  }
  if (showExportMenu.value && !target.closest('[data-export-menu]')) {
    showExportMenu.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadClaims()
  await reloadCourses()
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
