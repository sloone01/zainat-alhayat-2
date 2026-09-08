<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="
          isEditing
            ? $t('courseManagement.editCourse')
            : courseKind === 'standalone'
              ? $t('standaloneCourses.create')
              : $t('courseManagement.addCourse')
        "
        :subtitle="
          courseKind === 'standalone'
            ? $t('standaloneCourses.editorHint')
            : $t('courseManagement.editorHint')
        "
      >
        <template #leading>
          <router-link
            :to="coursesBasePath"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('courseManagement.backToCourses')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <form
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
        @submit.prevent="submitCourse"
      >
        <div class="border-b border-gray-100 bg-gray-50/80 px-6 py-3">
          <div class="inline-flex rounded-lg border border-gray-200 bg-gray-100/80 p-0.5" role="tablist">
            <button
              type="button"
              role="tab"
              class="rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :class="
                activeTab === 'info'
                  ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :aria-selected="activeTab === 'info'"
              @click="activeTab = 'info'"
            >
              {{ $t('courseManagement.courseInfo') }}
            </button>
            <button
              type="button"
              role="tab"
              class="rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              :class="
                activeTab === 'phases'
                  ? 'bg-white text-primary-800 shadow-sm ring-1 ring-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :aria-selected="activeTab === 'phases'"
              @click="activeTab = 'phases'"
            >
              {{ $t('courseManagement.phasesSection') }}
            </button>
          </div>
        </div>

        <!-- Tab: course info -->
        <div v-show="activeTab === 'info'" class="space-y-6 p-6">
          <div class="rounded-xl border border-gray-200/80 bg-gray-50/50 p-5 ring-1 ring-black/[0.02]">
            <p class="mb-4 text-xs text-gray-500">{{ $t('courseManagement.editorInfoHint') }}</p>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-title">
                  {{ $t('courseManagement.courseTitle') }} *
                </label>
                <input
                  id="course-title"
                  v-model="formData.title"
                  :required="activeTab === 'info'"
                  :placeholder="$t('courseManagement.courseTitlePlaceholder')"
                  class="fk-field"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="course-category">
                  {{ $t('courseManagement.category') }} *
                </label>
                <select
                  id="course-category"
                  v-model="formData.category"
                  :required="activeTab === 'info'"
                  class="fk-field"
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
                  :required="activeTab === 'info'"
                  class="fk-field"
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
                  class="fk-field resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: learning phases + milestones -->
        <div v-show="activeTab === 'phases'" class="space-y-6 p-6">
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

            <div v-if="formData.phases.length > 0" class="space-y-4 p-5">
              <article
                v-for="(phase, index) in formData.phases"
                :key="phaseKey(phase, index)"
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
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseManagement.phaseTitle') }}</label>
                    <input
                      v-model="phase.title"
                      :required="activeTab === 'phases'"
                      :placeholder="$t('courseManagement.phaseTitlePlaceholder')"
                      class="fk-field"
                    >
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">
                      {{ $t('courseManagement.duration') }} ({{ $t('courseManagement.weeks') }})
                    </label>
                    <input
                      v-model.number="phase.duration"
                      type="number"
                      min="1"
                      max="52"
                      :required="activeTab === 'phases'"
                      class="fk-field"
                    >
                  </div>
                  <div class="md:col-span-3">
                    <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('courseManagement.phaseDescription') }}</label>
                    <textarea
                      v-model="phase.description"
                      rows="2"
                      :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')"
                      class="fk-field resize-none"
                    />
                  </div>
                </div>

                <!-- Milestones (sub-items within a phase) -->
                <div class="mt-4 border-t border-gray-100 pt-4">
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h5 class="text-xs font-semibold uppercase tracking-wide text-gray-700">
                        {{ $t('courseManagement.milestones') }}
                      </h5>
                      <p class="mt-0.5 text-[11px] text-gray-500">{{ $t('courseManagement.milestonesSectionHint') }}</p>
                    </div>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-100"
                      @click="addMilestone(index)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {{ $t('courseManagement.addMilestone') }}
                    </button>
                  </div>

                  <div v-if="phase.milestones.length" class="space-y-3">
                    <div
                      v-for="(milestone, mIndex) in phase.milestones"
                      :key="milestoneKey(milestone, mIndex)"
                      class="rounded-lg border border-gray-200 bg-gray-50/60 p-3"
                    >
                      <div class="mb-2 flex items-center justify-between gap-2">
                        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-800">
                          {{ mIndex + 1 }}
                        </span>
                        <button
                          type="button"
                          class="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          :aria-label="$t('courseManagement.deleteMilestone')"
                          @click="removeMilestone(index, mIndex)"
                        >
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div class="md:col-span-2">
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">
                            {{ $t('courseManagement.milestoneTitle') }} *
                          </label>
                          <input
                            v-model="milestone.title"
                            :required="activeTab === 'phases'"
                            :placeholder="$t('courseManagement.milestoneTitlePlaceholder')"
                            class="fk-field"
                          >
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">
                            {{ $t('courseManagement.milestoneType') }}
                          </label>
                          <select v-model="milestone.type" class="fk-field">
                            <option value="assessment">{{ $t('courseManagement.assessment') }}</option>
                            <option value="project">{{ $t('courseManagement.project') }}</option>
                            <option value="activity">{{ $t('courseManagement.activity') }}</option>
                            <option value="presentation">{{ $t('courseManagement.presentation') }}</option>
                            <option value="exam">{{ $t('courseManagement.exam') }}</option>
                            <option value="assignment">{{ $t('courseManagement.assignment') }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">
                            {{ $t('courseManagement.targetWeek') }}
                          </label>
                          <input
                            v-model.number="milestone.targetWeek"
                            type="number"
                            min="1"
                            :max="phase.duration || 52"
                            class="fk-field"
                          >
                        </div>
                        <div class="md:col-span-4">
                          <label class="mb-1.5 block text-xs font-medium text-gray-600">
                            {{ $t('courseManagement.milestoneDescription') }}
                          </label>
                          <textarea
                            v-model="milestone.description"
                            rows="2"
                            :placeholder="$t('courseManagement.milestoneDescriptionPlaceholder')"
                            class="fk-field resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center"
                  >
                    <p class="text-xs font-medium text-gray-700">{{ $t('courseManagement.noMilestones') }}</p>
                    <p class="mt-1 text-[11px] text-gray-500">{{ $t('courseManagement.noMilestonesDescription') }}</p>
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

        <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-6 py-4">
          <button type="button" class="fk-btn fk-btn--pearl" @click="goBack">
            {{ $t('common.cancel') }}
          </button>
          <button type="submit" :disabled="saving" class="fk-btn fk-btn--primary">
            <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ saving ? $t('common.saving') : isEditing ? $t('common.update') : $t('common.create') }}
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
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import courseService from '@/services/course.service'
import authService from '@/services/auth.service'

