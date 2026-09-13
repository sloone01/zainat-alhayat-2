<template>
  <DashboardLayout content-bleed>
    <div class="archive" :dir="isRTL ? 'rtl' : 'ltr'" @click="activeMenuId = null">
      <section class="archive-hero" aria-labelledby="archive-hero-title">
        <div class="archive-hero__inner">
          <p class="archive-kicker">
            {{ $t('dashboard.heroKicker', { role: roleLabel }) }}
          </p>
          <h1 id="archive-hero-title" class="archive-title">
            {{ $t('dashboard.heroTitle') }}
          </h1>
          <p class="archive-meta">{{ currentDate }} · {{ currentTime }}</p>
          <div class="archive-hero__actions">
            <button
              v-if="isStudentUser"
              type="button"
              class="archive-btn archive-btn--solid"
              @click="navigateTo('/progress')"
            >
              {{ $t('dashboard.studentProgressAction') }}
            </button>
            <template v-else-if="isTeacher">
              <button type="button" class="archive-btn archive-btn--solid" @click="navigateTo('/attendance')">
                {{ $t('dashboard.heroAttendance') }}
              </button>
              <button type="button" class="archive-btn archive-btn--ghost" @click="navigateTo('/teacher/schedule')">
                {{ $t('dashboard.heroSchedule') }}
              </button>
            </template>
            <template v-else>
              <button type="button" class="archive-btn archive-btn--solid" @click="navigateTo('/students')">
                {{ $t('dashboard.heroEnrollments') }}
              </button>
              <button type="button" class="archive-btn archive-btn--ghost" @click="navigateTo('/reports')">
                {{ $t('dashboard.heroGoals') }}
              </button>
            </template>
          </div>
        </div>
      </section>

      <div class="archive-body">
        <section v-if="showStaffDashboard && !isTeacher" class="archive-metrics" :aria-label="$t('dashboard.dashboard')">
          <button type="button" class="archive-stat" @click="navigateTo('/students')">
            <div class="archive-stat__top">
              <span class="archive-stat__icon" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span v-if="!statsLoading && stats?.activeStudents" class="archive-stat__chip">
                {{ stats.activeStudents }} {{ $t('dashboard.active') }}
              </span>
            </div>
            <p v-if="!statsLoading" class="archive-stat__value">{{ stats?.totalStudents || 0 }}</p>
            <div v-else class="archive-skel archive-skel--value" />
            <p class="archive-stat__label">{{ $t('dashboard.totalStudents') }}</p>
          </button>

          <button type="button" class="archive-stat" @click="navigateTo('/users')">
            <div class="archive-stat__top">
              <span class="archive-stat__icon" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
                </svg>
              </span>
              <span class="archive-stat__chip">{{ $t('dashboard.staff') }}</span>
            </div>
            <p v-if="!statsLoading" class="archive-stat__value">{{ stats?.totalTeachers || 0 }}</p>
            <div v-else class="archive-skel archive-skel--value" />
            <p class="archive-stat__label">{{ $t('dashboard.totalTeachers') }}</p>
          </button>

          <button type="button" class="archive-stat" @click="navigateTo('/groups')">
            <div class="archive-stat__top">
              <span class="archive-stat__icon" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                </svg>
              </span>
              <span class="archive-stat__chip">{{ $t('dashboard.classes') }}</span>
            </div>
            <p v-if="!statsLoading" class="archive-stat__value">{{ stats?.totalGroups || 0 }}</p>
            <div v-else class="archive-skel archive-skel--value" />
            <p class="archive-stat__label">{{ $t('dashboard.totalGroups') }}</p>
          </button>

          <button type="button" class="archive-stat archive-stat--accent" @click="navigateTo('/reports')">
            <div class="archive-stat__top">
              <span class="archive-stat__icon archive-stat__icon--on-accent" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span class="archive-stat__chip archive-stat__chip--on-accent">
                {{ $t('dashboard.newCount', { n: stats?.completedMilestones || 0 }) }}
              </span>
            </div>
            <p v-if="!statsLoading" class="archive-stat__value">{{ $t('dashboard.reports') }}</p>
            <div v-else class="archive-skel archive-skel--value archive-skel--on-accent" />
            <p class="archive-stat__label">{{ $t('dashboard.readyForReview') }}</p>
          </button>
        </section>

        <section v-else-if="isStudentUser" class="archive-metrics">
          <button type="button" class="archive-stat archive-stat--wide" @click="navigateTo('/progress')">
            <div class="archive-stat__top">
              <span class="archive-stat__icon" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <p class="archive-stat__value archive-stat__value--text">{{ $t('dashboard.studentProgressTitle') }}</p>
            <p class="archive-stat__label">{{ $t('dashboard.studentProgressHint') }}</p>
          </button>
        </section>

        <LiveMeetingJoinCard
          v-if="isStudentUser"
          class="mt-4"
          :rooms="liveMeetings"
        />

        <div v-if="showStaffDashboard" class="archive-split">
          <section class="archive-panel" aria-labelledby="archive-records-title">
            <div class="archive-panel__head">
              <h2 id="archive-records-title" class="archive-heading">{{ $t('dashboard.recordsTitle') }}</h2>
              <button type="button" class="archive-text-link" @click="navigateTo('/attendance')">
                {{ $t('dashboard.viewAll') }}
              </button>
            </div>

            <ul class="archive-records">
              <li v-for="activity in recentActivities" :key="activity.id" class="archive-record">
                <span class="archive-record__icon" aria-hidden="true">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="getActivityIcon(activity.type)" />
                  </svg>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="archive-record__title">{{ $t(activity.titleKey) }}</p>
                  <p class="archive-record__meta">
                    {{ $t('dashboard.recordsModified', { time: formatTimeAgo(activity.timestamp) }) }}
                  </p>
                </div>
                <span class="archive-badge" :class="`archive-badge--${activity.badge}`">
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

          <aside class="archive-panel">
            <div class="archive-cal">
              <h2 class="archive-heading">{{ calendarMonth }}</h2>
              <div class="archive-cal__grid" role="grid" :aria-label="calendarMonth">
                <span v-for="day in weekdayLabels" :key="day" class="archive-cal__dow">{{ day }}</span>
                <span
                  v-for="(cell, idx) in calendarCells"
                  :key="idx"
                  class="archive-cal__day"
                  :class="{
                    'archive-cal__day--muted': !cell.inMonth,
                    'archive-cal__day--today': cell.isToday,
                  }"
                >
                  {{ cell.day }}
                </span>
              </div>
            </div>

            <div class="archive-events">
              <h3 class="archive-subhead">{{ $t('dashboard.upcomingTitle') }}</h3>
              <ul>
                <li v-for="event in upcomingEvents" :key="event.titleKey" class="archive-event">
                  <span class="archive-event__bar" aria-hidden="true" />
                  <div>
                    <p class="archive-event__title">{{ $t(event.titleKey) }}</p>
                    <p class="archive-event__meta">{{ $t(event.metaKey) }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section v-if="showStaffDashboard" class="archive-cta-row">
          <article class="archive-cta archive-cta--photo">
            <h2 class="archive-cta__title">{{ $t('dashboard.innovationsTitle') }}</h2>
            <p class="archive-cta__body">{{ $t('dashboard.innovationsBody') }}</p>
            <button type="button" class="archive-btn archive-btn--solid" @click="navigateTo(isTeacher ? '/attendance' : '/reports')">
              {{ isTeacher ? $t('dashboard.takeAttendance') : $t('dashboard.innovationsCta') }}
            </button>
          </article>

          <article class="archive-cta archive-cta--plain">
            <span class="archive-cta__glyph" aria-hidden="true">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <h2 class="archive-cta__title archive-cta__title--ink">{{ $t('dashboard.supportTitle') }}</h2>
            <p class="archive-cta__body archive-cta__body--muted">{{ $t('dashboard.supportBody') }}</p>
            <button type="button" class="archive-text-link" @click="navigateTo('/settings')">
              {{ $t('dashboard.supportLink') }}
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </article>
        </section>
      </div>
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

<style scoped>
.archive {
  --fikr-navy: #0a2147;
  --fikr-teal: #00a19b;
  --fikr-teal-deep: #00847f;
  --fikr-ink: #1a2a3a;
  --fikr-muted: #6b7c8d;
  --fikr-line: #e4e9ef;
  --fikr-canvas: #f4f7f8;
  --fikr-card: #ffffff;
  background: var(--fikr-canvas);
  color: var(--fikr-ink);
  min-height: 100%;
  font-family: 'Be Vietnam Pro', 'Noto Sans Arabic', system-ui, sans-serif;
}

.archive-hero {
  position: relative;
  min-height: 280px;
  margin: 1rem 1rem 0;
  padding: 2.5rem 1.25rem 3rem;
  border-radius: 1rem;
  overflow: hidden;
  background:
    linear-gradient(105deg, rgba(10, 33, 71, 0.7) 0%, rgba(10, 33, 71, 0.42) 58%, rgba(0, 161, 155, 0.2) 100%),
    url('/dashboard-hero.jpg') center / cover no-repeat;
  color: #fff;
}

@media (min-width: 640px) {
  .archive-hero {
    margin: 1.25rem 1.5rem 0;
  }
}

@media (min-width: 768px) {
  .archive-hero {
    min-height: 320px;
    padding: 3.5rem 2.5rem 3.75rem;
  }
}

@media (min-width: 1024px) {
  .archive-hero {
    margin: 1.5rem 2rem 0;
  }
}

.archive-hero__inner {
  max-width: 44rem;
}

.archive-kicker {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}

.archive-title {
  margin: 0;
  font-size: clamp(1.65rem, 3.4vw, 2.35rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.archive-meta {
  margin: 0.85rem 0 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.78);
}

.archive-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.archive-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.65rem 1.15rem;
  border-radius: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 120ms ease;
}

.archive-btn:active {
  transform: scale(0.98);
}

.archive-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.archive-btn--solid {
  border: 0;
  background: var(--fikr-teal);
  color: #fff;
}

.archive-btn--solid:hover {
  background: var(--fikr-teal-deep);
}

.archive-btn--ghost {
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: transparent;
  color: #fff;
}

.archive-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.12);
}

