<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('courseMaterials.title')"
        :subtitle="selectedCourse ? selectedCourse.name : $t('courseMaterials.selectCourseHint')"
      >
        <template v-if="selectedCourse" #leading>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('common.back')"
            @click="closeCourse"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </template>
      </FikrPageHeader>

      <div v-if="!selectedCourse" class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('courseMaterials.coursesHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('courseMaterials.coursesCount', { count: filteredCourses.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>
        <div class="p-6">
          <div v-if="loadingCourses" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-soft">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else-if="loadError" class="fk-alert fk-alert--error">{{ loadError }}</div>
          <div v-else-if="!filteredCourses.length" class="fk-empty">
            <div class="fk-empty__icon">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <h3 class="fk-empty__title">{{ $t('courseMaterials.noCourses') }}</h3>
          </div>
          <template v-else>
            <div v-if="isCards" class="fk-grid">
              <KanbanCard
                v-for="c in paginatedCourses"
                :key="c.id"
                as="button"
                :title="c.name"
                @click="openCourse(c)"
              >
                <template #tags>
                  <KanbanTag dot="primary">{{ kindLabel(c.course_kind) }}</KanbanTag>
                </template>
                <template #meta>
                  <KanbanMeta icon="paperclip">{{ $t('courseMaterials.filesCount', { count: c.materials_count }) }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>
            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('gradedCourses.courseName') }}</th>
                    <th>{{ $t('courseMaterials.kindLabel') }}</th>
                    <th>{{ $t('courseMaterials.listHeading') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="c in paginatedCourses"
                    :key="'list-' + c.id"
                    class="cursor-pointer"
                    @click="openCourse(c)"
                  >
                    <td class="font-medium text-fikr-ink">{{ c.name }}</td>
                    <td class="text-fikr-ink-muted">{{ kindLabel(c.course_kind) }}</td>
                    <td class="text-fikr-ink-muted">{{ $t('courseMaterials.filesCount', { count: c.materials_count }) }}</td>
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
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="fk-elev overflow-visible p-0">
          <header
            class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6"
          >
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('courseMaterials.listHeading') }}</h2>
            </div>
            <button
              v-if="canManage && !loadingMaterials && !hasPhases"
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              :disabled="savingTopic"
              @click="addTopic"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ $t('courseMaterials.addTopic') }}
            </button>
          </header>
          <div v-if="loadingMaterials" class="flex flex-col items-center justify-center gap-3 py-12 text-fikr-ink-soft">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>
          <div v-else class="space-y-3 p-4 sm:p-5">
            <div
              v-if="!hasPhases && !topics.length && !unassignedFiles.length"
              class="fk-empty min-h-[16rem]"
            >
              <div class="fk-empty__icon">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="fk-empty__title">{{ $t('courseMaterials.noTopics') }}</h3>
              <p class="fk-empty__desc">{{ $t('courseMaterials.noTopicsDescription') }}</p>
              <button
                v-if="canManage"
                type="button"
                class="fk-btn fk-btn--primary fk-btn--sm mt-4"
                :disabled="savingTopic"
                @click="addTopic"
              >
                {{ $t('courseMaterials.createFirstTopic') }}
              </button>
            </div>

            <article
              v-for="(section, index) in displaySections"
              :key="section.key"
              class="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
              :class="openSectionKey === section.key ? 'border-primary-200 ring-primary-100' : ''"
            >
              <header
                class="flex cursor-pointer items-start justify-between gap-2 px-4 py-3 hover:bg-gray-50/80"
                :class="openSectionKey === section.key ? 'border-b border-gray-100 bg-primary-50/40' : ''"
                @click="toggleSection(section.key)"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                    {{ index + 1 }}
                  </span>
                  <div class="min-w-0">
                    <h4 class="truncate text-sm font-semibold text-gray-900">
                      {{ section.title || $t('courseMaterials.topicFallback', { n: index + 1 }) }}
                    </h4>
                    <p class="mt-0.5 text-[11px] text-gray-500">
                      {{ $t('courseMaterials.filesCount', { count: section.files.length }) }}
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-1" @click.stop>
                  <button
                    v-if="canManage && section.kind === 'topic'"
                    type="button"
                    class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                    :aria-label="$t('common.delete')"
                    @click="deleteTopic(section.id)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    :aria-expanded="openSectionKey === section.key"
                    @click="toggleSection(section.key)"
                  >
                    <svg
                      class="h-4 w-4 transition-transform duration-200"
                      :class="openSectionKey === section.key ? 'rotate-180' : ''"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </header>

              <div v-if="openSectionKey === section.key" class="space-y-4 p-4">
                <div v-if="canManage && section.kind === 'topic'" class="space-y-2">
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`material-topic-title-${section.id}`">
                    {{ $t('courseMaterials.topicTitle') }}
                  </label>
                  <input
                    :id="`material-topic-title-${section.id}`"
                    :value="section.title"
                    :placeholder="$t('courseMaterials.topicTitlePlaceholder')"
                    class="fk-field"
                    @input="onTopicTitleInput(section.id, $event)"
                    @blur="saveTopicTitle(section.id)"
                  >
                </div>
                <form
                  v-if="canManage && section.showUpload && drafts[section.key]"
                  class="rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-4"
                  @submit.prevent="submitUpload(section)"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div class="min-w-0 sm:w-56">
                      <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`material-file-${section.key}`">
                        {{ $t('courseMaterials.file') }} *
                      </label>
                      <input
                        :id="`material-file-${section.key}`"
                        type="file"
                        required
                        :accept="accept"
                        class="block w-full text-sm text-gray-700 file:me-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-800"
                        @change="onFileChange(section.key, $event)"
                      >
                    </div>
                    <div class="min-w-0 flex-1">
                      <label class="mb-1.5 block text-xs font-medium text-gray-600" :for="`material-title-${section.key}`">
                        {{ $t('courseMaterials.materialTitle') }} *
                      </label>
                      <input
                        :id="`material-title-${section.key}`"
                        v-model="drafts[section.key].title"
                        required
                        class="fk-field"
                      >
                    </div>
                    <button
                      type="submit"
                      class="fk-btn fk-btn--primary shrink-0"
                      :disabled="drafts[section.key].uploading || !drafts[section.key].file"
                    >
                      {{ drafts[section.key].uploading ? $t('common.saving') : $t('courseMaterials.upload') }}
                    </button>
                  </div>
                  <p v-if="drafts[section.key].error" class="mt-2 text-sm text-red-600">{{ drafts[section.key].error }}</p>
                </form>

                <p v-if="!section.files.length" class="py-4 text-center text-sm text-gray-500">
                  {{ $t('courseMaterials.noFilesInSection') }}
                </p>
                <AnimatedList
                  v-else
                  :items="section.files"
                  :delay="160"
                  :reset-key="section.key"
                >
                  <template #default="{ item: m }">
                    <div class="relative mx-auto flex w-full items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.04)] transition-colors duration-200 hover:border-primary-300 hover:bg-primary-50/50">
                      <button
                        type="button"
                        class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 p-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500/40"
                        :aria-label="$t('courseMaterials.download')"
                        @click="download(m)"
                      >
                        <div
                          class="flex size-10 shrink-0 items-center justify-center rounded-2xl text-white"
                          :style="{ backgroundColor: fileAccent(m.title) }"
                          aria-hidden="true"
                        >
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex flex-wrap items-baseline gap-x-1.5 text-fikr-ink">
                            <span class="truncate text-sm font-medium">{{ m.title }}</span>
                            <span class="text-gray-400" aria-hidden="true">·</span>
                            <span class="shrink-0 text-xs tabular-nums text-gray-500">{{ formatSize(m.file_size) }}</span>
                          </div>
                          <p class="mt-0.5 truncate text-sm text-fikr-ink-muted">{{ m.original_filename }}</p>
                          <p v-if="m.description" class="mt-0.5 truncate text-xs text-fikr-ink-soft">{{ m.description }}</p>
                          <p v-if="!m.is_visible" class="mt-0.5 truncate text-xs text-amber-700">{{ $t('courseMaterials.hidden') }}</p>
                        </div>
                      </button>
                      <button
                        v-if="canManage"
                        type="button"
                        class="me-3 inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                        :aria-label="$t('common.delete')"
                        @click="remove(m)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </template>
                </AnimatedList>
              </div>
            </article>
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
              <label class="fk-flabel" for="materials-kind"><span>{{ $t('courseMaterials.allKinds') }}</span></label>
              <select id="materials-kind" v-model="kindFilter" class="fk-field">
                <option value="">{{ $t('courseMaterials.allKinds') }}</option>
                <option value="milestone">{{ $t('courseMaterials.kindMilestone') }}</option>
                <option value="graded">{{ $t('courseMaterials.kindGraded') }}</option>
                <option value="standalone">{{ $t('courseMaterials.kindStandalone') }}</option>
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
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { getErrorMessage } from '@/utils/error-reporting'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import { useListViewMode } from '@/composables/useListViewMode'
import { useFeedback } from '@/composables/useFeedback'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import AnimatedList from '@/components/ui/animated-list.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import authService from '@/services/auth.service'
import { getStoredSchoolId } from '@/utils/auth-token'
import courseMaterialService, {
  COURSE_MATERIAL_ACCEPT,
  type CourseMaterialCourseRow,
  type CourseMaterialPhaseRow,
  type CourseMaterialRow,
  type CourseMaterialTopicRow,
} from '@/services/course-material.service'

