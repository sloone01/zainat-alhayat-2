<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8 no-print">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('scheduleManagement.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('scheduleManagement.description') }}</p>
        </div>
      </section>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] no-print">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0 flex-1">
              <label for="group-select" class="block text-sm font-semibold text-gray-900">
                {{ $t('scheduleManagement.selectGroup') }}
              </label>
              <select
                id="group-select"
                v-model="selectedGroupId"
                class="mt-2 block w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              >
                <option value="">{{ $t('scheduleManagement.selectGroupPlaceholder') }}</option>
                <option v-for="group in groups" :key="group.id" :value="String(group.id)">
                  {{ group.name }}<template v-if="group.ageRangeLabel"> ({{ group.ageRangeLabel }})</template>
                  — {{ group.currentStudents }}/{{ group.capacity }} {{ $t('groupManagement.students') }}
                </option>
              </select>
            </div>

            <div v-if="selectedGroup" class="flex flex-wrap items-center gap-2">
              <span class="hidden text-xs text-gray-500 sm:inline">{{ $t('scheduleManagement.exportMenu') }}</span>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
                @click="runExport('word')"
              >
                {{ $t('scheduleManagement.exportAsWord') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100"
                @click="runExport('pdf')"
              >
                {{ $t('scheduleManagement.exportAsPdf') }}
              </button>
              <button
                type="button"
                class="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
                @click="runExport('excel')"
              >
                {{ $t('scheduleManagement.exportAsExcel') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedGroup" class="grid grid-cols-2 gap-3 border-b border-gray-100 px-6 py-4 sm:grid-cols-4">
          <div class="rounded-xl bg-primary-50/70 px-3 py-3 text-center ring-1 ring-primary-100">
            <div class="text-xl font-bold tabular-nums text-primary-700">{{ scheduleStats.totalClasses }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('scheduleManagement.statistics.totalClasses') }}</div>
          </div>
          <div class="rounded-xl bg-teal-50/70 px-3 py-3 text-center ring-1 ring-teal-100">
            <div class="text-xl font-bold tabular-nums text-teal-700">{{ scheduleStats.totalHours }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('scheduleManagement.statistics.totalHours') }}</div>
          </div>
          <div class="rounded-xl bg-sky-50/70 px-3 py-3 text-center ring-1 ring-sky-100">
            <div class="text-xl font-bold tabular-nums text-sky-700">{{ scheduleStats.activeTeachers }}</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('scheduleManagement.statistics.activeTeachers') }}</div>
          </div>
          <div class="rounded-xl bg-amber-50/70 px-3 py-3 text-center ring-1 ring-amber-100">
            <div class="text-xl font-bold tabular-nums text-amber-700">{{ scheduleStats.utilizationRate }}%</div>
            <div class="mt-0.5 text-[11px] font-medium text-gray-500">{{ $t('scheduleManagement.statistics.utilizationRate') }}</div>
          </div>
        </div>
      </div>

      <div
        v-if="!selectedGroup"
        class="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-6 py-16 text-center"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 002.25 2.25v7.5m-18 0h18" />
          </svg>
        </div>
        <h3 class="text-base font-semibold text-gray-900">{{ $t('scheduleManagement.noGroupSelected') }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ $t('scheduleManagement.noGroupSelectedDescription') }}</p>
      </div>

      <div
        v-else
        class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]"
      >
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/60 via-white to-teal-50/40 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ $t('scheduleManagement.weeklySchedule') }} — {{ selectedGroup.name }}
          </h2>
        </div>

        <div class="hidden overflow-x-auto lg:block">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="w-20 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {{ $t('common.time') }}
                </th>
                <th
                  v-for="day in weekDays"
                  :key="day.key"
                  class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {{ $t(`scheduleManagement.days.${day.key}`) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="timeSlot in timeSlots" :key="timeSlot.time" class="hover:bg-primary-50/20">
                <td class="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-gray-900">
                  {{ timeSlot.time }}
                </td>
                <td v-for="day in weekDays" :key="`${timeSlot.time}-${day.key}`" class="px-2 py-3 text-center align-top">
                  <template v-if="getClassForTimeAndDay(timeSlot.time, day.key)">
                    <div
                      class="cursor-pointer rounded-xl border border-primary-200 bg-primary-50 p-3 text-start transition-colors hover:border-primary-300 hover:bg-primary-100"
                      @click="editClass(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <div class="text-sm font-semibold text-primary-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-primary-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                      </div>
                      <div class="mt-0.5 text-xs text-primary-600">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.room }}
                      </div>
                    </div>
                  </template>
                  <button
                    v-else
                    type="button"
                    class="flex h-16 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-600"
                    :aria-label="$t('scheduleManagement.addClass')"
                    @click="addClass(timeSlot.time, day.key)"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="lg:hidden">
          <div v-for="day in weekDays" :key="day.key" class="border-b border-gray-100 last:border-b-0">
            <div class="bg-gray-50 px-5 py-3">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t(`scheduleManagement.days.${day.key}`) }}</h3>
            </div>
            <div class="space-y-3 p-4">
              <div v-for="timeSlot in timeSlots" :key="timeSlot.time" class="flex items-center gap-3">
                <div class="w-14 shrink-0 text-sm font-semibold tabular-nums text-gray-500">{{ timeSlot.time }}</div>
                <div class="min-w-0 flex-1">
                  <template v-if="getClassForTimeAndDay(timeSlot.time, day.key)">
                    <div
                      class="cursor-pointer rounded-xl border border-primary-200 bg-primary-50 p-3 transition-colors hover:bg-primary-100"
                      @click="editClass(getClassForTimeAndDay(timeSlot.time, day.key))"
                    >
                      <div class="text-sm font-semibold text-primary-900">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.subjectLabel }}
                      </div>
                      <div class="mt-1 text-xs text-primary-700">
                        {{ getClassForTimeAndDay(timeSlot.time, day.key)?.teacherLabel }}
                        · {{ getClassForTimeAndDay(timeSlot.time, day.key)?.room }}
                      </div>
                    </div>
                  </template>
                  <button
                    v-else
                    type="button"
                    class="flex h-12 w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-600"
                    :aria-label="$t('scheduleManagement.addClass')"
                    @click="addClass(timeSlot.time, day.key)"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="!getDayClasses(day.key).length" class="py-6 text-center text-gray-500">
                <p class="text-sm">{{ $t('scheduleManagement.noClassesScheduled') }}</p>
                <p class="mt-1 text-xs">{{ $t('scheduleManagement.noClassesDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ClassModal
      v-if="showClassModal"
      :class-schedule="selectedClass"
      :group="selectedGroup"
      :day="selectedDay"
      :time="selectedTime"
      :teachers="teachers"
      :courses="courses"
      :rooms="rooms"
      @close="closeClassModal"
      @save="saveClass"
      @delete="deleteClass"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ClassModal from '@/components/ClassModal.vue'
import { authService } from '@/services'
import { courseService } from '@/services/course.service'
import userService from '@/services/user.service'
import { scheduleService } from '@/services/schedule.service'
import { groupService } from '@/services/group.service'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'
import {
  normalizeScheduleDayKey,
  toScheduleHm,
  teacherDisplayName,
  courseDisplayName,
  encodeScheduleNotes,
  decodeScheduleNotes,
} from '@/utils/schedule-display'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: number } | null
  return u?.school_id != null ? Number(u.school_id) : 1
})

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sanitizeFilenameSegment(name: string): string {
  return (
    String(name || 'schedule')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim()
      .slice(0, 80) || 'schedule'
  )
}

