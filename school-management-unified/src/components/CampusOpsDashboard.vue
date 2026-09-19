<template>
  <div class="campus" :dir="isRtl ? 'rtl' : 'ltr'">
    <div class="campus__inner">
      <!-- Hero + decisions -->
      <section class="campus__top">
        <div class="campus-hero">
          <p class="campus-hero__date">{{ dateLine }}</p>
          <h1 class="campus-hero__title">
            {{
              $t('campusOps.presentHeadline', {
                present: presentCount,
                total: totalStudents,
              })
            }}
          </h1>
          <p class="campus-hero__sub">
            {{
              $t('campusOps.presentSub', {
                absent: absentReported,
                unrecorded: unrecordedCount,
                buses: busesOnTime,
              })
            }}
          </p>
          <div class="campus-hero__actions">
            <button
              v-if="canRegister"
              type="button"
              class="campus-btn campus-btn--navy"
              @click="go('/students/register')"
            >
              {{ $t('campusOps.registerStudent') }}
            </button>
            <button
              v-if="canLetters"
              type="button"
              class="campus-btn campus-btn--soft"
              @click="go('/settings/message-letters')"
            >
              {{ $t('campusOps.sendAnnouncement') }}
            </button>
            <button type="button" class="campus-btn campus-btn--soft" @click="go('/attendance')">
              {{ $t('campusOps.todayReport') }}
            </button>
          </div>
        </div>

        <aside class="campus-card campus-decisions">
          <h2 class="campus-card__title">{{ $t('campusOps.needsDecision') }}</h2>
          <ul class="campus-decisions__list">
            <li>
              <button type="button" class="campus-decisions__row" @click="go('/enrollments')">
                <span>{{ $t('campusOps.newRegistrations') }}</span>
                <span class="campus-badge">{{ pendingEnrollments }}</span>
              </button>
            </li>
            <li>
              <button type="button" class="campus-decisions__row" @click="go('/students/payments/pending-receipts')">
                <span>{{ $t('campusOps.receiptsAwaiting') }}</span>
                <span class="campus-badge">{{ pendingReceipts }}</span>
              </button>
            </li>
            <li>
              <button type="button" class="campus-decisions__row" @click="go('/approvals')">
                <span>{{ $t('campusOps.lettersAwaiting') }}</span>
                <span class="campus-badge">{{ pendingApprovals }}</span>
              </button>
            </li>
          </ul>
          <button type="button" class="campus-btn campus-btn--navy campus-btn--block" @click="go('/approvals')">
            {{ $t('campusOps.openApprovals', { n: decisionsTotal }) }}
          </button>
        </aside>
      </section>

      <!-- Mid stats -->
      <section class="campus__stats">
        <article class="campus-stat campus-stat--navy">
          <h2 class="campus-stat__label">{{ $t('campusOps.registrationYear', { year: academicYearLabel }) }}</h2>
          <p class="campus-stat__value">
            {{ $t('campusOps.seatsFilled', { filled: seatsFilled, capacity: seatsCapacity }) }}
          </p>
          <p class="campus-stat__meta">
            {{
              $t('campusOps.registrationMeta', {
                available: seatsAvailable,
                pending: pendingEnrollments,
              })
            }}
          </p>
          <button type="button" class="campus-btn campus-btn--on-navy" @click="go('/enrollments')">
            {{ $t('campusOps.reviewApplications') }}
          </button>
        </article>

        <article class="campus-stat">
          <h2 class="campus-stat__label">{{ $t('campusOps.attendanceWeek') }}</h2>
          <p class="campus-stat__value">{{ weekAttendancePct }}%</p>
          <div class="campus-bars" aria-hidden="true">
            <span
              v-for="(bar, i) in weekBars"
              :key="i"
              class="campus-bars__seg"
              :class="bar.tone"
              :style="{ flex: bar.weight }"
            />
          </div>
          <div class="campus-stat__footer">
            <span>{{ $t('campusOps.attendanceWeekHint') }}</span>
            <button type="button" class="campus-link" @click="go('/attendance')">
              {{ $t('campusOps.attendanceDetails') }}
            </button>
          </div>
        </article>

        <article class="campus-stat">
          <h2 class="campus-stat__label">{{ $t('campusOps.unpaidFees') }}</h2>
          <p class="campus-stat__value">{{ formatMoney(unpaidTotal) }}</p>
          <div class="campus-progress" aria-hidden="true">
            <span class="campus-progress__fill" :style="{ width: unpaidBarPct + '%' }" />
          </div>
          <p class="campus-stat__meta">
            {{ $t('campusOps.lateFeesMeta', { amount: formatMoney(lateTotal), families: lateFamilies }) }}
          </p>
          <button type="button" class="campus-btn campus-btn--soft campus-btn--sm" @click="go('/reports/financial')">
            {{ $t('campusOps.dueAndLate') }}
          </button>
        </article>
      </section>

      <!-- Bottom -->
      <section class="campus__bottom">
        <article class="campus-card">
          <header class="campus-card__head">
            <h2 class="campus-card__title">{{ $t('campusOps.todaysClasses') }}</h2>
          </header>
          <div class="campus-table-wrap">
            <table class="campus-table">
              <thead>
                <tr>
                  <th>{{ $t('campusOps.colClass') }}</th>
                  <th>{{ $t('campusOps.colTeacher') }}</th>
                  <th>{{ $t('campusOps.colAttendance') }}</th>
                  <th>{{ $t('campusOps.colStatus') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="campus-empty">{{ $t('common.loading') }}</td>
                </tr>
                <tr v-else-if="!classRows.length">
                  <td colspan="4" class="campus-empty">{{ $t('campusOps.noClasses') }}</td>
                </tr>
                <tr v-for="row in classRows" :key="row.id">
                  <td class="font-medium text-navy-800">{{ row.name }}</td>
                  <td class="text-fikr-ink-muted">{{ row.teacher }}</td>
                  <td class="tabular-nums">{{ row.attendanceLabel }}</td>
                  <td>
                    <span v-if="row.recorded" class="campus-status campus-status--ok">
                      <span class="campus-status__dot" aria-hidden="true" />
                      {{ $t('campusOps.statusRecorded') }}
                    </span>
                    <button
                      v-else
                      type="button"
                      class="campus-btn campus-btn--navy campus-btn--xs"
                      @click="go(`/attendance?group=${row.id}`)"
                    >
                      {{ $t('campusOps.statusNotRecorded') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="campus-card">
          <header class="campus-card__head">
            <h2 class="campus-card__title">{{ $t('campusOps.latestActivity') }}</h2>
          </header>
          <ul class="campus-feed">
            <li v-for="item in feed" :key="item.id" class="campus-feed__item">
              <span class="campus-feed__icon" :class="`campus-feed__icon--${item.tone}`" aria-hidden="true">
                <svg v-if="item.icon === 'check'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else-if="item.icon === 'receipt'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="item.icon === 'bus'" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17h.01M16 17h.01M4 11h16M6 7h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <p class="campus-feed__text">{{ item.text }}</p>
                <span v-if="item.tag" class="campus-tag">{{ item.tag }}</span>
              </div>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useClaims } from '@/composables/useClaims'
import { statisticsService } from '@/services/statistics.service'
import { attendanceService } from '@/services/attendance.service'
import { enrollmentService } from '@/services/enrollment.service'
import { feesV2Service } from '@/services/fees-v2.service'
import { chatApiService } from '@/services/chat.service'
import { groupService, type Group } from '@/services/group.service'
import { academicYearService } from '@/services/academic-year.service'
import { authService } from '@/services'

type ClassRow = {
  id: string
  name: string
  teacher: string
  attendanceLabel: string
  recorded: boolean
}

type FeedItem = {
  id: string
  text: string
  tag?: string
  icon: 'check' | 'receipt' | 'bus' | 'plus'
  tone: 'teal' | 'navy' | 'soft'
}

const { t, locale } = useI18n()
const router = useRouter()
const { hasClaim } = useClaims()

const loading = ref(true)
const isRtl = computed(() => locale.value === 'ar')

const canRegister = computed(
  () => hasClaim('student_register', 'create') || hasClaim('students', 'create'),
)
const canLetters = computed(() => hasClaim('message_letters', 'view') || hasClaim('message_letters', 'create'))

const totalStudents = ref(0)
const presentCount = ref(0)
const absentReported = ref(0)
const unrecordedCount = ref(0)
const busesOnTime = ref(0)
const pendingEnrollments = ref(0)
const pendingReceipts = ref(0)
const pendingApprovals = ref(0)
const seatsFilled = ref(0)
const seatsCapacity = ref(0)
const weekAttendancePct = ref(0)
const unpaidTotal = ref(0)
const lateTotal = ref(0)
const lateFamilies = ref(0)
const academicYearLabel = ref('')
const classRows = ref<ClassRow[]>([])
const feed = ref<FeedItem[]>([])

const decisionsTotal = computed(
  () => pendingEnrollments.value + pendingReceipts.value + pendingApprovals.value,
)

const seatsAvailable = computed(() => Math.max(0, seatsCapacity.value - seatsFilled.value))

const unpaidBarPct = computed(() => {
  const total = unpaidTotal.value
  if (total <= 0) return 8
  const lateShare = lateTotal.value / total
  return Math.min(100, Math.max(12, Math.round(lateShare * 100)))
})

const weekBars = computed(() => {
  const rate = weekAttendancePct.value
  const tones = ['navy', 'navy', 'teal', 'teal', 'soft'] as const
  return tones.map((tone, i) => ({
    tone: `campus-bars__seg--${tone}`,
    weight: Math.max(0.35, 0.55 + ((rate / 100) * (1 - i * 0.08))),
  }))
})

const schoolName = computed(() => {
  const u = authService.getStoredUser() as { school_name?: string } | null
  return u?.school_name?.trim() || t('dashboard.schoolManagement')
})

const dateLine = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-US'
  const day = new Date().toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return `${day} · ${schoolName.value}`
})

function go(path: string) {
  router.push(path)
}

function formatMoney(n: number) {
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-OM'
  try {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: 'OMR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(n)
  } catch {
    return `${n.toFixed(3)} OMR`
  }
}

function todayIso() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function supervisorName(g: Group) {
  const s = g.supervisor
  if (!s) return t('common.notSpecified')
  if (s.fullName?.trim()) return s.fullName.trim()
  const parts = [s.firstName, s.lastName].filter(Boolean)
  return parts.length ? parts.join(' ') : t('common.notSpecified')
}

async function load() {
  loading.value = true
  const date = todayIso()

  const settled = await Promise.allSettled([
    statisticsService.getDashboardStats(),
    attendanceService.getDailyReport(date),
    enrollmentService.getEnrollments('pending'),
    feesV2Service.listPendingPayments(),
    feesV2Service.dueInstallmentsReport({ bucket: 'all' }),
    chatApiService.listApprovalInbox(locale.value === 'ar' ? 'ar' : 'en'),
    groupService.getActive(),
    academicYearService.getActive(),
  ])

  const stats = settled[0].status === 'fulfilled' ? settled[0].value : null
  const daily = settled[1].status === 'fulfilled' ? settled[1].value : null
  const enrollments = settled[2].status === 'fulfilled' ? settled[2].value : []
  const receipts = settled[3].status === 'fulfilled' ? settled[3].value : []
  const dueReport = settled[4].status === 'fulfilled' ? settled[4].value : null
  const approvals = settled[5].status === 'fulfilled' ? settled[5].value : []
  const groups = settled[6].status === 'fulfilled' ? settled[6].value : []
  const year = settled[7].status === 'fulfilled' ? settled[7].value : null

  totalStudents.value = stats?.totalStudents ?? 0
  weekAttendancePct.value = Math.round(stats?.attendanceRate ?? 0)
  academicYearLabel.value = year?.year?.trim() || '—'

  const summary = daily?.summary
  if (summary) {
    presentCount.value = Number(summary.present || 0) + Number(summary.late || 0)
    absentReported.value = Number(summary.absent || 0)
  } else {
    presentCount.value = Math.round((weekAttendancePct.value / 100) * totalStudents.value)
    absentReported.value = Math.max(0, totalStudents.value - presentCount.value)
  }

  const dailyGroups: Array<{
    group_id?: string
    group_name?: string
    present?: number
    absent?: number
    late?: number
    total_students?: number
  }> = Array.isArray(daily?.groups) ? daily.groups : []

  const byGroupId = new Map<string, (typeof dailyGroups)[0]>()
  for (const g of dailyGroups) {
    if (g.group_id) byGroupId.set(String(g.group_id), g)
  }

  const rows: ClassRow[] = (groups as Group[]).slice(0, 8).map((g) => {
    const hit = byGroupId.get(g.id)
    const present = Number(hit?.present || 0) + Number(hit?.late || 0)
    const total = Number(hit?.total_students || g.students?.length || 0)
    const recorded = Boolean(hit)
    return {
      id: g.id,
      name: g.name,
      teacher: supervisorName(g),
      attendanceLabel: recorded ? `${present}/${total || '—'}` : '—',
      recorded,
    }
  })
  classRows.value = rows

  const recordedHeadcount = dailyGroups.reduce(
    (sum, g) => sum + Number(g.total_students || 0),
    0,
  )
  unrecordedCount.value = Math.max(0, totalStudents.value - recordedHeadcount)
  busesOnTime.value = 0

  pendingEnrollments.value = Array.isArray(enrollments) ? enrollments.length : 0
  pendingReceipts.value = Array.isArray(receipts) ? receipts.length : 0
  pendingApprovals.value = Array.isArray(approvals) ? approvals.length : 0

  seatsFilled.value = totalStudents.value
  seatsCapacity.value = (groups as Group[]).reduce((sum, g) => sum + (Number(g.capacity) || 0), 0)
  if (seatsCapacity.value < seatsFilled.value) seatsCapacity.value = seatsFilled.value

  if (dueReport?.summary) {
    unpaidTotal.value = Number(dueReport.summary.balance_total || 0)
    lateTotal.value = Number(
      (dueReport.items || [])
        .filter((i) => i.state === 'late')
        .reduce((s, i) => s + Number(i.balance || 0), 0)
        .toFixed(3),
    )
    lateFamilies.value = new Set(
      (dueReport.items || []).filter((i) => i.state === 'late').map((i) => i.student_id),
    ).size
  }

  const feedItems: FeedItem[] = []
  if (pendingEnrollments.value > 0) {
    feedItems.push({
      id: 'enroll',
      text: t('campusOps.feedNewRegistration', { n: pendingEnrollments.value }),
      tag: t('campusOps.tagReview'),
      icon: 'plus',
      tone: 'soft',
    })
  }
  if (pendingReceipts.value > 0) {
    feedItems.push({
      id: 'receipt',
      text: t('campusOps.feedReceipts', { n: pendingReceipts.value }),
      tag: t('campusOps.tagSettlement'),
      icon: 'receipt',
      tone: 'navy',
    })
  }
  const recordedCount = rows.filter((r) => r.recorded).length
  if (recordedCount > 0) {
    feedItems.push({
      id: 'att',
      text: t('campusOps.feedAttendance', { n: recordedCount }),
      icon: 'check',
      tone: 'teal',
    })
  }
  if (!feedItems.length) {
    feedItems.push({
      id: 'idle',
      text: t('campusOps.feedEmpty'),
      icon: 'check',
      tone: 'soft',
    })
  }
  feed.value = feedItems

  loading.value = false
}

onMounted(() => {
  void load()
})
</script>

<style scoped>
.campus {
  --campus-navy: #0a2147;
  --campus-teal: #00a19b;
  --campus-canvas: #f4f6f8;
  --campus-card: #ffffff;
  --campus-line: #e6eaef;
  --campus-muted: #6b7c8d;
  background: var(--campus-canvas);
  min-height: 100%;
  color: #1a2a3a;
}

.campus__inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.25rem 1rem 2.5rem;
}