.archive-body {
  padding: 1.25rem 1rem 4.5rem;
}

@media (min-width: 640px) {
  .archive-body {
    padding: 1.5rem 1.5rem 5rem;
  }
}

@media (min-width: 1024px) {
  .archive-body {
    padding: 1.75rem 2rem 5.5rem;
  }
}

.archive-metrics {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  margin-top: -2.25rem;
  position: relative;
  z-index: 1;
}

@media (min-width: 640px) {
  .archive-metrics {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1100px) {
  .archive-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.archive-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  padding: 1.15rem 1.2rem 1.25rem;
  border: 1px solid var(--fikr-line);
  border-radius: 1rem;
  background: var(--fikr-card);
  box-shadow: 0 8px 24px rgba(10, 33, 71, 0.06);
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.archive-stat:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(10, 33, 71, 0.1);
}

.archive-stat:focus-visible {
  outline: 2px solid var(--fikr-teal);
  outline-offset: 2px;
}

.archive-stat--wide {
  grid-column: 1 / -1;
}

.archive-stat--accent {
  background: var(--fikr-navy);
  border-color: var(--fikr-navy);
  color: #fff;
}

.archive-stat__top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.archive-stat__icon {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
  background: #eef3f6;
  color: var(--fikr-navy);
}

.archive-stat__icon--on-accent {
  background: rgba(0, 161, 155, 0.2);
  color: #7ee8e3;
}

.archive-stat__chip {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fikr-teal-deep);
}

