<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('busDailyLog.title')" :subtitle="$t('busDailyLog.subtitle')" />

      <div v-if="loading && !selectedBusId" class="fk-elev flex flex-col items-center justify-center gap-3 py-20 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <section v-else class="fk-bus-board fk-bus-sup">
        <header class="fk-bus-sup__head">
          <div class="fk-bus-sup__pick fk-bus-sup__pick--grow">
            <label class="fk-bus-sup__label" for="bus-daily-select">
              {{ $t('busDailyLog.selectBus') }}
            </label>
            <select id="bus-daily-select" v-model="selectedBusId" class="fk-field">
              <option value="">{{ $t('busDailyLog.chooseBus') }}</option>
              <option v-for="b in buses" :key="b.id" :value="b.id">{{ b.title }}</option>
            </select>
          </div>
          <div class="fk-bus-sup__pick">
            <span class="fk-bus-sup__label">{{ $t('busDailyLog.tripKind') }}</span>
            <div class="fk-bus-tabs fk-bus-tabs--seg" role="group" :aria-label="$t('busDailyLog.tripKind')">
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
          </div>
        </header>

        <p
          v-if="!selectedBusId"
          class="rounded-2xl bg-fikr-mist py-12 text-center text-sm font-medium text-navy-800"
        >
          {{ $t('busDailyLog.chooseBusHint') }}
        </p>

        <template v-else>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h1 class="fk-bus-sup__title">
              {{ selectedBus?.title }}
              ·
              {{ tripKind === 'going' ? $t('busDailyLog.tripGoing') : $t('busDailyLog.tripReturn') }}
            </h1>
            <button
              type="button"
              class="fk-btn fk-btn--sm"
              :class="sharing ? 'fk-btn--mist' : 'fk-btn--navy'"
              :disabled="!selectedBusId"
              @click="sharing ? stopSharing() : startSharing()"
            >
              <span
                v-if="sharing"
                class="me-1 inline-block h-2 w-2 animate-pulse rounded-full bg-primary-500"
                aria-hidden="true"
              />
              {{ sharing ? $t('transportation.liveShareStop') : $t('transportation.liveShareStart') }}
            </button>
          </div>

          <div class="fk-bus-route">
            <div class="fk-bus-route__map">
              <MapView
                class="h-full"
                :center="mapCenter"
                :zoom="mapMarkers.length > 1 ? 13 : 14"
                :markers="mapMarkers"
                :fit-markers="mapMarkers.length > 0"
              />
            </div>
            <div class="fk-bus-route__foot">
              <span class="fk-pill fk-pill--navy">
                {{ $t('transportation.onBoardOf', { n: onboardStudents.length, total: roster.length }) }}
              </span>
              <span class="text-xs text-fikr-ink-muted">
                <template v-if="sharing">{{ $t('transportation.liveSharing') }}</template>
                <template v-else-if="lastFix">{{ $t('transportation.liveLastSeen', { time: formatClock(lastFix.at) }) }}</template>
                <template v-else>{{ $t('transportation.liveNone') }}</template>
              </span>
            </div>
            <p v-if="shareError" class="px-3 pb-3 text-sm font-medium leading-5 text-red-700">{{ shareError }}</p>
          </div>

          <div class="fk-bus-tabs" role="tablist" :aria-label="$t('busDailyLog.rosterTabs')">
            <button
              type="button"
              role="tab"
              class="fk-fchip"
              :class="rosterTab === 'waiting' ? 'fk-fchip--active' : ''"
              :aria-selected="rosterTab === 'waiting'"
              @click="rosterTab = 'waiting'"
            >
              {{ $t('busDailyLog.tabWaiting', { count: waitingStudents.length }) }}
            </button>
            <button
              type="button"
              role="tab"
              class="fk-fchip"
              :class="rosterTab === 'onboard' ? 'fk-fchip--active' : ''"
              :aria-selected="rosterTab === 'onboard'"
              @click="rosterTab = 'onboard'"
            >
              {{ $t('busDailyLog.tabOnboard', { count: onboardStudents.length }) }}
            </button>
            <button
              type="button"
              role="tab"
              class="fk-fchip"
              :class="rosterTab === 'done' ? 'fk-fchip--active' : ''"
              :aria-selected="rosterTab === 'done'"
              @click="rosterTab = 'done'"
            >
              {{ $t('busDailyLog.tabDone', { count: doneStudents.length }) }}
            </button>
          </div>

          <p v-if="loading" class="py-10 text-center text-sm text-fikr-ink-muted">
            {{ $t('common.loading') }}…
          </p>

          <p
            v-else-if="roster.length === 0"
            class="rounded-2xl bg-fikr-mist py-10 text-center text-sm font-medium text-navy-800"
          >
            {{ $t('busDailyLog.emptyRoster') }}
          </p>

          <template v-else>
            <div v-if="rosterTab === 'waiting'" class="fk-bus-panel">
              <div class="fk-bus-panel__head">
                <h2 class="fk-bus-panel__title">{{ $t('busDailyLog.waitingTitle') }}</h2>
                <p class="fk-bus-panel__meta">{{ waitingStudents.length }}</p>
              </div>
              <p v-if="!waitingStudents.length" class="py-6 text-center text-sm text-fikr-ink-muted">
                {{ $t('busDailyLog.waitingEmpty') }}
              </p>
              <div
                v-for="s in waitingStudents"
                :key="s.id"
                class="fk-bus-row"
              >
                <span class="fk-bus-av" aria-hidden="true">{{ initials(s) }}</span>
                <div class="fk-bus-row__body">
                  <p class="fk-bus-row__name">{{ s.firstName }} {{ s.lastName }}</p>
                  <p class="fk-bus-row__meta">
                    <template v-if="etaMinutesFor(s.id) != null">
                      {{ $t('transportation.etaMinutes', { n: etaMinutesFor(s.id) }) }}
                    </template>
                    <template v-else>{{ $t('busDailyLog.legPendingBoard') }}</template>
                  </p>
                </div>
                <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    class="fk-btn fk-btn--mist fk-btn--sm"
                    :disabled="locatingId === s.id || saving"
                    @click="setPickupFromGps(s.id)"
                  >
                    {{
                      locatingId === s.id
                        ? $t('common.loading')
                        : pickupSet(s.id)
                          ? $t('transportation.updateLocation')
                          : $t('transportation.useCurrentLocation')
                    }}
                  </button>
                  <button
                    type="button"
                    class="fk-btn fk-btn--navy fk-btn--sm"
                    :disabled="saving || !canBoard(s.id)"
                    @click="logOne(s.id, 'boarded')"
                  >
                    {{ $t('busDailyLog.boarded') }}
                  </button>
                </div>
              </div>
            </div>

            <div v-else-if="rosterTab === 'onboard'" class="fk-bus-panel">
              <div class="fk-bus-panel__head">
                <h2 class="fk-bus-panel__title">{{ $t('busDailyLog.onboardTitle') }}</h2>
                <p class="fk-bus-panel__meta">{{ onboardStudents.length }}</p>
              </div>
              <p v-if="!onboardStudents.length" class="py-6 text-center text-sm text-fikr-ink-muted">
                {{ $t('busDailyLog.onboardEmpty') }}
              </p>
              <div
                v-for="s in onboardStudents"
                :key="s.id"
                class="fk-bus-row fk-bus-row--plain"
              >
                <span class="fk-bus-av fk-bus-av--on" aria-hidden="true">{{ initials(s) }}</span>
                <div class="fk-bus-row__body">
                  <p class="fk-bus-row__name">{{ s.firstName }} {{ s.lastName }}</p>
                  <p class="fk-bus-row__meta">{{ boardedMeta(s.id) }}</p>
                </div>
                <button
                  type="button"
                  class="fk-btn fk-btn--mist fk-btn--sm shrink-0"
                  :disabled="saving || !canDrop(s.id)"
                  @click="logOne(s.id, 'dropped_off')"
                >
                  {{ $t('busDailyLog.droppedOff') }}
                </button>
              </div>
            </div>

            <div v-else class="fk-bus-panel">
              <div class="fk-bus-panel__head">
                <h2 class="fk-bus-panel__title">{{ $t('busDailyLog.doneTitle') }}</h2>
                <p class="fk-bus-panel__meta">{{ doneStudents.length }}</p>
              </div>
              <p v-if="!doneStudents.length" class="py-6 text-center text-sm text-fikr-ink-muted">
                {{ $t('busDailyLog.doneEmpty') }}
              </p>
              <div
                v-for="s in doneStudents"
                :key="s.id"
                class="fk-bus-row fk-bus-row--plain"
              >
                <span class="fk-bus-av" aria-hidden="true">{{ initials(s) }}</span>
                <div class="fk-bus-row__body">
                  <p class="fk-bus-row__name">{{ s.firstName }} {{ s.lastName }}</p>
                  <p class="fk-bus-row__meta">{{ $t('busDailyLog.legTripComplete') }}</p>
                </div>
              </div>
            </div>
          </template>
        </template>
      </section>
    </div>

    <LocationPickerDialog
      :show="pickerStudentId !== null"
      :busy="pickerSaving"
      :initial="pickerInitial"
      @close="pickerStudentId = null"
      @confirm="onPickerConfirm"
    />

    <FikrDialog
      :show="!!boardedOkName"
      :title="$t('common.success')"
      plain-footer
      @close="boardedOkName = ''"
    >
      <p class="text-sm text-fikr-ink-soft">{{ $t('busDailyLog.boardedOk', { name: boardedOkName }) }}</p>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--primary" @click="boardedOkName = ''">
          {{ $t('common.ok') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import { authService } from '@/services'
import {
  busService,
  type Bus,
  type BusMovementLog,
  type BusMovementEventType,
  type BusTripType,
  type BusStudentWithPickup,
} from '@/services/bus.service'
import FikrLoader from '@/components/FikrLoader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import LocationPickerDialog from '@/components/LocationPickerDialog.vue'
import { watchDevicePosition } from '@/utils/device-location'

const route = useRoute()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  const raw = u?.school_id
  return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
})

function localDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function todayTripDate(): string {
  return localDateInputValue(new Date())
}

type RosterStudent = { id: string; firstName: string; lastName: string }

const loading = ref(true)
const saving = ref(false)
const buses = ref<Bus[]>([])
const selectedBusId = ref('')
const roster = ref<RosterStudent[]>([])
const pickups = ref<BusStudentWithPickup[]>([])
const movements = ref<BusMovementLog[]>([])
const tripKind = ref<BusTripType>('going')
const rosterTab = ref<'waiting' | 'onboard' | 'done'>('waiting')
const etaByStudentId = ref<Record<string, number>>({})
const locatingId = ref<string | null>(null)

const selectedBus = computed(() => buses.value.find((b) => b.id === selectedBusId.value) ?? null)

function etaMinutesFor(studentId: string): number | null {
  const n = etaByStudentId.value[studentId]
  return Number.isFinite(n) ? n : null
}

function locationErrorText(err: { code: string }): string {
  if (err.code === 'unsupported') return t('transportation.geoNotSupported')
  if (err.code === 'denied') return t('transportation.geoDenied')
  return t('transportation.geoUnavailable')
}

function pickupSet(studentId: string): boolean {
  const p = pickups.value.find((s) => s.id === studentId)
  return p != null && p.pickup_lat != null && p.pickup_lng != null
}