@media (min-width: 640px) {
  .campus__inner {
    padding: 1.5rem 1.5rem 3rem;
  }
}

@media (min-width: 1024px) {
  .campus__inner {
    padding: 1.75rem 2rem 3.5rem;
  }
}

.campus__top {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .campus__top {
    grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.85fr);
    align-items: start;
  }
}

.campus-hero__date {
  margin: 0 0 0.65rem;
  font-size: 0.8125rem;
  color: var(--campus-muted);
}

.campus-hero__title {
  margin: 0;
  font-size: clamp(1.55rem, 3.2vw, 2.15rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--campus-navy);
}

.campus-hero__sub {
  margin: 0.65rem 0 0;
  font-size: 0.9rem;
  color: var(--campus-muted);
}

.campus-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 1.25rem;
}

.campus-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0.55rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
  cursor: pointer;
}

.campus-btn--navy {
  border: 0;
  background: var(--campus-navy);
  color: #fff;
}

.campus-btn--navy:hover {
  background: #071830;
}

.campus-btn--on-navy {
  border: 0;
  background: #fff;
  color: var(--campus-navy);
}

.campus-btn--on-navy:hover {
  background: #f0f4f8;
}

.campus-btn--soft {
  border: 1px solid var(--campus-line);
  background: #eef1f4;
  color: var(--campus-navy);
}

