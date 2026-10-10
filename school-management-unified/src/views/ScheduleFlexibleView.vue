<template>
  <DashboardLayout>
    <div class="fk-page fk-tt-canvas fk-tt-mobile-inset" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('scheduleManagement.flexibleTitle')"
        :subtitle="selectedGroup?.name"
      >
        <template #actions>
            <select
              id="group-select-flex"
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
        <FlexibleTimeline
          :slots="timelineSlots"
          :days="timelineDays"
          :start-minutes="timelineBounds.startMinutes"
          :end-minutes="timelineBounds.endMinutes"
          :rtl="isRTL"
          :busy="loading"
          @select="onTimelineSelect"
          @add="onTimelineAdd"
          @move="onTimelineMove"
          @reject="onTimelineReject"
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
      :teachers="teachers"
      :courses="courses"
      :rooms="rooms"
      :day-sessions="currentSchedule"
      :first-class-time="firstClassTime"
      :week-days="weekDays.map((d) => d.key)"
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
import FlexibleTimeline from '@/components/FlexibleTimeline.vue'
import { useFeedback } from '@/composables/useFeedback'
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
  sessionDurationMinutes,
  hmToMinutes,
  schoolWeekdayIndex,
} from '@/utils/schedule-display'
import { isCourseSchedulable } from '@/utils/course-status'
import { resolveFeeLevelId } from '@/utils/fee-level'
import { downloadPrintableTimetable, type PrintableTimetable } from '@/utils/printable-timetable'
import { useSchoolBrand } from '@/composables/useSchoolBrand'

const { locale, t } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const { schoolName } = useSchoolBrand()

const SESSION_COLORS = ['#2563eb', '#059669', '#7c3aed', '#ea580c', '#0f766e', '#db2777', '#ca8a04']

function sessionColor(courseId: string | null, raw?: string) {
  const value = String(raw || '').trim()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value
  const key = String(courseId || value || 'session')
  let index = 0
  for (let i = 0; i < key.length; i += 1) index = (index + key.charCodeAt(i)) % SESSION_COLORS.length
  return SESSION_COLORS[index]
}

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
          color: sessionColor(
            courseId != null ? String(courseId) : null,
            schedule.course?.color_code || schedule.course?.colorCode,
          ),
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

const schoolStartTime = ref('07:30')
const schoolEndTime = ref('')
const firstClassTime = ref('08:00')
const periodsPerDay = ref(6)
const defaultDurationMinutes = ref(45)
const breakMinutesTotal = ref(0)

function sliceHm(value: unknown): string {
  const text = String(value || '').slice(0, 5)
  return /^\d{2}:\d{2}$/.test(text) ? text : ''
}

const loadSchoolDay = async () => {
  try {
    const saved = localStorage.getItem('classSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      const start = sliceHm(settings.schoolStartTime)
      const end = sliceHm(settings.schoolEndTime)
      const first = sliceHm(settings.firstClassTime)
      if (start) schoolStartTime.value = start
      if (end) schoolEndTime.value = end
      if (first) firstClassTime.value = first
      if (Number(settings.periodsPerDay) > 0) periodsPerDay.value = Number(settings.periodsPerDay)
      const durations = Array.isArray(settings.classDurations) ? settings.classDurations : []
      const preferred = durations.find((row: { isDefault?: boolean; minutes?: number }) => row?.isDefault)
      if (Number(preferred?.minutes) > 0) defaultDurationMinutes.value = Number(preferred.minutes)
      if (Array.isArray(settings.breakTimes)) {
        breakMinutesTotal.value = settings.breakTimes.reduce(
          (sum: number, row: { duration?: number }) => sum + (Number(row?.duration) || 0),
          0,
        )
      }
    }
  } catch {
    /* keep defaults */
  }
  try {
    const { classSettingsService } = await import('@/services')
    const all = await classSettingsService.getAll()
    const first = all.find((s: any) => s.setting_type === 'first_class_time' || s.name === 'firstClassTime')
    if (first?.time_value) firstClassTime.value = String(first.time_value).slice(0, 5)
  } catch {
    /* keep defaults */
  }
}

