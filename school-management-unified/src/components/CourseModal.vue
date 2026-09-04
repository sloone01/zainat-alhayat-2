<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen p-4 text-center sm:items-center sm:p-6">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block w-full max-w-5xl align-bottom overflow-hidden rounded-2xl bg-white text-left shadow-xl transform transition-all sm:align-middle">
        <div class="w-full">
            <!-- Header -->
            <div class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-xl font-semibold text-gray-900" id="modal-title">
                    {{ isEditing ? $t('courseManagement.editCourse') : $t('courseManagement.addCourse') }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-600">
                    {{ $t('courseManagement.description') }}
                  </p>
                </div>
              <button
                @click="$emit('close')"
                class="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="saveCourse" class="space-y-6 p-6">
              <!-- Basic Information -->
              <div class="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
                <h4 class="mb-4 text-base font-semibold text-gray-900">{{ $t('courseManagement.courseInfo') }}</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Course Title -->
                  <div class="md:col-span-2">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.courseTitle') }} *
                    </label>
                    <input
                      id="title"
                      v-model="formData.title"
                      type="text"
                      required
                      :placeholder="$t('courseManagement.courseTitlePlaceholder')"
                      class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    />
                  </div>

                  <!-- Category -->
                  <div>
                    <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.category') }} *
                    </label>
                    <div class="relative">
                    <select
                      id="category"
                      v-model="formData.category"
                      required
                      class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
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
                    <div class="pointer-events-none absolute inset-y-0 end-3 flex items-center">
                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    </div>
                  </div>

                  <!-- Status -->
                  <div>
                    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.status') }} *
                    </label>
                    <div class="relative">
                    <select
                      id="status"
                      v-model="formData.status"
                      required
                      class="block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    >
                      <option value="draft">{{ $t('courseManagement.draft') }}</option>
                      <option value="active">{{ $t('courseManagement.active') }}</option>
                      <option value="published">{{ $t('courseManagement.published') }}</option>
                      <option value="inactive">{{ $t('courseManagement.inactive') }}</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 end-3 flex items-center">
                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                    </div>
                  </div>

                  <!-- Course Description -->
                  <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.courseDescription') }}
                    </label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="3"
                      :placeholder="$t('courseManagement.courseDescriptionPlaceholder')"
                      class="block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3">
                  <p class="text-xs font-medium text-purple-700">{{ $t('courseManagement.phases') }}</p>
                  <p class="mt-1 text-xl font-semibold text-purple-900">{{ formData.phases.length }}</p>
                </div>
                <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                  <p class="text-xs font-medium text-blue-700">{{ $t('courseManagement.totalDuration') }}</p>
                  <p class="mt-1 text-xl font-semibold text-blue-900">{{ totalDuration }} {{ $t('courseManagement.weeks') }}</p>
                </div>
                <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p class="text-xs font-medium text-emerald-700">{{ $t('courseManagement.status') }}</p>
                  <p class="mt-1 text-xl font-semibold text-emerald-900">{{ $t(`courseManagement.${formData.status}`) }}</p>
                </div>
              </div>

              <!-- Phases Section -->
              <div class="rounded-xl border border-gray-200 bg-white p-5">
                <div class="flex items-center justify-between mb-4" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
                  <h4 class="text-base font-semibold text-gray-900">{{ $t('courseManagement.phases') }}</h4>
                  <button
                    type="button"
                    @click="addPhase"
                    class="inline-flex items-center rounded-lg border border-transparent bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    :class="isRTL ? 'flex-row-reverse' : 'flex-row'"
                  >
                    <svg :class="isRTL ? 'h-4 w-4 ml-1' : 'h-4 w-4 mr-1'" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {{ $t('courseManagement.addPhase') }}
                  </button>
                </div>

                <!-- Phases List -->
                <div v-if="formData.phases.length > 0" class="space-y-3">
                  <div
                    v-for="(phase, index) in formData.phases"
                    :key="phase.id || index"
                    class="rounded-xl border border-gray-200 bg-gray-50/60 p-4"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
                          {{ index + 1 }}
                        </span>
                        <h5 class="text-sm font-medium text-gray-900">
                          {{ phase.title || $t('courseManagement.phase') + ' ' + (index + 1) }}
                        </h5>
                      </div>
                      <div class="flex items-center gap-2">
                        <!-- Move Up -->
                        <button
                          v-if="index > 0"
                          type="button"
                          @click="movePhaseUp(index)"
                          class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          :title="$t('courseManagement.moveUp')"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <!-- Move Down -->
                        <button
                          v-if="index < formData.phases.length - 1"
                          type="button"
                          @click="movePhaseDown(index)"
                          class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          :title="$t('courseManagement.moveDown')"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        <!-- Delete Phase -->
                        <button
                          type="button"
                          @click="removePhase(index)"
                          class="rounded-md p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          :title="$t('courseManagement.deletePhase')"
                        >
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <!-- Phase Title -->
                      <div class="md:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.phaseTitle') }} *
                        </label>
                        <input
                          v-model="phase.title"
                          type="text"
                          required
                          :placeholder="$t('courseManagement.phaseTitlePlaceholder')"
                          class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        />
                      </div>

                      <!-- Duration -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.duration') }} ({{ $t('courseManagement.weeks') }}) *
                        </label>
                        <input
                          v-model.number="phase.duration"
                          type="number"
                          min="1"
                          max="52"
                          required
                          :placeholder="$t('courseManagement.durationPlaceholder')"
                          class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        />
                      </div>

                      <!-- Phase Description -->
                      <div class="md:col-span-3">
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.phaseDescription') }}
                        </label>
                        <textarea
                          v-model="phase.description"
                          rows="2"
                          :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')"
                          class="block w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Milestones Preview -->
                    <div v-if="phase.milestones && phase.milestones.length > 0" class="mt-3 pt-3 border-t border-gray-100">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-medium text-gray-700">{{ $t('courseManagement.milestones') }}</span>
                        <span class="text-xs text-gray-500">{{ phase.milestones.length }} {{ $t('courseManagement.milestones').toLowerCase() }}</span>
                      </div>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="milestone in phase.milestones.slice(0, 3)"
                          :key="milestone.id"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {{ milestone.title }}
                        </span>
                        <span
                          v-if="phase.milestones.length > 3"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
                        >
                          +{{ phase.milestones.length - 3 }} {{ $t('common.more') }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-6">
                  <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('courseManagement.noPhases') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.noPhasesDescription') }}</p>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="sticky bottom-0 flex items-center gap-3 border-t border-gray-200 bg-white/95 pt-5 backdrop-blur" :class="isRTL ? 'justify-start' : 'justify-end'">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="rounded-lg border border-transparent bg-purple-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {{ isEditing ? $t('common.update') : $t('common.create') }}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { CourseFormData, PhaseFormData } from '@/types'

const { t, locale } = useI18n()

// Props
const props = defineProps<{
  course?: CourseFormData
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [courseData: CourseFormData]
}>()

// Computed
const isEditing = computed(() => !!props.course)
const isRTL = computed(() => locale.value === 'ar')
const totalDuration = computed(() =>
  formData.value.phases.reduce((total, phase) => total + (phase.duration || 0), 0)
)

// Form data
const formData = ref<CourseFormData>({
  title: '',
  description: '',
  category: '',
  status: 'draft',
  milestones: [],
  phases: []
})

// Initialize form data
const initializeForm = () => {
  if (props.course) {
    formData.value = {
      title: props.course.title || '',
      description: props.course.description || '',
      category: props.course.category || '',
      status: props.course.status || 'draft',
      milestones: props.course.milestones ? [...props.course.milestones] : [],
      phases: props.course.phases ? [...props.course.phases] : []
    }
  } else {
    formData.value = {
      title: '',
      description: '',
      category: '',
      status: 'draft',
      milestones: [],
      phases: []
    }
  }
}

// Watch for course prop changes
watch(() => props.course, initializeForm, { immediate: true })

// Methods
const addPhase = () => {
  const newPhase = {
    id: Date.now(),
    title: '',
    description: '',
    duration: 1,
    order: formData.value.phases.length + 1,
    milestones: []
  }
  formData.value.phases.push(newPhase)
}

const removePhase = (index: number) => {
  formData.value.phases.splice(index, 1)
}

const movePhaseUp = (index: number) => {
  if (index > 0) {
    const phase = formData.value.phases.splice(index, 1)[0]
    formData.value.phases.splice(index - 1, 0, phase)
  }
}

const movePhaseDown = (index: number) => {
  if (index < formData.value.phases.length - 1) {
    const phase = formData.value.phases.splice(index, 1)[0]
    formData.value.phases.splice(index + 1, 0, phase)
  }
}

const addMilestone = () => {
  const newMilestone = {
    id: Date.now(),
    name: '',
    title: '',
    description: '',
    order: formData.value.milestones.length + 1,
    isRequired: true,
    points: 10,
    phaseId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: [],
    type: 'assessment',
    targetWeek: 1
  }
  formData.value.milestones.push(newMilestone)
}

const removeMilestone = (index: number) => {
  formData.value.milestones.splice(index, 1)
}

const saveCourse = () => {
  // Calculate total duration
  const totalDuration = formData.value.phases.reduce((total, phase) => {
    return total + (phase.duration || 0)
  }, 0)

  const courseData = {
    ...formData.value,
    totalDuration
  }

  emit('save', courseData)
}

// Initialize form on mount
initializeForm()
</script>

<style scoped>
/* Custom styles for better RTL support */
.rtl {
  direction: rtl;
}

.rtl input,
.rtl textarea,
.rtl select {
  text-align: right;
}
</style>