function applyRtlToExcel(wb: XLSX.WorkBook, ws: XLSX.WorkSheet, rtl: boolean) {
  if (!rtl) return
  ;(ws as XLSX.WorkSheet & { '!views'?: { RTL?: boolean }[] })['!views'] = [{ RTL: true }]
  wb.Workbook = { ...(wb.Workbook || {}), Views: [{ RTL: true }] }
}

const selectedGroupId = ref('')
const showClassModal = ref(false)
const selectedClass = ref(null)
const selectedDay = ref('')
const selectedTime = ref('')

const groups = ref<any[]>([])
const teachers = ref<any[]>([])
const rooms = ref<any[]>([])
const courses = ref<any[]>([])
const loading = ref(false)
const schedules = ref<Record<string, any[]>>({})

const toHm = toScheduleHm

const fetchGroups = async () => {
  try {
    loading.value = true
    const groupsData = await groupService.getActive(schoolId.value)
    if (groupsData && Array.isArray(groupsData)) {
      groups.value = groupsData.map((group) => ({
        id: group.id,
        name: group.name,
        ageRangeLabel: formatGroupAgeRangeLabel(
          group.age_range_min,
          group.age_range_max,
          t('groupManagement.years'),
        ),
        currentStudents:
          typeof (group as any).studentCount === 'number'
            ? (group as any).studentCount
            : group.students
              ? group.students.length
              : 0,
        capacity: group.capacity,
        description: group.description,
      }))
    } else {
      groups.value = []
    }
  } catch (error) {
    console.error('Database error fetching groups:', error)
    groups.value = []
  } finally {
    loading.value = false
  }
}

