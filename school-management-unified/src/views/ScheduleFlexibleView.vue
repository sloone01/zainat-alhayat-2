<template>
  <DashboardLayout>
    <div class="fk-page fk-tt-canvas" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="fk-tt-board">
        <header class="flex flex-wrap items-end justify-between gap-4">
          <div class="min-w-0">
            <h1 class="fk-tt-board__title">{{ $t('scheduleManagement.flexibleTitle') }}</h1>
            <p v-if="selectedGroup" class="fk-tt-board__meta">{{ selectedGroup.name }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
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
            <div v-if="selectedGroup" class="relative" data-export-menu>
              <button
                type="button"
                class="fk-tt-icon"
                :aria-label="$t('scheduleManagement.exportMenu')"
                :aria-expanded="showExportMenu"
                aria-haspopup="true"
                @click="toggleExportMenu"
              >
                <IconDownload />
              </button>
              <div
                v-if="showExportMenu"
                role="menu"
                class="absolute end-0 z-30 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1 text-start shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="onExport('word')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-sky-100 text-[10px] font-bold text-sky-800">W</span>
                  {{ $t('scheduleManagement.exportAsWord') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="onExport('pdf')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-red-100 text-[10px] font-bold text-red-800">PDF</span>
                  {{ $t('scheduleManagement.exportAsPdf') }}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  @click="onExport('excel')"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-[10px] font-bold text-emerald-800">XLS</span>
                  {{ $t('scheduleManagement.exportAsExcel') }}
                </button>
              </div>
            </div>
            <button
              v-if="selectedGroup"
              type="button"
              class="fk-tt-add"
              @click="addClass('', '')"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
              </svg>
              {{ $t('scheduleManagement.addSession') }}
            </button>
          </div>
        </header>
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
          <div class="hidden overflow-x-auto lg:block">
            <div class="fk-tt-grid" style="grid-template-columns: repeat(5, minmax(0, 1fr))">
              <div
                v-for="day in weekDays"
                :key="day.key"
                class="flex min-w-0 flex-col gap-1.5"
              >
                <div
                  class="fk-tt-grid__day"
                  :class="day.key === todayDayKey ? 'fk-tt-grid__day--today' : ''"
                >
                  {{ $t(`scheduleManagement.days.${day.key}`) }}
                  <template v-if="day.key === todayDayKey"> · {{ $t('scheduleUi.today') }}</template>
                </div>
                <button
                  v-for="cls in sortedDayClasses(day.key)"
                  :key="cls.id"
                  type="button"
                  class="fk-tt-cell fk-tt-cell--lesson w-full"
                  :class="day.key === todayDayKey ? 'fk-tt-cell--today' : ''"
                  :style="{ minHeight: `${sessionCardHeight(cls)}px` }"
                  @click="editClass(cls)"
                >
                  <p class="fk-tt-cell__title">{{ cls.subjectLabel }}</p>
                  <p class="fk-tt-cell__meta">{{ cls.teacherLabel }}</p>
                  <p class="fk-tt-cell__meta">{{ cls.startTime }} – {{ cls.endTime }}</p>
                  <p v-if="cls.room" class="fk-tt-cell__meta">{{ cls.room }}</p>
                </button>
                <button
                  type="button"
                  class="fk-tt-cell fk-tt-cell--empty mt-auto w-full"
                  @click="addClass(nextStartForDay(day.key), day.key)"
                >
                  {{ $t('scheduleUi.add') }}
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-5 lg:hidden">
            <div v-for="day in weekDays" :key="day.key" class="space-y-2">
              <h3 class="text-sm font-semibold text-[#0a2147]">
                {{ $t(`scheduleManagement.days.${day.key}`) }}
                <template v-if="day.key === todayDayKey"> · {{ $t('scheduleUi.today') }}</template>
              </h3>
              <button
                v-for="cls in sortedDayClasses(day.key)"
                :key="cls.id"
                type="button"
                class="fk-tt-lesson w-full"
                @click="editClass(cls)"
              >
                <span class="fk-tt-lesson__clock">
                  {{ cls.startTime }}<template v-if="cls.endTime"><br>{{ cls.endTime }}</template>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="fk-tt-lesson__title">{{ cls.subjectLabel }}</p>
                  <p class="fk-tt-lesson__sub">
                    {{ cls.teacherLabel }}
                    <template v-if="cls.room"> · {{ cls.room }}</template>
                  </p>
                </div>
              </button>
              <button
                type="button"
                class="fk-tt-cell fk-tt-cell--empty min-h-14 w-full"
                @click="addClass(nextStartForDay(day.key), day.key)"
              >
                {{ $t('scheduleUi.add') }}
              </button>
            </div>
          </div>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import IconDownload from '@/components/icons/IconDownload.vue'
import ClassModal from '@/components/ClassModal.vue'
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

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

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
const showExportMenu = ref(false)
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

const firstClassTime = ref('08:00')

const loadFirstClassTime = async () => {
  try {
    const saved = localStorage.getItem('classSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.firstClassTime) firstClassTime.value = settings.firstClassTime
    }
  } catch {
    /* keep default */
  }
  try {
    const { classSettingsService } = await import('@/services')
    const all = await classSettingsService.getAll()
    const first = all.find((s: any) => s.setting_type === 'first_class_time' || s.name === 'firstClassTime')
    if (first?.time_value) firstClassTime.value = String(first.time_value).slice(0, 5)
  } catch {
    /* keep default */
  }
}

onMounted(async () => {
  document.addEventListener('click', handleExportMenuClickOutside)
  await loadFirstClassTime()
  await Promise.all([fetchGroups(), fetchTeachers(), fetchCourses(), fetchRooms()])
  if (groups.value.length > 0 && !selectedGroupId.value) {
    selectedGroupId.value = String(groups.value[0].id)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleExportMenuClickOutside)
})

function toggleExportMenu() {
  showExportMenu.value = !showExportMenu.value
}

function onExport(format: 'word' | 'pdf' | 'excel') {
  showExportMenu.value = false
  void runExport(format)
}

function handleExportMenuClickOutside(event: Event) {
  const target = event.target as Element
  if (showExportMenu.value && !target.closest('[data-export-menu]')) {
    showExportMenu.value = false
  }
}

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

const sessionCardHeight = (cls: any) => Math.max(88, Math.round(sessionMinutes(cls) * 0.7))

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
  const rows: (string | number)[][] = [
    [t('scheduleManagement.title')],
    [`${t('common.group')}: ${selectedGroup.value?.name || ''}`],
    [`${t('scheduleManagement.exportGeneratedAt')}: ${exportStamp()}`],
    [],
    [
      t('scheduleManagement.classModal.day'),
      t('common.time'),
      t('scheduleManagement.classModal.subject'),
      t('scheduleManagement.classModal.teacher'),
      t('scheduleManagement.classModal.room'),
      t('scheduleManagement.classModal.notes'),
    ],
  ]

  for (const day of weekDays) {
    const list = sortedDayClasses(day.key)
    if (!list.length) {
      rows.push([t(`scheduleManagement.days.${day.key}`), '—', '', '', '', ''])
      continue
    }
    for (const cls of list) {
      rows.push([
        t(`scheduleManagement.days.${cls.day}`),
        `${cls.startTime}${cls.endTime ? `–${cls.endTime}` : ''}`,
        cls.subjectLabel || cls.subject || '',
        cls.teacherLabel || cls.teacher || '',
        cls.room || '',
        cls.notes || '',
      ])
    }
  }

  return rows
}

function buildExportTableHtml(): string {
  const rtl = isRTL.value
  const ta = rtl ? 'right' : 'left'

  const dayColumns = weekDays
    .map((day) => {
      const list = sortedDayClasses(day.key)
      const cards = list.length
        ? list
            .map((cls) => {
              const subject = escapeHtml(cls.subjectLabel || cls.subject || '')
              const teacher = escapeHtml(cls.teacherLabel || cls.teacher || '')
              const room = escapeHtml(cls.room || '')
              const time = escapeHtml(`${cls.startTime}–${cls.endTime}`)
              const mins = sessionMinutes(cls)
              return `<div class="card"><div class="meta">${time} · ${mins}</div><div class="subj">${subject}</div><div class="meta">${teacher}</div><div class="meta">${room}</div></div>`
            })
            .join('')
        : `<div class="empty">${escapeHtml(t('scheduleManagement.noClassesDescription'))}</div>`
      return `<td class="day-col"><div class="day-title">${escapeHtml(t(`scheduleManagement.days.${day.key}`))}</div>${cards}</td>`
    })
    .join('')

  return `
    <style>
      * { box-sizing: border-box; }
      .wrap { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; }
      h1 { font-size: 18px; margin: 0 0 6px; font-weight: 700; text-align: ${ta}; }
      h2 { font-size: 13px; margin: 0 0 12px; font-weight: 600; color: #4b5563; text-align: ${ta}; }
      .meta-line { font-size: 12px; color: #374151; margin-bottom: 12px; line-height: 1.5; text-align: ${ta}; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; }
      th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; text-align: ${ta}; }
      .day-title { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #4b5563; margin-bottom: 8px; }
      .card { border: 1px solid #99d5d2; background: #f0fafa; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
      .subj { font-weight: 600; color: #111827; }
      .meta { font-size: 10px; color: #6b7280; margin-top: 2px; }
      .empty { color: #9ca3af; font-size: 10px; }
    </style>
    <div class="wrap">
      <h1>${escapeHtml(t('scheduleManagement.title'))}</h1>
      <h2>${escapeHtml(t('scheduleManagement.weeklySchedule'))} — ${escapeHtml(selectedGroup.value?.name || '')}</h2>
      <div class="meta-line">
        <div><strong>${escapeHtml(t('scheduleManagement.exportGeneratedAt'))}</strong>: ${escapeHtml(exportStamp())}</div>
      </div>
      <table>
        <tbody>
          <tr>${dayColumns}</tr>
        </tbody>
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