type SectionKind = 'phase' | 'topic' | 'unassigned'
type MaterialSection = {
  key: string
  kind: SectionKind
  id: string | null
  title: string
  files: CourseMaterialRow[]
  showUpload: boolean
}
type UploadDraft = {
  file: File | null
  title: string
  uploading: boolean
  error: string
}

const { t, locale } = useI18n()
const route = useRoute()
const feedback = useFeedback()
const { viewMode, isCards } = useListViewMode()
const isRTL = computed(() => locale.value === 'ar')
const user = computed(() => authService.getStoredUser())
const schoolId = computed(() => {
  const u = user.value as { role?: string; user_type?: string } | null
  if (
    u?.role === 'parent' ||
    u?.user_type === 'parent' ||
    u?.role === 'student' ||
    u?.user_type === 'student'
  ) {
    return undefined
  }
  return getStoredSchoolId()
})
const canManage = computed(
  () => user.value?.role === 'admin' || user.value?.role === 'teacher',
)
const accept = COURSE_MATERIAL_ACCEPT

const courses = ref<CourseMaterialCourseRow[]>([])
const kindFilter = ref('')
const showFilters = ref(false)
const loadingCourses = ref(false)
const loadError = ref('')
const hasActiveFilters = computed(() => kindFilter.value !== '')
function clearFilters() {
  kindFilter.value = ''
}