.archive-stat__chip--on-accent {
  color: #7ee8e3;
}

.archive-stat__value {
  margin: 0.85rem 0 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.archive-stat__value--text {
  font-size: 1.35rem;
}

.archive-stat__label {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--fikr-muted);
}

.archive-stat--accent .archive-stat__label {
  color: rgba(255, 255, 255, 0.72);
}

.archive-split {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

@media (min-width: 1024px) {
  .archive-split {
    grid-template-columns: minmax(0, 1.35fr) minmax(16rem, 0.85fr);
  }
}

.archive-panel {
  padding: 1.15rem 1.15rem 1.25rem;
  border: 1px solid var(--fikr-line);
  border-radius: 1rem;
  background: var(--fikr-card);
  box-shadow: 0 8px 24px rgba(10, 33, 71, 0.05);
}

.archive-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.archive-heading {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--fikr-navy);
}

.archive-subhead {
  margin: 1.15rem 0 0.65rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--fikr-muted);
}

.archive-text-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fikr-teal-deep);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.archive-text-link:hover {
  color: var(--fikr-teal);
}

.archive-text-link:focus-visible {
  outline: 2px solid var(--fikr-teal);
  outline-offset: 2px;
}

.archive-records {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.archive-record {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.65rem;
  border: 1px solid var(--fikr-line);
  border-radius: 0.85rem;
  background: #fbfcfd;
}

.archive-record__icon {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.55rem;
  background: #eef3f6;
  color: var(--fikr-navy);
}

.archive-record__title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 650;
  color: var(--fikr-ink);
}

