<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('busDailyLog.title')"
        :subtitle="$t('busDailyLog.subtitle')"
      />

      <div v-if="loading && !selectedBusId" class="fk-elev flex flex-col items-center justify-center gap-3 py-20 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else>
        <div class="fk-elev p-0">
          <div class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0 flex-1 lg:max-w-md">
              <label class="mb-1.5 block text-xs font-medium text-fikr-ink-muted">{{ $t('busDailyLog.selectBus') }}</label>
              <select
                v-model="selectedBusId"
                class="fk-field"
              >
                <option value="">{{ $t('busDailyLog.chooseBus') }}</option>
                <option v-for="b in buses" :key="b.id" :value="b.id">{{ b.title }}</option>
              </select>
            </div>

            <div class="flex flex-wrap items-end gap-3 lg:ms-auto">
              <div class="flex flex-wrap items-center gap-2">
                <span class="shrink-0 text-xs font-medium text-fikr-ink-muted">{{ $t('busDailyLog.tripKind') }}</span>
                <div class="flex gap-2">
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

              <button
                type="button"
                class="fk-btn fk-btn--mist"
                :disabled="loading || !selectedBusId"
                @click="refresh"
              >
                {{ $t('busDailyLog.update') }}
              </button>
            </div>
            </div>
          </div>

          <div class="p-6">
          <div v-if="selectedBus" class="fk-tile mb-4">
            <span class="fk-tile__label">{{ $t('busDailyLog.onRoster') }}</span>
            <span class="fk-tile__value" dir="ltr">{{ roster.length }}</span>
          </div>

          <p
            v-if="!selectedBusId"
            class="rounded-lg bg-fikr-mist py-10 text-center text-sm font-medium text-navy-800"
          >
            {{ $t('busDailyLog.chooseBusHint') }}
          </p>

          <p
            v-else-if="loading"
            class="py-10 text-center text-sm text-fikr-ink-muted"
          >
            {{ $t('common.loading') }}…
          </p>

          <p
            v-else-if="roster.length === 0"
            class="rounded-lg bg-fikr-mist py-10 text-center text-sm font-medium text-navy-800"
          >
            {{ $t('busDailyLog.emptyRoster') }}
          </p>

          <div v-else class="flex flex-col">
            <div
              v-for="s in roster"
              :key="s.id"
              class="fk-sched__row"
            >
              <span class="fk-sched__dot" :class="rosterDotClass(s.id)" aria-hidden="true">{{ rosterDotGlyph(s.id) }}</span>
              <div class="min-w-0 flex-1">
                <p class="fk-sched__title truncate">{{ s.firstName }} {{ s.lastName }}</p>
                <p class="fk-sched__meta">{{ legLine(s.id) }}</p>
              </div>
              <div class="flex shrink-0 flex-wrap justify-end gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--navy fk-btn--sm"
                  :disabled="saving || !canBoard(s.id)"
                  @click="logOne(s.id, 'boarded')"
                >
                  {{ $t('busDailyLog.boarded') }}
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--mist fk-btn--sm"
                  :disabled="saving || !canDrop(s.id)"
                  @click="logOne(s.id, 'dropped_off')"
                >
                  {{ $t('busDailyLog.droppedOff') }}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div v-if="selectedBusId" class="fk-elev p-0">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-display truncate text-lg font-bold leading-7 text-navy-800">{{ $t('busDailyLog.recentLog') }}</h2>
          </header>
          <div class="px-6 py-2">
          <p
            v-if="loading"
            class="py-8 text-center text-sm text-fikr-ink-muted"
          >
            {{ $t('common.loading') }}…
          </p>
          <p
            v-else-if="movements.length === 0"
            class="my-4 rounded-lg bg-fikr-mist py-8 text-center text-sm font-medium text-navy-800"
          >
            {{ $t('busDailyLog.noMovements') }}
          </p>
          <div v-else class="flex flex-col">
            <div
              v-for="m in movements"
              :key="m.id"
              class="fk-sched__row"
            >
              <span
                class="fk-sched__dot"
                :class="m.event_type === 'dropped_off' ? 'fk-sched__dot--paid' : 'fk-sched__dot--wait'"
                aria-hidden="true"
              >{{ m.event_type === 'dropped_off' ? '✓' : '◔' }}</span>
              <div class="min-w-0 flex-1">
                <p class="fk-sched__title truncate">{{ studentLabel(m) }}</p>
                <p class="fk-sched__meta" dir="ltr">{{ formatTime(m.logged_at) }}</p>
              </div>
              <span
                class="fk-pill shrink-0"
                :class="m.event_type === 'dropped_off' ? 'fk-pill--teal' : 'fk-pill--mist'"
              >
                {{ m.event_type === 'boarded' ? $t('busDailyLog.boarded') : $t('busDailyLog.droppedOff') }}
              </span>
            </div>
          </div>
          </div>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import { authService } from '@/services'
