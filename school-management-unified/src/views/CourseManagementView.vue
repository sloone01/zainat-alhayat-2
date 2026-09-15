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

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ listHeading }}</h2>
            <p class="fk-card__meta">{{ $t('courseManagement.coursesCount', { count: filteredCourses.length }) }}</p>
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
            <ListViewModeToggle v-model="viewMode" />
            <button
              v-if="courseKind === 'milestone'"
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('courseManagement.exportCourse')"
              @click="exportCourses"
            >
              <IconDownload />
            </button>
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
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="courses.length">
            <p
              v-if="filteredCourses.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ noFilterMessage }}
            </p>
            <template v-else>
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
                  <KanbanMeta icon="check">{{ course.phases?.length || 0 }} {{ $t('courseManagement.phases') }}</KanbanMeta>
                  <KanbanMeta icon="check">{{ getTotalMilestones(course) }} {{ $t('courseManagement.milestones') }}</KanbanMeta>
                  <KanbanMeta icon="calendar">{{ course.totalDuration || 0 }} {{ $t('courseManagement.weeks') }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>

            <!-- List -->
            <div v-else class="fk-table-wrap overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow class="hover:bg-transparent">
                    <TableHead>{{ $t('courseManagement.courseTitle') }}</TableHead>
                    <TableHead>{{ $t('courseManagement.category') }}</TableHead>
                    <TableHead>{{ $t('courseManagement.status') }}</TableHead>
                    <TableHead>{{ $t('courseManagement.phases') }}</TableHead>
                    <TableHead>{{ $t('courseManagement.milestones') }}</TableHead>
                    <TableHead class="text-end">{{ $t('common.actions') }}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="course in paginatedCourses"
                    :key="'list-' + course.id"
                  >
                    <TableCell>
                      <div class="font-medium text-gray-900">{{ course.title }}</div>
                      <div v-if="course.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ course.description }}</div>
                    </TableCell>
                    <TableCell class="text-xs text-gray-500">
                      {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                    </TableCell>
                    <TableCell>
                      <span
                        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        :class="getCourseDisplayBadge(course)"
                      >
                        {{ courseDisplayLabel(course) }}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            class="h-full rounded-full bg-primary-500"
                            :style="{ width: `${meterPct(course.phases?.length || 0, maxPhases)}%` }"
                          />
                        </div>
                        <span class="w-6 text-end text-xs tabular-nums text-gray-500">{{ course.phases?.length || 0 }}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="flex items-center gap-2">
                        <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            class="h-full rounded-full bg-primary-500"
                            :style="{ width: `${meterPct(getTotalMilestones(course), maxMilestones)}%` }"
                          />
                        </div>
                        <span class="w-6 text-end text-xs tabular-nums text-gray-500">{{ getTotalMilestones(course) }}</span>
                      </div>
                    </TableCell>
                    <TableCell class="text-end">
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
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredCourses.length > 0"
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
            <p class="text-sm font-medium text-gray-600">{{ emptyMessage }}</p>
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useClientPagination } from '@/composables/useClientPagination'
import { useClaims } from '@/composables/useClaims'
import { useFeedback } from '@/composables/useFeedback'
import courseService, { type Course } from '@/services/course.service'
import { courseActivity, courseDisplayStatus, courseLifecycleStatus } from '@/utils/course-status'

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
const activeDropdown = ref<string | number | null>(null)

const drawerFilterCount = computed(() =>
  Number(selectedStatus.value !== '') + Number(selectedCategory.value !== ''),
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

const courses = ref<Course[]>([])
const loading = ref(false)

const loadCourses = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await courseService.getAllCourses(schoolId.value, courseKind.value)

    if (response && Array.isArray(response)) {
      courses.value = response.map((course) => ({
        ...course,
        title: course.name || course.title,
        status: courseLifecycleStatus(course),
        category: course.category || 'general',
      }))
    } else {
      courses.value = []
      errorMessage.value = 'Database connection error. Please check your database setup.'
    }
  } catch (error: unknown) {
    courses.value = []
    const err = error as Error
    if (err.message?.includes('does not exist')) {
      errorMessage.value = 'Database tables not found. Please run database migrations.'
    } else if (err.message?.includes('connect')) {
      errorMessage.value = 'Cannot connect to database. Please check database connection.'
    } else {
      errorMessage.value = `Database error: ${err.message || t('courseManagement.loadError')}`
    }
  } finally {
    loading.value = false
  }
}

const filteredCourses = computed(() => {
  let filtered = courses.value

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    filtered = filtered.filter((course) => {
      const title = (course.title || course.name || '').toLowerCase()
      const description = (course.description || '').toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }

  if (selectedStatus.value) {
    if (selectedStatus.value === 'inactive') {
      filtered = filtered.filter((course) => courseActivity(course) === 'inactive')
    } else if (selectedStatus.value === 'active') {
      filtered = filtered.filter(
        (course) =>
          courseLifecycleStatus(course) === 'active' && courseActivity(course) === 'active',
      )
    } else {
      filtered = filtered.filter(
        (course) => courseLifecycleStatus(course) === selectedStatus.value,
      )
    }
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((course) => course.category === selectedCategory.value)
  }

  return filtered
})

const {
  currentPage,
  paginatedItems: paginatedCourses,
  totalPages,
  goToPage,
} = useClientPagination(filteredCourses)

watch([searchQuery, selectedStatus, selectedCategory], () => {
  currentPage.value = 1
})

watch(courseKind, () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
  void loadCourses()
})

const getCourseDisplayBadge = (course: Course) => {
  const display = courseDisplayStatus(course)
  if (display === 'draft') return 'border-transparent bg-amber-500 text-white'
  if (display === 'inactive') return 'border-transparent bg-slate-400 text-white'
  return 'border-transparent bg-primary-500 text-white'
}

const getTotalMilestones = (course: Course) => {
  return (
    course.phases?.reduce((total, phase) => {
      return total + (phase.milestones?.length || 0)
    }, 0) || 0
  )
}

const maxPhases = computed(() =>
  Math.max(1, ...filteredCourses.value.map((course) => course.phases?.length || 0)),
)
const maxMilestones = computed(() =>
  Math.max(1, ...filteredCourses.value.map((course) => getTotalMilestones(course))),
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
  activeDropdown.value = activeDropdown.value === courseId ? null : courseId
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
    courses.value = [created, ...courses.value.filter((c) => c.id !== created.id)]
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
    courses.value = courses.value.filter((c) => c.id !== course.id)
    feedback.success(t('courseManagement.deleteOk'), t('common.success'))
  } catch (err: any) {
    feedback.error(err?.message || t('courseManagement.deleteFailed'), t('common.error'))
  }
}

const exportCourses = () => {
  console.log('Exporting courses...')
}

const handleClickOutside = (event: Event) => {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await loadClaims()
  await loadCourses()
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