function applyEtaSnapshot(eta: { stops?: Array<{ student_id: string; eta_minutes: number }> } | null | undefined) {
  const map: Record<string, number> = {}
  for (const stop of eta?.stops || []) {
    map[stop.student_id] = stop.eta_minutes
  }
  etaByStudentId.value = map
}

const loadBuses = async () => {
  buses.value = await busService.getAll(schoolId.value)
}

const loadRosterAndLogs = async () => {
  const bid = selectedBusId.value
  if (!bid) {
    roster.value = []
    pickups.value = []
    movements.value = []
    loading.value = false
    return
  }
  loading.value = true
  try {
    const [studs, movs] = await Promise.all([
      busService.getStudentsOnBus(bid),
      busService.listMovements(bid, {
        date: todayTripDate(),
        tripType: tripKind.value,
        limit: 400,
      }),
    ])
    pickups.value = studs
    roster.value = studs.map((st) => ({
      id: st.id,
      firstName: st.firstName ?? (st as { first_name?: string }).first_name ?? '',
      lastName: st.lastName ?? (st as { last_name?: string }).last_name ?? '',
    }))
    movements.value = movs
    try {
      applyEtaSnapshot(
        await busService.getEta(bid, {
          tripType: tripKind.value,
          tripDate: todayTripDate(),
        }),
      )
    } catch {
      etaByStudentId.value = {}
    }
  } catch (e) {
    console.error(e)
    roster.value = []
    pickups.value = []
    movements.value = []
  } finally {
    loading.value = false
  }
}