const fetchTeachers = async () => {
  try {
    loading.value = true
    const teachersData = await userService.getUsersByRole('teacher')
    teachers.value = teachersData.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      name: `${teacher.firstName} ${teacher.lastName}`,
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      isActive: teacher.isActive,
    }))
  } catch (error) {
    console.error('Error fetching teachers:', error)
    teachers.value = []
  } finally {
    loading.value = false
  }
}

const fetchCourses = async () => {
  try {
    loading.value = true
    const coursesData = await courseService.getAllCourses(schoolId.value)
    courses.value = coursesData
      .filter((course) => course.is_active)
      .map((course) => ({
        id: course.id,
        name: (course.name || course.title || '').trim() || '—',
        title: course.title,
        description: course.description,
        colorCode: course.color_code,
        icon: course.icon,
        ageGroupMin: course.age_group_min,
        ageGroupMax: course.age_group_max,
      }))
  } catch (error) {
    console.error('Error fetching courses:', error)
    courses.value = []
  } finally {
    loading.value = false
  }
}

const fetchRooms = async () => {
  rooms.value = [
    { id: 1, name: 'قاعة 1', capacity: 25 },
    { id: 2, name: 'قاعة 2', capacity: 20 },
    { id: 3, name: 'قاعة الفنون', capacity: 15 },
  ]
}

const fetchSchedules = async (groupId: string) => {
  const gid = String(groupId)
  try {
    loading.value = true
    const schedulesData = await scheduleService.getSchedulesByGroup(gid)
    const mapped = schedulesData
      .map((schedule: any) => {
        const dayKey = normalizeScheduleDayKey(schedule.day_of_week)
        if (!dayKey) return null

        const label = courseDisplayName(schedule.course, (schedule.subject || '').trim() || '—')
        const courseId = schedule.course_id
        const subjectKey = courseId != null && courseId !== '' ? String(courseId) : String(label)
        const tid =
          schedule.teacher_id != null && schedule.teacher_id !== '' ? String(schedule.teacher_id) : ''
        const teacherLabel = teacherDisplayName(
          schedule.teacher,
          tid ? '—' : t('scheduleManagement.unspecifiedTeacher'),
        )
        const roomId = schedule.room_id != null ? Number(schedule.room_id) : null
        const decoded = decodeScheduleNotes(schedule.notes || '')
        const roomName =
          schedule.room?.name ||
          decoded.room ||
          rooms.value.find((r) => Number(r.id) === roomId)?.name ||
          (roomId ? `Room ${roomId}` : t('scheduleManagement.unspecifiedRoom'))

        return {
          id: schedule.id,
          day: dayKey,
          startTime: toHm(schedule.start_time),
          endTime: toHm(schedule.end_time),
          subject: subjectKey,
          subjectLabel: label,
          teacher: tid,
          teacherLabel,
          room: roomName,
          roomId,
          notes: decoded.notes,
          courseId: courseId != null ? String(courseId) : null,
          teacherId: tid || null,
          groupId: schedule.group_id,
        }
      })
      .filter(Boolean)

    schedules.value = { ...schedules.value, [gid]: mapped }
  } catch (error) {
    console.error('Error fetching schedules:', error)
    schedules.value = { ...schedules.value, [gid]: [] }
  } finally {
    loading.value = false
  }
}

const weekDays = [
  { key: 'sunday', name: 'الأحد' },
  { key: 'monday', name: 'الاثنين' },
  { key: 'tuesday', name: 'الثلاثاء' },
  { key: 'wednesday', name: 'الأربعاء' },
  { key: 'thursday', name: 'الخميس' },
]