type EditorMilestone = {
  id?: string | number
  title: string
  description: string
  type: string
  targetWeek: number
  isRequired: boolean
}

type EditorPhase = {
  id?: string | number
  title: string
  description: string
  duration: number
  milestones: EditorMilestone[]
}

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

const courseKind = computed<'milestone' | 'standalone'>(() =>
  route.meta.courseKind === 'standalone' ? 'standalone' : 'milestone',
)
const coursesBasePath = computed(() =>
  courseKind.value === 'standalone' ? '/standalone-courses' : '/courses',
)
const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const courseId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!courseId.value)
const saving = ref(false)
const activeTab = ref<'info' | 'phases'>('info')

const formData = ref({
  title: '',
  description: '',
  category: '',
  status: 'draft',
  phases: [] as EditorPhase[],
})

const phaseKey = (phase: EditorPhase, index: number) => String(phase.id ?? `new-phase-${index}`)
const milestoneKey = (milestone: EditorMilestone, index: number) =>
  String(milestone.id ?? `new-ms-${index}`)

const goBack = () => router.push(coursesBasePath.value)

const emptyMilestone = (): EditorMilestone => ({
  id: Date.now() + Math.random(),
  title: '',
  description: '',
  type: 'activity',
  targetWeek: 1,
  isRequired: true,
})

