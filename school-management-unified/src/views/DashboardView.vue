<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'" @click="activeMenuId = null">
      <!-- Hero band: muted kicker, big Kufi headline, pill actions (mock 6a/6c) -->
      <section class="fk-elev px-5 py-6 sm:px-8 sm:py-8" aria-labelledby="archive-hero-title">
        <p class="text-sm leading-5 text-fikr-ink-muted">
          {{ $t('dashboard.heroKicker', { role: roleLabel }) }}
        </p>
        <h1 id="archive-hero-title" class="fk-display mt-1 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl">
          {{ $t('dashboard.heroTitle') }}
        </h1>
        <p class="mt-2 text-sm leading-5 text-fikr-ink-muted">{{ currentDate }} · {{ currentTime }}</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <button
            v-if="isStudentUser"
            type="button"
            class="fk-btn fk-btn--navy"
            @click="navigateTo('/progress')"
          >
            {{ $t('dashboard.studentProgressAction') }}
          </button>
          <template v-else-if="isTeacher">
            <button type="button" class="fk-btn fk-btn--navy" @click="navigateTo('/attendance')">
              {{ $t('dashboard.heroAttendance') }}
            </button>
            <button type="button" class="fk-btn fk-btn--mist" @click="navigateTo('/teacher/schedule')">
              {{ $t('dashboard.heroSchedule') }}
            </button>
          </template>
          <template v-else>
            <button type="button" class="fk-btn fk-btn--navy" @click="navigateTo('/students')">
              {{ $t('dashboard.heroEnrollments') }}
            </button>
            <button type="button" class="fk-btn fk-btn--mist" @click="navigateTo('/reports')">
              {{ $t('dashboard.heroGoals') }}
            </button>
          </template>
        </div>
      </section>

      <!-- Admin metric tiles: mist stat tiles, one navy accent (mock 6c) -->
      <section
        v-if="showStaffDashboard && !isTeacher"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        :aria-label="$t('dashboard.dashboard')"
      >
        <button
          type="button"
          class="flex flex-col gap-6 rounded-2xl bg-fikr-mist p-4 text-start transition-colors hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="navigateTo('/students')"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span v-if="!statsLoading && stats?.activeStudents" class="fk-pill fk-pill--teal">
              {{ stats.activeStudents }} {{ $t('dashboard.active') }}
            </span>
          </div>
          <div>
            <p v-if="!statsLoading" class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800">{{ stats?.totalStudents || 0 }}</p>
            <div v-else class="h-9 w-16 animate-pulse rounded-lg bg-white/80" />
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('dashboard.totalStudents') }}</p>
          </div>
        </button>

        <button
          type="button"
          class="flex flex-col gap-6 rounded-2xl bg-fikr-mist p-4 text-start transition-colors hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="navigateTo('/users')"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
              </svg>
            </span>
            <span class="fk-pill bg-white text-fikr-ink-muted">{{ $t('dashboard.staff') }}</span>
          </div>
          <div>
            <p v-if="!statsLoading" class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800">{{ stats?.totalTeachers || 0 }}</p>
            <div v-else class="h-9 w-16 animate-pulse rounded-lg bg-white/80" />
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('dashboard.totalTeachers') }}</p>
          </div>
        </button>

        <button
          type="button"
          class="flex flex-col gap-6 rounded-2xl bg-fikr-mist p-4 text-start transition-colors hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="navigateTo('/groups')"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
            </span>
            <span class="fk-pill bg-white text-fikr-ink-muted">{{ $t('dashboard.classes') }}</span>
          </div>
          <div>
            <p v-if="!statsLoading" class="fk-display text-[28px] font-bold leading-9 tabular-nums text-navy-800">{{ stats?.totalGroups || 0 }}</p>
            <div v-else class="h-9 w-16 animate-pulse rounded-lg bg-white/80" />
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('dashboard.totalGroups') }}</p>
          </div>
        </button>

        <button
          type="button"
          class="flex flex-col gap-6 rounded-2xl bg-navy-800 p-4 text-start text-white transition-colors hover:bg-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="navigateTo('/reports')"
        >
          <div class="flex w-full items-center justify-between gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-fikr-link-on-dark" aria-hidden="true">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span class="text-xs font-medium leading-5 text-fikr-link-on-dark">
              {{ $t('dashboard.newCount', { n: stats?.completedMilestones || 0 }) }}
            </span>
          </div>
          <div>
            <p v-if="!statsLoading" class="fk-display text-2xl font-bold leading-9 text-white">{{ $t('dashboard.reports') }}</p>
            <div v-else class="h-9 w-16 animate-pulse rounded-lg bg-white/20" />
            <p class="mt-0.5 text-xs leading-5 text-white/70">{{ $t('dashboard.readyForReview') }}</p>
          </div>
        </button>
      </section>

      <!-- Student tile -->
      <section v-else-if="isStudentUser" class="grid grid-cols-1">
        <button
          type="button"
          class="flex flex-col gap-6 rounded-2xl bg-fikr-mist p-4 text-start transition-colors hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="navigateTo('/progress')"
        >
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </span>
          <div>
            <p class="fk-display text-xl font-bold leading-7 text-navy-800">{{ $t('dashboard.studentProgressTitle') }}</p>
            <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ $t('dashboard.studentProgressHint') }}</p>
          </div>
        </button>
      </section>

      <LiveMeetingJoinCard
        v-if="isStudentUser"
        :rooms="liveMeetings"
      />

      <div v-if="showStaffDashboard" class="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
        <!-- Recent records: hairline rows with mist status circles (mock 6c activity list) -->
        <section class="fk-elev" aria-labelledby="archive-records-title">
          <div class="flex items-center justify-between gap-4 pb-1">
            <h2 id="archive-records-title" class="fk-display text-xl font-bold leading-7 text-navy-800">{{ $t('dashboard.recordsTitle') }}</h2>
            <button
              type="button"
              class="text-sm font-medium text-navy-800 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              @click="navigateTo('/attendance')"
            >
              {{ $t('dashboard.viewAll') }}
            </button>
          </div>

          <ul class="flex flex-col">
            <li v-for="activity in recentActivities" :key="activity.id" class="fk-sched__row">
              <span class="fk-sched__dot fk-sched__dot--wait" aria-hidden="true">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="getActivityIcon(activity.type)" />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <p class="fk-sched__title">{{ $t(activity.titleKey) }}</p>
                <p class="fk-sched__meta">
                  {{ $t('dashboard.recordsModified', { time: formatTimeAgo(activity.timestamp) }) }}
                </p>
              </div>
              <span class="fk-pill" :class="badgeClass(activity.badge)">
                {{ badgeLabel(activity.badge) }}
              </span>
              <RowActionsMenu
                :open="activeMenuId === activity.id"
                placement="up"
                @toggle="toggleMenu(activity.id)"
              >
                <RowActionsItem icon="view" @click="navigateTo(activity.route)">
                  {{ $t('common.view') }}
                </RowActionsItem>
              </RowActionsMenu>
            </li>
          </ul>
        </section>

        <!-- Calendar + upcoming events -->
        <aside class="fk-elev">
          <div>
            <h2 class="fk-display text-xl font-bold leading-7 text-navy-800">{{ calendarMonth }}</h2>
            <div class="mt-3 grid grid-cols-7 gap-1" role="grid" :aria-label="calendarMonth">
              <span
                v-for="day in weekdayLabels"
                :key="day"
                class="grid min-h-7 place-items-center text-xs font-medium text-fikr-ink-muted"
              >{{ day }}</span>
              <span
                v-for="(cell, idx) in calendarCells"
                :key="idx"
                class="grid min-h-7 place-items-center rounded-full text-xs tabular-nums"
                :class="cell.isToday ? 'bg-primary-500 font-bold text-white' : cell.inMonth ? 'text-navy-800' : 'text-fikr-ink-soft'"
              >
                {{ cell.day }}
              </span>
            </div>
          </div>

          <div class="mt-5">
            <h3 class="text-base font-medium text-navy-800">{{ $t('dashboard.upcomingTitle') }}</h3>
            <ul class="flex flex-col">
              <li v-for="event in upcomingEvents" :key="event.titleKey" class="fk-sched__row">
                <div class="min-w-0 flex-1">
                  <p class="fk-sched__title">{{ $t(event.titleKey) }}</p>
                  <p class="fk-sched__meta">{{ $t(event.metaKey) }}</p>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <!-- CTA row: navy promo + support card (mock 6a/6b promo band) -->
      <section v-if="showStaffDashboard" class="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
        <article class="fk-promo flex flex-col items-start">
          <h2 class="fk-promo__title mt-0">{{ $t('dashboard.innovationsTitle') }}</h2>
          <p class="fk-promo__body">{{ $t('dashboard.innovationsBody') }}</p>
          <div class="fk-promo__actions mt-auto pt-4">
            <button type="button" class="fk-btn fk-btn--white" @click="navigateTo(isTeacher ? '/attendance' : '/reports')">
              {{ isTeacher ? $t('dashboard.takeAttendance') : $t('dashboard.innovationsCta') }}
            </button>
          </div>
        </article>

        <article class="fk-elev flex flex-col items-start p-6">
          <span class="grid h-12 w-12 place-items-center rounded-full bg-fikr-mist text-navy-800" aria-hidden="true">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </span>
          <h2 class="fk-display mt-4 text-xl font-bold leading-7 text-navy-800">{{ $t('dashboard.supportTitle') }}</h2>
          <p class="mt-1 text-sm leading-6 text-fikr-ink-muted">{{ $t('dashboard.supportBody') }}</p>
          <button
            type="button"
            class="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-navy-800 hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            @click="navigateTo('/settings')"
          >
            {{ $t('dashboard.supportLink') }}
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </article>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import LiveMeetingJoinCard from '@/components/LiveMeetingJoinCard.vue'
import { statisticsService, type DashboardStats } from '@/services/statistics.service'
import { authService } from '@/services'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import { canInviteeJoinMeeting } from '@/utils/meeting-host'

