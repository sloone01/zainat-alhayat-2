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
                v-for="course in filteredCourses"
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
                    <p class="mt-0.5 text-xs text-gray-500">{{ courseSecondary(course) }}</p>
                  </div>
                  <span
                    class="inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="course.is_active ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ course.is_active ? $t('courseManagement.active') : $t('courseManagement.inactive') }}
                  </span>
                  <RowActionsMenu
                    :open="activeDropdown === course.id"
                    placement="up"
                    @toggle="toggleCourseActions(course.id)"
                  >
                    <RowActionsItem icon="view" @click="viewCourse(course)">
                      {{ $t('gradedCourses.openCourse') }}
                    </RowActionsItem>
                    <RowActionsItem icon="edit" @click="editCourse(course)">
                      {{ $t('courseManagement.editCourse') }}
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
                    <th class="px-4 py-3 text-start">{{ $t('gradedCourses.aggregation') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('common.status') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="course in filteredCourses" :key="'list-' + course.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ course.name || course.title }}</td>
                    <td class="px-4 py-3 text-xs text-gray-600">{{ courseSecondary(course) }}</td>
                    <td class="px-4 py-3">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        :class="course.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ course.is_active ? $t('courseManagement.active') : $t('courseManagement.inactive') }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeDropdown === course.id"
                          placement="up"
                          @toggle="toggleCourseActions(course.id)"
                        >
                          <RowActionsItem icon="view" @click="viewCourse(course)">
                            {{ $t('gradedCourses.openCourse') }}
                          </RowActionsItem>
                          <RowActionsItem icon="edit" @click="editCourse(course)">
                            {{ $t('courseManagement.editCourse') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import gradedAssessmentService, {
  type GradedCourseWithScheme,
} from '@/services/graded-assessment.service'

const { locale, t } = useI18n()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()

const isRTL = computed(() => locale.value === 'ar')

const currentUser = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    return null
  }
})

const schoolId = computed(() => Number(currentUser.value?.school_id || 1))

const loading = ref(true)
const courses = ref<GradedCourseWithScheme[]>([])
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedAggregation = ref('')
const showFilters = ref(false)
const activeDropdown = ref<string | null>(null)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim().length > 0 || selectedStatus.value !== '' || selectedAggregation.value !== '',
)

function clearFilters() {
  searchQuery.value = ''
  selectedStatus.value = ''
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
  if (selectedStatus.value === 'active') {
    list = list.filter((c) => c.is_active)
  } else if (selectedStatus.value === 'inactive') {
    list = list.filter((c) => !c.is_active)
  }
  if (selectedAggregation.value) {
    list = list.filter(
      (c) => (c.graded_scheme?.aggregation_method || '') === selectedAggregation.value,
    )
  }
  return list
})

function courseSecondary(course: GradedCourseWithScheme): string {
  const year = course.academicYear?.year
  const aggregation =
    course.graded_scheme?.aggregation_method === 'average'
      ? t('gradedCourses.aggregationAverage')
      : t('gradedCourses.aggregationSum')
  return year ? `${year} · ${aggregation}` : aggregation
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

function handleClickOutside(event: Event) {
  if (activeDropdown.value && !(event.target as Element).closest('.relative')) {
    activeDropdown.value = null
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  loading.value = true
  try {
    courses.value = await gradedAssessmentService.list(schoolId.value)
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