const lastFor = (studentId: string): BusMovementLog | null => {
  let best: BusMovementLog | null = null
  for (const m of movements.value) {
    if (m.student_id !== studentId) continue
    if (!best || new Date(m.logged_at) > new Date(best.logged_at)) best = m
  }
  return best
}

const canBoard = (studentId: string): boolean => {
  const last = lastFor(studentId)
  return !last
}

const canDrop = (studentId: string): boolean => {
  const last = lastFor(studentId)
  return last?.event_type === 'boarded'
}

const waitingStudents = computed(() => roster.value.filter((s) => canBoard(s.id)))
const onboardStudents = computed(() => roster.value.filter((s) => canDrop(s.id)))
const doneStudents = computed(() =>
  roster.value.filter((s) => lastFor(s.id)?.event_type === 'dropped_off'),
)

function initials(s: RosterStudent): string {
  const a = (s.firstName || '').trim().charAt(0)
  const b = (s.lastName || '').trim().charAt(0)
  return (a + b || '؟').slice(0, 2)
}

function boardedMeta(studentId: string): string {
  const last = lastFor(studentId)
  if (!last) return t('busDailyLog.legOnBus')
  return `${t('busDailyLog.legOnBus')} · ${formatClock(last.logged_at)}`
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString(locale.value === 'ar' ? 'ar-OM' : 'en-OM', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ---- Live GPS sharing (state; start/stop below map markers) ---------- */
const sharing = ref(false)
const shareError = ref('')
const lastFix = ref<{ lat: number; lng: number; at: string } | null>(null)
let lastSentAt = 0
let stopWatch: (() => void) | null = null

const mapCenter = computed((): [number, number] => {
  if (lastFix.value) return [lastFix.value.lng, lastFix.value.lat]
  const bus = selectedBus.value
  if (bus?.last_lat != null && bus?.last_lng != null) {
    return [Number(bus.last_lng), Number(bus.last_lat)]
  }
  const pickup = pickups.value.find(
    (p) => p.pickup_lat != null && p.pickup_lng != null,
  )
  if (pickup?.pickup_lat != null && pickup.pickup_lng != null) {
    return [Number(pickup.pickup_lng), Number(pickup.pickup_lat)]
  }
  return [58.3829, 23.588]
})

const mapMarkers = computed<MapViewMarker[]>(() => {
  const markers: MapViewMarker[] = [
    {
      id: 'school',
      lng: 58.3829,
      lat: 23.588,
      kind: 'school',
      color: 'navy',
      label: t('transportation.schoolMarker'),
    },
  ]
  const busLat = lastFix.value?.lat ?? (selectedBus.value?.last_lat != null ? Number(selectedBus.value.last_lat) : null)
  const busLng = lastFix.value?.lng ?? (selectedBus.value?.last_lng != null ? Number(selectedBus.value.last_lng) : null)
  if (busLat != null && busLng != null && Number.isFinite(busLat) && Number.isFinite(busLng)) {
    markers.push({
      id: 'bus-live',
      lng: busLng,
      lat: busLat,
      kind: 'bus',
      color: 'teal',
      label: t('transportation.busNowMarker'),
      tooltip: selectedBus.value?.title ?? '',
    })
  }
  for (const p of pickups.value) {
    if (p.pickup_lat == null || p.pickup_lng == null) continue
    markers.push({
      id: `pickup-${p.id}`,
      lng: Number(p.pickup_lng),
      lat: Number(p.pickup_lat),
      kind: 'pin',
      color: 'navy',
      tooltip: `${p.firstName} ${p.lastName}`.trim(),
    })
  }
  return markers
})

/* ---- Live GPS sharing ------------------------------------------------ */
async function startSharing() {
  if (!selectedBusId.value) return
  shareError.value = ''
  sharing.value = true
  stopWatch = await watchDevicePosition(
    (pos) => {
      const fix = { lat: pos.latitude, lng: pos.longitude, at: new Date().toISOString() }
      lastFix.value = fix
      const now = Date.now()
      if (now - lastSentAt >= 10_000 && selectedBusId.value) {
        lastSentAt = now
        busService
          .updatePosition(selectedBusId.value, fix.lat, fix.lng, {
            tripType: tripKind.value,
            tripDate: todayTripDate(),
          })
          .then((res) => {
            applyEtaSnapshot(res.eta)
          })
          .catch(() => {
            shareError.value = t('transportation.liveShareFailed')
          })
      }
    },
    (err) => {
      shareError.value = locationErrorText(err)
      stopSharing()
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
  )
}

/* WhatsApp-style pickup: live map dialog that refines the GPS fix until confirmed. */
const pickerStudentId = ref<string | null>(null)
const pickerSaving = ref(false)

const pickerInitial = computed(() => {
  const p = pickups.value.find((s) => s.id === pickerStudentId.value)
  if (p?.pickup_lat == null || p?.pickup_lng == null) return null
  return { latitude: Number(p.pickup_lat), longitude: Number(p.pickup_lng) }
})

function setPickupFromGps(studentId: string) {
  if (!selectedBusId.value) return
  shareError.value = ''
  pickerStudentId.value = studentId
}

async function onPickerConfirm(coords: { latitude: number; longitude: number; manual: boolean }) {
  const studentId = pickerStudentId.value
  if (!selectedBusId.value || !studentId) return
  pickerSaving.value = true
  locatingId.value = studentId
  try {
    await busService.setStudentPickup(selectedBusId.value, studentId, {
      pickup_lat: coords.latitude,
      pickup_lng: coords.longitude,
      pickup_source: coords.manual ? 'staff_map' : 'staff_gps',
    })
    pickerStudentId.value = null
    await loadRosterAndLogs()
  } catch {
    shareError.value = t('transportation.pickupSaveFailed')
    pickerStudentId.value = null
  } finally {
    pickerSaving.value = false
    locatingId.value = null
  }
}

function stopSharing() {
  sharing.value = false
  if (stopWatch) {
    stopWatch()
    stopWatch = null
  }
}

onBeforeUnmount(() => stopSharing())

/** Student name for the boarded-success dialog; empty = hidden. */
const boardedOkName = ref('')

const logOne = async (studentId: string, eventType: BusMovementEventType) => {
  if (!selectedBusId.value) return
  saving.value = true
  try {
    await busService.logMovement(
      selectedBusId.value,
      studentId,
      eventType,
      tripKind.value,
      todayTripDate(),
    )
    if (eventType === 'boarded') {
      const s = roster.value.find((r) => r.id === studentId)
      boardedOkName.value = `${s?.firstName || ''} ${s?.lastName || ''}`.trim() || t('busDailyLog.boarded')
    }
    // Stay on the current tab — the driver keeps working down the same list.
    await loadRosterAndLogs()
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg)
  } finally {
    saving.value = false
  }
}

watch(selectedBusId, () => {
  stopSharing()
  lastFix.value = null
  shareError.value = ''
  rosterTab.value = 'waiting'
  if (!selectedBusId.value) {
    roster.value = []
    pickups.value = []
    movements.value = []
    loading.value = false
    return
  }
  void loadRosterAndLogs()
})

watch(tripKind, () => {
  rosterTab.value = 'waiting'
  if (selectedBusId.value) void loadRosterAndLogs()
})

onMounted(async () => {
  loading.value = true
  try {
    await loadBuses()
    const q = route.query.bus
    if (typeof q === 'string' && q && buses.value.some((b) => b.id === q)) {
      selectedBusId.value = q
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
