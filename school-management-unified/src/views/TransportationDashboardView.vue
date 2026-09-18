<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('transportation.liveDashboard')"
        :subtitle="$t('transportation.liveDashboardHint')"
      >
        <template #actions>
          <router-link to="/transportation/daily-log" class="fk-btn fk-btn--white">
            {{ $t('busDailyLog.title') }}
          </router-link>
          <router-link to="/transportation/buses/new" class="fk-btn fk-btn--white">
            {{ $t('transportation.addBus') }}
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="loading" class="fk-elev flex flex-col items-center justify-center gap-3 py-20 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else>
        <!-- Summary band (mock 8c): date · trip chips + counts -->
        <section class="fk-elev p-0">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="min-w-0">
              <p class="text-xs leading-5 text-fikr-ink-muted">{{ todayLabel }}</p>
              <h2 class="fk-display truncate text-xl font-bold leading-8 text-navy-800">
                {{ $t('transportation.liveDashboard') }}
              </h2>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="fk-fchip"
                :class="tripKind === 'going' ? 'fk-fchip--active' : ''"
                :aria-pressed="tripKind === 'going'"
                @click="tripKind = 'going'"
              >
                {{ $t('busDailyLog.tripGoing') }}
              </button>
              <button
                type="button"
                class="fk-fchip"
                :class="tripKind === 'return' ? 'fk-fchip--active' : ''"
                :aria-pressed="tripKind === 'return'"
                @click="tripKind = 'return'"
              >
                {{ $t('busDailyLog.tripReturn') }}
              </button>
            </div>
          </header>

          <div class="grid grid-cols-2 gap-2 px-4 py-3 sm:px-5">
            <div class="fk-tile min-w-0">
              <span class="fk-tile__label">{{ $t('transportation.activeBuses') }}</span>
              <span class="fk-tile__value" dir="ltr">{{ activeBuses.length }}</span>
            </div>
            <div class="fk-tile min-w-0">
              <span class="fk-tile__label">{{ $t('transportation.onBoardNow') }}</span>
              <span class="fk-tile__value text-primary-700" dir="ltr">{{ totalOnBoard }}</span>
            </div>
          </div>

          <!-- Live fleet map -->
          <div class="px-4 pb-4 sm:px-5">
            <div v-if="fleetMarkers.length" class="h-80 overflow-hidden rounded-2xl shadow-fee">
              <MapView :markers="fleetMarkers" fit-markers class="h-full" />
            </div>
            <p v-else class="rounded-lg bg-fikr-mist px-4 py-3 text-center text-xs text-fikr-ink-muted">
              {{ $t('transportation.liveNone') }}
            </p>
          </div>
        </section>

        <!-- Per-bus cards (mock 8c list) -->
        <div v-if="activeBuses.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="bus in activeBuses"
            :key="bus.id"
            class="fk-kcard flex cursor-pointer flex-col gap-3 p-5"
            @click="openBus(bus)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex min-w-0 items-center gap-3">
                <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-navy-800" aria-hidden="true">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 6h8a3 3 0 013 3v6a2 2 0 01-2 2h-1a2 2 0 11-4 0h-2a2 2 0 11-4 0H5a2 2 0 01-2-2V9a3 3 0 013-3zm-3 6h14M8 6v6m8-6v6" />
                  </svg>
                </span>
                <div class="min-w-0">
                  <p class="truncate text-base font-medium leading-5 text-navy-800">{{ bus.title }}</p>
                  <p class="truncate text-xs text-fikr-ink-muted">
                    {{ $t('transportation.driver') }}: {{ bus.driverName }}<template v-if="supervisorName(bus)"> · {{ $t('transportation.supervisor') }}: {{ supervisorName(bus) }}</template>
                  </p>
                </div>
              </div>
              <span
                v-if="hasLivePosition(bus)"
                class="fk-ktag shrink-0"
                :title="lastSeenLabel(bus)"
              >
                <span class="fk-ktag__dot bg-primary-500" />
                {{ lastSeenLabel(bus) }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5">
              <span class="text-sm text-fikr-ink-muted">{{ $t('transportation.onBoardNow') }}</span>
              <span class="text-sm font-medium tabular-nums text-navy-800" dir="ltr">
                {{ $t('transportation.onBoardOf', { n: onBoardCount(bus.id), total: rosterCount(bus) }) }}
              </span>
            </div>
            <div class="flex h-1.5 gap-[3px] overflow-hidden rounded-pill" aria-hidden="true">
              <span v-if="onBoardCount(bus.id)" class="bg-primary-500" :style="{ flex: onBoardCount(bus.id) }" />
              <span v-if="rosterCount(bus) - onBoardCount(bus.id) > 0" class="bg-white" :style="{ flex: rosterCount(bus) - onBoardCount(bus.id) }" />
            </div>
          </article>
        </div>

        <div v-else class="fk-elev">
          <div class="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p class="text-sm font-medium text-navy-800">{{ $t('transportation.noBuses') }}</p>
            <router-link to="/transportation/buses/new" class="fk-btn fk-btn--navy mt-4">
              {{ $t('transportation.addBus') }}
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import { authService } from '@/services'
import { busService, type Bus, type BusMovementLog, type BusTripType } from '@/services/bus.service'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  const raw = u?.school_id
  return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
})

