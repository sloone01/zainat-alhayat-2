<template>
  <DashboardLayout>
    <div class="fk-page fk-tt-canvas fk-tt-mobile-inset" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('scheduleManagement.title')"
        :subtitle="selectedGroup?.name"
      >
        <template #actions>
            <select
              id="group-select"
              v-model="selectedGroupId"
              class="fk-tt-pill"
              :disabled="loadingGroups"
              :aria-label="$t('scheduleManagement.selectGroup')"
            >
              <option value="">{{ $t('scheduleManagement.selectGroupPlaceholder') }}</option>
              <option v-for="group in groups" :key="group.id" :value="String(group.id)">
                {{ group.name }}<template v-if="group.ageRangeLabel"> ({{ group.ageRangeLabel }})</template>
              </option>
            </select>
            <TimetableDownloadMenu
              :label="$t('scheduleManagement.downloadTable')"
              :word-label="$t('scheduleManagement.exportAsWord')"
              :pdf-label="$t('scheduleManagement.exportAsPdf')"
              @download="downloadTimetable"
            />
        </template>
      </FikrPageHeader>
      <section class="fk-tt-board">
        <p v-if="groupsError" class="text-xs text-red-600">{{ groupsError }}</p>
        <p v-else-if="!loadingGroups && !groups.length" class="text-xs text-amber-800">
          {{ $t('scheduleManagement.noGroupsAvailable') }}
        </p>

        <div
          v-if="!selectedGroup"
          class="fk-tt-cell fk-tt-cell--empty min-h-40"
        >
          <p class="text-sm font-semibold">{{ $t('scheduleManagement.noGroupSelected') }}</p>
        </div>

        <template v-else>
          <div class="hidden lg:block">
            <ScheduleWeekGrid
              :days="weekDays"
              :slots="weekGridSlots"
              :today-key="todayDayKey"
              :cells="weekGridCells"
              editable
              :add-label="$t('scheduleUi.add')"
              @edit="onGridEdit"
              @add="onGridAdd"
            />
          </div>
          <ScheduleMobileFeed
            variant="lessons"
            :items="mobileDayItems"
            :week-days="weekDays"
            :selected-index="mobileDayIndex"
            :today-index="todayIndex"
            :empty-label="$t('scheduleManagement.noClassesScheduled')"
            :reset-key="`${selectedGroupId}-${mobileDayIndex}`"
            @select="mobileDayIndex = $event"
            @open="onMobileOpen"
          />
        </template>
      </section>
    </div>

    <ClassModal
      v-if="showClassModal"
      :class-schedule="selectedClass"
      :group="selectedGroup"
      :day="selectedDay"
      :time="selectedTime"
      :slot-duration="selectedSlotDuration"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import TimetableDownloadMenu from '@/components/TimetableDownloadMenu.vue'
import ClassModal from '@/components/ClassModal.vue'
import ScheduleMobileFeed, { type ScheduleMobileItem } from '@/components/ScheduleMobileFeed.vue'
import ScheduleWeekGrid, { type WeekGridCell, type WeekGridSlot } from '@/components/ScheduleWeekGrid.vue'
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
  addMinutesToHm,
  periodPhase,
  schoolWeekdayIndex,
} from '@/utils/schedule-display'
import { isCourseSchedulable } from '@/utils/course-status'
import { resolveFeeLevelId } from '@/utils/fee-level'
import { getSelectedScheduleGroupId, setSelectedScheduleGroupId } from '@/utils/selected-schedule-group'
import { downloadPrintableTimetable, type PrintableTimetable } from '@/utils/printable-timetable'
import { useSchoolBrand } from '@/composables/useSchoolBrand'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { schoolName } = useSchoolBrand()

function sanitizeFilenameSegment(name: string): string {
  return (
    String(name || 'schedule')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim()
      .slice(0, 80) || 'schedule'
  )
}

const selectedGroupId = ref('')
const showClassModal = ref(false)
const selectedClass = ref(null)
const selectedDay = ref('')
const selectedTime = ref('')
const selectedSlotDuration = ref(0)