const selectedCourse = ref<CourseMaterialCourseRow | null>(null)
const materials = ref<CourseMaterialRow[]>([])
const phases = ref<CourseMaterialPhaseRow[]>([])
const topics = ref<CourseMaterialTopicRow[]>([])
const loadingMaterials = ref(false)
const openSectionKey = ref('')
const savingTopic = ref(false)
const drafts = reactive<Record<string, UploadDraft>>({})

const hasPhases = computed(() => phases.value.length > 0)

const filteredCourses = computed(() => {
  if (!kindFilter.value) return courses.value
  return courses.value.filter((c) => c.course_kind === kindFilter.value)
})

const {
  currentPage,
  paginatedItems: paginatedCourses,
  totalPages,
  goToPage,
} = useClientPagination(filteredCourses)

watch(kindFilter, () => {
  currentPage.value = 1
})

const unassignedFiles = computed(() =>
  materials.value.filter((m) => !m.phase_id && !m.topic_id),
)

const displaySections = computed<MaterialSection[]>(() => {
  const sections: MaterialSection[] = []
  if (hasPhases.value) {
    phases.value.forEach((phase, i) => {
      sections.push({
        key: `phase:${phase.id}`,
        kind: 'phase',
        id: phase.id,
        title: phase.name || t('courseMaterials.phaseFallback', { n: i + 1 }),
        files: materials.value.filter((m) => m.phase_id === phase.id),
        showUpload: canManage.value,
      })
    })
  } else {
    topics.value.forEach((topic) => {
      sections.push({
        key: `topic:${topic.id}`,
        kind: 'topic',
        id: topic.id,
        title: topic.title,
        files: materials.value.filter((m) => m.topic_id === topic.id),
        showUpload: canManage.value,
      })
    })
  }
  if (unassignedFiles.value.length) {
    sections.push({
      key: 'unassigned',
      kind: 'unassigned',
      id: null,
      title: t('courseMaterials.unassigned'),
      files: unassignedFiles.value,
      showUpload: false,
    })
  }
  return sections
})

