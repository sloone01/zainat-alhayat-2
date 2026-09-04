<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <router-link
            to="/courses"
            class="mb-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white shadow-sm hover:border-white/40 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            :aria-label="$t('courseManagement.backToCourses')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
            {{ isEditing ? $t('courseManagement.editEyebrow') : $t('courseManagement.createEyebrow') }}
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ isEditing ? $t('courseManagement.editCourse') : $t('courseManagement.addCourse') }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">
            {{ $t('courseManagement.editorHint') }}
          </p>
        </div>
      </section>

      <form
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
        @submit.prevent="submitCourse"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
          <h2 class="text-sm font-semibold text-gray-900">{{ $t('courseManagement.courseInfo') }}</h2>
          <p class="mt-0.5 text-xs text-gray-500">{{ $t('courseManagement.editorInfoHint') }}</p>
        </div>

        <div class="space-y-6 p-6">
          <div class="rounded-xl border border-gray-200/80 bg-gray-50/50 p-5 ring-1 ring-black/[0.02]">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-title">
                  {{ $t('courseManagement.courseTitle') }} *
                </label>
                <input
                  id="course-title"
                  v-model="formData.title"
                  required
                  :placeholder="$t('courseManagement.courseTitlePlaceholder')"
                  class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-category">
                  {{ $t('courseManagement.category') }} *
                </label>
                <select
                  id="course-category"
                  v-model="formData.category"
                  required
                  class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">{{ $t('courseManagement.selectCategory') }}</option>
                  <option value="language">{{ $t('courseManagement.language') }}</option>
                  <option value="mathematics">{{ $t('courseManagement.mathematics') }}</option>
                  <option value="science">{{ $t('courseManagement.science') }}</option>
                  <option value="art">{{ $t('courseManagement.art') }}</option>
                  <option value="music">{{ $t('courseManagement.music') }}</option>
                  <option value="physicalEducation">{{ $t('courseManagement.physicalEducation') }}</option>
                  <option value="socialStudies">{{ $t('courseManagement.socialStudies') }}</option>
                </select>
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-status">
                  {{ $t('courseManagement.status') }} *
                </label>
                <select
                  id="course-status"
                  v-model="formData.status"
                  required
                  class="block w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="draft">{{ $t('courseManagement.draft') }}</option>
                  <option value="active">{{ $t('courseManagement.active') }}</option>
                  <option value="published">{{ $t('courseManagement.published') }}</option>
                  <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-description">
                  {{ $t('courseManagement.courseDescription') }}
                </label>
                <textarea
                  id="course-description"
                  v-model="formData.description"
                  rows="3"
                  :placeholder="$t('courseManagement.courseDescriptionPlaceholder')"
                  class="block w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-xl bg-primary-50/70 px-4 py-3 text-center ring-1 ring-primary-100">
              <p class="text-[11px] font-medium text-gray-500">{{ $t('courseManagement.phases') }}</p>
              <p class="mt-1 text-xl font-bold tabular-nums text-primary-700">{{ formData.phases.length }}</p>
            </div>
            <div class="rounded-xl bg-teal-50/70 px-4 py-3 text-center ring-1 ring-teal-100">
              <p class="text-[11px] font-medium text-gray-500">{{ $t('courseManagement.totalDuration') }}</p>
              <p class="mt-1 text-xl font-bold tabular-nums text-teal-700">
                {{ totalDuration }} {{ $t('courseManagement.weeks') }}
              </p>
            </div>
            <div class="rounded-xl bg-emerald-50/70 px-4 py-3 text-center ring-1 ring-emerald-100">
              <p class="text-[11px] font-medium text-gray-500">{{ $t('courseManagement.status') }}</p>
              <p class="mt-1 text-sm font-bold text-emerald-800">{{ $t(`courseManagement.${formData.status}`) }}</p>
            </div>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200/80">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
              <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('courseManagement.phasesSection') }}</h3>
                <p class="mt-0.5 text-xs text-gray-500">{{ $t('courseManagement.phasesSectionHint') }}</p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
                @click="addPhase"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {{ $t('courseManagement.addPhase') }}
              </button>
            </div>

            <div v-if="formData.phases.length > 0" class="space-y-3 p-5">
              <article
                v-for="(phase, index) in formData.phases"
                :key="phase.id || index"
                class="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.02]"
              >
                <div class="mb-3 flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-800">
                      {{ index + 1 }}
                    </span>
                    <h4 class="text-sm font-semibold text-gray-900">
                      {{ phase.title || `${$t('courseManagement.phase')} ${index + 1}` }}
                    </h4>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      v-if="index > 0"
                      type="button"
                      class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      :aria-label="$t('courseManagement.moveUp')"
                      @click="movePhaseUp(index)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      v-if="index < formData.phases.length - 1"
                      type="button"
                      class="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                      :aria-label="$t('courseManagement.moveDown')"
                      @click="movePhaseDown(index)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      :aria-label="$t('courseManagement.deletePhase')"
                      @click="removePhase(index)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div class="md:col-span-2">
                    <label class="mb-1 block text-[11px] font-medium text-gray-500">{{ $t('courseManagement.phaseTitle') }}</label>
                    <input
                      v-model="phase.title"
                      required
                      :placeholder="$t('courseManagement.phaseTitlePlaceholder')"
                      class="block w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>
                  <div>
                    <label class="mb-1 block text-[11px] font-medium text-gray-500">{{ $t('courseManagement.duration') }}</label>
                    <input
                      v-model.number="phase.duration"
                      type="number"
                      min="1"
                      max="52"
                      required
                      class="block w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                  </div>
                  <div class="md:col-span-3">
                    <label class="mb-1 block text-[11px] font-medium text-gray-500">{{ $t('courseManagement.phaseDescription') }}</label>
                    <textarea
                      v-model="phase.description"
                      rows="2"
                      :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')"
                      class="block w-full resize-none rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </article>
            </div>

            <div
              v-else
              class="flex flex-col items-center justify-center border-t border-dashed border-gray-200 px-6 py-12 text-center"
            >
              <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-800">{{ $t('courseManagement.noPhases') }}</p>
              <p class="mt-1 max-w-sm text-xs text-gray-500">{{ $t('courseManagement.noPhasesDescription') }}</p>
              <button
                type="button"
                class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                @click="addPhase"
              >
                {{ $t('courseManagement.createFirstPhase') }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/50 px-6 py-4">
          <button
            type="button"
            class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="goBack"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ saving ? $t('common.saving') : (isEditing ? $t('common.update') : $t('common.create')) }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import courseService from '@/services/course.service'
