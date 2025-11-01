<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0 h-12 w-12">
                <div class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-lg font-medium text-indigo-700">{{ getStudentInitials(student.name) }}</span>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ student.name }}</h3>
                <p class="text-sm text-gray-600">{{ student.studentId }} - {{ course.title }}</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Student Progress Overview -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('progressTracking.overallProgress') }}</h4>
            <div class="flex items-center space-x-4">
              <div class="flex-1">
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    class="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${studentProgress}%` }"
                  ></div>
                </div>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ studentProgress }}%</span>
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-600">
              <span>{{ $t('progressTracking.completedMilestones') }}: {{ completedMilestones }}</span>
              <span>{{ $t('progressTracking.totalMilestones') }}: {{ course.milestones.length }}</span>
            </div>
          </div>

          <!-- Milestones List -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-900">{{ $t('progressTracking.milestoneProgress') }}</h4>
            
            <div class="space-y-3">
              <div
                v-for="milestone in course.milestones"
                :key="milestone.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <MilestoneStatusButton
                        :student-id="student.id"
                        :milestone-id="milestone.id"
                        :status="getMilestoneStatus(milestone.id)"
                        :notes="getMilestoneNotes(milestone.id)"
                        @update-status="updateMilestoneStatus"
                        size="small"
                      />
                      <div>
                        <h5 class="text-sm font-medium text-gray-900">{{ milestone.title }}</h5>
                        <p class="text-xs text-gray-600">{{ milestone.description }}</p>
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{{ $t('progressTracking.targetWeek') }}: {{ milestone.targetWeek }}</span>
                      <span>{{ $t('progressTracking.estimatedDuration') }}: {{ milestone.estimatedDuration }}{{ $t('common.minutes') }}</span>
                      <span v-if="milestone.isRequired" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {{ $t('progressTracking.isRequired') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Milestone Notes -->
                <div v-if="getMilestoneNotes(milestone.id)" class="mt-3 p-3 bg-blue-50 rounded-md">
                  <div class="flex items-start space-x-2">
                    <svg class="w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div>
                      <p class="text-sm text-blue-800">{{ getMilestoneNotes(milestone.id) }}</p>
                      <p class="text-xs text-blue-600 mt-1">{{ formatDate(getMilestoneCompletedDate(milestone.id)) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Quick Note Input -->
                <div class="mt-3">
                  <div class="flex space-x-2">
                    <input
                      v-model="quickNotes[milestone.id]"
                      type="text"
                      :placeholder="$t('progressTracking.actions.addNotes')"
                      class="flex-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      @keyup.enter="saveQuickNote(milestone.id)"
                    >
                    <button
                      @click="saveQuickNote(milestone.id)"
                      :disabled="!quickNotes[milestone.id]"
                      class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ $t('common.save') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- General Notes Section -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              {{ $t('progressTracking.teacherNotes') }} - {{ $t('common.general') }}
            </label>
            <textarea
              v-model="generalNotes"
              rows="4"
              class="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              :placeholder="$t('progressTracking.actions.addNotes')"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="saveAllNotes"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ $t('progressTracking.actions.saveProgress') }}
          </button>
          <button
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import MilestoneStatusButton from './MilestoneStatusButton.vue'

// Props
interface Props {
  student: any
  course: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  save: [data: { studentId: number, milestoneId: number, notes: string }]
}>()

const { t } = useI18n()

// Reactive data
const quickNotes = ref<Record<number, string>>({})
const generalNotes = ref('')

// Computed properties
const studentProgress = computed(() => {
  if (!props.student.progress) return 0
  
  const totalMilestones = props.course.milestones.length
  const completedMilestones = Object.values(props.student.progress).filter((p: any) => p.status === 'completed').length
  
  return Math.round((completedMilestones / totalMilestones) * 100)
})

const completedMilestones = computed(() => {
  if (!props.student.progress) return 0
  return Object.values(props.student.progress).filter((p: any) => p.status === 'completed').length
})

// Methods
const getStudentInitials = (name: string) => {
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
}

const getMilestoneStatus = (milestoneId: number) => {
  return props.student.progress?.[milestoneId]?.status || 'notStarted'
}

const getMilestoneNotes = (milestoneId: number) => {
  return props.student.progress?.[milestoneId]?.notes || ''
}

const getMilestoneCompletedDate = (milestoneId: number) => {
  return props.student.progress?.[milestoneId]?.completedDate
}

const updateMilestoneStatus = (data: { studentId: number, milestoneId: number, status: string, notes?: string }) => {
  // Update the student progress locally
  if (!props.student.progress) {
    props.student.progress = {}
  }
  
  if (!props.student.progress[data.milestoneId]) {
    props.student.progress[data.milestoneId] = { status: 'notStarted', notes: '', completedDate: null }
  }
  
  props.student.progress[data.milestoneId].status = data.status
  if (data.notes !== undefined) {
    props.student.progress[data.milestoneId].notes = data.notes
  }
  if (data.status === 'completed') {
    props.student.progress[data.milestoneId].completedDate = new Date().toISOString()
  } else {
    props.student.progress[data.milestoneId].completedDate = null
  }
  
  // Emit the change to parent
  emit('save', data)
}

const saveQuickNote = (milestoneId: number) => {
  const note = quickNotes.value[milestoneId]
  if (!note) return
  
  updateMilestoneStatus({
    studentId: props.student.id,
    milestoneId,
    status: getMilestoneStatus(milestoneId),
    notes: note
  })
  
  quickNotes.value[milestoneId] = ''
}

const saveAllNotes = () => {
  // Save general notes if any
  if (generalNotes.value) {
    // In a real implementation, you'd save general notes to a separate field
    console.log('Saving general notes:', generalNotes.value)
  }
  
  // Save any remaining quick notes
  Object.keys(quickNotes.value).forEach(milestoneId => {
    const note = quickNotes.value[Number(milestoneId)]
    if (note) {
      saveQuickNote(Number(milestoneId))
    }
  })
  
  emit('close')
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-OM', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  // Initialize quick notes with existing notes
  props.course.milestones.forEach((milestone: any) => {
    quickNotes.value[milestone.id] = ''
  })
})
</script>

