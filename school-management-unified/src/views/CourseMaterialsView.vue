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
            @click="selectedCourse = null; materials = []"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </template>
      </FikrPageHeader>

      <!-- Course list -->
      <div v-if="!selectedCourse" class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('courseMaterials.coursesHeading') }}</h2>
            <p class="fk-card__meta">{{ $t('courseMaterials.allKindsHint') }}</p>
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
          </div>
        </header>
        <div class="p-6">
          <div v-if="loadingCourses" class="flex justify-center py-16">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
          <div v-else-if="!filteredCourses.length" class="py-16 text-center text-sm text-gray-500">
            {{ $t('courseMaterials.noCourses') }}
          </div>
          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="c in filteredCourses"
              :key="c.id"
              type="button"
              class="rounded-2xl border border-gray-200/80 bg-white p-5 text-start shadow-sm transition hover:border-primary-200 hover:shadow-md"
              @click="openCourse(c)"
            >
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-semibold text-gray-900">{{ c.name }}</h3>
                <span class="shrink-0 rounded-lg bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-800 ring-1 ring-primary-100">
                  {{ kindLabel(c.course_kind) }}
                </span>
              </div>
              <p class="mt-3 text-xs text-gray-500">
                {{ $t('courseMaterials.filesCount', { count: c.materials_count }) }}
              </p>
            </button>
          </div>
        </div>
      </div>

      <!-- Materials for course -->
      <div v-else class="space-y-4">
        <div v-if="canManage" class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
          <h2 class="text-sm font-semibold text-gray-900">{{ $t('courseMaterials.uploadHeading') }}</h2>
          <p class="mt-1 text-xs text-gray-500">{{ $t('courseMaterials.allowedTypes') }}</p>
          <form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="submitUpload">
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseMaterials.file') }} *</label>
              <input
                ref="fileInput"
                type="file"
                required
                :accept="accept"
                class="block w-full text-sm text-gray-700 file:me-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-800"
                @change="onFileChange"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseMaterials.materialTitle') }} *</label>
              <input v-model="uploadTitle" required class="fk-field" />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseMaterials.description') }}</label>
              <input v-model="uploadDesc" class="fk-field" />
            </div>
            <div class="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                class="fk-btn fk-btn--primary"
                :disabled="uploading || !uploadFile"
              >
                {{ uploading ? $t('common.saving') : $t('courseMaterials.upload') }}
              </button>
              <p v-if="uploadError" class="fk-alert fk-alert--error">{{ uploadError }}</p>
            </div>
          </form>
        </div>

        <div class="fk-card">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ $t('courseMaterials.listHeading') }}</h2>
            </div>
          </header>
          <div v-if="loadingMaterials" class="flex justify-center py-12">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
          <div v-else-if="!materials.length" class="py-12 text-center text-sm text-gray-500">
            {{ $t('courseMaterials.noMaterials') }}
          </div>
          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="m in materials"
              :key="m.id"
              class="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <div class="font-medium text-gray-900">{{ m.title }}</div>
                <div class="mt-0.5 truncate text-xs text-gray-500">
                  {{ m.original_filename }} · {{ formatSize(m.file_size) }}
                  <span v-if="!m.is_visible" class="ms-2 text-amber-700">({{ $t('courseMaterials.hidden') }})</span>
                </div>
                <p v-if="m.description" class="mt-1 text-xs text-gray-600">{{ m.description }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-800 hover:bg-primary-100"
                  @click="download(m)"
                >
                  {{ $t('courseMaterials.download') }}
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  @click="toggleVisible(m)"
                >
                  {{ m.is_visible ? $t('courseMaterials.hide') : $t('courseMaterials.show') }}
                </button>
                <button
                  v-if="canManage"
                  type="button"
                  class="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  @click="remove(m)"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </li>
          </ul>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import authService from '@/services/auth.service'
import courseMaterialService, {
  COURSE_MATERIAL_ACCEPT,
  type CourseMaterialCourseRow,
  type CourseMaterialRow,
} from '@/services/course-material.service'

const { t, locale } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')
const user = computed(() => authService.getStoredUser())
const schoolId = computed(() => user.value?.school_id ?? 1)
const canManage = computed(
  () => user.value?.role === 'admin' || user.value?.role === 'teacher',
)
const accept = COURSE_MATERIAL_ACCEPT

const courses = ref<CourseMaterialCourseRow[]>([])
const kindFilter = ref('')
const showFilters = ref(false)
const loadingCourses = ref(false)

const hasActiveFilters = computed(() => kindFilter.value !== '')

function clearFilters() {
  kindFilter.value = ''
}
const selectedCourse = ref<CourseMaterialCourseRow | null>(null)
const materials = ref<CourseMaterialRow[]>([])
const loadingMaterials = ref(false)

const uploadFile = ref<File | null>(null)
const uploadTitle = ref('')
const uploadDesc = ref('')
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const filteredCourses = computed(() => {
  if (!kindFilter.value) return courses.value
  return courses.value.filter((c) => c.course_kind === kindFilter.value)
})

function kindLabel(kind: string) {
  if (kind === 'graded') return t('courseMaterials.kindGraded')
  if (kind === 'standalone') return t('courseMaterials.kindStandalone')
  return t('courseMaterials.kindMilestone')
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

async function loadCourses() {
  loadingCourses.value = true
  try {
    courses.value = await courseMaterialService.listCourses(schoolId.value)
    const q = String(route.query.course || '')
    if (q) {
      const match = courses.value.find((c) => c.id === q)
      if (match) await openCourse(match)
    }
  } catch {
    courses.value = []
  } finally {
    loadingCourses.value = false
  }
}

async function openCourse(c: CourseMaterialCourseRow) {
  selectedCourse.value = c
  await loadMaterials()
}

async function loadMaterials() {
  if (!selectedCourse.value) return
  loadingMaterials.value = true
  try {
    materials.value = await courseMaterialService.list(
      schoolId.value,
      selectedCourse.value.id,
    )
  } catch {
    materials.value = []
  } finally {
    loadingMaterials.value = false
  }
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] || null
  uploadFile.value = f
  if (f && !uploadTitle.value) {
    uploadTitle.value = f.name.replace(/\.[^.]+$/, '')
  }
}

async function submitUpload() {
  if (!selectedCourse.value || !uploadFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    await courseMaterialService.upload({
      schoolId: schoolId.value,
      courseId: selectedCourse.value.id,
      title: uploadTitle.value,
      description: uploadDesc.value || undefined,
      file: uploadFile.value,
    })
    uploadFile.value = null
    uploadTitle.value = ''
    uploadDesc.value = ''
    if (fileInput.value) fileInput.value.value = ''
    await loadMaterials()
    const refreshed = await courseMaterialService.listCourses(schoolId.value)
    courses.value = refreshed
    if (selectedCourse.value) {
      selectedCourse.value =
        refreshed.find((c) => c.id === selectedCourse.value!.id) ||
        selectedCourse.value
    }
  } catch (e: unknown) {
    uploadError.value =
      (e as { message?: string })?.message || t('courseMaterials.uploadFailed')
  } finally {
    uploading.value = false
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

async function toggleVisible(m: CourseMaterialRow) {
  await courseMaterialService.update(schoolId.value, m.id, {
    is_visible: !m.is_visible,
  })
  await loadMaterials()
}

async function remove(m: CourseMaterialRow) {
  if (!confirm(t('courseMaterials.confirmDelete'))) return
  await courseMaterialService.remove(schoolId.value, m.id)
  await loadMaterials()
  await loadCourses()
}

onMounted(() => {
  void loadCourses()
})
</script>
