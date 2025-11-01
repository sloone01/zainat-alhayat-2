<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="w-full">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900" id="modal-title">
                {{ isEditing ? $t('courseManagement.editMilestone') : $t('courseManagement.addMilestone') }}
              </h3>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="saveMilestone" class="space-y-6">
              <!-- Milestone Information -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-md font-medium text-gray-900 mb-4">{{ $t('courseManagement.milestone') }} {{ $t('courseManagement.courseInfo') }}</h4>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <!-- Milestone Title -->
                  <div class="md:col-span-2">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.milestoneTitle') }} *
                    </label>
                    <input
                      id="title"
                      v-model="formData.title"
                      type="text"
                      required
                      :placeholder="$t('courseManagement.milestoneTitlePlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Milestone Type -->
                  <div>
                    <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.milestoneType') }} *
                    </label>
                    <select
                      id="type"
                      v-model="formData.type"
                      required
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">{{ $t('courseManagement.selectMilestoneType') }}</option>
                      <option value="assessment">{{ $t('courseManagement.assessment') }}</option>
                      <option value="project">{{ $t('courseManagement.project') }}</option>
                      <option value="activity">{{ $t('courseManagement.activity') }}</option>
                      <option value="presentation">{{ $t('courseManagement.presentation') }}</option>
                      <option value="exam">{{ $t('courseManagement.exam') }}</option>
                      <option value="assignment">{{ $t('courseManagement.assignment') }}</option>
                    </select>
                  </div>

                  <!-- Target Week -->
                  <div>
                    <label for="targetWeek" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.targetWeek') }} *
                    </label>
                    <input
                      id="targetWeek"
                      v-model.number="formData.targetWeek"
                      type="number"
                      min="1"
                      :max="maxWeek"
                      required
                      :placeholder="$t('courseManagement.week')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p v-if="maxWeek" class="mt-1 text-xs text-gray-500">
                      {{ $t('courseManagement.duration') }}: 1-{{ maxWeek }} {{ $t('courseManagement.weeks') }}
                    </p>
                  </div>

                  <!-- Milestone Description -->
                  <div class="md:col-span-4">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.milestoneDescription') }}
                    </label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="3"
                      :placeholder="$t('courseManagement.milestoneDescriptionPlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Milestone Settings -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-md font-medium text-gray-900 mb-4">{{ $t('courseManagement.milestoneSettings') }}</h4>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Points/Weight -->
                  <div>
                    <label for="points" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.points') }}
                    </label>
                    <input
                      id="points"
                      v-model.number="formData.points"
                      type="number"
                      min="0"
                      max="100"
                      :placeholder="$t('courseManagement.pointsPlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Milestone Order -->
                  <div>
                    <label for="order" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.milestoneOrder') }}
                    </label>
                    <input
                      id="order"
                      v-model.number="formData.order"
                      type="number"
                      min="1"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Difficulty Level -->
                  <div>
                    <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.difficultyLevel') }}
                    </label>
                    <select
                      id="difficulty"
                      v-model="formData.difficulty"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">{{ $t('courseManagement.selectDifficultyLevel') }}</option>
                      <option value="beginner">{{ $t('courseManagement.beginner') }}</option>
                      <option value="intermediate">{{ $t('courseManagement.intermediate') }}</option>
                      <option value="advanced">{{ $t('courseManagement.advanced') }}</option>
                    </select>
                  </div>
                </div>

                <!-- Milestone Options -->
                <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center">
                    <input
                      id="isRequired"
                      v-model="formData.isRequired"
                      type="checkbox"
                      class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label for="isRequired" class="ml-2 block text-sm text-gray-700">
                      {{ $t('courseManagement.requiredMilestone') }}
                    </label>
                  </div>

                  <div class="flex items-center">
                    <input
                      id="allowLateSubmission"
                      v-model="formData.allowLateSubmission"
                      type="checkbox"
                      class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label for="allowLateSubmission" class="ml-2 block text-sm text-gray-700">
                      {{ $t('courseManagement.allowLateSubmission') }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {{ $t('common.cancel') }}
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  {{ isEditing ? $t('common.save') : $t('common.add') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Props
const props = defineProps<{
  milestone?: any
  phaseId?: number
  maxWeek?: number
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [milestoneData: any]
}>()

// Computed
const isEditing = computed(() => !!props.milestone)

// Form data
const formData = ref({
  title: '',
  description: '',
  type: '',
  targetWeek: 1,
  points: 0,
  order: 1,
  difficulty: '',
  isRequired: true,
  allowLateSubmission: false
})

// Initialize form data
const initializeForm = () => {
  if (props.milestone) {
    formData.value = {
      title: props.milestone.title || props.milestone.name || '',
      description: props.milestone.description || '',
      type: props.milestone.type || '',
      targetWeek: props.milestone.targetWeek || 1,
      points: props.milestone.points || 0,
      order: props.milestone.order || 1,
      difficulty: props.milestone.difficulty || '',
      isRequired: props.milestone.isRequired ?? true,
      allowLateSubmission: props.milestone.allowLateSubmission ?? false
    }
  } else {
    formData.value = {
      title: '',
      description: '',
      type: '',
      targetWeek: 1,
      points: 0,
      order: 1,
      difficulty: '',
      isRequired: true,
      allowLateSubmission: false
    }
  }
}

// Watch for milestone prop changes
watch(() => props.milestone, initializeForm, { immediate: true })

// Methods
const saveMilestone = () => {
  const milestoneData = {
    ...formData.value,
    phaseId: props.phaseId
  }

  emit('save', milestoneData)
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

