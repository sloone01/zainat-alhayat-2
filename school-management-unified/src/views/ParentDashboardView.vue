<template>
  <DashboardLayout>
    <div class="fk-page pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('parent.welcomeMessage')"
        :subtitle="$t('parent.childrenOverview')"
      />

      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="fk-elev">
        <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
          <h3 class="fk-display mb-2 text-lg font-bold text-navy-800">{{ $t('parent.error') }}</h3>
          <p class="text-sm text-fikr-ink-muted">{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadDashboardData">
            {{ $t('common.retry') }}
          </button>
        </div>
      </div>

      <template v-else>
        <!-- Overview tiles: fees due is the one navy-solid tile (mock-6a) -->
        <section
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          :aria-label="$t('parent.childrenOverview')"
        >
          <router-link
            to="/parent/fees"
            class="flex flex-col rounded-2xl bg-navy-800 px-4 py-4 text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-fikr-link-on-dark" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </span>
              <p class="text-sm font-medium text-fikr-link-on-dark">{{ $t('feesV2.due') }}</p>
            </div>
            <p class="fk-display mt-3 text-3xl font-bold tabular-nums" dir="ltr">{{ feesPendingLabel }}</p>
          </router-link>

          <router-link
            to="/parent/progress"
            class="flex flex-col rounded-2xl bg-fikr-mist px-4 py-4 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </span>
              <p class="text-sm font-medium text-fikr-ink-muted">{{ $t('parent.myChildren') }}</p>
            </div>
            <p class="fk-display mt-3 text-3xl font-bold tabular-nums text-navy-800">{{ dashboardData.summary?.totalChildren ?? 0 }}</p>
          </router-link>

          <router-link
            to="/parent/schedule"
            class="flex flex-col rounded-2xl bg-fikr-mist px-4 py-4 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <p class="text-sm font-medium text-fikr-ink-muted">{{ $t('parent.summaryGroups') }}</p>
            </div>
            <p class="fk-display mt-3 text-3xl font-bold tabular-nums text-navy-800">{{ dashboardData.summary?.totalGroups ?? 0 }}</p>
          </router-link>

          <router-link
            to="/parent/assigned-activities"
            class="flex flex-col rounded-2xl bg-fikr-mist px-4 py-4 transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
          >
            <div class="flex items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <p class="text-sm font-medium text-fikr-ink-muted">{{ $t('parent.assignedActivities') }}</p>
            </div>
            <p class="fk-display mt-3 text-3xl font-bold tabular-nums text-navy-800">{{ assignedActivities.length }}</p>
          </router-link>
        </section>

        <!-- Upcoming installments: sched rows, due = navy pill -->
        <section
          v-if="upcomingInstallments.length"
          class="fk-elev"
          aria-labelledby="archive-installments-title"
        >
          <h2 id="archive-installments-title" class="fk-display mb-1 text-lg font-bold text-navy-800">
            {{ $t('parent.nextInstallments') }}
          </h2>
          <ul class="m-0 flex list-none flex-col p-0">
            <li v-for="row in upcomingInstallments" :key="row.id">
              <router-link to="/parent/fees" class="fk-sched__row hover:bg-fikr-pearl">
                <span
                  class="fk-sched__dot"
                  :class="row.isDue ? 'fk-sched__dot--late' : 'fk-sched__dot--future'"
                  aria-hidden="true"
                >{{ row.isDue ? '!' : '' }}</span>
                <div class="min-w-0 flex-1">
                  <p class="fk-sched__title">{{ row.label }}</p>
                  <p class="fk-sched__meta">
                    <span v-if="row.dueDate" dir="ltr">{{ formatInstallmentDate(row.dueDate) }}</span>
                    <span v-if="showInstallmentChild && row.studentName">{{ row.dueDate ? ' · ' : '' }}{{ row.studentName }}</span>
                  </p>
                </div>
                <span v-if="row.isDue" class="fk-pill fk-pill--navy">{{ $t('feesV2.due') }}</span>
                <p class="fk-sched__amount" dir="ltr">{{ formatFeeAmount(row.remaining) }}</p>
              </router-link>
            </li>
          </ul>
        </section>

        <div class="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
          <!-- Records feed -->
          <section class="fk-elev" aria-labelledby="archive-records-title">
            <h2 id="archive-records-title" class="fk-display mb-1 text-lg font-bold text-navy-800">
              {{ $t('parent.childrenRecordsTitle') }}
            </h2>

            <ul v-if="recordsFeed.length" class="m-0 flex list-none flex-col p-0">
              <li v-for="item in recordsFeed" :key="item.id">
                <router-link :to="item.route" class="fk-sched__row hover:bg-fikr-pearl">
                  <span class="fk-sched__dot fk-sched__dot--wait !text-navy-800" aria-hidden="true">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="recordIcon(item.type)" />
                    </svg>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="fk-sched__title">{{ item.title }}</p>
                    <p class="fk-sched__meta">
                      {{ $t('dashboard.recordsModified', { time: formatTimeAgo(item.timestamp) }) }}
                    </p>
                  </div>
                  <span class="fk-pill" :class="item.badge === 'action' ? 'fk-pill--navy' : 'fk-pill--mist'">
                    {{ badgeLabel(item.badge) }}
                  </span>
                </router-link>
              </li>
            </ul>
            <p v-else class="mt-1 text-sm text-fikr-ink-muted">{{ $t('parent.recordsEmpty') }}</p>
          </section>

          <!-- Quick actions: mist tiles grid (mock-6a shortcut tiles) -->
          <aside class="fk-elev" aria-labelledby="archive-actions-title">
            <h2 id="archive-actions-title" class="fk-display mb-3 text-lg font-bold text-navy-800">
              {{ $t('dashboard.quickActions') }}
            </h2>
            <ul class="m-0 grid list-none grid-cols-2 gap-2 p-0">
              <li v-for="action in quickActions" :key="action.to">
                <router-link
                  :to="action.to"
                  class="flex min-h-[3.5rem] items-center rounded-xl bg-fikr-mist px-3 py-2.5 text-sm font-medium leading-5 text-navy-800 transition-colors hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
                >
                  {{ action.label }}
                </router-link>
              </li>
            </ul>
          </aside>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { parentService } from '../services/parent.service'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import {
  chatApiService,
  type DirectApprovalInboxRow,
  type DirectThreadSummary,
} from '@/services/chat.service'
import { canInviteeJoinMeeting } from '@/utils/meeting-host'
import { feesV2Service } from '@/services/fees-v2.service'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const quickActions = computed(() => [
  { to: '/parent/fees', label: t('parentFees.navTitle') },
  { to: '/parent/schedule', label: t('parent.schedule') },
  { to: '/parent/attendance', label: t('parent.attendance') },
  { to: '/parent/weekly-plans', label: t('parent.weeklyPlans') },
  { to: '/parent/course-materials', label: t('courseMaterials.navTitle') },
  { to: '/parent/assigned-activities', label: t('parent.assignedActivities') },
  { to: '/parent/weekly-activities', label: t('parent.weeklyActivities') },
  { to: '/parent/progress', label: t('parent.progress') },
])


type RecordBadge = 'internal' | 'action'
type RecordType =
  | 'attendance'
  | 'bus'
  | 'activity'
  | 'meeting'
  | 'chat'
  | 'approval'

type ParentRecordItem = {
  id: string
  type: RecordType
  title: string
  badge: RecordBadge
  route: string
  timestamp: Date
}

const loading = ref(true)
const error = ref('')
const dashboardData = ref<Record<string, any>>({})
const attendanceToday = ref<any>(null)
const attendanceLoadFailed = ref(false)
const busLog = ref<{ date: string | null; items: any[] } | null>(null)
const busLogLoadFailed = ref(false)
const invitedMeetings = ref<MeetingRoomMineRow[]>([])
const assignedActivities = ref<any[]>([])
const recentChats = ref<DirectThreadSummary[]>([])
const pendingApprovals = ref<DirectApprovalInboxRow[]>([])
const feesPendingTotal = ref<number | null>(null)
const upcomingInstallments = ref<UpcomingInstallment[]>([])
let meetingPoll: ReturnType<typeof setInterval> | null = null

type UpcomingInstallment = {
  id: string
  studentName: string
  label: string
  dueDate: string | null
  remaining: number
  isDue: boolean
}

function parseDate(value?: string | Date | null): Date | null {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const recordsFeed = computed((): ParentRecordItem[] => {
  const items: ParentRecordItem[] = []
  const now = Date.now()

  for (const row of attendanceToday.value?.children || []) {
    if (!row.record) continue
    const name = row.firstName || t('parent.childName')
    const stamped = parseDate(row.record?.updated_at || row.record?.created_at || row.record?.date)
    const status = String(row.record.status || '')
    let titleKey = 'parent.recordAttendancePresent'
    if (status === 'absent') titleKey = 'parent.recordAttendanceAbsent'
    else if (status === 'late') titleKey = 'parent.recordAttendanceLate'
    else if (status === 'excused') titleKey = 'parent.recordAttendanceExcused'
    items.push({
      id: `att-${row.studentId}-${status}`,
      type: 'attendance',
      title: t(titleKey, { name }),
      badge: status === 'absent' ? 'action' : 'internal',
      route: '/parent/attendance',
      timestamp: stamped || new Date(now - 60 * 60 * 1000),
    })
  }

  for (const row of busLog.value?.items || []) {
    const name = row.student_first_name || t('parent.childName')
    const boarded = row.event_type !== 'dropped_off'
    items.push({
      id: `bus-${row.id}`,
      type: 'bus',
      title: t(boarded ? 'parent.recordBusBoarded' : 'parent.recordBusDropped', { name }),
      badge: 'internal',
      route: '/parent/attendance',
      timestamp: parseDate(row.logged_at) || new Date(now),
    })
  }

  for (const act of assignedActivities.value.slice(0, 6)) {
    items.push({
      id: `act-${act.id}`,
      type: 'activity',
      title: t('parent.recordActivityAssigned', { title: act.title || act.name || '—' }),
      badge: 'internal',
      route: '/parent/assigned-activities',
      timestamp: parseDate(act.activity_date || act.date || act.created_at) || new Date(now),
    })
  }

  for (const room of invitedMeetings.value) {
    if (room.status === 'draft') continue
    const live = canInviteeJoinMeeting(room)
    items.push({
      id: `meet-${room.id}`,
      type: 'meeting',
      title: t(live ? 'parent.recordMeetingLive' : 'parent.recordMeetingInvite', {
        title: room.title || '—',
      }),
      badge: live ? 'action' : 'internal',
      route: `/meeting-room/${room.id}`,
      timestamp:
        parseDate(live ? room.opened_at : room.scheduled_at || room.created_at) || new Date(now),
    })
  }

  for (const th of recentChats.value) {
    items.push({
      id: `chat-${th.thread_id}`,
      type: 'chat',
      title: t('parent.recordNewMessage', { name: th.other_name || '—' }),
      badge: 'internal',
      route: `/messages/${th.thread_id}`,
      timestamp: parseDate(th.last_message_at) || new Date(now),
    })
  }

  for (const row of pendingApprovals.value) {
    items.push({
      id: `appr-${row.message_id}`,
      type: 'approval',
      title: t('parent.recordApprovalNeeded', { title: row.title || '—' }),
      badge: 'action',
      route: '/approvals',
      timestamp: parseDate(row.sent_at) || new Date(now),
    })
  }

  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 12)
})

function todayTripDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    attendanceLoadFailed.value = false
    attendanceToday.value = null
    busLogLoadFailed.value = false
    busLog.value = null

    const approvalLocale = locale.value === 'ar' ? 'ar' : 'en'

    const [dashResult, attResult, busResult, meetingResult, actResult, chatResult, approvalResult] =
      await Promise.allSettled([
        parentService.getMyDashboardData(),
        parentService.getMyAttendance(0, 1),
        parentService.getMyBusMovements({ date: todayTripDate(), limit: 40 }),
        meetingRoomService.mine(),
        parentService.getMyAssignedActivities(),
        chatApiService.listDirectThreads(),
        chatApiService.listApprovalInbox(approvalLocale),
      ])

    if (dashResult.status === 'rejected') {
      throw dashResult.reason
    }
    dashboardData.value = dashResult.value
    void loadFeesPending()

    if (attResult.status === 'fulfilled') {
      attendanceToday.value = attResult.value?.today ?? null
    } else {
      attendanceLoadFailed.value = true
      console.warn('Parent dashboard: attendance fetch failed', attResult.reason)
    }

    if (busResult.status === 'fulfilled') {
      busLog.value = busResult.value ?? { date: todayTripDate(), items: [] }
    } else {
      busLogLoadFailed.value = true
      console.warn('Parent dashboard: bus movements fetch failed', busResult.reason)
    }

    invitedMeetings.value = meetingResult.status === 'fulfilled' ? meetingResult.value : []
    assignedActivities.value = actResult.status === 'fulfilled' ? actResult.value ?? [] : []

    if (chatResult.status === 'fulfilled') {
      recentChats.value = (chatResult.value ?? []).slice(0, 6)
    } else {
      recentChats.value = []
    }

    if (approvalResult.status === 'fulfilled') {
      pendingApprovals.value = (approvalResult.value ?? []).filter(
        (r) => r.approval_status === 'pending' && r.can_approve,
      )
    } else {
      pendingApprovals.value = []
    }
  } catch (err: any) {
    console.error('Error loading parent dashboard data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

function formatFeeAmount(v: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.000'
  return n.toFixed(3)
}

function formatInstallmentDate(iso: string): string {
  const day = String(iso).slice(0, 10)
  const [y, m, d] = day.split('-')
  if (!y || !m || !d) return day
  return `${d}/${m}/${y}`
}

function installmentLabel(inst: { label?: string | null; sequence: number }) {
  if (inst.label === 'upfront' || inst.sequence === 0) return t('feesV2.upfront')
  if (inst.label) return inst.label
  return t('parentFees.installmentDefaultLabel', { n: inst.sequence })
}

function childDisplayName(
  child?: { firstName?: string; lastName?: string },
  sheetStudent?: { firstName?: string; lastName?: string },
) {
  const first = sheetStudent?.firstName || child?.firstName || ''
  const last = sheetStudent?.lastName || child?.lastName || ''
  return `${first} ${last}`.trim()
}

const feesPendingLabel = computed(() => {
  if (feesPendingTotal.value == null) return '—'
  return formatFeeAmount(feesPendingTotal.value)
})

const showInstallmentChild = computed(() => {
  const children = (dashboardData.value.children || []) as Array<{ id?: string }>
  return children.length > 1
})

async function loadFeesPending() {
  const children = (dashboardData.value.children || []) as Array<{
    id?: string
    firstName?: string
    lastName?: string
  }>
  const ids = children.map((c) => String(c.id || '')).filter(Boolean)
  if (!ids.length) {
    feesPendingTotal.value = 0
    upcomingInstallments.value = []
    return
  }
  const sheets = await Promise.all(
    ids.map((id) => feesV2Service.getStudentChargeSheet(id).catch(() => null)),
  )
  let pending = 0
  const rows: UpcomingInstallment[] = []
  const today = todayTripDate()
  for (const sheet of sheets) {
    if (!sheet) continue
    pending += Math.max(0, Number(sheet.due_total || 0) - Number(sheet.paid_total || 0))
    const child = children.find((c) => String(c.id) === String(sheet.student_id))
    const studentName = childDisplayName(child, sheet.student)
    for (const inst of sheet.installments || []) {
      if (inst.status === 'paid') continue
      const remaining = Math.max(0, Number(inst.amount_due || 0) - Number(inst.amount_paid || 0))
      if (remaining <= 0.0005) continue
      const dueDate = inst.due_date ? String(inst.due_date).slice(0, 10) : null
      rows.push({
        id: inst.id,
        studentName,
        label: installmentLabel(inst),
        dueDate,
        remaining,
        isDue: Boolean(dueDate && dueDate <= today),
      })
    }
  }
  rows.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
  upcomingInstallments.value = rows
  feesPendingTotal.value = pending
}

const formatTimeAgo = (timestamp: Date) => {
  const diffInMinutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60))
  if (diffInMinutes < 60) return t('dashboard.minutesAgo', { n: Math.max(1, diffInMinutes) })
  if (diffInMinutes < 1440) return t('dashboard.hoursAgo', { n: Math.floor(diffInMinutes / 60) })
  return t('dashboard.daysAgo', { n: Math.floor(diffInMinutes / 1440) })
}

const badgeLabel = (badge: RecordBadge) => {
  if (badge === 'action') return t('dashboard.badgeAction')
  return t('dashboard.badgeInternal')
}

const recordIcon = (type: RecordType) => {
  const icons: Record<RecordType, string> = {
    attendance:
      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    bus: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    activity:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    meeting:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    approval: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  }
  return icons[type]
}

onMounted(() => {
  loadDashboardData()
  meetingPoll = setInterval(() => {
    void meetingRoomService
      .mine()
      .then((rows) => {
        invitedMeetings.value = rows
      })
      .catch(() => undefined)
  }, 4000)
})

onBeforeUnmount(() => {
  if (meetingPoll) clearInterval(meetingPoll)
})
</script>
