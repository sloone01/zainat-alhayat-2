<template>
  <DashboardLayout content-bleed>
    <div class="archive" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="archive-body archive-body--parent">
        <FikrPageHeader
          :title="$t('parent.welcomeMessage')"
          :subtitle="$t('parent.childrenOverview')"
        />

        <div v-if="loading" class="flex items-center justify-center gap-3 py-12">
          <span class="h-10 w-10 animate-spin rounded-full border-2 border-[var(--fikr-teal)] border-t-transparent" aria-hidden="true" />
          <span style="color: var(--fikr-muted)">{{ $t('parent.loading') }}</span>
        </div>

        <div v-else-if="error" class="fk-alert fk-alert--error">
          <h3 class="mb-2 text-lg font-semibold">{{ $t('parent.error') }}</h3>
          <p>{{ error }}</p>
          <button type="button" class="fk-btn fk-btn--primary mt-4" @click="loadDashboardData">
            {{ $t('common.retry') }}
          </button>
        </div>

        <template v-else>
          <section class="archive-metrics archive-metrics--flush" :aria-label="$t('parent.childrenOverview')">
            <router-link to="/parent/fees" class="archive-stat archive-stat--tone-amber">
              <div class="archive-stat__top">
                <span class="archive-stat__icon" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </span>
                <p class="archive-stat__label">{{ $t('feesV2.due') }}</p>
              </div>
              <p class="archive-stat__value" dir="ltr">{{ feesPendingLabel }}</p>
            </router-link>

            <router-link to="/parent/progress" class="archive-stat archive-stat--tone-blue">
              <div class="archive-stat__top">
                <span class="archive-stat__icon" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </span>
                <p class="archive-stat__label">{{ $t('parent.myChildren') }}</p>
              </div>
              <p class="archive-stat__value">{{ dashboardData.summary?.totalChildren ?? 0 }}</p>
            </router-link>

            <router-link to="/parent/schedule" class="archive-stat archive-stat--tone-teal">
              <div class="archive-stat__top">
                <span class="archive-stat__icon" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <p class="archive-stat__label">{{ $t('parent.summaryGroups') }}</p>
              </div>
              <p class="archive-stat__value">{{ dashboardData.summary?.totalGroups ?? 0 }}</p>
            </router-link>

            <router-link to="/parent/assigned-activities" class="archive-stat archive-stat--tone-sky">
              <div class="archive-stat__top">
                <span class="archive-stat__icon" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <p class="archive-stat__label">{{ $t('parent.assignedActivities') }}</p>
              </div>
              <p class="archive-stat__value">{{ assignedActivities.length }}</p>
            </router-link>
          </section>

          <section
            v-if="upcomingInstallments.length"
            class="archive-panel archive-installments"
            aria-labelledby="archive-installments-title"
          >
            <div class="archive-panel__head">
              <h2 id="archive-installments-title" class="archive-heading">{{ $t('parent.nextInstallments') }}</h2>
            </div>
            <ul class="archive-records">
              <li v-for="row in upcomingInstallments" :key="row.id">
                <router-link to="/parent/fees" class="archive-record archive-record--link">
                  <div class="min-w-0 flex-1">
                    <p class="archive-record__title">{{ row.label }}</p>
                    <p class="archive-record__meta">
                      <span v-if="row.dueDate" dir="ltr">{{ formatInstallmentDate(row.dueDate) }}</span>
                      <span v-if="showInstallmentChild && row.studentName">{{ row.dueDate ? ' · ' : '' }}{{ row.studentName }}</span>
                    </p>
                  </div>
                  <p class="archive-record__amount" dir="ltr">{{ formatFeeAmount(row.remaining) }}</p>
                  <span v-if="row.isDue" class="archive-badge archive-badge--action">{{ $t('feesV2.due') }}</span>
                </router-link>
              </li>
            </ul>
          </section>

          <div class="archive-split">
            <section class="archive-panel" aria-labelledby="archive-records-title">
              <div class="archive-panel__head">
                <h2 id="archive-records-title" class="archive-heading">{{ $t('parent.childrenRecordsTitle') }}</h2>
              </div>

              <ul v-if="recordsFeed.length" class="archive-records">
                <li v-for="item in recordsFeed" :key="item.id">
                  <router-link :to="item.route" class="archive-record archive-record--link">
                    <span class="archive-record__icon" aria-hidden="true">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="recordIcon(item.type)" />
                      </svg>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="archive-record__title">{{ item.title }}</p>
                      <p class="archive-record__meta">
                        {{ $t('dashboard.recordsModified', { time: formatTimeAgo(item.timestamp) }) }}
                      </p>
                    </div>
                    <span class="archive-badge" :class="`archive-badge--${item.badge}`">
                      {{ badgeLabel(item.badge) }}
                    </span>
                  </router-link>
                </li>
              </ul>
              <p v-else class="archive-empty">{{ $t('parent.recordsEmpty') }}</p>
            </section>

            <aside class="archive-panel" aria-labelledby="archive-actions-title">
              <div class="archive-panel__head">
                <h2 id="archive-actions-title" class="archive-heading">{{ $t('dashboard.quickActions') }}</h2>
              </div>
              <ul class="archive-actions">
                <li v-for="action in quickActions" :key="action.to">
                  <router-link :to="action.to" class="archive-action">
                    <span class="archive-action__bar" aria-hidden="true" />
                    <span class="archive-action__title">{{ action.label }}</span>
                  </router-link>
                </li>
              </ul>
            </aside>
          </div>
        </template>
      </div>
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