const defaultTimeSlots = [
  { time: '08:00' },
  { time: '08:45' },
  { time: '09:30' },
  { time: '10:15' },
  { time: '11:00' },
  { time: '11:45' },
  { time: '12:30' },
  { time: '13:15' },
]

const timeSlots = ref([...defaultTimeSlots])

const loadClassSettings = () => {
  try {
    const savedSettings = localStorage.getItem('classSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.timeSlots && settings.timeSlots.length > 0) {
        timeSlots.value = settings.timeSlots.map((slot: any) => ({ time: slot.startTime }))
      }
    }
  } catch (error) {
    console.warn('Failed to load class settings:', error)
  }
}

onMounted(async () => {
  loadClassSettings()
  await Promise.all([fetchGroups(), fetchTeachers(), fetchCourses(), fetchRooms()])
  if (groups.value.length > 0 && !selectedGroupId.value) {
    selectedGroupId.value = String(groups.value[0].id)
  }
})

const selectedGroup = computed(() => {
  const sid = selectedGroupId.value
  if (!sid) return undefined
  return groups.value.find((group) => String(group.id) === String(sid))
})

const currentSchedule = computed(() => {
  const gid = String(selectedGroupId.value || '')
  return gid ? schedules.value[gid] || [] : []
})

const scheduleStats = computed(() => {
  const schedule = currentSchedule.value
  const totalClasses = schedule.length
  const totalHours = schedule.reduce((sum, cls) => {
    const start = new Date(`2000-01-01 ${cls.startTime}`)
    const end = new Date(`2000-01-01 ${cls.endTime}`)
    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }, 0)
  const uniqueTeachers = new Set(
    schedule.map((cls) => cls.teacherId || cls.teacher).filter(Boolean),
  ).size
  const utilizationRate = Math.round((totalClasses / (weekDays.length * timeSlots.value.length)) * 100)

  return {
    totalClasses,
    totalHours: Math.round(totalHours * 10) / 10,
    activeTeachers: uniqueTeachers,
    utilizationRate,
  }
})

const onGroupChange = async () => {
  selectedClass.value = null
  if (selectedGroupId.value) {
    await fetchSchedules(String(selectedGroupId.value))
  }
}

watch(selectedGroupId, () => {
  void onGroupChange()
})

const getClassForTimeAndDay = (time: string, day: string) => {
  return currentSchedule.value.find((cls) => cls.startTime === time && cls.day === day)
}

const getDayClasses = (day: string) => currentSchedule.value.filter((cls) => cls.day === day)

const addClass = (time: string, day: string) => {
  selectedClass.value = null
  selectedTime.value = time
  selectedDay.value = day
  showClassModal.value = true
}

const editClass = (classItem: any) => {
  selectedClass.value = classItem
  selectedTime.value = classItem.startTime
  selectedDay.value = classItem.day
  showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
  selectedTime.value = ''
  selectedDay.value = ''
}

const saveClass = async (classData: any) => {
  const groupId = String(selectedGroupId.value)
  if (!schedules.value[groupId]) {
    schedules.value[groupId] = []
  }

  try {
    loading.value = true
    const teacherIdStr = String(classData.teacher ?? '').trim()
    let teacher = teachers.value.find((tRow) => String(tRow.id) === teacherIdStr)
    if (!teacher && classData.teacher) {
      const fullName = String(classData.teacher).trim()
      teacher = teachers.value.find((tRow) => `${tRow.firstName} ${tRow.lastName}`.trim() === fullName)
    }

    const startTime = new Date(`2000-01-01 ${classData.startTime}`)
    const endTime = new Date(`2000-01-01 ${classData.endTime}`)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

    const sid = String(classData.subject ?? '').trim()
    const course = courses.value.find((c) => {
      const idStr = String(c.id)
      const title = (c as { title?: string }).title
      return (
        idStr === sid ||
        (c.name && String(c.name).trim() === sid) ||
        (title && String(title).trim() === sid)
      )
    })

    const roomRaw = String(classData.room ?? '').trim()
    const scheduleData = {
      day_of_week: classData.day,
      start_time: classData.startTime,
      end_time: classData.endTime,
      duration_minutes: durationMinutes,
      notes: encodeScheduleNotes(roomRaw, classData.notes || ''),
      group_id: groupId,
      course_id: course?.id || null,
      teacher_id: teacher?.id || null,
      room_id: null,
    }

    if (selectedClass.value) {
      await scheduleService.updateSchedule(selectedClass.value.id, scheduleData)
      await fetchSchedules(groupId)
    } else {
      await scheduleService.createSchedule(scheduleData)
      await fetchSchedules(groupId)
    }
  } catch (error) {
    console.error('Error saving schedule:', error)
    alert(t('scheduleManagement.saveFailed'))
  } finally {
    loading.value = false
  }

  closeClassModal()
}