function ensureDraft(key: string) {
  if (!drafts[key]) {
    drafts[key] = { file: null, title: '', uploading: false, error: '' }
  }
}

watch(
  displaySections,
  (sections) => {
    for (const section of sections) ensureDraft(section.key)
    if (!sections.length) {
      openSectionKey.value = ''
      return
    }
    if (!sections.some((s) => s.key === openSectionKey.value)) {
      openSectionKey.value = sections[0].key
    }
  },
  { immediate: true },
)

function toggleSection(key: string) {
  openSectionKey.value = openSectionKey.value === key ? '' : key
}

function kindLabel(kind: string) {
  if (kind === 'graded') return t('courseMaterials.kindGraded')
  if (kind === 'standalone') return t('courseMaterials.kindStandalone')
  return t('courseMaterials.kindMilestone')
}

const FILE_ACCENTS = ['#00A19B', '#0A2147', '#0284c7', '#d97706', '#7c3aed', '#db2777', '#059669']

function fileAccent(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0
  }
  return FILE_ACCENTS[hash % FILE_ACCENTS.length]
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function closeCourse() {
  selectedCourse.value = null
  materials.value = []
  phases.value = []
  topics.value = []
  openSectionKey.value = ''
}

async function openQueryCourse() {
  const q = String(route.query.course || '').trim()
  if (!q) return
  if (selectedCourse.value?.id === q) return
  const match = courses.value.find((c) => c.id === q)
  if (match) {
    await openCourse(match)
    return
  }
  await openCourse({
    id: q,
    name: '',
    course_kind: 'milestone',
    materials_count: 0,
  })
}

async function loadCourses() {
  loadingCourses.value = true
  loadError.value = ''
  try {
    courses.value = await courseMaterialService.listCourses(schoolId.value)
  } catch (e: unknown) {
    courses.value = []
    loadError.value = getErrorMessage(e, t('courseMaterials.loadError'))
  } finally {
    loadingCourses.value = false
  }
  await openQueryCourse()
}

async function openCourse(c: CourseMaterialCourseRow) {
  selectedCourse.value = c
  await loadBoard()
}

async function loadBoard() {
  if (!selectedCourse.value) return
  loadingMaterials.value = true
  try {
    const board = await courseMaterialService.board(
      schoolId.value,
      selectedCourse.value.id,
    )
    phases.value = board.phases || []
    topics.value = board.topics || []
    materials.value = board.materials || []
    if (selectedCourse.value && !selectedCourse.value.name) {
      const named = materials.value.find((m) => m.course_name)?.course_name
      if (named) {
        selectedCourse.value = { ...selectedCourse.value, name: named }
      }
    }
  } catch (e: unknown) {
    phases.value = []
    topics.value = []
    materials.value = []
    feedback.error(getErrorMessage(e, t('courseMaterials.loadError')), t('common.error'))
  } finally {
    loadingMaterials.value = false
  }
}

