<template>
  <DashboardLayout>
    <div class="fk-page fk-parent-home pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-12 text-fikr-ink-muted">
        <FikrLoader />
        <span>{{ $t('parent.loading') }}</span>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-fikr-hairline bg-white px-4 py-10 text-center">
        <h3 class="fk-display mb-2 text-lg font-bold text-navy-800">{{ $t('parent.error') }}</h3>
        <p class="text-sm text-fikr-ink-muted">{{ error }}</p>
        <button type="button" class="fk-btn fk-btn--navy mt-4" @click="loadDashboardData">
          {{ $t('common.retry') }}
        </button>
      </div>

      <template v-else>
        <!-- Mobile: design 6a -->
        <div class="mx-auto w-full max-w-lg space-y-5 px-1 sm:max-w-none sm:space-y-6 xl:hidden">
          <header class="space-y-1">
            <p class="text-sm text-fikr-ink-muted">{{ greetingDate }}</p>
            <h1 class="fk-display text-[1.75rem] font-bold leading-tight text-navy-800 sm:text-[2rem]">
              {{ greetingLine }}
            </h1>
          </header>

          <div v-if="children.length" class="flex flex-wrap gap-3">
            <button
              v-for="child in children"
              :key="child.id"
              type="button"
              class="fk-fchip"
              :class="selectedChildId === child.id ? 'fk-fchip--active' : ''"
              @click="selectedChildId = child.id"
            >
              {{ childChipLabel(child) }}
            </button>
          </div>

          <div class="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-6">
          <section
            v-if="selectedChild"
            class="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.16)] sm:p-5 lg:p-6"
            :aria-label="todayCardTitle"
          >
            <div class="mb-2 flex items-center justify-between gap-3 px-1">
              <h2 class="text-base font-medium text-navy-800">{{ todayCardTitle }}</h2>
              <span class="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800">
                <span
                  class="h-2 w-2 shrink-0 rounded-full"
                  :class="todayAttendanceDotClass"
                  aria-hidden="true"
                />
                {{ todayAttendanceLabel }}
              </span>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4">
                <div class="min-w-0">
                  <p class="text-xs leading-5 text-fikr-ink-muted">{{ $t('parent.homeClassNow') }}</p>
                  <p class="truncate text-base font-medium text-navy-800">{{ classNowTitle }}</p>
                </div>
                <span v-if="classNowTime" class="shrink-0 text-sm text-fikr-ink-muted" dir="ltr">{{ classNowTime }}</span>
              </div>

              <div class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4">
                <div class="min-w-0">
                  <p class="text-xs leading-5 text-fikr-ink-muted">{{ busRowKicker }}</p>
                  <p class="truncate text-base font-medium text-navy-800">{{ busRowTitle }}</p>
                  <p
                    v-if="selectedPickupRow?.etaMinutes != null"
                    class="mt-0.5 text-xs text-fikr-ink-muted"
                    dir="ltr"
                  >
                    {{ $t('parent.busEtaMinutes', { n: selectedPickupRow.etaMinutes }) }}
                  </p>
                  <p v-if="pickupError" class="mt-1 text-sm font-medium leading-5 text-red-700">
                    {{ pickupError }}
                  </p>
                </div>
                <button
                  v-if="selectedPickupRow"
                  type="button"
                  class="shrink-0 text-sm font-medium text-navy-800"
                  :disabled="locatingStudentId === selectedPickupRow.studentId"
                  @click="sharePickupFromGps(selectedPickupRow)"
                >
                  {{
                    locatingStudentId === selectedPickupRow.studentId
                      ? $t('common.loading')
                      : selectedPickupRow.pickupSet
                        ? $t('parent.updateBusPickup')
                        : $t('parent.shareBusPickup')
                  }}
                </button>
                <router-link
                  v-else
                  to="/parent/attendance"
                  class="shrink-0 text-sm font-medium text-navy-800"
                >
                  {{ $t('parent.homeTrack') }}
                </router-link>
              </div>
            </div>
          </section>

          <section
            v-if="feesCard"
            class="rounded-2xl bg-navy-800 px-6 py-6 text-white"
            :aria-label="$t('parentFees.navTitle')"
          >
            <p class="text-xs leading-5 text-fikr-link-on-dark">{{ $t('parent.homeFeesKicker') }}</p>
            <h2 class="fk-display mt-1 text-2xl font-bold leading-8">{{ feesCard.headline }}</h2>
            <div class="mt-4 flex flex-wrap items-center gap-3">
              <router-link
                to="/parent/fees"
                class="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-base font-medium text-navy-800"
              >
                {{ $t('parentFees.payNow') }}
              </router-link>
              <router-link
                to="/parent/fees"
                class="inline-flex items-center justify-center rounded-full px-4 py-3 text-base font-medium text-white"
              >
                {{ $t('parent.homeFeesSchedule') }}
              </router-link>
            </div>
          </section>
          </div>

          <section :aria-label="$t('parent.homeSections')">
            <h2 class="fk-display mb-3 text-xl font-bold text-navy-800">{{ $t('parent.homeSections') }}</h2>
            <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <router-link
                v-for="tile in sectionTiles"
                :key="tile.to"
                :to="tile.to"
                class="flex flex-col gap-4 rounded-2xl bg-fikr-mist p-4 transition-colors hover:bg-fikr-surface-high sm:gap-6 sm:p-5"
              >
                <span class="relative grid h-10 w-10 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="tile.icon" />
                  </svg>
                  <span
                    v-if="tile.dot"
                    class="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-primary-500"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p class="text-base font-medium text-navy-800">{{ tile.title }}</p>
                  <p class="text-xs leading-5 text-fikr-ink-muted">{{ tile.subtitle }}</p>
                </div>
              </router-link>
            </div>
          </section>

          <section :aria-label="$t('parent.upcomingActivities')">
            <div class="mb-1 flex items-baseline justify-between gap-3">
              <h2 class="fk-display text-xl font-bold text-navy-800">{{ $t('parent.upcomingActivities') }}</h2>
              <router-link to="/parent/assigned-activities" class="text-sm font-medium text-navy-800">
                {{ $t('dashboard.viewAll') }}
              </router-link>
            </div>

            <ul v-if="upcomingHomeActivities.length" class="m-0 list-none divide-y divide-fikr-hairline p-0">
              <li
                v-for="act in upcomingHomeActivities"
                :key="act.id"
                class="flex items-center gap-3 py-4"
              >
                <span
                  class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-fikr-mist text-center text-xs font-medium leading-[14px] text-navy-800"
                  aria-hidden="true"
                >
                  <span>{{ act.dayNum }}</span>
                  <span>{{ act.dayWeek }}</span>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-base font-medium leading-5 text-navy-800">{{ act.title }}</p>
                  <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ act.meta }}</p>
                </div>
                <router-link
                  v-if="act.needsApproval"
                  to="/approvals"
                  class="shrink-0 rounded-full bg-navy-800 px-4 py-2 text-sm font-medium text-white"
                >
                  {{ $t('parent.homeApprove') }}
                </router-link>
              </li>
            </ul>
            <p v-else class="mt-2 text-sm text-fikr-ink-muted">{{ $t('parent.noAssignedActivities') }}</p>
          </section>

          <section
            v-if="liveBusMarkers.length"
            class="fk-bus-parent"
            :aria-label="$t('transportation.liveMapTitle')"
          >
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 class="fk-display text-lg font-bold text-navy-800">{{ $t('transportation.liveMapTitle') }}</h2>
              <span class="fk-pill fk-pill--teal">{{ $t('transportation.busNowMarker') }}</span>
            </div>
            <div class="fk-bus-parent__map">
              <MapView :markers="liveBusMarkers" fit-markers class="h-full" />
            </div>
          </section>
        </div>

        <!-- Desktop: 6c-style board for the parent's kids -->
        <div class="hidden space-y-6 xl:block xl:space-y-8">
          <LiveMeetingJoinCard v-if="liveMeetings.length" :rooms="liveMeetings" />

          <section class="fk-elev overflow-hidden p-0">
            <div class="grid items-start gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] xl:items-center xl:px-8">
              <div class="min-w-0">
                <p class="text-sm leading-5 text-fikr-ink-muted">{{ greetingDate }}</p>
                <h1 class="fk-display mt-2 text-3xl font-bold leading-tight text-navy-800 sm:text-4xl xl:text-5xl xl:leading-[64px]">
                  {{ desktopHeroTitle }}
                </h1>
                <p
                  v-if="desktopHeroSubtitle"
                  class="mt-2 text-lg font-medium leading-6 text-fikr-ink-muted"
                >
                  {{ desktopHeroSubtitle }}
                </p>
                <div v-if="children.length" class="mt-6 flex flex-wrap gap-2.5">
                  <button
                    v-for="child in children"
                    :key="child.id"
                    type="button"
                    class="fk-fchip"
                    :class="selectedChildId === child.id ? 'fk-fchip--active' : ''"
                    @click="selectedChildId = child.id"
                  >
                    {{ childChipLabel(child) }}
                  </button>
                </div>
                <div class="mt-6 flex flex-wrap gap-2.5">
                  <router-link to="/parent/attendance" class="fk-btn fk-btn--navy">
                    {{ $t('parent.attendance') }}
                  </router-link>
                  <router-link v-if="feesCard" to="/parent/fees" class="fk-btn fk-btn--mist">
                    {{ $t('parentFees.payNow') }}
                  </router-link>
                  <router-link to="/messages" class="fk-btn fk-btn--mist">
                    {{ $t('directMessages.title') }}
                  </router-link>
                </div>
              </div>

              <aside class="rounded-2xl bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,.16)]">
                <p class="mb-1 px-1 text-base font-medium text-navy-800">{{ $t('parent.homeNeedsAttention') }}</p>
                <div class="flex flex-col gap-2">
                  <router-link
                    v-if="feesCard"
                    to="/parent/fees"
                    class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4 text-base text-navy-800"
                  >
                    <span>{{ $t('parent.homeFeesKicker') }}</span>
                    <span class="font-medium tabular-nums" dir="ltr">{{ formatFeeAmount(feesPendingTotal || 0) }}</span>
                  </router-link>
                  <router-link
                    to="/approvals"
                    class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4 text-base text-navy-800"
                  >
                    <span>{{ $t('parent.openApprovals') }}</span>
                    <span class="font-medium">{{ pendingApprovals.length }}</span>
                  </router-link>
                  <router-link
                    to="/messages"
                    class="flex items-center justify-between gap-3 rounded-lg bg-fikr-mist px-4 py-4 text-base text-navy-800"
                  >
                    <span>{{ $t('directMessages.title') }}</span>
                    <span class="font-medium">{{ recentChats.length }}</span>
                  </router-link>
                  <router-link
                    v-if="attentionCta.to"
                    :to="attentionCta.to"
                    class="fk-btn fk-btn--navy mt-1 w-full"
                  >
                    {{ attentionCta.label }}
                  </router-link>
                </div>
              </aside>
            </div>

            <div class="px-4 pb-4 sm:px-6 xl:px-8">
              <h2 class="fk-display mb-3 text-xl font-bold text-navy-800 sm:text-2xl">{{ $t('parent.homeKidsToday') }}</h2>
              <div v-if="!desktopChildRows.length" class="py-10 text-center text-sm text-fikr-ink-muted">
                {{ $t('parentFees.noChildren') }}
              </div>
              <div v-else class="-mx-4 overflow-x-auto sm:mx-0">
                <table class="fk-feetable min-w-[640px] w-full sm:min-w-full">
                  <thead>
                    <tr>
                      <th>{{ $t('progressTracking.studentName') }}</th>
                      <th>{{ $t('parent.attendance') }}</th>
                      <th>{{ $t('parent.homeClassNow') }}</th>
                      <th>{{ $t('parent.homeBus') }}</th>
                      <th class="!text-end">{{ $t('common.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in desktopChildRows" :key="row.id">
                      <td>
                        <div class="font-medium text-navy-800">{{ row.name }}</div>
                        <div v-if="row.group" class="text-xs text-fikr-ink-muted">{{ row.group }}</div>
                      </td>
                      <td>
                        <span class="inline-flex items-center gap-1.5">
                          <span class="h-2 w-2 rounded-full" :class="row.attendanceDot" aria-hidden="true" />
                          {{ row.attendanceLabel }}
                        </span>
                      </td>
                      <td>
                        <div>{{ row.classTitle }}</div>
                        <div v-if="row.classTime" class="text-xs text-fikr-ink-muted" dir="ltr">{{ row.classTime }}</div>
                      </td>
                      <td>
                        <div>{{ row.busLabel }}</div>
                        <div
                          v-if="row.pickup?.etaMinutes != null"
                          class="text-xs text-fikr-ink-muted"
                          dir="ltr"
                        >
                          {{ $t('parent.busEtaMinutes', { n: row.pickup.etaMinutes }) }}
                        </div>
                        <p
                          v-if="pickupError && row.pickup && locatingStudentId === null && row.id === pickupErrorChildId"
                          class="mt-1 text-sm font-medium leading-5 text-red-700"
                        >
                          {{ pickupError }}
                        </p>
                      </td>
                      <td class="text-end">
                        <button
                          v-if="row.pickup"
                          type="button"
                          class="fk-btn fk-btn--mist fk-btn--sm"
                          :disabled="locatingStudentId === row.pickup.studentId"
                          @click="sharePickupFromGps(row.pickup)"
                        >
                          {{
                            locatingStudentId === row.pickup.studentId
                              ? $t('common.loading')
                              : row.pickup.pickupSet
                                ? $t('parent.updateBusPickup')
                                : $t('parent.shareBusPickup')
                          }}
                        </button>
                        <router-link
                          v-else
                          to="/parent/attendance"
                          class="fk-btn fk-btn--mist fk-btn--sm"
                        >
                          {{ $t('parent.homeTrack') }}
                        </router-link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="grid gap-4 px-4 py-6 sm:grid-cols-2 sm:gap-6 sm:px-6 sm:py-8 xl:grid-cols-3 xl:gap-8 xl:px-8">
              <div v-if="feesCard" class="fk-promo !p-6">
                <p class="fk-promo__eyebrow">{{ $t('parent.homeFeesKicker') }}</p>
                <h2 class="fk-promo__title">{{ feesCard.headline }}</h2>
                <div class="fk-promo__actions">
                  <router-link to="/parent/fees" class="fk-btn fk-btn--white">{{ $t('parentFees.payNow') }}</router-link>
                  <router-link to="/parent/fees" class="fk-btn fk-btn--ondark">{{ $t('parent.homeFeesSchedule') }}</router-link>
                </div>
              </div>
              <div v-else class="fk-soft !p-6">
                <p class="text-sm text-fikr-ink-muted">{{ $t('parent.homeFeesKicker') }}</p>
                <p class="fk-display mt-2 text-3xl font-bold text-navy-800">{{ $t('parent.homeFeesClear') }}</p>
              </div>

              <div class="fk-soft !p-6">
                <p class="text-sm text-fikr-ink-muted">{{ $t('parent.attendance') }}</p>
                <p class="fk-display mt-2 text-3xl font-bold text-navy-800">
                  {{ $t('parent.homeDesktopPresentShort', { present: presentCount, total: children.length }) }}
                </p>
                <router-link to="/parent/attendance" class="fk-btn fk-btn--mist mt-4">
                  {{ $t('parent.dashboardAttendanceSeeAll') }}
                </router-link>
              </div>

              <div class="fk-soft !p-6">
                <p class="text-sm text-fikr-ink-muted">{{ $t('parent.homeSections') }}</p>
                <div class="mt-4 grid grid-cols-2 gap-2">
                  <router-link
                    v-for="tile in sectionTiles"
                    :key="`desk-${tile.to}`"
                    :to="tile.to"
                    class="rounded-lg bg-white px-3 py-3 text-sm font-medium text-navy-800 shadow-sm"
                  >
                    {{ tile.title }}
                  </router-link>
                </div>
              </div>
            </div>
          </section>

          <div class="grid gap-4 sm:gap-6 xl:grid-cols-2 xl:gap-8">
            <section class="fk-elev !p-6" :aria-label="$t('parent.upcomingActivities')">
              <div class="mb-3 flex items-baseline justify-between gap-3">
                <h2 class="fk-display text-2xl font-bold text-navy-800">{{ $t('parent.upcomingActivities') }}</h2>
                <router-link to="/parent/assigned-activities" class="text-sm font-medium text-navy-800">
                  {{ $t('dashboard.viewAll') }}
                </router-link>
              </div>
              <ul v-if="upcomingHomeActivities.length" class="m-0 list-none divide-y divide-fikr-hairline p-0">
                <li
                  v-for="act in upcomingHomeActivities"
                  :key="`desk-act-${act.id}`"
                  class="flex items-center gap-3 py-4"
                >
                  <span
                    class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-fikr-mist text-center text-xs font-medium leading-[14px] text-navy-800"
                    aria-hidden="true"
                  >
                    <span>{{ act.dayNum }}</span>
                    <span>{{ act.dayWeek }}</span>
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="text-base font-medium leading-5 text-navy-800">{{ act.title }}</p>
                    <p class="mt-0.5 text-xs leading-5 text-fikr-ink-muted">{{ act.meta }}</p>
                  </div>
                  <router-link
                    v-if="act.needsApproval"
                    to="/approvals"
                    class="fk-btn fk-btn--navy fk-btn--sm shrink-0"
                  >
                    {{ $t('parent.homeApprove') }}
                  </router-link>
                </li>
              </ul>
              <p v-else class="text-sm text-fikr-ink-muted">{{ $t('parent.noAssignedActivities') }}</p>
            </section>

            <section
              v-if="liveBusMarkers.length"
              class="fk-elev !p-6 fk-bus-parent"
              :aria-label="$t('transportation.liveMapTitle')"
            >
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 class="fk-display text-2xl font-bold text-navy-800">{{ $t('transportation.liveMapTitle') }}</h2>
                <span class="fk-pill fk-pill--teal">{{ $t('transportation.busNowMarker') }}</span>
              </div>
              <div class="fk-bus-parent__map min-h-[240px]">
                <MapView :markers="liveBusMarkers" fit-markers class="h-full min-h-[240px]" />
              </div>
            </section>
            <section v-else class="fk-soft !p-6">
              <h2 class="fk-display text-2xl font-bold text-navy-800">{{ $t('parent.progress') }}</h2>
              <p class="mt-2 text-base text-navy-800">{{ progressSubtitle }}</p>
              <router-link to="/parent/progress" class="fk-btn fk-btn--mist mt-4">
                {{ $t('parent.progress') }}
              </router-link>
            </section>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import LiveMeetingJoinCard from '@/components/LiveMeetingJoinCard.vue'
import { useFeedback } from '@/composables/useFeedback'
import { parentService } from '../services/parent.service'
import { authService } from '@/services/auth.service'
import { meetingRoomService, type MeetingRoomMineRow } from '@/services/meeting-room.service'
import {
  chatApiService,
  type DirectApprovalInboxRow,
  type DirectThreadSummary,
} from '@/services/chat.service'
import { feesV2Service } from '@/services/fees-v2.service'
import { formatParentGroupNames } from '@/utils/parent-group-names'
import { canInviteeJoinMeeting } from '@/utils/meeting-host'
import { getDevicePosition, isDeviceLocationError } from '@/utils/device-location'
import FikrLoader from '@/components/FikrLoader.vue'

const { t, locale } = useI18n()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

type DashboardChild = {
  id: string
  firstName?: string
  lastName?: string
  groupNames?: string
  groups?: Array<{ id: string; name?: string }>
}

const loading = ref(true)
const error = ref('')
const dashboardData = ref<Record<string, any>>({})
const attendanceToday = ref<any>(null)
const assignedActivities = ref<any[]>([])
const recentChats = ref<DirectThreadSummary[]>([])
const pendingApprovals = ref<DirectApprovalInboxRow[]>([])
const invitedMeetings = ref<MeetingRoomMineRow[]>([])
const feesPendingTotal = ref<number | null>(null)
const feeHeadline = ref('')
const selectedChildId = ref<string | null>(null)
const locatingStudentId = ref<string | null>(null)
const pickupError = ref('')
const pickupErrorChildId = ref<string | null>(null)
let meetingPoll: ReturnType<typeof setInterval> | null = null
let busPositionPoll: ReturnType<typeof setInterval> | null = null

type ParentBusPosition = Awaited<ReturnType<typeof parentService.getMyBusPositions>>[number]
const busPositions = ref<ParentBusPosition[]>([])

const children = computed<DashboardChild[]>(() => {
  const list = (dashboardData.value.children || []) as DashboardChild[]
  return list.map((c) => ({ ...c, id: String(c.id) }))
})

const selectedChild = computed(() => {
  if (!children.value.length) return null
  return children.value.find((c) => c.id === selectedChildId.value) || children.value[0]
})

watch(
  children,
  (list) => {
    if (!list.length) {
      selectedChildId.value = null
      return
    }
    if (!selectedChildId.value || !list.some((c) => c.id === selectedChildId.value)) {
      selectedChildId.value = list[0].id
    }
  },
  { immediate: true },
)

const parentFirstName = computed(() => {
  const u = authService.getStoredUser()
  return (u?.firstName || '').trim() || t('parent.childName')
})

const greetingDate = computed(() => {
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-OM'
  return new Date().toLocaleDateString(loc, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

const greetingLine = computed(() => {
  const hour = new Date().getHours()
  const key = hour < 12 ? 'parent.homeGoodMorning' : hour < 18 ? 'parent.homeGoodAfternoon' : 'parent.homeGoodEvening'
  return t(key, { name: parentFirstName.value })
})

function childChipLabel(child: DashboardChild) {
  const name = (child.firstName || '').trim() || t('parent.childName')
  const group = formatParentGroupNames(child.groupNames, '')
  return group ? `${name} · ${group}` : name
}

const todayCardTitle = computed(() => {
  const name = (selectedChild.value?.firstName || '').trim() || t('parent.childName')
  return t('parent.homeTodayTitle', { name })
})

function formatScheduleTime(time: string | undefined | null): string {
  if (time == null || time === '') return ''
  const part = String(time).trim().split(/\s+/)[0]
  const bits = part.split(':')
  if (bits.length < 2) return ''
  return `${bits[0].padStart(2, '0')}:${bits[1].padStart(2, '0')}`
}

function normalizeDay(d: string | undefined | null): string {
  return (d || '').toLowerCase().trim()
}

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function attendanceRecordFor(childId: string | null | undefined) {
  if (!childId) return null
  const rows = attendanceToday.value?.children || []
  return rows.find((r: any) => String(r.studentId) === String(childId)) || null
}

function attendanceLabelFor(childId: string) {
  const row = attendanceRecordFor(childId)
  const status = row?.record?.status as string | undefined
  const time = row?.record?.check_in_time
  const timeShort = time ? String(time).slice(0, 5) : ''
  if (!status) return t('parent.pendingAttendance')
  const statusKey = `attendanceManagement.status.${status}`
  const statusText = t(statusKey)
  const label = statusText === statusKey ? status : statusText
  return timeShort ? `${label} · ${timeShort}` : label
}

function attendanceDotFor(childId: string) {
  const status = attendanceRecordFor(childId)?.record?.status
  if (status === 'present') return 'bg-primary-500'
  if (status === 'absent') return 'bg-rose-500'
  if (status === 'late') return 'bg-amber-500'
  return 'bg-zinc-400'
}

function classNowFor(child: DashboardChild | null) {
  if (!child) return null
  const groupIds = (child.groups || []).map((g) => String(g.id))
  if (!groupIds.length) return null
  const todayKey = dayKeys[new Date().getDay()]
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes()
  const schedules = (dashboardData.value.schedules || []) as Array<{
    group_id?: string
    day_of_week?: string
    start_time?: string
    end_time?: string
    course?: { name?: string }
    subject?: string
    teacher?: { firstName?: string; lastName?: string }
  }>
  const todays = schedules
    .filter((s) => groupIds.includes(String(s.group_id)) && normalizeDay(s.day_of_week) === todayKey)
    .map((s) => {
      const start = formatScheduleTime(s.start_time)
      const end = formatScheduleTime(s.end_time)
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const startMins = (sh || 0) * 60 + (sm || 0)
      const endMins = end ? (eh || 0) * 60 + (em || 0) : startMins + 45
      return { s, start, end, startMins, endMins }
    })
    .sort((a, b) => a.startMins - b.startMins)

  const current = todays.find((row) => nowMins >= row.startMins && nowMins < row.endMins)
  const next = todays.find((row) => row.startMins > nowMins)
  return current || next || todays[0] || null
}

function classTitleFor(row: ReturnType<typeof classNowFor>) {
  if (!row) return t('parent.homeNoClassNow')
  const course = row.s.course?.name || row.s.subject || t('parent.noData')
  const teacher = row.s.teacher
    ? `${row.s.teacher.firstName || ''} ${row.s.teacher.lastName || ''}`.trim()
    : ''
  return teacher ? `${course} · ${teacher}` : course
}

function classTimeFor(row: ReturnType<typeof classNowFor>) {
  if (!row?.start) return ''
  return row.end && row.end !== row.start ? `${row.start} – ${row.end}` : row.start
}

function pickupFor(childId: string) {
  for (const bus of busPositions.value) {
    const student = (bus.students || []).find((s) => String(s.id) === String(childId))
    if (student) {
      return {
        studentId: String(student.id),
        busTitle: bus.bus_title,
        pickupSet: Boolean(student.pickup_set),
        etaMinutes:
          student.eta_minutes != null && Number.isFinite(Number(student.eta_minutes))
            ? Number(student.eta_minutes)
            : null,
      }
    }
  }
  return null
}

const selectedAttendance = computed(() => attendanceRecordFor(selectedChild.value?.id))

const todayAttendanceLabel = computed(() =>
  selectedChild.value ? attendanceLabelFor(selectedChild.value.id) : t('parent.pendingAttendance'),
)

const todayAttendanceDotClass = computed(() =>
  selectedChild.value ? attendanceDotFor(selectedChild.value.id) : 'bg-zinc-400',
)

const classNow = computed(() => classNowFor(selectedChild.value))

const classNowTitle = computed(() => classTitleFor(classNow.value))

const classNowTime = computed(() => classTimeFor(classNow.value))

const selectedPickupRow = computed(() => {
  const id = selectedChild.value?.id
  return id ? pickupFor(id) : null
})

const presentCount = computed(() =>
  children.value.filter((c) => attendanceRecordFor(c.id)?.record?.status === 'present').length,
)

const absentCount = computed(() =>
  children.value.filter((c) => attendanceRecordFor(c.id)?.record?.status === 'absent').length,
)

const pendingAttendanceCount = computed(() =>
  children.value.filter((c) => !attendanceRecordFor(c.id)?.record?.status).length,
)

const desktopHeroTitle = computed(() => {
  if (!children.value.length) return greetingLine.value
  return t('parent.homeDesktopPresent', {
    present: presentCount.value,
    total: children.value.length,
  })
})

const desktopHeroSubtitle = computed(() => {
  if (!children.value.length) return ''
  const liveBusCount = busPositions.value.filter(
    (b) => b.last_lat != null && b.last_lng != null && Number.isFinite(Number(b.last_lat)),
  ).length
  const parts = [
    t('parent.homeDesktopAbsent', { n: absentCount.value }),
    t('parent.homeDesktopPending', { n: pendingAttendanceCount.value }),
  ]
  if (liveBusCount) {
    parts.push(t('parent.homeDesktopBusesLive', { n: liveBusCount }))
  }
  return parts.join(' · ')
})

const attentionCta = computed(() => {
  if (feesCard.value) {
    return { to: '/parent/fees', label: t('parentFees.payNow') }
  }
  if (pendingApprovals.value.length) {
    return {
      to: '/approvals',
      label: t('parent.homeApprovalsWaiting', { n: pendingApprovals.value.length }),
    }
  }
  if (recentChats.value.length) {
    return { to: '/messages', label: t('directMessages.title') }
  }
  return { to: '/parent/attendance', label: t('parent.attendance') }
})

const desktopChildRows = computed(() =>
  children.value.map((child) => {
    const pickup = pickupFor(child.id)
    const classRow = classNowFor(child)
    return {
      id: child.id,
      name: `${child.firstName || ''} ${child.lastName || ''}`.trim() || t('parent.childName'),
      group: formatParentGroupNames(child.groupNames, ''),
      attendanceLabel: attendanceLabelFor(child.id),
      attendanceDot: attendanceDotFor(child.id),
      classTitle: classTitleFor(classRow),
      classTime: classTimeFor(classRow),
      busLabel: pickup?.busTitle
        ? t('parent.homeBusRoute', { route: pickup.busTitle })
        : t('parent.homeBusNone'),
      pickup,
    }
  }),
)

const liveMeetings = computed(() => invitedMeetings.value.filter((r) => canInviteeJoinMeeting(r)))

const busRowKicker = computed(() => {
  if (selectedPickupRow.value?.busTitle) {
    return t('parent.homeBusRoute', { route: selectedPickupRow.value.busTitle })
  }
  return t('parent.homeBus')
})

const busRowTitle = computed(() => {
  if (selectedPickupRow.value) return t('parent.homeBusDismissal')
  return t('parent.homeBusNone')
})

const feesCard = computed(() => {
  const pending = feesPendingTotal.value
  if (pending == null || pending <= 0.0005) return null
  return {
    headline: feeHeadline.value || t('parent.homeFeesDue', { amount: formatFeeAmount(pending) }),
  }
})

function formatFeeAmount(v: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.000'
  return n.toFixed(3)
}

const weeklyPlanSubtitle = computed(() => {
  const plans = (dashboardData.value.weeklyPlans || []) as Array<{
    task_title?: string
    title?: string
    week_number?: number
  }>
  const plan = plans[0]
  if (!plan) return t('parent.homeNoWeeklyPlan')
  const title = plan.task_title || plan.title || t('parent.weeklyPlans')
  if (plan.week_number) return t('parent.homeWeekPlan', { n: plan.week_number, title })
  return title
})

const attendanceSubtitle = computed(() => {
  const status = selectedAttendance.value?.record?.status
  if (status === 'present') return t('parent.homeAttendancePresent')
  if (status === 'absent') return t('parent.homeAttendanceAbsent')
  return t('parent.pendingAttendance')
})

const progressSubtitle = computed(() => {
  const id = selectedChild.value?.id
  const rows = (dashboardData.value.progress || []) as Array<{
    student?: { id?: string }
    progress?: Array<{ status?: string }>
  }>
  const row = rows.find((r) => String(r.student?.id) === String(id))
  const list = row?.progress || []
  const fresh = list.filter((p) => p.status === 'completed' || p.status === 'in_progress').length
  if (!fresh) return t('parent.homeNoProgress')
  return t('parent.homeProgressCount', { n: fresh })
})

const messagesSubtitle = computed(() => {
  const chat = recentChats.value[0]
  if (chat?.other_name) return t('parent.homeMessageFrom', { name: chat.other_name })
  if (pendingApprovals.value.length) return t('parent.homeApprovalsWaiting', { n: pendingApprovals.value.length })
  return t('parent.homeNoMessages')
})

const sectionTiles = computed(() => [
  {
    to: '/parent/attendance',
    title: t('parent.attendance'),
    subtitle: attendanceSubtitle.value,
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    dot: false,
  },
  {
    to: '/parent/weekly-plans',
    title: t('parent.weeklyPlan'),
    subtitle: weeklyPlanSubtitle.value,
    icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    dot: false,
  },
  {
    to: '/parent/progress',
    title: t('parent.progress'),
    subtitle: progressSubtitle.value,
    icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    dot: false,
  },
  {
    to: '/messages',
    title: t('directMessages.title'),
    subtitle: messagesSubtitle.value,
    icon: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
    dot: recentChats.value.length > 0 || pendingApprovals.value.length > 0,
  },
])

const upcomingHomeActivities = computed(() => {
  const today = todayTripDate()
  const loc = locale.value === 'ar' ? 'ar-OM' : 'en-OM'
  return (assignedActivities.value || [])
    .map((act: any) => {
      const raw = act.activity_date || act.date || ''
      const day = String(raw).slice(0, 10)
      return { act, day }
    })
    .filter(({ day }) => day && day >= today)
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(0, 4)
    .map(({ act, day }) => {
      const d = new Date(`${day}T12:00:00`)
      const dayNum = d.toLocaleDateString(loc, { day: 'numeric' })
      const dayWeek = d.toLocaleDateString(loc, { weekday: 'short' })
      const group = act.group?.name || act.group_name || ''
      const needsApproval = !!act.requires_parent_approval
      const metaParts = [
        group,
        needsApproval ? t('activities.approvalRequiredBadge') : '',
      ].filter(Boolean)
      return {
        id: String(act.id),
        title: act.title || act.name || '—',
        meta: metaParts.join(' · '),
        dayNum,
        dayWeek,
        needsApproval,
      }
    })
})

const liveBuses = computed(() =>
  busPositions.value.filter(
    (b) => b.last_lat != null && b.last_lng != null && Number.isFinite(Number(b.last_lat)),
  ),
)

const liveBusMarkers = computed<MapViewMarker[]>(() =>
  liveBuses.value.map((b) => ({
    id: b.bus_id,
    lng: Number(b.last_lng),
    lat: Number(b.last_lat),
    kind: 'bus' as const,
    color: 'teal' as const,
    label: b.bus_title,
    tooltip: b.students.map((s) => s.firstName).join(' · '),
  })),
)

function todayTripDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadFeesPending() {
  const list = children.value
  const ids = list.map((c) => String(c.id || '')).filter(Boolean)
  if (!ids.length) {
    feesPendingTotal.value = 0
    feeHeadline.value = ''
    return
  }
  const sheets = await Promise.all(
    ids.map((id) => feesV2Service.getStudentChargeSheet(id).catch(() => null)),
  )
  let pending = 0
  let headline = ''
  const today = todayTripDate()
  for (const sheet of sheets) {
    if (!sheet) continue
    pending += Math.max(0, Number(sheet.due_total || 0) - Number(sheet.paid_total || 0))
    for (const inst of sheet.installments || []) {
      if (inst.status === 'paid') continue
      const remaining = Math.max(0, Number(inst.amount_due || 0) - Number(inst.amount_paid || 0))
      if (remaining <= 0.0005) continue
      const dueDate = inst.due_date ? String(inst.due_date).slice(0, 10) : null
      if (!dueDate || dueDate > today) continue
      const label =
        inst.label === 'upfront' || inst.sequence === 0
          ? t('feesV2.upfront')
          : inst.label || t('parentFees.installmentDefaultLabel', { n: inst.sequence })
      headline = t('parent.homeFeesLate', {
        label,
        amount: `${formatFeeAmount(remaining)} ${t('enrollment.omaniRial')}`,
      })
      break
    }
    if (headline) break
  }
  feesPendingTotal.value = pending
  feeHeadline.value = headline || (pending > 0
    ? t('parent.homeFeesDue', { amount: `${formatFeeAmount(pending)} ${t('enrollment.omaniRial')}` })
    : '')
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    attendanceToday.value = null

    const approvalLocale = locale.value === 'ar' ? 'ar' : 'en'
    const [dashResult, attResult, meetingResult, actResult, chatResult, approvalResult] =
      await Promise.allSettled([
        parentService.getMyDashboardData(),
        parentService.getMyAttendance(0, 1),
        meetingRoomService.mine(),
        parentService.getMyAssignedActivities(),
        chatApiService.listDirectThreads(),
        chatApiService.listApprovalInbox(approvalLocale),
      ])

    if (dashResult.status === 'rejected') throw dashResult.reason
    dashboardData.value = dashResult.value
    void loadFeesPending()
    void loadBusPositions()

    if (attResult.status === 'fulfilled') {
      attendanceToday.value = attResult.value?.today ?? null
    }

    invitedMeetings.value = meetingResult.status === 'fulfilled' ? meetingResult.value : []
    assignedActivities.value = actResult.status === 'fulfilled' ? actResult.value ?? [] : []
    recentChats.value = chatResult.status === 'fulfilled' ? (chatResult.value ?? []).slice(0, 6) : []
    pendingApprovals.value =
      approvalResult.status === 'fulfilled'
        ? (approvalResult.value ?? []).filter((r) => r.approval_status === 'pending' && r.can_approve)
        : []
  } catch (err: any) {
    console.error('Error loading parent dashboard data:', err)
    error.value = err.message || t('parent.error')
  } finally {
    loading.value = false
  }
}

async function loadBusPositions() {
  try {
    busPositions.value = await parentService.getMyBusPositions()
  } catch {
    /* keep last known */
  }
}

function geoErrorMessage(err: unknown): string {
  if (isDeviceLocationError(err)) {
    if (err.code === 'unsupported') return t('parent.geoNotSupported')
    if (err.code === 'denied') return t('parent.geoDenied')
    return t('parent.geoUnavailable')
  }
  return t('parent.geoUnavailable')
}

async function sharePickupFromGps(row: { studentId: string }) {
  locatingStudentId.value = row.studentId
  pickupError.value = ''
  pickupErrorChildId.value = null
  try {
    const pos = await getDevicePosition({ enableHighAccuracy: true, timeout: 15000 })
    await parentService.shareChildBusPickup(row.studentId, {
      pickup_lat: pos.latitude,
      pickup_lng: pos.longitude,
    })
    feedback.success(t('parent.shareBusPickupOk'), t('common.success'))
    await loadBusPositions()
  } catch (err) {
    pickupError.value = isDeviceLocationError(err)
      ? geoErrorMessage(err)
      : t('parent.shareBusPickupFailed')
    pickupErrorChildId.value = row.studentId
  } finally {
    locatingStudentId.value = null
  }
}

onMounted(() => {
  void loadDashboardData()
  meetingPoll = setInterval(() => {
    meetingRoomService.mine().then((rows) => {
      invitedMeetings.value = rows
    }).catch(() => {})
  }, 20000)
  busPositionPoll = setInterval(() => {
    void loadBusPositions()
  }, 15000)
})

onBeforeUnmount(() => {
  if (meetingPoll) clearInterval(meetingPoll)
  if (busPositionPoll) clearInterval(busPositionPoll)
})
</script>

<style scoped>
.fk-parent-home {
  width: 100%;
  max-width: none;
}
@media (max-width: 639px) {
  .fk-parent-home {
    max-width: 28rem;
    margin-inline: auto;
  }
}
</style>