onMounted(async () => {
  await loadSchoolDay()
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

const onGroupChange = async () => {
  selectedClass.value = null
  if (selectedGroupId.value) {
    await fetchSchedules(String(selectedGroupId.value))
  }
}

watch(selectedGroupId, () => {
  void onGroupChange()
})

const sortedDayClasses = (day: string) =>
  currentSchedule.value
    .filter((cls) => cls.day === day)
    .slice()
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))

const sessionMinutes = (cls: any) => sessionDurationMinutes(cls?.startTime, cls?.endTime)

const timelineDays = computed(() =>
  weekDays.map((day) => ({
    key: day.key,
    label: t(`scheduleManagement.days.${day.key}`),
    isToday: day.key === todayDayKey,
  })),
)

const timelineSlots = computed(() =>
  currentSchedule.value.map((cls) => ({
    id: String(cls.id),
    day: cls.day,
    startTime: cls.startTime,
    endTime: cls.endTime,
    title: cls.subjectLabel || cls.subject || '—',
    teacher: cls.teacherLabel || '',
    color: cls.color || sessionColor(cls.courseId, ''),
  })),
)

const resolvedSchoolEnd = computed(() => {
  const stored = hmToMinutes(schoolEndTime.value)
  if (Number.isFinite(stored) && stored > hmToMinutes(schoolStartTime.value)) return stored
  const duration = defaultDurationMinutes.value
  const first = hmToMinutes(firstClassTime.value)
  if (!Number.isFinite(first) || !duration || !periodsPerDay.value) return first + 8 * 60
  return first + periodsPerDay.value * duration + breakMinutesTotal.value
})

const timelineBounds = computed(() => {
  let min = hmToMinutes(schoolStartTime.value)
  if (!Number.isFinite(min)) min = 7 * 60 + 30
  let max = resolvedSchoolEnd.value
  if (!Number.isFinite(max) || max <= min) max = min + 8 * 60
  for (const cls of currentSchedule.value) {
    const start = hmToMinutes(cls.startTime)
    const end = hmToMinutes(cls.endTime)
    if (Number.isFinite(start) && start < min) min = start
    if (Number.isFinite(end) && end > max) max = end
  }
  min = Math.max(0, Math.min(min, 24 * 60 - 60))
  max = Math.min(24 * 60, Math.max(max, min + 60))
  return { startMinutes: min, endMinutes: max }
})

function onTimelineSelect(id: string) {
  const cls = currentSchedule.value.find((item) => String(item.id) === id)
  if (cls) editClass(cls)
}

function onTimelineAdd(day: string) {
  addClass(nextStartForDay(day), day)
}

function onTimelineReject() {
  feedback.error(t('scheduleManagement.overlapRejected'))
}

async function onTimelineMove(payload: { id: string; day: string; startTime: string; endTime: string }) {
  const cls = currentSchedule.value.find((item) => String(item.id) === payload.id)
  const groupId = String(selectedGroupId.value)
  if (!cls || !groupId) return

  const start = hmToMinutes(payload.startTime)
  const end = hmToMinutes(payload.endTime)
  const clash = currentSchedule.value.some((other) => {
    if (String(other.id) === payload.id || other.day !== payload.day) return false
    const otherStart = hmToMinutes(other.startTime)
    const otherEnd = hmToMinutes(other.endTime)
    return start < otherEnd && otherStart < end
  })
  if (clash) {
    feedback.error(t('scheduleManagement.overlapRejected'))
    return
  }

  try {
    loading.value = true
    await scheduleService.updateSchedule(cls.id, {
      day_of_week: payload.day,
      start_time: payload.startTime,
      end_time: payload.endTime,
      duration_minutes: sessionDurationMinutes(payload.startTime, payload.endTime),
      notes: encodeScheduleNotes(cls.room || '', cls.notes || ''),
      group_id: cls.groupId || groupId,
      course_id: cls.courseId || null,
      teacher_id: cls.teacherId || null,
      room_id: null,
    })
    await fetchSchedules(groupId)
  } catch (error) {
    console.error('Error moving schedule:', error)
    feedback.error(t('scheduleManagement.saveFailed'))
    try {
      await fetchSchedules(groupId)
    } catch {
      /* ignore */
    }
  } finally {
    loading.value = false
  }
}

const nextStartForDay = (day: string) => {
  const list = sortedDayClasses(day)
  if (!list.length) return firstClassTime.value
  return list[list.length - 1].endTime || firstClassTime.value
}

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