function onFileChange(key: string, e: Event) {
  ensureDraft(key)
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] || null
  drafts[key].file = f
  if (f && !drafts[key].title) {
    drafts[key].title = f.name.replace(/\.[^.]+$/, '')
  }
}

async function submitUpload(section: MaterialSection) {
  if (!selectedCourse.value) return
  ensureDraft(section.key)
  const draft = drafts[section.key]
  if (!draft.file) return
  draft.uploading = true
  draft.error = ''
  try {
    await courseMaterialService.upload({
      schoolId: schoolId.value,
      courseId: selectedCourse.value.id,
      title: draft.title,
      file: draft.file,
      phaseId: section.kind === 'phase' ? section.id || undefined : undefined,
      topicId: section.kind === 'topic' ? section.id || undefined : undefined,
    })
    draft.file = null
    draft.title = ''
    await loadBoard()
    await refreshCourseCounts()
  } catch (e: unknown) {
    draft.error =
      (e as { message?: string })?.message || t('courseMaterials.uploadFailed')
  } finally {
    draft.uploading = false
  }
}

async function addTopic() {
  if (!selectedCourse.value || hasPhases.value) return
  savingTopic.value = true
  try {
    const created = await courseMaterialService.createTopic(
      schoolId.value,
      selectedCourse.value.id,
      t('courseMaterials.topicFallback', { n: topics.value.length + 1 }),
    )
    await loadBoard()
    openSectionKey.value = `topic:${created.id}`
    await nextTick()
    const el = document.getElementById(
      `material-topic-title-${created.id}`,
    ) as HTMLInputElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.focus()
    el?.select()
  } catch (e: unknown) {
    feedback.error(
      (e as { message?: string })?.message || t('courseMaterials.uploadFailed'),
      t('common.error'),
    )
  } finally {
    savingTopic.value = false
  }
}

function onTopicTitleInput(id: string | null, event: Event) {
  const row = topics.value.find((topic) => topic.id === id)
  if (row) row.title = (event.target as HTMLInputElement).value
}

async function saveTopicTitle(id: string | null) {
  if (!id) return
  const row = topics.value.find((topic) => topic.id === id)
  if (!row) return
  const index = topics.value.findIndex((topic) => topic.id === id)
  const trimmed = row.title.trim() || t('courseMaterials.topicFallback', { n: index + 1 })
  row.title = trimmed
  try {
    await courseMaterialService.updateTopic(schoolId.value, id, trimmed)
  } catch (e: unknown) {
    feedback.error(
      (e as { message?: string })?.message || t('courseMaterials.uploadFailed'),
      t('common.error'),
    )
  }
}

async function deleteTopic(id: string | null) {
  if (!id) return
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('courseMaterials.confirmDeleteTopic'),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  await courseMaterialService.removeTopic(schoolId.value, id)
  await loadBoard()
}

async function refreshCourseCounts() {
  const refreshed = await courseMaterialService.listCourses(schoolId.value)
  courses.value = refreshed
  if (selectedCourse.value) {
    selectedCourse.value =
      refreshed.find((c) => c.id === selectedCourse.value!.id) || selectedCourse.value
  }
}

async function download(m: CourseMaterialRow) {
  try {
    const { blob, filename } = await courseMaterialService.downloadBlob(
      schoolId.value,
      m.id,
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || m.original_filename
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    /* ignore */
  }
}

async function remove(m: CourseMaterialRow) {
  const ok = await feedback.confirm({
    title: t('common.delete'),
    message: t('courseMaterials.confirmDelete'),
    confirmLabel: t('common.delete'),
    danger: true,
  })
  if (!ok) return
  await courseMaterialService.remove(schoolId.value, m.id)
  await loadBoard()
  await refreshCourseCounts()
}

watch(
  () => String(route.query.course || ''),
  () => {
    void openQueryCourse()
  },
)

onMounted(() => {
  void loadCourses()
})
</script>
