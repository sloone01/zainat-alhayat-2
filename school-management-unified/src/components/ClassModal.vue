<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isEditing ? $t('scheduleManagement.classModal.editTitle') : $t('scheduleManagement.classModal.title') }}
        </h3>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="mt-6">
        <form @submit.prevent="saveClass" class="space-y-6">
          <!-- Period from config (read-only) when slot is locked from /schedules -->
          <div v-if="lockToSlot && formData.day && formData.startTime" class="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-primary-900">
                  {{ $t('scheduleManagement.classModal.timeSlot') }}
                </p>
                <p class="text-sm text-primary-700">
                  {{ $t(`scheduleManagement.days.${formData.day}`) }} —
                  {{ formData.startTime }} – {{ formData.endTime }}
                  ({{ selectedDurationMinutes }} {{ $t('common.minutes') }})
                </p>
              </div>
            </div>
          </div>

          <!-- Duration selection for flexible schedule (no fixed slot) -->
          <div v-if="!lockToSlot" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="duration" class="mb-1.5 block text-xs font-medium text-gray-600">
                {{ $t('classSettings.durations.title') }} <span class="text-red-500">*</span>
              </label>
              <select
                id="duration"
                v-model="formData.selectedDuration"
                class="fk-field"
                required
              >
                <option value="">{{ $t('scheduleManagement.classModal.selectDuration') }}</option>
                <option
                  v-for="duration in availableDurations"
                  :key="duration.id"
                  :value="duration.minutes"
                >
                  {{ duration.name }} ({{ duration.minutes }} {{ $t('common.minutes') }})
                </option>
              </select>
              <p v-if="errors.duration" class="mt-1 text-sm text-red-600">{{ errors.duration }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-600">
                {{ $t('scheduleManagement.classModal.timeSlot') }}
              </label>
              <div class="fk-field bg-gray-50 text-gray-700">
                {{ formData.startTime }} – {{ formData.endTime }}
                <span v-if="selectedDurationMinutes > 0" class="text-sm text-gray-500">
                  ({{ selectedDurationMinutes }} {{ $t('common.minutes') }})
                </span>
              </div>
            </div>
          </div>

          <input type="hidden" v-model="formData.startTime" />
          <input type="hidden" v-model="formData.endTime" />

          <!-- Subject and Teacher Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Subject -->
            <div>
              <label for="subject" class="mb-1.5 block text-xs font-medium text-gray-600">
                {{ $t('scheduleManagement.classModal.subject') }} <span class="text-red-500">*</span>
              </label>
              <select
                id="subject"
                v-model="formData.subject"
                class="fk-field"
                required
              >
                <option value="">{{ $t('scheduleManagement.classModal.subjectPlaceholder') }}</option>
                <option v-for="subject in subjects" :key="subject.key" :value="subject.key">
                  {{ subject.name }}
                </option>
              </select>
              <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
            </div>

            <!-- Teacher -->
            <div>
              <label for="teacher" class="mb-1.5 block text-xs font-medium text-gray-600">
                {{ $t('scheduleManagement.classModal.teacher') }} <span class="text-red-500">*</span>
              </label>
              <select
                id="teacher"
                v-model="formData.teacher"
                class="fk-field"
                required
              >
                <option value="">{{ $t('scheduleManagement.classModal.teacherPlaceholder') }}</option>
                <option v-for="teacher in teachersData" :key="teacher.id" :value="String(teacher.id)">
                  {{ teacherDisplayName(teacher, '') }}
                </option>
              </select>
              <p v-if="errors.teacher" class="mt-1 text-sm text-red-600">{{ errors.teacher }}</p>
            </div>
          </div>

          <!-- Time Conflict Warning -->
          <div v-if="timeConflictWarning" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">{{ $t('common.warning') }}</h3>
                <p class="mt-1 text-sm text-yellow-700">{{ timeConflictWarning }}</p>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row sm:justify-between gap-3 pt-6 border-t border-gray-200">
            <div>
              <button
                v-if="isEditing"
                @click="confirmDelete"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {{ $t('scheduleManagement.deleteClass') }}
              </button>
            </div>

            <div class="flex gap-3">
              <button
                @click="closeModal"
                type="button"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                {{ $t('scheduleManagement.classModal.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="!isFormValid"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {{ $t('scheduleManagement.classModal.save') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60" @click="cancelDelete">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">{{ $t('scheduleManagement.confirmDelete') }}</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">{{ $t('scheduleManagement.confirmDeleteMessage') }}</p>
        </div>
        <div class="flex gap-3 justify-center mt-4">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-white text-gray-500 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            {{ $t('scheduleManagement.classModal.cancel') }}
          </button>
          <button
            @click="deleteClass"
            class="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            {{ $t('scheduleManagement.deleteClass') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ClassSchedule, Teacher, Subject, Room } from '@/types'
import { classSettingsService } from '@/services/class-settings.service'
import { courseDisplayName, teacherDisplayName } from '@/utils/schedule-display'

const { t } = useI18n()

const props = defineProps<{
  classSchedule?: ClassSchedule
  group?: any
  day?: string
  time?: string
  /** When set (>0), period start/end are locked to Settings timetable slots (fixed /schedules grid). */
  slotDuration?: number
  teachers?: Teacher[]
  courses?: Subject[]
  rooms?: Room[]
}>()

const emit = defineEmits<{
  close: []
  save: [classData: ClassSchedule]
  delete: [classData: ClassSchedule]
}>()

const formData = ref<ClassSchedule>({
  day: '',
  startTime: '',
  endTime: '',
  selectedDuration: '',
  subject: '',
  teacher: '',
  room: '',
  notes: '',
  recurring: false,
})

const errors = ref({
  day: '',
  startTime: '',
  duration: '',
  subject: '',
  teacher: '',
})

const showDeleteConfirm = ref(false)
const availableDurations = ref<{ id: string; name: string; minutes: number; isDefault: boolean }[]>([])

const lockToSlot = computed(() => Number(props.slotDuration) > 0)

const loadClassDurations = async () => {
  if (lockToSlot.value) return
  try {
    const settings = await classSettingsService.getAll()
    availableDurations.value = (settings || [])
      .filter((setting) => setting.setting_type === 'duration' && setting.is_active !== false)
      .map((setting) => ({
        id: setting.id,
        name: (setting.name || '').trim() || `${setting.duration_minutes || 0}`,
        minutes: setting.duration_minutes || 0,
        isDefault: setting.is_default,
      }))
      .filter((d) => d.minutes > 0)
      .sort((a, b) => a.minutes - b.minutes)
  } catch (error) {
    console.warn('Failed to load class durations from configuration:', error)
    availableDurations.value = []
  }
}

const calculateEndTime = (startTime: string, duration: number) => {
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(start.getTime() + duration * 60000)
  return end.toTimeString().slice(0, 5)
}

const subjects = computed(() =>
  (props.courses || [])
    .map((course) => ({
      key: String(course.id),
      name: courseDisplayName(course, ''),
    }))
    .filter((s) => s.key && s.name),
)

const teachersData = computed(() => props.teachers || [])

const isEditing = computed(() => !!props.classSchedule)

const selectedDurationMinutes = computed(() => {
  if (lockToSlot.value) return Number(props.slotDuration)
  if (!formData.value.selectedDuration) return 0
  return parseInt(String(formData.value.selectedDuration), 10) || 0
})

const isFormValid = computed(() => {
  return (
    formData.value.subject &&
    formData.value.teacher &&
    formData.value.startTime &&
    formData.value.endTime &&
    selectedDurationMinutes.value > 0 &&
    !Object.values(errors.value).some((error) => error)
  )
})

const timeConflictWarning = computed(() => {
  if (!formData.value.startTime || !formData.value.endTime) return ''
  const startTime = new Date(`2000-01-01 ${formData.value.startTime}`)
  const endTime = new Date(`2000-01-01 ${formData.value.endTime}`)
  if (endTime <= startTime) {
    return t('scheduleManagement.validation.invalidTimeRange')
  }
  return ''
})

const updateEndTime = () => {
  const mins = selectedDurationMinutes.value
  if (formData.value.startTime && mins > 0) {
    formData.value.endTime = calculateEndTime(formData.value.startTime, mins)
    if (lockToSlot.value) {
      formData.value.selectedDuration = String(mins)
    }
  }
}

const closeModal = () => {
  emit('close')
}

const validateForm = () => {
  errors.value = {
    day: '',
    startTime: '',
    duration: '',
    subject: '',
    teacher: '',
  }

  if (!formData.value.startTime) {
    errors.value.startTime = t('scheduleManagement.validation.startTimeRequired')
  }

  if (selectedDurationMinutes.value <= 0) {
    errors.value.duration = t('scheduleManagement.validation.durationRequired')
  }

  if (!formData.value.subject) {
    errors.value.subject = t('scheduleManagement.validation.subjectRequired')
  }

  if (!formData.value.teacher) {
    errors.value.teacher = t('scheduleManagement.validation.teacherRequired')
  }

  if (formData.value.startTime && formData.value.endTime) {
    const startTime = new Date(`2000-01-01 ${formData.value.startTime}`)
    const endTime = new Date(`2000-01-01 ${formData.value.endTime}`)
    if (endTime <= startTime) {
      errors.value.duration = t('scheduleManagement.validation.invalidTimeRange')
    }
  }

  return !Object.values(errors.value).some((error) => error)
}

const saveClass = () => {
  updateEndTime()
  if (!validateForm()) return

  emit('save', {
    day: formData.value.day,
    startTime: formData.value.startTime,
    endTime: formData.value.endTime,
    subject: formData.value.subject,
    teacher: formData.value.teacher,
    room: formData.value.room,
    notes: formData.value.notes,
    recurring: formData.value.recurring,
  })
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteClass = () => {
  emit('delete', props.classSchedule)
  showDeleteConfirm.value = false
}

onMounted(async () => {
  await loadClassDurations()

  if (props.classSchedule) {
    const subjectVal = String(props.classSchedule.courseId ?? props.classSchedule.subject ?? '').trim()
    let teacherVal = String(props.classSchedule.teacherId ?? props.classSchedule.teacher ?? '').trim()
    if (!teacherVal && props.teachers?.length) {
      const label = (props.classSchedule.teacherLabel || '').trim()
      if (label && label !== 'غير محدد' && label !== '—') {
        const found = props.teachers.find((tr) => `${tr.firstName} ${tr.lastName}`.trim() === label)
        if (found) teacherVal = String(found.id)
      }
    }
    let roomVal = ''
    const roomId = (props.classSchedule as any).roomId
    if (props.classSchedule.room) {
      roomVal = String(props.classSchedule.room)
    } else if (roomId != null && roomId !== '' && props.rooms?.length) {
      const byId = props.rooms.find((r) => String(r.id) === String(roomId))
      if (byId) roomVal = byId.name
    }
    formData.value = {
      day: props.classSchedule.day,
      startTime: props.classSchedule.startTime,
      endTime: props.classSchedule.endTime,
      selectedDuration: '',
      subject: subjectVal,
      teacher: teacherVal,
      room: roomVal,
      notes: props.classSchedule.notes || '',
      recurring: props.classSchedule.recurring || false,
    }

    if (lockToSlot.value) {
      updateEndTime()
    } else if (props.classSchedule.startTime && props.classSchedule.endTime) {
      const start = new Date(`2000-01-01 ${props.classSchedule.startTime}`)
      const end = new Date(`2000-01-01 ${props.classSchedule.endTime}`)
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      formData.value.selectedDuration = String(durationMinutes)
    }
  } else {
    formData.value.day = props.day || ''
    formData.value.startTime = props.time || ''
    if (lockToSlot.value) {
      updateEndTime()
    } else {
      const defaultDuration =
        availableDurations.value.find((d) => d.isDefault) || availableDurations.value[0]
      if (defaultDuration) {
        formData.value.selectedDuration = defaultDuration.minutes.toString()
        updateEndTime()
      }
    }
  }
})

watch(
  () => formData.value.selectedDuration,
  () => {
    if (!lockToSlot.value) updateEndTime()
  },
)

watch(
  () => formData.value.startTime,
  () => {
    updateEndTime()
  },
)
</script>

<style scoped>
.z-60 {
  z-index: 60;
}
</style>