async function shiftSameDaySessions(opts: {
  day: string
  fromStartHm: string
  deltaMinutes: number
  excludeId?: string | null
}) {
  if (!opts.deltaMinutes) return
  const from = hmToMinutes(opts.fromStartHm)
  if (!Number.isFinite(from)) return

  const targets = currentSchedule.value
    .filter((cls) => {
      if (cls.day !== opts.day) return false
      if (opts.excludeId != null && String(cls.id) === String(opts.excludeId)) return false
      const start = hmToMinutes(cls.startTime)
      return Number.isFinite(start) && start >= from
    })
    .slice()
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))

  // Shift later sessions first when moving forward so we don't collide mid-way;
  // when moving earlier, shift earlier sessions first.
  if (opts.deltaMinutes > 0) targets.reverse()

  for (const cls of targets) {
    try {
      const newStart = addMinutesToHm(cls.startTime, opts.deltaMinutes)
      const newEnd = addMinutesToHm(cls.endTime, opts.deltaMinutes)
      const durationMinutes = sessionDurationMinutes(newStart, newEnd)
      await scheduleService.updateSchedule(cls.id, {
        day_of_week: cls.day,
        start_time: newStart,
        end_time: newEnd,
        duration_minutes: durationMinutes,
        notes: encodeScheduleNotes(cls.room || '', cls.notes || ''),
        group_id: cls.groupId || selectedGroupId.value,
        course_id: cls.courseId || null,
        teacher_id: cls.teacherId || null,
        room_id: null,
      })
    } catch (err) {
      console.error('Shift session failed:', err)
      throw new Error('shift-failed')
    }
  }
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

    const durationMinutes = sessionDurationMinutes(classData.startTime, classData.endTime)

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
      const oldStart = selectedClass.value.startTime
      const oldEnd = selectedClass.value.endTime
      const oldDuration = sessionDurationMinutes(oldStart, oldEnd)
      const delta = durationMinutes - oldDuration

      if (delta > 0) {
        // Make room after the old end before extending this session.
        await shiftSameDaySessions({
          day: classData.day,
          fromStartHm: oldEnd,
          deltaMinutes: delta,
          excludeId: selectedClass.value.id,
        })
        await fetchSchedules(groupId)
      }

      await scheduleService.updateSchedule(selectedClass.value.id, scheduleData)

      if (delta < 0) {
        await fetchSchedules(groupId)
        // Pull later sessions earlier from the old end boundary.
        await shiftSameDaySessions({
          day: classData.day,
          fromStartHm: oldEnd,
          deltaMinutes: delta,
          excludeId: selectedClass.value.id,
        })
      }

      await fetchSchedules(groupId)
    } else {
      // Insert: shift everyone at/after the new start, then create into the gap.
      await shiftSameDaySessions({
        day: classData.day,
        fromStartHm: classData.startTime,
        deltaMinutes: durationMinutes,
        excludeId: null,
      })
      await fetchSchedules(groupId)
      await scheduleService.createSchedule(scheduleData)
      await fetchSchedules(groupId)
    }
  } catch (error) {
    console.error('Error saving schedule:', error)
    alert(
      error instanceof Error && error.message === 'shift-failed'
        ? t('scheduleManagement.shiftFailed')
        : t('scheduleManagement.saveFailed'),
    )
    try {
      await fetchSchedules(groupId)
    } catch {
      /* ignore */
    }
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

function buildPrintableTimetable(): PrintableTimetable {
  const slotKeys: string[] = []
  for (const cls of currentSchedule.value) {
    const key = `${cls.startTime}|${cls.endTime || ''}`
    if (!slotKeys.includes(key)) slotKeys.push(key)
  }
  slotKeys.sort((a, b) => a.localeCompare(b))
  const columns = slotKeys.map((key) => {
    const [start, end] = key.split('|')
    return end ? `${start}–${end}` : start
  })
  const rows = weekDays.map((day) => ({
    day: t(`scheduleManagement.days.${day.key}`),
    cells: (columns.length ? slotKeys : ['']).map((key) => {
      if (!key) return { title: '', detail: '', tone: 'empty' as const }
      const cls = sortedDayClasses(day.key).find((item) => `${item.startTime}|${item.endTime || ''}` === key)
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