.campus-btn--soft:hover {
  background: #e4e9ef;
}

.campus-btn--block {
  width: 100%;
  margin-top: 1rem;
}

.campus-btn--sm {
  min-height: 2.15rem;
  padding: 0.4rem 0.9rem;
  font-size: 0.8125rem;
}

.campus-btn--xs {
  min-height: 1.85rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  border-radius: 0.55rem;
}

.campus-card {
  border-radius: 1rem;
  background: var(--campus-card);
  border: 1px solid var(--campus-line);
  padding: 1.15rem 1.2rem 1.25rem;
}

.campus-card__title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--campus-navy);
}

.campus-card__head {
  margin-bottom: 0.85rem;
}

.campus-decisions__list {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.campus-decisions__row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.15rem;
  border: 0;
  border-bottom: 1px solid var(--campus-line);
  background: transparent;
  text-align: start;
  font-size: 0.875rem;
  color: #2a3a4a;
  cursor: pointer;
}

.campus-decisions__row:hover {
  color: var(--campus-navy);
}

.campus-badge {
  display: inline-flex;
  min-width: 1.65rem;
  height: 1.65rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #eef1f4;
  color: var(--campus-navy);
  font-size: 0.8rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.campus__stats {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .campus__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.campus-stat {
  border-radius: 1rem;
  background: #eef1f4;
  padding: 1.15rem 1.2rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-height: 11.5rem;
}

.campus-stat--navy {
  background: var(--campus-navy);
  color: #fff;
}

.campus-stat__label {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.85;
}

.campus-stat--navy .campus-stat__label {
  color: rgba(255, 255, 255, 0.78);
}

.campus-stat__value {
  margin: 0;
  font-size: clamp(1.55rem, 2.4vw, 1.95rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--campus-navy);
}

.campus-stat--navy .campus-stat__value {
  color: #fff;
}

.campus-stat__meta {
  margin: 0;
  font-size: 0.8rem;
  color: var(--campus-muted);
  line-height: 1.45;
}

.campus-stat--navy .campus-stat__meta {
  color: rgba(255, 255, 255, 0.72);
}

.campus-stat__footer {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--campus-muted);
}

.campus-link {
  border: 0;
  background: transparent;
  color: var(--campus-navy);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.campus-bars {
  display: flex;
  gap: 0.35rem;
  height: 2.35rem;
  margin: 0.15rem 0 0.35rem;
}

.campus-bars__seg {
  border-radius: 0.45rem;
  min-width: 0.65rem;
}

.campus-bars__seg--navy {
  background: var(--campus-navy);
}

.campus-bars__seg--teal {
  background: var(--campus-teal);
}

.campus-bars__seg--soft {
  background: #cfd6de;
}

.campus-progress {
  height: 0.45rem;
  border-radius: 9999px;
  background: #d7dde5;
  overflow: hidden;
}

.campus-progress__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--campus-navy);
}

