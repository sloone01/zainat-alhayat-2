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
              v-if="courseKind === 'milestone'"
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('courseManagement.exportCourse')"
              @click="exportCourses"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              v-if="canCreateCourse"
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="courseKind === 'standalone' ? $t('standaloneCourses.create') : $t('courseManagement.addCourse')"
              @click="router.push(`${coursesBasePath}/new`)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div class="px-6 py-5">
          <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="mt-3 text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="filteredCourses.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-gray-900">{{ $t('courseManagement.noCourses') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('courseManagement.noCoursesDescription') }}</p>
            <button
              v-if="canCreateCourse"
              type="button"
              class="fk-btn fk-btn--primary mt-5"
              @click="router.push(`${coursesBasePath}/new`)"
            >
              {{ courseKind === 'standalone' ? $t('standaloneCourses.create') : $t('courseManagement.createFirstCourse') }}
            </button>
          </div>

          <template v-else>
            <!-- Cards -->
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="course in filteredCourses"
                :key="course.id"
                class="group relative flex flex-col rounded-2xl border border-gray-200/80 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          :class="getCourseStatusBadge(course.status)"
                        >
                          {{ $t(`courseManagement.${course.status}`) }}
                        </span>
                        <span class="text-[11px] font-medium text-gray-500">
                          {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                        </span>
                        <span
                          v-if="course.academicYear"
                          class="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-800 ring-1 ring-primary-100"
                        >
                          {{ course.academicYear.year }}
                        </span>
                      </div>
                      <h3 class="truncate text-base font-semibold text-gray-900">{{ course.title }}</h3>
                      <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ course.description }}</p>
                    </div>
                    <RowActionsMenu
                      :open="activeDropdown === course.id"
                      @toggle="toggleCourseActions(course.id)"
                    >
                      <RowActionsItem icon="view" @click="viewCourse(course)">
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
                        v-if="courseKind === 'standalone'"
                        icon="view"
                        @click="openMaterials(course)"
                      >
                        {{ $t('courseMaterials.navTitle') }}
                      </RowActionsItem>
                      <RowActionsItem
                        v-if="canCreateCourse"
                        icon="clone"
                        @click="duplicateCourse(course)"
                      >
                        {{ $t('courseManagement.duplicateCourse') }}
                      </RowActionsItem>
                      <RowActionsItem
                        v-if="canEditCourse && course.status === 'draft'"
                        icon="activate"
                        @click="publishCourse(course)"
                      >
                        {{ $t('courseManagement.publishCourse') }}
                      </RowActionsItem>
                    </RowActionsMenu>
                  </div>

                  <div class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ course.phases?.length || 0 }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.phases') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ getTotalMilestones(course) }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.milestones') }}</div>
                    </div>
                    <div class="text-center">
                      <div class="text-lg font-bold tabular-nums text-gray-900">{{ course.totalDuration || 0 }}</div>
                      <div class="text-[10px] font-medium text-gray-500">{{ $t('courseManagement.weeks') }}</div>
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <!-- List -->
            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.courseTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.category') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.status') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.phases') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('courseManagement.milestones') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="course in filteredCourses"
                    :key="'list-' + course.id"
                    class="hover:bg-primary-50/20"
                  >
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ course.title }}</div>
                      <div v-if="course.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ course.description }}</div>
                    </td>
                    <td class="px-4 py-3 text-gray-700">
                      {{ course.category ? $t(`courseManagement.${course.category}`) : $t('courseManagement.general') }}
                    </td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="getCourseStatusBadge(course.status)"
                      >
                        {{ $t(`courseManagement.${course.status}`) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ course.phases?.length || 0 }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ getTotalMilestones(course) }}</td>
                    <td class="px-4 py-3 text-end">
                      <RowActionsMenu
                        :open="activeDropdown === course.id"
                        @toggle="toggleCourseActions(course.id)"
                      >
                        <RowActionsItem icon="view" @click="viewCourse(course)">
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
                          v-if="courseKind === 'standalone'"
                          icon="view"
                          @click="openMaterials(course)"
                        >
                          {{ $t('courseMaterials.navTitle') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canCreateCourse"
                          icon="clone"
                          @click="duplicateCourse(course)"
                        >
                          {{ $t('courseManagement.duplicateCourse') }}
                        </RowActionsItem>
                        <RowActionsItem
                          v-if="canEditCourse && course.status === 'draft'"
                          icon="activate"
                          @click="publishCourse(course)"
                        >
                          {{ $t('courseManagement.publishCourse') }}
                        </RowActionsItem>
                      </RowActionsMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
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
              <label class="fk-flabel" for="courses-search"><span>{{ $t('common.search') }}</span></label>
              <input
                id="courses-search"
                v-model="searchQuery"
                type="search"
                class="fk-field"
                :placeholder="$t('courseManagement.searchPlaceholder')"
              >
            </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { useClaims } from '@/composables/useClaims'
import courseService, { type Course } from '@/services/course.service'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const { hasClaim, loadClaims } = useClaims()
const canEditCourse = computed(() => hasClaim('courses', 'edit'))
const canCreateCourse = computed(() => hasClaim('courses', 'create'))

/** Existing product flag: milestone curriculum vs standalone (paid/extra) curriculum. */
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

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const showFilters = ref(false)
const activeDropdown = ref<string | number | null>(null)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim().length > 0 || selectedStatus.value !== '' || selectedCategory.value !== '',
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
        status: course.is_active ? 'active' : 'inactive',
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

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        (course.description || '').toLowerCase().includes(query),
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter((course) => course.status === selectedStatus.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter((course) => course.category === selectedCategory.value)
  }

  return filtered
})

const getCourseStatusBadge = (status: string) => {
  const badges: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800',
    inactive: 'bg-slate-100 text-slate-700',
    draft: 'bg-amber-100 text-amber-900',
    published: 'bg-primary-100 text-primary-800',
    archived: 'bg-red-100 text-red-800',
  }
  return badges[status] || 'bg-gray-100 text-gray-800'
}

const getTotalMilestones = (course: Course) => {
  return (
    course.phases?.reduce((total, phase) => {
      return total + (phase.milestones?.length || 0)
    }, 0) || 0
  )
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

const duplicateCourse = (course: Course) => {
  const newCourse = {
    ...course,
    id: Date.now(),
    title: `${course.title} (نسخة)`,
    status: 'draft',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
  }
  courses.value.push(newCourse as Course)
  activeDropdown.value = null
}

const publishCourse = (course: Course) => {
  const index = courses.value.findIndex((c) => c.id === course.id)
  if (index !== -1) {
    courses.value[index].status = 'published'
    courses.value[index].lastModified = new Date().toISOString().split('T')[0]
  }
  activeDropdown.value = null
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