const deleteClass = async (classItem: any) => {
  const groupId = String(selectedGroupId.value)

  try {
    loading.value = true
    await scheduleService.deleteSchedule(classItem.id)
    const index = schedules.value[groupId].findIndex((cls) => cls.id === classItem.id)
    if (index !== -1) {
      schedules.value[groupId].splice(index, 1)
    }
  } catch (error) {
    console.error('Error deleting schedule:', error)
    alert(t('scheduleManagement.deleteFailed'))
  } finally {
    loading.value = false
  }

  closeClassModal()
}

function classCellText(cls: any | undefined): string {
  if (!cls) return ''
  const subject = cls.subjectLabel || cls.subject || ''
  const teacher = cls.teacherLabel || cls.teacher || ''
  const room = cls.room || ''
  return [subject, teacher, room].filter(Boolean).join(' · ')
}

function exportStamp(): string {
  try {
    return new Date().toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return new Date().toISOString()
  }
}

function buildExcelWorkbookRows(): (string | number)[][] {
  const dayHeaders = weekDays.map((d) => t(`scheduleManagement.days.${d.key}`))
  const rows: (string | number)[][] = [
    [t('scheduleManagement.title')],
    [`${t('common.group')}: ${selectedGroup.value?.name || ''}`],
    [`${t('scheduleManagement.exportGeneratedAt')}: ${exportStamp()}`],
    [],
    [t('scheduleManagement.statistics.totalClasses'), scheduleStats.value.totalClasses],
    [t('scheduleManagement.statistics.totalHours'), scheduleStats.value.totalHours],
    [t('scheduleManagement.statistics.activeTeachers'), scheduleStats.value.activeTeachers],
    [t('scheduleManagement.statistics.utilizationRate'), `${scheduleStats.value.utilizationRate}%`],
    [],
    [t('common.time'), ...dayHeaders],
  ]

  for (const slot of timeSlots.value) {
    rows.push([
      slot.time,
      ...weekDays.map((day) => classCellText(getClassForTimeAndDay(slot.time, day.key))),
    ])
  }

  rows.push([])
  rows.push([t('scheduleManagement.exportFlatList')])
  rows.push([
    t('scheduleManagement.classModal.day'),
    t('common.time'),
    t('scheduleManagement.classModal.subject'),
    t('scheduleManagement.classModal.teacher'),
    t('scheduleManagement.classModal.room'),
    t('scheduleManagement.classModal.notes'),
  ])

  const sorted = [...currentSchedule.value].sort((a, b) => {
    const dayOrder =
      weekDays.findIndex((d) => d.key === a.day) - weekDays.findIndex((d) => d.key === b.day)
    if (dayOrder !== 0) return dayOrder
    return String(a.startTime).localeCompare(String(b.startTime))
  })

  for (const cls of sorted) {
    rows.push([
      t(`scheduleManagement.days.${cls.day}`),
      `${cls.startTime}${cls.endTime ? `–${cls.endTime}` : ''}`,
      cls.subjectLabel || cls.subject || '',
      cls.teacherLabel || cls.teacher || '',
      cls.room || '',
      cls.notes || '',
    ])
  }

  return rows
}

