<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('gradedCourses.title')"
        :subtitle="$t('gradedCourses.subtitle')"
      />

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('gradedCourses.listHeading') }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <FikrToolbarSearch
                v-model="searchQuery"
                :placeholder="$t('courseManagement.searchPlaceholder')"
                :aria-label="$t('common.search')"
                id="graded-search"
              />
              <FikrFilterButton
                :expanded="showFilters"
                :count="drawerFilterCount"
                @click="showFilters = true"
              />
              <ListViewModeToggle v-model="viewMode" />
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--primary"
                :aria-label="$t('gradedCourses.addCourse')"
                @click="router.push('/graded-courses/new')"
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
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KanbanCard
                v-for="course in paginatedCourses"
                :key="course.id"
                :title="course.name || course.title"
                :description="[courseLevelLabel(course), courseSecondary(course)].filter(Boolean).join(' · ')"
                :muted="!course.is_active"
              >
                <template #tags>
                  <KanbanTag :dot="course.status === 'draft' ? 'amber' : 'emerald'">
                    {{ courseStatusLabel(course) }}
                  </KanbanTag>
                </template>
                <template #actions>
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
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('gradedCourses.courseName') }}</th>
                    <th>{{ $t('gradedCourses.courseLevel') }}</th>
                    <th>{{ $t('gradedCourses.aggregation') }}</th>
                    <th>{{ $t('common.status') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in paginatedCourses" :key="'list-' + course.id">
                    <td class="font-medium">{{ course.name || course.title }}</td>
                    <td class="text-xs text-gray-600">{{ courseLevelLabel(course) }}</td>
                    <td class="text-xs text-gray-600">{{ courseSecondary(course) }}</td>
                    <td>
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="courseStatusClass(course)"
                      >
                        {{ courseStatusLabel(course) }}
                      </span>
                    </td>
                    <td>
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
              :show="courseTotal > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ hasActiveFilters ? $t('gradedCourses.noFilterResults') : $t('gradedCourses.noCourses') }}</p>
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
import FikrToolbarSearch from '@/components/FikrToolbarSearch.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useServerPagination } from '@/composables/useServerPagination'
import { useClaims } from '@/composables/useClaims'
import { useFeedback } from '@/composables/useFeedback'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'
import { paymentConfigService, type SchoolPaymentLevel } from '@/services/payment-config.service'
import FikrLoader from '@/components/FikrLoader.vue'

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

const levels = ref<SchoolPaymentLevel[]>([])
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedLevelId = ref('')
const selectedAggregation = ref('')
const showFilters = ref(false)
const activeDropdown = ref<string | null>(null)

const drawerFilterCount = computed(() =>
  Number(selectedStatus.value !== '')
  + Number(selectedLevelId.value !== '')
  + Number(selectedAggregation.value !== ''),
)
const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || drawerFilterCount.value > 0,
)

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedLevelId.value = ''
  selectedAggregation.value = ''
}

const {
  items: paginatedCourses,
  total: courseTotal,
  loading,
  currentPage,
  totalPages,
  goToPage,
  reload: reloadCourses,
} = useServerPagination<
  GradedCourseWithScheme,
  { q: string; status: string; level_id: string; aggregation: string; schoolId: string }
>(
  (params) =>
    gradedAssessmentService.listPage({
      schoolId: params.schoolId,
      page: params.page,
      limit: params.limit,
      q: params.q,
      status: params.status,
      level_id: params.level_id,
      aggregation: params.aggregation,
    }),
  {
    filters: () => ({
      q: searchQuery.value,
      status: selectedStatus.value,
      level_id: selectedLevelId.value,
      aggregation: selectedAggregation.value,
      schoolId: schoolId.value,
    }),
    debounceKeys: ['q'],
    enabled: () => Boolean(schoolId.value),
  },
)

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
    await reloadCourses()
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
    await reloadCourses()
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
  if (schoolId.value) await reloadCourses()
  try {
    const schoolLevels = schoolId.value
      ? await paymentConfigService.listLevels(schoolId.value).catch(() => [] as SchoolPaymentLevel[])
      : []
    levels.value = schoolLevels.filter((lv) => lv.is_active !== false)
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