.campus__bottom {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

@media (min-width: 1024px) {
  .campus__bottom {
    grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.85fr);
  }
}

.campus-table-wrap {
  overflow-x: auto;
}

.campus-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.campus-table th {
  text-align: start;
  padding: 0.55rem 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--campus-muted);
  border-bottom: 1px solid var(--campus-line);
}

.campus-table td {
  padding: 0.85rem 0.35rem;
  border-bottom: 1px solid var(--campus-line);
  vertical-align: middle;
}

.campus-table tbody tr:last-child td {
  border-bottom: 0;
}

.campus-empty {
  text-align: center;
  color: var(--campus-muted);
  padding: 1.5rem 0.5rem !important;
}

.campus-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: var(--campus-muted);
}

.campus-status__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 9999px;
  background: #22c55e;
}

.campus-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.campus-feed__item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.campus-feed__icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.campus-feed__icon--teal {
  background: #d9f5f3;
  color: var(--campus-teal);
}

.campus-feed__icon--navy {
  background: #e8eef7;
  color: var(--campus-navy);
}

.campus-feed__icon--soft {
  background: #eef1f4;
  color: var(--campus-muted);
}

.campus-feed__text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  color: #243447;
}

.campus-tag {
  display: inline-flex;
  margin-top: 0.35rem;
  padding: 0.15rem 0.55rem;
  border-radius: 9999px;
  background: #eef1f4;
  color: var(--campus-muted);
  font-size: 0.7rem;
  font-weight: 600;
}
</style>
