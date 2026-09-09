<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('busDailyLog.title')"
        :subtitle="$t('busDailyLog.subtitle')"
      />

      <div v-if="loading && !selectedBusId" class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white py-20 text-gray-500 shadow-sm">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <template v-else>
        <div class="fk-card">
          <div class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="min-w-0 flex-1 lg:max-w-md">
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('busDailyLog.selectBus') }}</label>
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
                <span class="shrink-0 text-xs font-medium text-gray-500">{{ $t('busDailyLog.tripKind') }}</span>
                <div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    type="button"
                    class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    :class="tripKind === 'going' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                    @click="tripKind = 'going'"
                  >
                    {{ $t('busDailyLog.tripGoing') }}
                  </button>
                  <button
                    type="button"
                    class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                    :class="tripKind === 'return' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                    @click="tripKind = 'return'"
                  >
                    {{ $t('busDailyLog.tripReturn') }}
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:opacity-50"
                :disabled="loading || !selectedBusId"
                @click="refresh"
              >
                {{ $t('busDailyLog.update') }}
              </button>
            </div>
            </div>
          </div>

          <div class="p-6">
          <p v-if="selectedBus" class="mb-4 text-sm text-gray-500">
            {{ roster.length }} {{ $t('busDailyLog.onRoster') }}
          </p>

          <p
            v-if="!selectedBusId"
            class="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500"
          >
            {{ $t('busDailyLog.chooseBusHint') }}
          </p>

          <p
            v-else-if="loading"
            class="py-10 text-center text-sm text-gray-500"
          >
            {{ $t('common.loading') }}…
          </p>

          <p
            v-else-if="roster.length === 0"
            class="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500"
          >
            {{ $t('busDailyLog.emptyRoster') }}
          </p>

          <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="s in roster"
              :key="s.id"
              class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                  <span class="text-sm font-semibold text-primary-700">{{ initials(s.firstName, s.lastName) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold leading-snug text-gray-900">
                    {{ s.firstName }} {{ s.lastName }}
                  </p>
                  <p class="mt-0.5 text-xs text-gray-500">{{ legLine(s.id) }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="min-w-[6rem] flex-1 rounded-md border border-emerald-100 bg-emerald-50 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-40"
                      :disabled="saving || !canBoard(s.id)"
                      @click="logOne(s.id, 'boarded')"
                    >
                      {{ $t('busDailyLog.boarded') }}
                    </button>
                    <button
                      type="button"
                      class="min-w-[6rem] flex-1 rounded-md border border-gray-200 bg-gray-50 py-2 text-xs font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:opacity-40"
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
          </div>
        </div>

        <div v-if="selectedBusId" class="fk-card">
          <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
            <h2 class="fk-card__title truncate">{{ $t('busDailyLog.recentLog') }}</h2>
          </header>
          <div class="p-6">
          <p
            v-if="loading"
            class="py-8 text-center text-sm text-gray-500"
          >
            {{ $t('common.loading') }}…
          </p>
          <p
            v-else-if="movements.length === 0"
            class="rounded-lg border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('busDailyLog.noMovements') }}
          </p>
          <ul v-else class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
            <li
              v-for="m in movements"
              :key="m.id"
              class="flex flex-wrap items-center gap-x-3 gap-y-1 bg-white px-4 py-3 text-sm hover:bg-gray-50/80"
            >
              <span class="shrink-0 text-xs tabular-nums text-gray-500">{{ formatTime(m.logged_at) }}</span>
              <span class="font-medium text-gray-900">{{ studentLabel(m) }}</span>
              <span
                class="ms-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="m.event_type === 'boarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ m.event_type === 'boarded' ? $t('busDailyLog.boarded') : $t('busDailyLog.droppedOff') }}
              </span>
            </li>
          </ul>
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

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  return Number(u?.school_id ?? 1)
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

function initials(first: string, last: string): string {
  const a = (first || '?').charAt(0)
  const b = (last || '').charAt(0)
  return `${a}${b}`.toUpperCase()
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