.archive-record__meta {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: var(--fikr-muted);
}

.archive-badge {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.archive-badge--internal {
  background: #e6f7f6;
  color: var(--fikr-teal-deep);
}

.archive-badge--action {
  background: #fde8e8;
  color: #b42318;
}

.archive-badge--draft {
  background: #eef1f4;
  color: #5b6b7a;
}

.archive-cal__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.2rem;
  margin-top: 0.85rem;
}

.archive-cal__dow,
.archive-cal__day {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.85rem;
  font-size: 0.72rem;
}

.archive-cal__dow {
  font-weight: 700;
  color: var(--fikr-muted);
}

.archive-cal__day {
  border-radius: 999px;
  color: var(--fikr-ink);
}

.archive-cal__day--muted {
  color: #b4bec7;
}

.archive-cal__day--today {
  background: var(--fikr-teal);
  color: #fff;
  font-weight: 700;
}

.archive-events ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.archive-event {
  display: flex;
  gap: 0.7rem;
}

.archive-event__bar {
  width: 3px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--fikr-teal);
}

.archive-event:nth-child(2) .archive-event__bar {
  background: var(--fikr-navy);
}

.archive-event:nth-child(3) .archive-event__bar {
  background: #7aa3b8;
}

.archive-event__title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 650;
}

.archive-event__meta {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: var(--fikr-muted);
}

.archive-cta-row {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

@media (min-width: 768px) {
  .archive-cta-row {
    grid-template-columns: 1.15fr 0.85fr;
  }
}

.archive-cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 14rem;
  padding: 1.5rem;
  border-radius: 1rem;
}

.archive-cta--photo {
  background:
    linear-gradient(180deg, rgba(10, 33, 71, 0.55) 10%, rgba(10, 33, 71, 0.78) 100%),
    url('/dashboard-cta.jpg') center / cover no-repeat;
  color: #fff;
}

.archive-cta--plain {
  border: 1px solid var(--fikr-line);
  background: var(--fikr-card);
  box-shadow: 0 8px 24px rgba(10, 33, 71, 0.05);
}

.archive-cta__glyph {
  display: inline-flex;
  height: 3rem;
  width: 3rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
  border-radius: 0.85rem;
  background: #e6f7f6;
  color: var(--fikr-teal-deep);
}

.archive-cta__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.archive-cta__title--ink {
  color: var(--fikr-navy);
}

.archive-cta__body {
  margin: 0.5rem 0 1.15rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.86);
}

.archive-cta__body--muted {
  color: var(--fikr-muted);
}

.archive-skel {
  border-radius: 0.5rem;
  background: #e8eef2;
  animation: archive-pulse 1.2s ease-in-out infinite;
}

.archive-skel--value {
  margin-top: 0.85rem;
  height: 2rem;
  width: 4.5rem;
}

.archive-skel--on-accent {
  background: rgba(255, 255, 255, 0.18);
}

@keyframes archive-pulse {
  0%,
  100% { opacity: 1; }
  50% { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .archive-btn,
  .archive-stat,
  .archive-skel {
    transition: none;
    animation: none;
  }
}
</style>