type RecordBadge = 'internal' | 'action' | 'draft'

const { t, locale } = useI18n()
const router = useRouter()

const stats = ref<DashboardStats | null>(null)
const statsLoading = ref(true)
const currentUser = ref(authService.getStoredUser())
const currentTime = ref('')
const currentDate = ref('')
const activeMenuId = ref<number | null>(null)
const invitedMeetings = ref<MeetingRoomMineRow[]>([])
const liveMeetings = computed(() => invitedMeetings.value.filter((r) => canInviteeJoinMeeting(r)))
let meetingPoll: ReturnType<typeof setInterval> | null = null

async function loadInvitedMeetings() {
  try {
    invitedMeetings.value = await meetingRoomService.mine()
  } catch {
    invitedMeetings.value = []
  }
}

const recentActivities = ref([
  {
    id: 1,
    type: 'student',
    titleKey: 'dashboard.activityStudentTitle',
    badge: 'internal' as RecordBadge,
    route: '/students',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 2,
    type: 'attendance',
    titleKey: 'dashboard.activityAttendanceTitle',
    badge: 'action' as RecordBadge,
    route: '/attendance',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 3,
    type: 'activity',
    titleKey: 'dashboard.activityNewTitle',
    badge: 'draft' as RecordBadge,
    route: '/activities',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: 4,
    type: 'progress',
    titleKey: 'dashboard.activityProgressTitle',
    badge: 'internal' as RecordBadge,
    route: '/progress',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
])

const upcomingEvents = [
  { titleKey: 'dashboard.eventStaff', metaKey: 'dashboard.eventStaffMeta' },
  { titleKey: 'dashboard.eventParents', metaKey: 'dashboard.eventParentsMeta' },
  { titleKey: 'dashboard.eventReview', metaKey: 'dashboard.eventReviewMeta' },
]

const isRTL = computed(() => locale.value === 'ar')

const showStaffDashboard = computed(() => {
  const r = currentUser.value?.role
  return r === 'admin' || r === 'teacher'
})

const isTeacher = computed(() => currentUser.value?.role === 'teacher')

const isStudentUser = computed(
  () => currentUser.value?.role === 'student' || currentUser.value?.user_type === 'student',
)

const roleLabel = computed(() => {
  const role = currentUser.value?.role
  if (role === 'admin') return t('dashboard.admin')
  if (role === 'teacher') return t('dashboard.teacher')
  if (role === 'student') return t('dashboard.student')
  if (role === 'parent') return t('dashboard.parent')
  return t('dashboard.guestUser')
})

const calendarMonth = computed(() => {
  return new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const weekdayLabels = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-US'
  const start = locale.value === 'ar' ? 6 : 0
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 8, 1 + ((start + i) % 7))
    return d.toLocaleDateString(loc, { weekday: 'narrow' })
  })
})

