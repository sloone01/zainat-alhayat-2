<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <div v-if="loading" class="fk-elev flex flex-col items-center justify-center gap-3 py-20 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <section v-else class="fk-bus-board">
        <header class="fk-bus-board__toolbar">
          <div class="min-w-0">
            <p class="fk-bus-board__meta">
              {{ todayLabel }}
              ·
              {{ tripKind === 'going' ? $t('busDailyLog.tripGoing') : $t('busDailyLog.tripReturn') }}
            </p>
            <h1 class="fk-bus-board__title">
              {{ $t('transportation.fleetHeadline', { buses: activeBuses.length, kids: totalOnBoard }) }}
            </h1>
          </div>
          <div class="fk-bus-board__actions">
            <div class="fk-bus-tabs" role="group" :aria-label="$t('busDailyLog.tripKind')">
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
            <router-link to="/transportation/daily-log" class="fk-btn fk-btn--mist">
              {{ $t('busDailyLog.title') }}
            </router-link>
            <router-link to="/transportation/buses/new" class="fk-btn fk-btn--navy">
              <IconPlus />
              <span class="hidden sm:inline">{{ $t('transportation.addBus') }}</span>
            </router-link>
          </div>
        </header>

        <div v-if="!activeBuses.length" class="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p class="text-sm font-medium text-navy-800">{{ $t('transportation.noBuses') }}</p>
          <router-link to="/transportation/buses/new" class="fk-btn fk-btn--navy mt-4">
            {{ $t('transportation.addBus') }}
          </router-link>
        </div>

        <div v-else class="fk-bus-layout">
          <aside class="fk-bus-rail" :aria-label="$t('transportation.buses')">
            <article
              v-for="bus in activeBuses"
              :key="bus.id"
              class="fk-bus-card"
              :class="selectedBusId === bus.id ? 'fk-bus-card--on' : ''"
              role="button"
              tabindex="0"
              @click="selectBus(bus)"
              @keydown.enter.prevent="selectBus(bus)"
            >
              <div class="fk-bus-card__top">
                <div class="min-w-0">
                  <p class="fk-bus-card__name truncate">{{ bus.title }}</p>
                  <p class="fk-bus-card__crew truncate">
                    {{ $t('transportation.driver') }}: {{ bus.driverName }}
                    <template v-if="supervisorName(bus)">
                      · {{ $t('transportation.supervisor') }}: {{ supervisorName(bus) }}
                    </template>
                  </p>
                </div>
                <div @click.stop>
                  <RowActionsMenu
                    :open="activeMenuId === bus.id"
                    placement="up"
                    @toggle="toggleMenu(bus.id)"
                  >
                    <RowActionsItem icon="view" @click="openDailyLog(bus)">
                      {{ $t('transportation.openDailyLog') }}
                    </RowActionsItem>
                    <RowActionsItem icon="edit" @click="openBus(bus)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem icon="chat" @click="openBusChat(bus)">
                      {{ $t('transportation.createParentsChat') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
              </div>

              <div class="fk-bus-card__bar" aria-hidden="true">
                <span :style="{ width: progressPct(bus) + '%' }" />
              </div>

              <div class="fk-bus-card__foot">
                <span dir="ltr">{{ $t('transportation.onBoardOf', { n: onBoardCount(bus.id), total: rosterCount(bus) }) }}</span>
                <span v-if="hasLivePosition(bus)">{{ lastSeenLabel(bus) }}</span>
              </div>
            </article>
          </aside>

          <div class="fk-bus-map">
            <MapView
              class="h-full min-h-[18rem] lg:min-h-full"
              :markers="fleetMarkers"
              :fit-markers="fleetMarkers.length > 0"
              :center="mapCenter"
              :zoom="fleetMarkers.length ? 12 : 11"
              @marker-click="onMarkerClick"
            />
            <div v-if="!fleetMarkers.some((m) => m.kind === 'bus')" class="fk-bus-map__empty">
              <p>{{ $t('transportation.liveNone') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { authService } from '@/services'
import { chatApiService } from '@/services/chat.service'
import { busService, type Bus, type BusMovementLog, type BusTripType } from '@/services/bus.service'

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
const selectedBusId = ref<string | null>(null)
const activeMenuId = ref<string | null>(null)
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

function progressPct(bus: Bus): number {
  const total = rosterCount(bus)
  if (!total) return 0
  return Math.min(100, Math.round((onBoardCount(bus.id) / total) * 100))
}

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

const mapCenter = computed((): [number, number] => {
  const selected = activeBuses.value.find((b) => b.id === selectedBusId.value)
  if (selected && hasLivePosition(selected)) {
    return [Number(selected.last_lng), Number(selected.last_lat)]
  }
  const withPos = activeBuses.value.find(hasLivePosition)
  if (withPos) return [Number(withPos.last_lng), Number(withPos.last_lat)]
  return [58.3829, 23.588]
})

const fleetMarkers = computed<MapViewMarker[]>(() => {
  const markers: MapViewMarker[] = [
    {
      id: 'school',
      lng: 58.3829,
      lat: 23.588,
      kind: 'school',
      color: 'navy',
      label: t('transportation.schoolMarker'),
      tooltip: t('transportation.schoolMarker'),
    },
  ]
  for (const b of activeBuses.value) {
    if (!hasLivePosition(b)) continue
    const on = onBoardCount(b.id)
    markers.push({
      id: b.id,
      lng: Number(b.last_lng),
      lat: Number(b.last_lat),
      kind: 'bus',
      color: selectedBusId.value === b.id ? 'teal' : 'navy',
      label: `${b.title} · ${on}`,
      tooltip: lastSeenLabel(b) || b.title,
    })
  }
  return markers
})

function selectBus(bus: Bus) {
  selectedBusId.value = bus.id
  activeMenuId.value = null
}

function openBus(bus: Bus) {
  activeMenuId.value = null
  void router.push(`/transportation/buses/${bus.id}`)
}

function openDailyLog(bus: Bus) {
  activeMenuId.value = null
  void router.push({ path: '/transportation/daily-log', query: { bus: bus.id } })
}

async function openBusChat(bus: Bus) {
  activeMenuId.value = null
  try {
    const room = await chatApiService.createBusParentsRoom(bus.id)
    void router.push(`/chat/${room.id}`)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg || t('transportation.createParentsChatFailed'))
  }
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function onMarkerClick(id: string) {
  if (id === 'school') return
  selectedBusId.value = id
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
  if (!selectedBusId.value && activeBuses.value.length) {
    selectedBusId.value = activeBuses.value[0].id
  }
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