.archive-body--parent {
  padding-top: 1.25rem;
}

.archive-body--parent :deep(.fk-hero) {
  margin-bottom: 1.25rem;
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
  position: relative;
  z-index: 1;
}

.archive-metrics--flush {
  margin-top: 0;
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
  text-decoration: none;
  color: inherit;
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

.archive-stat__top {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
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
  flex-shrink: 0;
}

.archive-stat__value {
  margin: 0.85rem 0 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--fikr-ink);
  white-space: nowrap;
}

.archive-stat__label {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fikr-muted);
  line-height: 1.25;
}

.archive-stat--tone-blue {
  border-top: 3px solid #3b82f6;
}
.archive-stat--tone-blue .archive-stat__icon {
  background: #eff6ff;
  color: #1d4ed8;
}
.archive-stat--tone-blue .archive-stat__value {
  color: #1e3a8a;
}

.archive-stat--tone-teal {
  border-top: 3px solid var(--fikr-teal);
}
.archive-stat--tone-teal .archive-stat__icon {
  background: #e6f7f6;
  color: var(--fikr-teal-deep);
}
.archive-stat--tone-teal .archive-stat__value {
  color: #0f5c58;
}

.archive-stat--tone-sky {
  border-top: 3px solid #0ea5e9;
}
.archive-stat--tone-sky .archive-stat__icon {
  background: #e0f2fe;
  color: #0369a1;
}
.archive-stat--tone-sky .archive-stat__value {
  color: #0c4a6e;
}

.archive-stat--tone-amber {
  border-top: 3px solid #f59e0b;
}
.archive-stat--tone-amber .archive-stat__icon {
  background: #fffbeb;
  color: #b45309;
}
.archive-stat--tone-amber .archive-stat__value {
  color: #92400e;
}

.archive-installments {
  margin-top: 1.25rem;
}

.archive-record__amount {
  margin: 0;
  flex-shrink: 0;
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--fikr-ink);
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
  text-decoration: none;
  color: inherit;
}

.archive-record--link:hover {
  background: #fff;
  border-color: rgba(0, 161, 155, 0.35);
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

.archive-empty {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--fikr-muted);
}

.archive-actions {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.archive-action {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-decoration: none;
  color: inherit;
  padding: 0.15rem 0;
}

.archive-action:hover .archive-action__title {
  color: var(--fikr-teal-deep);
}

.archive-action__bar {
  width: 3px;
  align-self: stretch;
  min-height: 1.5rem;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--fikr-teal);
}

.archive-action:nth-child(2n) .archive-action__bar {
  background: var(--fikr-navy);
}

.archive-action:nth-child(3n) .archive-action__bar {
  background: #7aa3b8;
}

.archive-action__title {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--fikr-ink);
}
</style>