const calendarCells = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weekStart = locale.value === 'ar' ? 6 : 0
  const firstDow = first.getDay()
  const leading = (firstDow - weekStart + 7) % 7
  const prevDays = new Date(year, month, 0).getDate()
  const cells: { day: number; inMonth: boolean; isToday: boolean }[] = []

  for (let i = leading; i > 0; i -= 1) {
    cells.push({ day: prevDays - i + 1, inMonth: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({
      day: d,
      inMonth: true,
      isToday: d === now.getDate(),
    })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - (leading + daysInMonth) + 1, inMonth: false, isToday: false })
  }
  return cells
})

const navigateTo = (path: string) => {
  activeMenuId.value = null
  router.push(path)
}

const toggleMenu = (id: number) => {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

const badgeLabel = (badge: RecordBadge) => {
  if (badge === 'action') return t('dashboard.badgeAction')
  if (badge === 'draft') return t('dashboard.badgeDraft')
  return t('dashboard.badgeInternal')
}

/** FIKR pill mapping: navy solid = urgent action, outline = draft/attention, mist = neutral. */
const badgeClass = (badge: RecordBadge) => {
  if (badge === 'action') return 'fk-pill--navy'
  if (badge === 'draft') return 'fk-pill--outline'
  return 'fk-pill--mist'
}

const loadDashboardStats = async () => {
  try {
    statsLoading.value = true
    stats.value = await statisticsService.getDashboardStats()
  } catch (error) {
    console.warn('Dashboard stats API failed, using fallback:', error)
    stats.value = {
      totalStudents: 156,
      totalTeachers: 24,
      totalGroups: 8,
      totalCourses: 12,
      activeStudents: 142,
      completedMilestones: 8,
      attendanceRate: 91.2,
    }
  } finally {
    statsLoading.value = false
  }
}

const updateDateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString(locale.value === 'ar' ? 'ar-OM' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  currentDate.value = now.toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getActivityIcon = (type: string) => {
  const icons = {
    student: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    attendance: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    activity: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    progress: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  }
  return icons[type as keyof typeof icons] || 'M12 6v6m0 0v6m0-6h6m-6 0H6'
}

const formatTimeAgo = (timestamp: Date) => {
  const diffInMinutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
  if (diffInMinutes < 60) return t('dashboard.minutesAgo', { n: Math.max(1, diffInMinutes) })
  if (diffInMinutes < 1440) return t('dashboard.hoursAgo', { n: Math.floor(diffInMinutes / 60) })
  return t('dashboard.daysAgo', { n: Math.floor(diffInMinutes / 1440) })
}

onBeforeMount(() => {
  const u = authService.getStoredUser()
  if (u?.role === 'parent') {
    router.replace('/parent/dashboard')
  }
})

onMounted(() => {
  currentUser.value = authService.getStoredUser()

  if (currentUser.value?.role === 'parent') {
    return
  }

  if (showStaffDashboard.value && !isTeacher.value) {
    loadDashboardStats()
  } else {
    statsLoading.value = false
  }

  if (isStudentUser.value) {
    void loadInvitedMeetings()
    meetingPoll = setInterval(() => {
      void loadInvitedMeetings()
    }, 8000)
  }

  updateDateTime()
  setInterval(updateDateTime, 60000)
})

onBeforeUnmount(() => {
  if (meetingPoll) clearInterval(meetingPoll)
})
</script>