function buildExportTableHtml(): string {
  const rtl = isRTL.value
  const ta = rtl ? 'right' : 'left'
  const dayHeaders = weekDays
    .map((d) => `<th>${escapeHtml(t(`scheduleManagement.days.${d.key}`))}</th>`)
    .join('')

  const bodyRows = timeSlots.value
    .map((slot) => {
      const cells = weekDays
        .map((day) => {
          const cls = getClassForTimeAndDay(slot.time, day.key)
          if (!cls) return '<td class="empty">—</td>'
          const subject = escapeHtml(cls.subjectLabel || cls.subject || '')
          const teacher = escapeHtml(cls.teacherLabel || cls.teacher || '')
          const room = escapeHtml(cls.room || '')
          return `<td><div class="subj">${subject}</div><div class="meta">${teacher}</div><div class="meta">${room}</div></td>`
        })
        .join('')
      return `<tr><td class="time">${escapeHtml(slot.time)}</td>${cells}</tr>`
    })
    .join('')

  const stats = scheduleStats.value

  return `
    <style>
      * { box-sizing: border-box; }
      .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; }
      h1 { font-size: 18px; margin: 0 0 6px; font-weight: 700; text-align: ${ta}; }
      h2 { font-size: 13px; margin: 0 0 12px; font-weight: 600; color: #4b5563; text-align: ${ta}; }
      .meta-line { font-size: 12px; color: #374151; margin-bottom: 12px; line-height: 1.5; text-align: ${ta}; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
      .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; text-align: center; background: #f9fafb; }
      .card .n { font-size: 16px; font-weight: 700; color: #0f766e; }
      .card .l { font-size: 10px; color: #6b7280; margin-top: 3px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; text-align: ${ta}; }
      th { background: #f3f4f6; font-weight: 600; font-size: 10px; text-transform: uppercase; color: #4b5563; }
      td.time { font-weight: 700; white-space: nowrap; width: 56px; background: #fafafa; }
      td.empty { color: #9ca3af; text-align: center; }
      .subj { font-weight: 600; color: #111827; }
      .meta { font-size: 10px; color: #6b7280; margin-top: 2px; }
    </style>
    <div class="wrap">
      <h1>${escapeHtml(t('scheduleManagement.title'))}</h1>
      <h2>${escapeHtml(t('scheduleManagement.weeklySchedule'))} — ${escapeHtml(selectedGroup.value?.name || '')}</h2>
      <div class="meta-line">
        <div><strong>${escapeHtml(t('scheduleManagement.exportGeneratedAt'))}</strong>: ${escapeHtml(exportStamp())}</div>
      </div>
      <div class="grid">
        <div class="card"><div class="n">${stats.totalClasses}</div><div class="l">${escapeHtml(t('scheduleManagement.statistics.totalClasses'))}</div></div>
        <div class="card"><div class="n">${stats.totalHours}</div><div class="l">${escapeHtml(t('scheduleManagement.statistics.totalHours'))}</div></div>
        <div class="card"><div class="n">${stats.activeTeachers}</div><div class="l">${escapeHtml(t('scheduleManagement.statistics.activeTeachers'))}</div></div>
        <div class="card"><div class="n">${stats.utilizationRate}%</div><div class="l">${escapeHtml(t('scheduleManagement.statistics.utilizationRate'))}</div></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('common.time'))}</th>
            ${dayHeaders}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `
}

const runExport = async (format: 'word' | 'pdf' | 'excel') => {
  if (!selectedGroup.value) {
    window.alert(t('scheduleManagement.exportSelectGroupFirst'))
    return
  }

  const dateSeg = new Date().toISOString().slice(0, 10)
  const groupSeg = sanitizeFilenameSegment(selectedGroup.value.name)
  const baseName = `schedule_${groupSeg}_${dateSeg}`

  if (format === 'excel') {
    const ws = XLSX.utils.aoa_to_sheet(buildExcelWorkbookRows())
    const wb = XLSX.utils.book_new()
    applyRtlToExcel(wb, ws, isRTL.value)
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule')
    XLSX.writeFile(wb, `${baseName}.xlsx`)
    return
  }

  const inner = buildExportTableHtml()

  if (format === 'word') {
    const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="${locale.value}" dir="${isRTL.value ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${escapeHtml(t('scheduleManagement.title'))}</title></head><body>${inner}</body></html>`
    const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName}.doc`
    a.click()
    URL.revokeObjectURL(url)
    return
  }

  const host = document.createElement('div')
  host.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr')
  host.style.cssText =
    'position:fixed;left:-12000px;top:0;width:1100px;padding:20px;background:#ffffff;z-index:-1;'
  host.innerHTML = inner
  document.body.appendChild(host)
  await nextTick()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

  try {
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    let heightLeft = imgH
    let y = 0
    pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH
    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }
    pdf.save(`${baseName}.pdf`)
  } catch (e) {
    console.error('Schedule PDF export failed:', e)
    window.alert(t('scheduleManagement.exportPdfFailed'))
  } finally {
    host.remove()
  }
}
</script>

<style scoped>
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