const addPhase = () => {
  formData.value.phases.push({
    id: Date.now(),
    title: '',
    description: '',
    duration: 1,
    milestones: [],
  })
  activeTab.value = 'phases'
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

const addMilestone = (phaseIndex: number) => {
  formData.value.phases[phaseIndex].milestones.push(emptyMilestone())
}

const removeMilestone = (phaseIndex: number, milestoneIndex: number) => {
  formData.value.phases[phaseIndex].milestones.splice(milestoneIndex, 1)
}

function mapApiMilestone(m: any): EditorMilestone {
  return {
    id: m.id,
    title: m.name || m.title || '',
    description: m.description || '',
    type: m.type || 'activity',
    targetWeek: Number(m.target_week ?? m.targetWeek ?? 1) || 1,
    isRequired: m.isRequired !== false,
  }
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
    phases: phases.map((phase) => ({
      id: phase.id,
      title: phase.name || '',
      description: phase.description || '',
      duration: phase.duration_weeks || 1,
      milestones: (phase.milestones || []).map(mapApiMilestone),
    })),
  }
}

async function syncMilestonesForPhase(phaseId: string, milestones: EditorMilestone[]) {
  const existing = await courseService.getMilestonesByPhase(phaseId)
  const existingIds = new Set(existing.map((m) => m.id))
  const formIds = new Set(
    milestones.filter((m) => typeof m.id === 'string').map((m) => m.id as string),
  )

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i]
    const payload = {
      name: m.title,
      description: m.description,
      order: i + 1,
      phaseId,
      isRequired: m.isRequired !== false,
      type: m.type,
      target_week: m.targetWeek,
      targetWeek: m.targetWeek,
    }
    if (typeof m.id === 'string' && existingIds.has(m.id)) {
      await courseService.updateMilestone(m.id, payload)
    } else {
      await courseService.createMilestone(payload)
    }
  }

  for (const m of existing) {
    if (!formIds.has(m.id)) await courseService.deleteMilestone(m.id)
  }
}

const submitCourse = async () => {
  if (!formData.value.title.trim()) {
    activeTab.value = 'info'
    alert(t('courseManagement.saveError'))
    return
  }

  saving.value = true
  try {
    const coursePayload = {
      name: formData.value.title,
      title: formData.value.title,
      description: formData.value.description,
      is_active: formData.value.status === 'active' || formData.value.status === 'published',
      status: formData.value.status,
      category:
        formData.value.category ||
        (courseKind.value === 'standalone' ? 'standalone' : 'general'),
      school_id: schoolId.value,
      course_kind: courseKind.value,
      estimated_duration_weeks: formData.value.phases.reduce(
        (sum, p) => sum + (Number(p.duration) || 0),
        0,
      ),
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
        const payload = {
          name: phase.title,
          description: phase.description,
          order: i + 1,
          courseId: courseId.value,
          duration_weeks: Number(phase.duration) || 1,
        }

        let savedPhaseId: string
        if (typeof phase.id === 'string' && existingIds.has(phase.id)) {
          await courseService.updatePhase(phase.id, payload)
          savedPhaseId = phase.id
        } else {
          const created = await courseService.createPhase(payload)
          savedPhaseId = created.id
          phase.id = created.id
        }
        await syncMilestonesForPhase(savedPhaseId, phase.milestones)
      }

      for (const phase of existingPhases) {
        if (!formIds.has(phase.id)) await courseService.deletePhase(phase.id)
      }
    } else {
      const newCourse = await courseService.createCourse(coursePayload)
      for (let i = 0; i < formData.value.phases.length; i++) {
        const phase = formData.value.phases[i]
        const created = await courseService.createPhase({
          name: phase.title,
          description: phase.description,
          order: i + 1,
          courseId: newCourse.id,
          duration_weeks: Number(phase.duration) || 1,
        } as any)
        await syncMilestonesForPhase(created.id, phase.milestones)
      }
    }

    router.push(coursesBasePath.value)
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