import { busService, type Bus, type BusMovementLog, type BusMovementEventType, type BusTripType } from '@/services/bus.service'
import FikrLoader from '@/components/FikrLoader.vue'

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

const loading = ref(true)
const saving = ref(false)
const buses = ref<Bus[]>([])
const selectedBusId = ref('')
const roster = ref<{ id: string; firstName: string; lastName: string }[]>([])
const movements = ref<BusMovementLog[]>([])
const tripKind = ref<BusTripType>('going')

const selectedBus = computed(() => buses.value.find((b) => b.id === selectedBusId.value) ?? null)

const loadBuses = async () => {
  buses.value = await busService.getAll(schoolId.value)
}

const loadRosterAndLogs = async () => {
  const bid = selectedBusId.value
  if (!bid) {
    roster.value = []
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
    roster.value = studs.map((st) => ({
      id: st.id,
      firstName: st.firstName ?? (st as { first_name?: string }).first_name ?? '',
      lastName: st.lastName ?? (st as { last_name?: string }).last_name ?? '',
    }))
    movements.value = movs
  } catch (e) {
    console.error(e)
    roster.value = []
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
  if (!last) return true
  return false
}

const canDrop = (studentId: string): boolean => {
  const last = lastFor(studentId)
  return last?.event_type === 'boarded'
}

const legLine = (studentId: string): string => {
  const last = lastFor(studentId)
  if (!last) return t('busDailyLog.legPendingBoard')
  if (last.event_type === 'boarded') return t('busDailyLog.legOnBus')
  return t('busDailyLog.legTripComplete')
}

/** FIKR sched dot: pending board = empty mist, on bus = mist ◔, trip complete = teal ✓. */
const rosterDotClass = (studentId: string): string => {
  const last = lastFor(studentId)
  if (!last) return 'fk-sched__dot--future'
  if (last.event_type === 'boarded') return 'fk-sched__dot--wait'
  return 'fk-sched__dot--paid'
}

const rosterDotGlyph = (studentId: string): string => {
  const last = lastFor(studentId)
  if (!last) return ''
  if (last.event_type === 'boarded') return '◔'
  return '✓'
}

const refresh = () => loadRosterAndLogs()

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
    await loadRosterAndLogs()
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg)
  } finally {
    saving.value = false
  }
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const studentLabel = (m: BusMovementLog) => {
  const st = m.student
  if (st?.firstName || st?.lastName) {
    return `${st.firstName ?? ''} ${st.lastName ?? ''}`.trim()
  }
  return m.student_id.slice(0, 8)
}

watch(selectedBusId, () => {
  if (!selectedBusId.value) {
    roster.value = []
    movements.value = []
    loading.value = false
    return
  }
  loadRosterAndLogs()
})

watch(tripKind, () => {
  if (selectedBusId.value) loadRosterAndLogs()
})

onMounted(async () => {
  loading.value = true
  try {
    await loadBuses()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
