<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Toolbar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('busDailyLog.title') }}</h1>
            <p class="text-gray-600 text-sm mt-1">{{ $t('busDailyLog.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('busDailyLog.selectBus') }}</label>
              <select
                v-model="selectedBusId"
                class="block min-w-[220px] py-2 px-3 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">{{ $t('busDailyLog.chooseBus') }}</option>
                <option v-for="b in buses" :key="b.id" :value="b.id">{{ b.title }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('busDailyLog.update') }}</label>
              <button
                type="button"
                class="inline-flex items-center justify-center min-h-[42px] px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:opacity-50"
                @click="refresh"
                :disabled="loading"
              >
                {{ $t('busDailyLog.update') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-3 text-gray-600 text-sm">{{ $t('common.loading') }}…</p>
      </div>

      <template v-else-if="selectedBus">
        <!-- Roster -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex flex-col gap-3 mb-4">
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ selectedBus.title }}</h2>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ roster.length }} {{ $t('busDailyLog.onRoster') }}
                </p>
              </div>
              <div class="flex flex-col items-stretch sm:items-end gap-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-medium text-gray-500 shrink-0">{{ $t('busDailyLog.tripKind') }}</span>
                  <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                    <button
                      type="button"
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                      :class="
                        tripKind === 'going'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      "
                      @click="tripKind = 'going'"
                    >
                      {{ $t('busDailyLog.tripGoing') }}
                    </button>
                    <button
                      type="button"
                      class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
                      :class="
                        tripKind === 'return'
                          ? 'bg-white text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      "
                      @click="tripKind = 'return'"
                    >
                      {{ $t('busDailyLog.tripReturn') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40"
                :disabled="selectedStudentIds.size === 0"
                @click="clearSelection"
              >
                {{ $t('busDailyLog.clearSelection') }}
              </button>
              <button
                v-if="tripKind === 'going'"
                type="button"
                class="px-3 py-2 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm disabled:opacity-40"
                :disabled="
                  selectedStudentIds.size === 0 || saving || bulkSelectionInvalid
                "
                @click="runBulkGoingDrop"
              >
                {{ $t('busDailyLog.bulkGoingDrop') }}
                <span class="tabular-nums">({{ selectedStudentIds.size }})</span>
              </button>
              <button
                v-else
                type="button"
                class="px-3 py-2 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm disabled:opacity-40"
                :disabled="
                  selectedStudentIds.size === 0 || saving || bulkSelectionInvalid
                "
                @click="runBulkReturnBoard"
              >
                {{ $t('busDailyLog.bulkReturnBoard') }}
                <span class="tabular-nums">({{ selectedStudentIds.size }})</span>
              </button>
            </div>
            <p v-if="bulkSelectionInvalid && selectedStudentIds.size > 0" class="text-xs text-amber-700">
              {{ $t('busDailyLog.bulkSelectionInvalid') }}
            </p>
          </div>

          <p v-if="roster.length === 0" class="text-sm text-gray-500 py-6 text-center border border-dashed border-gray-200 rounded-lg">
            {{ $t('busDailyLog.emptyRoster') }}
          </p>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="s in roster"
              :key="s.id"
              class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex items-start gap-3">
                <input
                  v-if="eligibleForCurrentBulk(s.id)"
                  type="checkbox"
                  class="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                  :checked="selectedStudentIds.has(s.id)"
                  @change="toggleSelect(s.id, ($event.target as HTMLInputElement).checked)"
                />
                <span v-else class="mt-1 w-4 shrink-0" aria-hidden="true"></span>
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span class="text-primary-700 font-semibold text-sm">{{ initials(s.firstName, s.lastName) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-900 text-sm leading-snug">
                    {{ s.firstName }} {{ s.lastName }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ legLine(s.id) }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="flex-1 min-w-[6rem] text-xs font-medium py-2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                      :disabled="saving || !canBoard(s.id)"
                      @click="logOne(s.id, 'boarded')"
                    >
                      {{ $t('busDailyLog.boarded') }}
                    </button>
                    <button
                      type="button"
                      class="flex-1 min-w-[6rem] text-xs font-medium py-2 rounded-md bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
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

        <!-- Activity log -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('busDailyLog.recentLog') }}</h2>
          <p v-if="movements.length === 0" class="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg">
            {{ $t('busDailyLog.noMovements') }}
          </p>
          <ul v-else class="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            <li
              v-for="m in movements"
              :key="m.id"
              class="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 bg-white hover:bg-gray-50/80 text-sm"
            >
              <span class="text-gray-500 tabular-nums text-xs shrink-0">{{ formatTime(m.logged_at) }}</span>
              <span class="font-medium text-gray-900">{{ studentLabel(m) }}</span>
              <span
                :class="[
                  'ms-auto shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold',
                  m.event_type === 'boarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ m.event_type === 'boarded' ? $t('busDailyLog.boarded') : $t('busDailyLog.droppedOff') }}
              </span>
            </li>
          </ul>
        </div>
      </template>

      <div
        v-else
        class="bg-white rounded-lg border border-dashed border-gray-300 p-10 text-center text-gray-500 text-sm shadow-sm"
      >
        {{ $t('busDailyLog.chooseBusHint') }}
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { busService, type Bus, type BusMovementLog, type BusMovementEventType, type BusTripType } from '@/services/bus.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: number } | null
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
const selectedStudentIds = ref(new Set<string>())
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

const eligibleForCurrentBulk = (studentId: string): boolean => {
  if (tripKind.value === 'going') return canDrop(studentId)
  return canBoard(studentId)
}

const bulkSelectionInvalid = computed(() => {
  for (const id of selectedStudentIds.value) {
    if (!eligibleForCurrentBulk(id)) return true
  }
  return false
})

const legLine = (studentId: string): string => {
  const last = lastFor(studentId)
  if (!last) return t('busDailyLog.legPendingBoard')
  if (last.event_type === 'boarded') return t('busDailyLog.legOnBus')
  return t('busDailyLog.legTripComplete')
}

const refresh = () => loadRosterAndLogs()

const toggleSelect = (id: string, on: boolean) => {
  const next = new Set(selectedStudentIds.value)
  if (on) next.add(id)
  else next.delete(id)
  selectedStudentIds.value = next
}

const clearSelection = () => {
  selectedStudentIds.value = new Set()
}

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

const runBulkGoingDrop = async () => {
  const ids = [...selectedStudentIds.value]
  if (!selectedBusId.value || ids.length === 0 || bulkSelectionInvalid.value) return
  saving.value = true
  try {
    await busService.logMovementsBulk(
      selectedBusId.value,
      ids,
      'dropped_off',
      'going',
      todayTripDate(),
    )
    clearSelection()
    await loadRosterAndLogs()
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg)
  } finally {
    saving.value = false
  }
}

const runBulkReturnBoard = async () => {
  const ids = [...selectedStudentIds.value]
  if (!selectedBusId.value || ids.length === 0 || bulkSelectionInvalid.value) return
  saving.value = true
  try {
    await busService.logMovementsBulk(
      selectedBusId.value,
      ids,
      'boarded',
      'return',
      todayTripDate(),
    )
    clearSelection()
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
  selectedStudentIds.value = new Set()
  if (!selectedBusId.value) {
    roster.value = []
    movements.value = []
    loading.value = false
    return
  }
  loadRosterAndLogs()
})

watch(tripKind, () => {
  clearSelection()
  if (selectedBusId.value) loadRosterAndLogs()
})

onMounted(async () => {
  loading.value = true
  try {
    await loadBuses()
    await loadRosterAndLogs()
  } catch (e) {
    console.error(e)
    loading.value = false
  }
})
</script>