type TimetableSlot = {
  time: string
  duration: number
  kind: 'class' | 'break'
  name?: string
}

const groups = ref<any[]>([])
const groupsError = ref('')
const loadingGroups = ref(false)
const teachers = ref<any[]>([])
const rooms = ref<any[]>([])
const courses = ref<any[]>([])
const loading = ref(false)
const schedules = ref<Record<string, any[]>>({})

const toHm = toScheduleHm

const fetchGroups = async () => {
  try {
    loadingGroups.value = true
    groupsError.value = ''
    const groupsData = await groupService.getActive()
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
        level_id: resolveFeeLevelId(group) || null,
        level: group.level || null,
      }))
    } else {
      groups.value = []
    }
  } catch (error) {
    console.error('Database error fetching groups:', error)
    groups.value = []
    groupsError.value = t('scheduleManagement.groupsLoadFailed')
  } finally {
    loadingGroups.value = false
  }
}

const fetchTeachers = async () => {
  try {
    loading.value = true
    const allUsers = await userService.getAllUsers()
    teachers.value = allUsers
      .filter((user) => {
        if (user.isActive === false) return false
        const roles = Array.isArray(user.roles)
          ? user.roles
          : typeof user.roles === 'string'
            ? user.roles.split(',').map((r) => r.trim())
            : []
        return user.role === 'teacher' || roles.includes('teacher')
      })
      .map((teacher) => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        name: teacherDisplayName(teacher, ''),
        fullName: teacher.fullName || teacherDisplayName(teacher, ''),
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
    const coursesData = await courseService.getAllCourses()
    courses.value = (coursesData || [])
      .filter((course) => isCourseSchedulable(course))
      .map((course) => ({
        id: course.id,
        name: courseDisplayName(course, ''),
        title: course.title,
        description: course.description,
        colorCode: course.color_code,
        icon: course.icon,
        ageGroupMin: course.age_group_min,
        ageGroupMax: course.age_group_max,
        levelId: resolveFeeLevelId(course) || null,
      }))
      .filter((course) => course.id && course.name)
  } catch (error) {
    console.error('Error fetching courses:', error)
    courses.value = []
  } finally {
    loading.value = false
  }
}

const fetchRooms = async () => {
  rooms.value = []
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
          (roomId ? `Room ${roomId}` : '')

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

const todayDayKey = weekDays[schoolWeekdayIndex()]?.key || 'sunday'

const defaultTimeSlots: TimetableSlot[] = [
  { time: '08:00', duration: 45, kind: 'class' },
  { time: '08:45', duration: 45, kind: 'class' },
  { time: '09:30', duration: 45, kind: 'class' },
  { time: '10:15', duration: 45, kind: 'class' },
  { time: '11:00', duration: 45, kind: 'class' },
  { time: '11:45', duration: 45, kind: 'class' },
  { time: '12:30', duration: 45, kind: 'class' },
  { time: '13:15', duration: 45, kind: 'class' },
]

const timeSlots = ref<TimetableSlot[]>([...defaultTimeSlots])

const loadClassSettings = () => {
  try {
    const savedSettings = localStorage.getItem('classSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.timeSlots && settings.timeSlots.length > 0) {
        timeSlots.value = settings.timeSlots.map((slot: any) => ({
          time: String(slot.startTime || '').slice(0, 5),
          duration: Number(slot.duration) > 0 ? Number(slot.duration) : 45,
          kind: slot.kind === 'break' ? 'break' : 'class',
          name: slot.name ? String(slot.name) : undefined,
        }))
      }
    }
  } catch (error) {
    console.warn('Failed to load class settings:', error)
  }
}

const classPeriodSlots = computed(() => timeSlots.value.filter((s) => s.kind !== 'break'))

onMounted(async () => {
  loadClassSettings()
  await Promise.all([fetchGroups(), fetchTeachers(), fetchCourses(), fetchRooms()])
  if (groups.value.length > 0 && !selectedGroupId.value) {
    const stored = getSelectedScheduleGroupId()
    const match = stored && groups.value.some((group) => String(group.id) === stored)
    selectedGroupId.value = match ? stored : String(groups.value[0].id)
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
  const periodCount = Math.max(classPeriodSlots.value.length, 1)
  const utilizationRate = Math.round((totalClasses / (weekDays.length * periodCount)) * 100)

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

watch(selectedGroupId, (groupId) => {
  setSelectedScheduleGroupId(groupId)
  void onGroupChange()
})

const getClassForTimeAndDay = (time: string, day: string) => {
  return currentSchedule.value.find((cls) => cls.startTime === time && cls.day === day)
}

const todayIndex = schoolWeekdayIndex()
const mobileDayIndex = ref(todayIndex)

const weekGridSlots = computed<WeekGridSlot[]>(() => {
  let period = 0
  return timeSlots.value.map((slot) => {
    if (slot.kind === 'break') {
      return {
        time: slot.time,
        kind: 'break',
        name: slot.name || t('classSettings.timeSlots.breakKind'),
        label: slot.name || t('classSettings.timeSlots.breakKind'),
      }
    }
    period += 1
    return {
      time: slot.time,
      kind: 'class',
      label: t('scheduleUi.period', { n: period }),
    }
  })
})

const weekGridCells = computed(() => {
  const map: Record<string, WeekGridCell> = {}
  for (const slot of timeSlots.value) {
    if (slot.kind === 'break') continue
    for (const day of weekDays) {
      const cls = getClassForTimeAndDay(slot.time, day.key)
      if (!cls) continue
      map[`${slot.time}|${day.key}`] = {
        title: cls.subjectLabel,
        meta: [cls.teacherLabel, cls.room].filter(Boolean).join(' · '),
        now: periodPhase(weekDays.findIndex((d) => d.key === day.key), todayIndex, cls.startTime, cls.endTime) === 'now',
      }
    }
  }
  return map
})

const mobileDayItems = computed<ScheduleMobileItem[]>(() => {
  const dayKey = weekDays[mobileDayIndex.value]?.key
  return timeSlots.value.map((slot) => {
    const end = addMinutesToHm(slot.time, slot.duration)
    if (slot.kind === 'break') {
      return {
        id: `break-${slot.time}`,
        title: slot.name || t('classSettings.timeSlots.breakKind'),
        subtitle: '',
        time: slot.time,
        startTime: slot.time,
        endTime: end,
        kind: 'break',
      }
    }
    const cls = getClassForTimeAndDay(slot.time, dayKey)
    if (cls) {
      return {
        id: String(cls.id),
        title: cls.subjectLabel,
        subtitle: cls.teacherLabel,
        time: slot.time,
        startTime: cls.startTime,
        endTime: cls.endTime,
        meta: cls.room || undefined,
        kind: 'lesson',
      }
    }
    return {
      id: `empty-${slot.time}`,
      title: t('scheduleUi.add'),
      subtitle: '',
      time: slot.time,
      startTime: slot.time,
      endTime: end,
      kind: 'empty',
    }
  })
})

const onGridEdit = ({ time, day }: { time: string; day: string }) => {
  const cls = getClassForTimeAndDay(time, day)
  if (cls) editClass(cls)
}

const onGridAdd = ({ time, day }: { time: string; day: string }) => {
  const slot = timeSlots.value.find((s) => s.time === time)
  if (slot) addClass(slot, day)
}

const onMobileOpen = (item: ScheduleMobileItem) => {
  const day = weekDays[mobileDayIndex.value]?.key
  if (!day) return
  if (item.kind === 'empty') {
    const slot = timeSlots.value.find((s) => s.time === item.startTime && s.kind !== 'break')
    if (slot) addClass(slot, day)
    return
  }
  const cls =
    currentSchedule.value.find((row) => String(row.id) === item.id) ||
    getClassForTimeAndDay(item.startTime || item.time, day)
  if (cls) editClass(cls)
}

const addClass = (slot: TimetableSlot, day: string) => {
  if (slot.kind === 'break') return
  selectedClass.value = null
  selectedTime.value = slot.time
  selectedSlotDuration.value = slot.duration
  selectedDay.value = day
  showClassModal.value = true
}

const editClass = (classItem: any) => {
  selectedClass.value = classItem
  selectedTime.value = classItem.startTime
  selectedDay.value = classItem.day
  const matched = timeSlots.value.find(
    (s) => s.kind !== 'break' && s.time === classItem.startTime,
  )
  if (matched) {
    selectedSlotDuration.value = matched.duration
  } else if (classItem.startTime && classItem.endTime) {
    const start = new Date(`2000-01-01 ${classItem.startTime}`)
    const end = new Date(`2000-01-01 ${classItem.endTime}`)
    selectedSlotDuration.value = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
    )
  } else {
    selectedSlotDuration.value = 45
  }
  showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
  selectedTime.value = ''
  selectedDay.value = ''
  selectedSlotDuration.value = 0
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

    if (durationMinutes <= 0) {
      alert(t('scheduleManagement.validation.invalidTimeRange'))
      return
    }

    if (selectedClass.value) {
      await scheduleService.updateSchedule(selectedClass.value.id, scheduleData)
      await fetchSchedules(groupId)
    } else {
      await scheduleService.createSchedule(scheduleData)
      await fetchSchedules(groupId)
    }
    closeClassModal()
  } catch (error) {
    console.error('Error saving schedule:', error)
    alert(scheduleSaveErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function scheduleSaveErrorMessage(error: unknown): string {
  const ax = error as { response?: { data?: { message?: string | string[] } }; message?: string }
  const raw = ax.response?.data?.message
  const text = Array.isArray(raw) ? raw.join(' ') : raw || ax.message || ''
  if (/teacher/i.test(text)) return t('scheduleManagement.validation.teacherConflict')
  if (/room/i.test(text)) return t('scheduleManagement.validation.roomBooked')
  if (/group/i.test(text)) return t('scheduleManagement.validation.groupConflict')
  if (/end time/i.test(text)) return t('scheduleManagement.validation.invalidTimeRange')
  return t('scheduleManagement.saveFailed')
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

function buildPrintableTimetable(): PrintableTimetable {
  const columns = timeSlots.value.map((slot) => {
    const end = addMinutesToHm(slot.time, slot.duration)
    if (slot.kind === 'break') {
      const name = slot.name || t('classSettings.timeSlots.breakKind')
      return `${name}\n${slot.time}–${end}`
    }
    return `${slot.time}–${end}`
  })
  const rows = weekDays.map((day) => ({
    day: t(`scheduleManagement.days.${day.key}`),
    cells: timeSlots.value.map((slot) => {
      if (slot.kind === 'break') return { title: '', detail: '', tone: 'break' as const }
      const cls = getClassForTimeAndDay(slot.time, day.key)
      if (!cls) return { title: '', detail: '', tone: 'empty' as const }
      return {
        title: cls.subjectLabel || cls.subject || '',
        detail: cls.teacherLabel || cls.teacher || '',
        tone: 'class' as const,
      }
    }),
  }))
  const notes = currentSchedule.value
    .filter((cls) => String(cls.notes || '').trim())
    .map((cls) => {
      const day = t(`scheduleManagement.days.${cls.day}`)
      const subject = cls.subjectLabel || cls.subject || ''
      return `${day} · ${subject}: ${String(cls.notes).trim()}`
    })
  return {
    title: t('scheduleManagement.printableTitle'),
    schoolName: schoolName.value,
    groupName: selectedGroup.value?.name || '',
    corner: t('scheduleManagement.dayTimeCorner'),
    notesLabel: t('scheduleManagement.classModal.notes'),
    rtl: isRTL.value,
    columns,
    rows,
    notes,
  }
}

async function downloadTimetable(format: 'pdf' | 'word') {
  if (!selectedGroup.value) {
    window.alert(t('scheduleManagement.exportSelectGroupFirst'))
    return
  }
  const dateSeg = new Date().toISOString().slice(0, 10)
  const groupSeg = sanitizeFilenameSegment(selectedGroup.value.name)
  try {
    await downloadPrintableTimetable(buildPrintableTimetable(), format, `timetable_${groupSeg}_${dateSeg}`)
  } catch (error) {
    console.error('Timetable export failed', error)
    window.alert(t('scheduleManagement.exportFailed'))
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