import type { CourseFormData } from '@/types'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

const courseId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!courseId.value)
const saving = ref(false)

const formData = ref<CourseFormData>({
  title: '',
  description: '',
  category: '',
  status: 'draft',
  milestones: [],
  phases: [],
})

const totalDuration = computed(() =>
  formData.value.phases.reduce((total, phase) => total + (phase.duration || 0), 0),
)

const goBack = () => router.push('/courses')

const addPhase = () => {
  formData.value.phases.push({ id: Date.now(), title: '', description: '', duration: 1, milestones: [] })
}

const removePhase = (index: number) => formData.value.phases.splice(index, 1)

const movePhaseUp = (index: number) => {
  const phase = formData.value.phases.splice(index, 1)[0]
  formData.value.phases.splice(index - 1, 0, phase)
}

const movePhaseDown = (index: number) => {
  const phase = formData.value.phases.splice(index, 1)[0]
  formData.value.phases.splice(index + 1, 0, phase)
}

const loadCourse = async () => {
  if (!courseId.value) return
  const course = await courseService.getCourseById(courseId.value)
  const phases = await courseService.getPhasesByCourse(courseId.value)
  formData.value = {
    title: course.name || course.title || '',
    description: course.description || '',
    category: course.category || 'general',
    status: course.is_active ? 'active' : 'inactive',
    milestones: [],
    phases: phases.map((phase) => ({
      id: phase.id as string | number,
      title: phase.name || '',
      description: phase.description || '',
      duration: phase.duration_weeks || 1,
      milestones: phase.milestones || [],
    })),
  }
}

const submitCourse = async () => {
  saving.value = true
  try {
    const coursePayload = {
      name: formData.value.title,
      description: formData.value.description,
      is_active: formData.value.status === 'active',
      school_id: 1,
    }

    if (isEditing.value && courseId.value) {
      await courseService.updateCourse(courseId.value, coursePayload)
      const existingPhases = await courseService.getPhasesByCourse(courseId.value)
      const existingIds = new Set(existingPhases.map((p) => p.id))
      const formIds = new Set(
        formData.value.phases.filter((p) => typeof p.id === 'string').map((p) => p.id as string),
      )

      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        const payload = { name: phase.title, description: phase.description, order: i + 1, courseId: courseId.value }
        if (typeof phase.id === 'string' && existingIds.has(phase.id)) await courseService.updatePhase(phase.id, payload)
        else await courseService.createPhase(payload)
      }

      for (const phase of existingPhases) {
        if (!formIds.has(phase.id)) await courseService.deletePhase(phase.id)
      }
    } else {
      const newCourse = await courseService.createCourse(coursePayload)
      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        await courseService.createPhase({
          name: phase.title,
          description: phase.description,
          order: i + 1,
          courseId: newCourse.id,
        })
      }
    }

    router.push('/courses')
  } catch (error: unknown) {
    const err = error as Error
    alert(err?.message || t('courseManagement.saveError'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) await loadCourse()
})
</script>
