<template>
  <div class="fk-tt-sheet" @click="closeModal">
    <div class="fk-tt-sheet__panel" @click.stop>
      <span class="fk-tt-sheet__grip" aria-hidden="true" />
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p v-if="sheetMeta" class="fk-tt-sheet__meta">{{ sheetMeta }}</p>
          <h3 class="fk-tt-sheet__title">
            {{ isEditing ? $t('scheduleManagement.classModal.editTitle') : $t('scheduleManagement.classModal.title') }}
          </h3>
        </div>
        <button
          type="button"
          class="fk-modal__close"
          :aria-label="$t('common.close')"
          @click="closeModal"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mt-6">
        <form class="space-y-3" @submit.prevent="saveClass">
          <div v-if="guidedPlacement" class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="fk-tt-field" for="flex-day">
              <span class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.day') }}</span>
              <select id="flex-day" v-model="formData.day" class="fk-tt-field__ctl" required>
                <option value="">{{ $t('scheduleManagement.classModal.selectDay') }}</option>
                <option v-for="d in weekDayOptions" :key="d" :value="d">
                  {{ $t(`scheduleManagement.days.${d}`) }}
                </option>
              </select>
            </label>
            <p v-if="errors.day" class="text-sm text-red-600 md:col-span-2">{{ errors.day }}</p>
            <label class="fk-tt-field" for="place-after">
              <span class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.placeAfter') }}</span>
              <select
                id="place-after"
                v-model="placeAfterId"
                class="fk-tt-field__ctl"
                :disabled="!formData.day"
                required
              >
                <option value="">{{ $t('scheduleManagement.classModal.selectPlaceAfter') }}</option>
                <option value="__start__">{{ $t('scheduleManagement.classModal.startOfDay') }}</option>
                <option v-for="slot in placeAfterOptions" :key="slot.id" :value="String(slot.id)">
                  {{ placeAfterLabel(slot) }}
                </option>
              </select>
            </label>
            <p v-if="errors.placeAfter" class="text-sm text-red-600 md:col-span-2">{{ errors.placeAfter }}</p>
          </div>

          <div v-if="!lockToSlot" class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="fk-tt-field" for="duration">
              <span class="fk-tt-field__lab">{{ $t('classSettings.durations.title') }}</span>
              <select
                id="duration"
                v-model="formData.selectedDuration"
                class="fk-tt-field__ctl"
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
            </label>
            <div class="fk-tt-field">
              <p class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.timeSlot') }}</p>
              <p class="fk-tt-field__ctl">
                <template v-if="formData.startTime && formData.endTime">
                  {{ formData.startTime }} – {{ formData.endTime }}
                </template>
                <template v-else>{{ $t('scheduleManagement.classModal.timePreviewHint') }}</template>
              </p>
            </div>
            <p v-if="errors.duration" class="text-sm text-red-600 md:col-span-2">{{ errors.duration }}</p>
          </div>

          <div v-else class="fk-tt-field">
            <p class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.timeSlot') }}</p>
            <p class="fk-tt-field__ctl">
              <template v-if="formData.startTime && formData.endTime">
                {{ formData.startTime }} – {{ formData.endTime }}
              </template>
              <template v-else>{{ time }}</template>
            </p>
          </div>

          <input v-model="formData.startTime" type="hidden">
          <input v-model="formData.endTime" type="hidden">

          <div class="grid grid-cols-1 gap-3">
            <label class="fk-tt-field" for="subject">
              <span class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.subject') }}</span>
              <select id="subject" v-model="formData.subject" class="fk-tt-field__ctl" required>
                <option value="">{{ $t('scheduleManagement.classModal.subjectPlaceholder') }}</option>
                <option v-for="subject in subjects" :key="subject.key" :value="subject.key">
                  {{ subject.name }}
                </option>
              </select>
            </label>
            <p
              v-if="!subjects.length && groupLevelId"
              class="text-sm text-amber-700"
            >
              {{ $t('scheduleManagement.classModal.noCoursesForGroupLevel') }}
            </p>
            <p
              v-else-if="!subjects.length && !groupLevelId"
              class="text-sm text-amber-700"
            >
              {{ $t('scheduleManagement.classModal.groupMissingLevel') }}
            </p>
            <p v-if="errors.subject" class="text-sm text-red-600">{{ errors.subject }}</p>

            <label class="fk-tt-field" :class="timeConflictWarning ? 'fk-tt-field--warn' : ''" for="teacher">
              <span class="fk-tt-field__lab">{{ $t('scheduleManagement.classModal.teacher') }}</span>
              <select id="teacher" v-model="formData.teacher" class="fk-tt-field__ctl" required>
                <option value="">{{ $t('scheduleManagement.classModal.teacherPlaceholder') }}</option>
                <option v-for="teacher in teachersData" :key="teacher.id" :value="String(teacher.id)">
                  {{ teacherDisplayName(teacher, '') }}
                </option>
              </select>
            </label>
            <p v-if="errors.teacher" class="text-sm text-red-600">{{ errors.teacher }}</p>
          </div>

          <div v-if="timeConflictWarning" class="rounded-md border border-yellow-200 bg-yellow-50 p-4">
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

          <div class="grid grid-cols-[auto_1fr] gap-2 pt-2">
            <button
              v-if="isEditing"
              type="button"
              class="fk-btn fk-btn--pearl"
              @click="confirmDelete"
            >
              {{ $t('scheduleManagement.deleteClass') }}
            </button>
            <button
              v-else
              type="button"
              class="fk-btn fk-btn--pearl"
              @click="closeModal"
            >
              {{ $t('scheduleManagement.classModal.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
              class="fk-btn fk-btn--navy"
            >
              {{ $t('scheduleManagement.classModal.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div
    v-if="showDeleteConfirm"
    class="fk-tt-sheet z-[60]"
    @click="cancelDelete"
  >
    <div class="fk-tt-sheet__panel lg:max-w-sm" @click.stop>
      <div class="mt-3 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium leading-6 text-gray-900">{{ $t('scheduleManagement.confirmDelete') }}</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500">{{ $t('scheduleManagement.confirmDeleteMessage') }}</p>
        </div>
        <div class="mt-4 flex justify-center gap-2">
          <button
            type="button"
            class="fk-btn fk-btn--pearl"
            @click="cancelDelete"
          >
            {{ $t('scheduleManagement.classModal.cancel') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--navy"
            @click="deleteClass"
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
import {
  courseDisplayName,
  teacherDisplayName,
  toScheduleHm,
} from '@/utils/schedule-display'
import { resolveFeeLevelId } from '@/utils/fee-level'

const PLACE_START = '__start__'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    classSchedule?: ClassSchedule
    group?: any
    day?: string
    time?: string
    /** When set (>0), period start/end are locked to Settings timetable slots (fixed /schedules grid). */
    slotDuration?: number
    teachers?: Teacher[]
    courses?: Subject[]
    rooms?: Room[]
    /** All sessions for the selected group (flexible guided place-after). */
    daySessions?: any[]
    firstClassTime?: string
    weekDays?: string[]
  }>(),
  {
    daySessions: () => [],
    firstClassTime: '08:00',
    weekDays: () => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'],
  },
)

const emit = defineEmits<{
  close: []
  save: [classData: ClassSchedule & { placeAfterId?: string }]
  delete: [classData: ClassSchedule]
}>()

const formData = ref<ClassSchedule & { selectedDuration?: string }>({
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

const placeAfterId = ref('')

const errors = ref({
  day: '',
  placeAfter: '',
  startTime: '',
  duration: '',
  subject: '',
  teacher: '',
})

const showDeleteConfirm = ref(false)
const availableDurations = ref<{ id: string; name: string; minutes: number; isDefault: boolean }[]>([])

const lockToSlot = computed(() => Number(props.slotDuration) > 0)
const isEditing = computed(() => !!props.classSchedule)
const guidedPlacement = computed(() => !lockToSlot.value && !isEditing.value)
const weekDayOptions = computed(() => props.weekDays || [])

const sheetMeta = computed(() => {
  const groupName = String(props.group?.name || '').trim()
  const dayKey = formData.value.day || props.day || ''
  const day = dayKey ? t(`scheduleManagement.days.${dayKey}`) : ''
  const time = toScheduleHm(formData.value.startTime || props.time || '')
  return [groupName, day, time].filter(Boolean).join(' · ')
})

const placeAfterOptions = computed(() => {
  const day = formData.value.day
  if (!day) return []
  return (props.daySessions || [])
    .filter((s) => s.day === day)
    .slice()
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
})

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

/** Fee/grade level of the selected class group — subjects must match this. */
const groupLevelId = computed(() => {
  const fromGroup = resolveFeeLevelId(props.group)
  if (fromGroup) return fromGroup
  const fromCourses = new Set(
    (props.courses || []).map((course) => resolveFeeLevelId(course as Record<string, unknown>)).filter(Boolean),
  )
  return fromCourses.size === 1 ? [...fromCourses][0] : ''
})

function courseLevelId(course: Record<string, unknown>): string {
  return resolveFeeLevelId(course)
}

const subjects = computed(() => {
  const groupLevel = groupLevelId.value
  const currentKey = String(formData.value.subject || '').trim()
  return (props.courses || [])
    .filter((course) => {
      const id = String((course as { id?: string }).id || '').trim()
      if (!id) return false
      // Keep the currently saved course visible when editing legacy mismatches.
      if (currentKey && id === currentKey) return true
      const courseLevel = courseLevelId(course as unknown as Record<string, unknown>)
      if (!groupLevel) return !!courseLevel
      return courseLevel === groupLevel
    })
    .map((course) => ({
      key: String(course.id),
      name: courseDisplayName(course, ''),
    }))
    .filter((s) => s.key && s.name)
})

const teachersData = computed(() => props.teachers || [])

const selectedDurationMinutes = computed(() => {
  if (lockToSlot.value) return Number(props.slotDuration)
  if (!formData.value.selectedDuration) return 0
  return parseInt(String(formData.value.selectedDuration), 10) || 0
})

const isFormValid = computed(() => {
  if (guidedPlacement.value) {
    if (!formData.value.day || !placeAfterId.value) return false
  }
  return (
    !!formData.value.subject &&
    !!formData.value.teacher &&
    !!formData.value.startTime &&
    !!formData.value.endTime &&
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

function placeAfterLabel(slot: any) {
  const start = toScheduleHm(slot.startTime)
  const end = toScheduleHm(slot.endTime)
  const subject = slot.subjectLabel || slot.subject || '—'
  const teacher = slot.teacherLabel || ''
  return t('scheduleManagement.classModal.afterSlot', {
    time: `${start}–${end}`,
    subject,
    teacher: teacher ? ` (${teacher})` : '',
  })
}

function resolveStartFromPlacement(): string {
  if (!guidedPlacement.value) return formData.value.startTime
  if (placeAfterId.value === PLACE_START) {
    return toScheduleHm(props.firstClassTime) || '08:00'
  }
  const anchor = placeAfterOptions.value.find((s) => String(s.id) === String(placeAfterId.value))
  if (anchor?.endTime) return toScheduleHm(anchor.endTime)
  return toScheduleHm(props.firstClassTime) || '08:00'
}

const updateEndTime = () => {
  const mins = selectedDurationMinutes.value
  if (guidedPlacement.value) {
    formData.value.startTime = resolveStartFromPlacement()
  }
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
    placeAfter: '',
    startTime: '',
    duration: '',
    subject: '',
    teacher: '',
  }

  if (guidedPlacement.value) {
    if (!formData.value.day) {
      errors.value.day = t('scheduleManagement.validation.dayRequired')
    }
    if (!placeAfterId.value) {
      errors.value.placeAfter = t('scheduleManagement.validation.placeAfterRequired')
    }
  }

  updateEndTime()

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
    placeAfterId: guidedPlacement.value ? placeAfterId.value : undefined,
  })
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteClass = () => {
  emit('delete', props.classSchedule!)
  showDeleteConfirm.value = false
}

function defaultPlaceAfterForDay(day: string) {
  const list = (props.daySessions || [])
    .filter((s) => s.day === day)
    .slice()
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
  if (!list.length) return PLACE_START
  return String(list[list.length - 1].id)
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
    if (guidedPlacement.value && formData.value.day) {
      placeAfterId.value = defaultPlaceAfterForDay(formData.value.day)
    }
    if (lockToSlot.value) {
      updateEndTime()
    } else {
      const defaultDuration =
        availableDurations.value.find((d) => d.isDefault) || availableDurations.value[0]
      if (defaultDuration) {
        formData.value.selectedDuration = defaultDuration.minutes.toString()
      }
      updateEndTime()
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
    if (!guidedPlacement.value) updateEndTime()
  },
)

watch(
  () => formData.value.day,
  (day, prev) => {
    if (!guidedPlacement.value) return
    if (day && day !== prev) {
      placeAfterId.value = defaultPlaceAfterForDay(day)
    }
    if (!day) placeAfterId.value = ''
    updateEndTime()
  },
)

watch(placeAfterId, () => {
  if (guidedPlacement.value) updateEndTime()
})
</script>