function todayTripDate(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

const loading = ref(true)
const buses = ref<Bus[]>([])
const tripKind = ref<BusTripType>('going')
/** Today's movement logs per bus for the selected trip. */
const movementsByBus = ref<Record<string, BusMovementLog[]>>({})
let poll: ReturnType<typeof setInterval> | null = null

const todayLabel = computed(() =>
  new Date().toLocaleDateString(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
)

const activeBuses = computed(() => buses.value.filter((b) => b.is_active))

function rosterCount(bus: Bus): number {
  return bus.students?.length ?? 0
}

function supervisorName(bus: Bus): string {
  const s = bus.supervisor
  if (!s) return ''
  return `${s.firstName || ''} ${s.lastName || ''}`.trim()
}

/** On board = students whose latest movement today (this trip) is "boarded". */
function onBoardCount(busId: string): number {
  const logs = movementsByBus.value[busId] || []
  const lastByStudent = new Map<string, BusMovementLog>()
  for (const m of logs) {
    const prev = lastByStudent.get(m.student_id)
    if (!prev || new Date(m.logged_at) > new Date(prev.logged_at)) {
      lastByStudent.set(m.student_id, m)
    }
  }
  let n = 0
  for (const m of lastByStudent.values()) if (m.event_type === 'boarded') n++
  return n
}

const totalOnBoard = computed(() =>
  activeBuses.value.reduce((sum, b) => sum + onBoardCount(b.id), 0),
)

function hasLivePosition(bus: Bus): boolean {
  return bus.last_lat != null && bus.last_lng != null && Number.isFinite(Number(bus.last_lat))
}

function lastSeenLabel(bus: Bus): string {
  if (!bus.last_position_at) return ''
  const time = new Date(bus.last_position_at).toLocaleTimeString(
    locale.value === 'ar' ? 'ar-OM' : 'en-OM',
    { hour: '2-digit', minute: '2-digit' },
  )
  return t('transportation.liveLastSeen', { time })
}

const fleetMarkers = computed<MapViewMarker[]>(() =>
  activeBuses.value.filter(hasLivePosition).map((b) => ({
    id: b.id,
    lng: Number(b.last_lng),
    lat: Number(b.last_lat),
    kind: 'bus' as const,
    color: 'teal' as const,
    label: `${b.title} · ${onBoardCount(b.id)}`,
    tooltip: lastSeenLabel(b) || b.title,
  })),
)

function openBus(bus: Bus) {
  void router.push(`/transportation/buses/${bus.id}`)
}

async function loadMovements() {
  const date = todayTripDate()
  const entries = await Promise.all(
    activeBuses.value.map(async (b) => {
      const logs = await busService
        .listMovements(b.id, { date, tripType: tripKind.value, limit: 400 })
        .catch(() => [] as BusMovementLog[])
      return [b.id, logs] as const
    }),
  )
  movementsByBus.value = Object.fromEntries(entries)
}

async function refresh() {
  buses.value = await busService.getAll(schoolId.value, true).catch(() => buses.value)
  await loadMovements()
}

watch(tripKind, () => {
  void loadMovements()
})

onMounted(async () => {
  loading.value = true
  try {
    await refresh()
  } finally {
    loading.value = false
  }
  poll = setInterval(() => {
    void refresh()
  }, 15000)
})

onUnmounted(() => {
  if (poll) clearInterval(poll)
})
</script>
