<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="w-full">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-medium text-gray-900" id="modal-title">
                {{ isEditing ? $t('courseManagement.editPhase') : $t('courseManagement.addPhase') }}
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
            <form @submit.prevent="savePhase" class="space-y-6">
              <!-- Phase Information -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-md font-medium text-gray-900 mb-4">{{ $t('courseManagement.phase') }} {{ $t('courseManagement.courseInfo') }}</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Phase Title -->
                  <div class="md:col-span-2">
                    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.phaseTitle') }} *
                    </label>
                    <input
                      id="title"
                      v-model="formData.title"
                      type="text"
                      required
                      :placeholder="$t('courseManagement.phaseTitlePlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Duration -->
                  <div>
                    <label for="duration" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.duration') }} ({{ $t('courseManagement.weeks') }}) *
                    </label>
                    <input
                      id="duration"
                      v-model.number="formData.duration"
                      type="number"
                      min="1"
                      max="52"
                      required
                      :placeholder="$t('courseManagement.durationPlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Phase Order -->
                  <div>
                    <label for="order" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.phaseOrder') }}
                    </label>
                    <input
                      id="order"
                      v-model.number="formData.order"
                      type="number"
                      min="1"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <!-- Phase Description -->
                  <div class="md:col-span-2">
                    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                      {{ $t('courseManagement.phaseDescription') }}
                    </label>
                    <textarea
                      id="description"
                      v-model="formData.description"
                      rows="3"
                      :placeholder="$t('courseManagement.phaseDescriptionPlaceholder')"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Milestones Section -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-md font-medium text-gray-900">{{ $t('courseManagement.milestones') }}</h4>
                  <button
                    type="button"
                    @click="addMilestone"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {{ $t('courseManagement.addMilestone') }}
                  </button>
                </div>

                <!-- Milestones List -->
                <div v-if="formData.milestones.length > 0" class="space-y-3">
                  <div
                    v-for="(milestone, index) in formData.milestones"
                    :key="milestone.id || index"
                    class="bg-white p-4 rounded-md border border-gray-200"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                          {{ index + 1 }}
                        </span>
                        <h5 class="text-sm font-medium text-gray-900">
                          {{ milestone.title || $t('courseManagement.milestone') + ' ' + (index + 1) }}
                        </h5>
                      </div>
                      <button
                        type="button"
                        @click="removeMilestone(index)"
                        class="p-1 text-red-400 hover:text-red-600"
                        :title="$t('courseManagement.deleteMilestone')"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <!-- Milestone Title -->
                      <div class="md:col-span-2">
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.milestoneTitle') }} *
                        </label>
                        <input
                          v-model="milestone.title"
                          type="text"
                          required
                          :placeholder="$t('courseManagement.milestoneTitlePlaceholder')"
                          class="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      <!-- Milestone Type -->
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.milestoneType') }} *
                        </label>
                        <select
                          v-model="milestone.type"
                          required
                          class="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.targetWeek') }} *
                        </label>
                        <input
                          v-model.number="milestone.targetWeek"
                          type="number"
                          min="1"
                          :max="formData.duration || 52"
                          required
                          :placeholder="$t('courseManagement.targetWeekPlaceholder')"
                          class="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      <!-- Milestone Description -->
                      <div class="md:col-span-4">
                        <label class="block text-xs font-medium text-gray-700 mb-1">
                          {{ $t('courseManagement.milestoneDescription') }}
                        </label>
                        <textarea
                          v-model="milestone.description"
                          rows="2"
                          :placeholder="$t('courseManagement.milestoneDescriptionPlaceholder')"
                          class="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="text-center py-6">
                  <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('courseManagement.noMilestones') }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ $t('courseManagement.noMilestonesDescription') }}</p>
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
  phase?: any
  courseId?: number
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [phaseData: any]
}>()

// Computed
const isEditing = computed(() => !!props.phase)

// Form data
const formData = ref({
  title: '',
  description: '',
  duration: 1,
  order: 1,
  milestones: []
})

// Initialize form data
const initializeForm = () => {
  if (props.phase) {
    formData.value = {
      title: props.phase.title || '',
      description: props.phase.description || '',
      duration: props.phase.duration || 1,
      order: props.phase.order || 1,
      milestones: props.phase.milestones ? [...props.phase.milestones] : []
    }
  } else {
    formData.value = {
      title: '',
      description: '',
      duration: 1,
      order: 1,
      milestones: []
    }
  }
}

// Watch for phase prop changes
watch(() => props.phase, initializeForm, { immediate: true })

// Methods
const addMilestone = () => {
  const newMilestone = {
    id: Date.now(),
    title: '',
    description: '',
    type: '',
    targetWeek: 1
  }
  formData.value.milestones.push(newMilestone)
}

const removeMilestone = (index: number) => {
  formData.value.milestones.splice(index, 1)
}

const savePhase = () => {
  // Sort milestones by target week
  formData.value.milestones.sort((a, b) => (a.targetWeek || 0) - (b.targetWeek || 0))

  const phaseData = {
    ...formData.value,
    courseId: props.courseId
  }

  emit('save', phaseData)
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

