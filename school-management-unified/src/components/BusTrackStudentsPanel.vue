<template>
  <div class="space-y-6">
    <p v-if="!busId" class="rounded-lg bg-fikr-mist px-4 py-3 text-sm font-medium text-navy-800">
      {{ $t('transportation.saveBusBeforeStudents') }}
    </p>

    <template v-else>
      <!-- Pickup points map (mock-8c route map) -->
      <section v-if="pickupMarkers.length" :aria-label="$t('transportation.pickupPointsMap')">
        <h3 class="fk-display mb-2 text-lg font-bold text-navy-800">
          {{ $t('transportation.pickupPointsMap') }}
        </h3>
        <div class="h-64 overflow-hidden rounded-2xl shadow-fee">
          <MapView :markers="pickupMarkers" fit-markers class="h-full" />
        </div>
      </section>

      <!-- On this bus -->
      <section>
        <h3 class="fk-display mb-1 text-lg font-bold text-navy-800">
          {{ $t('transportation.onThisBus') }}
          <span class="text-sm font-normal text-fikr-ink-muted" dir="ltr">({{ onBusStudents.length }}/{{ capacity }})</span>
        </h3>
        <div
          v-if="loadingRoster"
          class="flex min-h-[8rem] items-center justify-center text-sm text-fikr-ink-muted"
        >
          {{ $t('common.loading') }}
        </div>
        <p
          v-else-if="onBusStudents.length === 0"
          class="rounded-lg bg-fikr-mist py-8 text-center text-sm font-medium text-navy-800"
        >
          {{ $t('transportation.noneOnBus') }}
        </p>
        <div v-else class="flex flex-col">
          <div v-for="s in onBusStudents" :key="s.id" class="fk-sched__row">
            <span
              class="fk-sched__dot"
              :class="hasPickup(s) ? 'fk-sched__dot--paid' : 'fk-sched__dot--future !text-navy-800'"
              aria-hidden="true"
            >{{ hasPickup(s) ? '✓' : initials(s.firstName, s.lastName) }}</span>
            <div class="min-w-0 flex-1">
              <p class="fk-sched__title truncate">{{ s.firstName }} {{ s.lastName }}</p>
              <p class="fk-sched__meta truncate">
                {{ hasPickup(s) ? $t('transportation.pickupSet') : $t('transportation.pickupMissing') }}
              </p>
            </div>
            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                class="fk-pill fk-pill--mist transition-colors hover:bg-fikr-surface-high"
                :disabled="locatingId === s.id"
                @click="setPickupFromGps(s)"
              >
                {{ locatingId === s.id ? $t('common.loading') : $t('transportation.useCurrentLocation') }}
              </button>
              <button
                v-if="hasPickup(s)"
                type="button"
                class="fk-pill fk-pill--mist text-red-700 transition-colors hover:bg-red-50"
                @click="clearPickup(s)"
              >
                {{ $t('transportation.clearPickup') }}
              </button>
              <button
                type="button"
                class="fk-iconbtn fk-iconbtn--ghost text-red-600 hover:bg-red-50 hover:text-red-700"
                :disabled="removingId === s.id"
                :aria-label="$t('transportation.remove')"
                @click="removeStudent(s.id)"
              >
                <FikrLoader v-if="removingId === s.id" size="xs" />
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Add students (server-paged) -->
      <section>
        <h3 class="fk-display mb-2 text-lg font-bold text-navy-800">{{ $t('transportation.addFromSchool') }}</h3>
        <div class="fk-form__row mb-3">
          <label class="fk-flabel" for="bus-track-student-search">
            <span>{{ $t('transportation.addStudentsSearch') }}</span>
          </label>
          <input
            id="bus-track-student-search"
            v-model="studentPickQuery"
            type="search"
            class="fk-field fk-input--search"
            :placeholder="$t('transportation.searchStudentsPlaceholder')"
          />
        </div>

        <div
          v-if="loadingPickable"
          class="flex min-h-[6rem] items-center justify-center text-sm text-fikr-ink-muted"
        >
          {{ $t('common.loading') }}
        </div>
        <p
          v-else-if="pickableStudents.length === 0"
          class="rounded-lg bg-fikr-mist py-8 text-center text-sm font-medium text-navy-800"
        >
          {{ $t('transportation.noMoreToAdd') }}
        </p>
        <div v-else class="flex flex-col">
          <div v-for="s in pickableStudents" :key="s.id" class="fk-sched__row">
            <span class="fk-sched__dot fk-sched__dot--future !text-navy-800" aria-hidden="true">
              {{ initials(s.firstName, s.lastName) }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="fk-sched__title truncate">{{ s.firstName }} {{ s.lastName }}</p>
              <p v-if="currentBusTitle(s)" class="fk-sched__meta truncate font-medium text-navy-800">
                {{ $t('transportation.movingFrom') }}: {{ currentBusTitle(s) }}
              </p>
            </div>
            <button
              type="button"
              class="fk-iconbtn shrink-0 !border-navy-800 !bg-navy-800 !text-white hover:!bg-navy-900"
              :disabled="addingId === s.id || onBusStudents.length >= capacity"
              :aria-label="
                studentIsMovingFromAnotherBus(s)
                  ? $t('transportation.moveToThisBus')
                  : $t('transportation.addToThisBus')
              "
              @click="addStudent(s.id)"
            >
              <FikrLoader v-if="addingId === s.id" size="xs" />
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <FikrPagination
          :page="pickPage"
          :pages="pickPages"
          :show="!loadingPickable && pickableStudents.length > 0"
          @update:page="goToPickPage"
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrPagination from '@/components/FikrPagination.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import { useFeedback } from '@/composables/useFeedback'
import { busService, type BusStudentWithPickup } from '@/services/bus.service'
import { studentService, type Student } from '@/services/student.service'
import FikrLoader from '@/components/FikrLoader.vue'

const props = defineProps<{
  busId: string | null
  capacity: number
}>()

const emit = defineEmits<{
  changed: []
}>()

const { t } = useI18n()
const feedback = useFeedback()

const PICK_PAGE_SIZE = 10

const onBusStudents = ref<BusStudentWithPickup[]>([])
const loadingRoster = ref(false)
const pickableItems = ref<Student[]>([])
const loadingPickable = ref(false)
const pickPage = ref(1)
const pickPages = ref(1)
const studentPickQuery = ref('')
let searchDebounce: ReturnType<typeof setTimeout> | undefined
const addingId = ref<string | null>(null)
const removingId = ref<string | null>(null)
const locatingId = ref<string | null>(null)
const savingPickup = ref(false)

function initials(first: string, last: string): string {
  const a = (first || '?').charAt(0)
  const b = (last || '').charAt(0)
  return `${a}${b}`.toUpperCase()
}

function hasPickup(s: BusStudentWithPickup) {
  return s.pickup_lat != null && s.pickup_lng != null && Number.isFinite(Number(s.pickup_lat))
}

const pickupMarkers = computed<MapViewMarker[]>(() =>
  onBusStudents.value
    .filter((s) => hasPickup(s))
    .map((s) => ({
      id: s.id,
      lng: Number(s.pickup_lng),
      lat: Number(s.pickup_lat),
      kind: 'pin' as const,
      label: s.firstName,
      tooltip: `${s.firstName} ${s.lastName}`,
    })),
)

function currentBusTitle(student: Student): string | null {
  const list = student.buses || []
  if (!list.length) return null
  const b = list[0]
  if (!b || b.id === props.busId) return null
  return (b as { title?: string }).title ?? null
}

function studentIsMovingFromAnotherBus(student: Student) {
  return !!currentBusTitle(student)
}

const assignedIds = computed(() => new Set(onBusStudents.value.map((s) => s.id)))

/** Current server page minus students already on this bus. */
const pickableStudents = computed(() =>
  pickableItems.value.filter((s) => !assignedIds.value.has(s.id)),
)

async function loadRoster() {
  if (!props.busId) {
    onBusStudents.value = []
    return
  }
  loadingRoster.value = true
  try {
    onBusStudents.value = await busService.getStudentsOnBus(props.busId)
  } catch (e) {
    console.error(e)
    onBusStudents.value = []
  } finally {
    loadingRoster.value = false
  }
}

/** Server-paged pickable list — never loads the whole school at once. */
async function loadPickable() {
  if (!props.busId) {
    pickableItems.value = []
    return
  }
  loadingPickable.value = true
  try {
    const page = await studentService.listPage({
      page: pickPage.value,
      limit: PICK_PAGE_SIZE,
      q: studentPickQuery.value.trim() || undefined,
    })
    pickableItems.value = page.items
    pickPages.value = page.pages
    if (pickPage.value > page.pages) pickPage.value = page.pages
  } catch (e) {
    console.error(e)
    pickableItems.value = []
    pickPages.value = 1
  } finally {
    loadingPickable.value = false
  }
}

function goToPickPage(page: number) {
  pickPage.value = page
  void loadPickable()
}

async function reload() {
  await Promise.all([loadRoster(), loadPickable()])
}

async function addStudent(studentId: string) {
  if (!props.busId) return
  addingId.value = studentId
  try {
    await studentService.assignToBus(studentId, props.busId)
    await reload()
    emit('changed')
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : ''
    feedback.error(msg || t('transportation.assignFailed'), t('common.error'))
  } finally {
    addingId.value = null
  }
}

async function removeStudent(studentId: string) {
  if (!props.busId) return
  removingId.value = studentId
  try {
    await studentService.removeFromBus(studentId, props.busId)
    await reload()
    emit('changed')
  } catch {
    feedback.error(t('transportation.removeFailed'), t('common.error'))
  } finally {
    removingId.value = null
  }
}

async function savePickup(
  studentId: string,
  lat: number | null,
  lng: number | null,
  source: string,
) {
  if (!props.busId) return
  savingPickup.value = true
  try {
    await busService.setStudentPickup(props.busId, studentId, {
      pickup_lat: lat,
      pickup_lng: lng,
      pickup_source: source,
    })
    await loadRoster()
    emit('changed')
  } catch {
    feedback.error(t('transportation.pickupSaveFailed'), t('common.error'))
  } finally {
    savingPickup.value = false
  }
}

function setPickupFromGps(s: BusStudentWithPickup) {
  if (!navigator.geolocation) {
    feedback.error(t('transportation.geoNotSupported'), t('common.error'))
    return
  }
  locatingId.value = s.id
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await savePickup(s.id, pos.coords.latitude, pos.coords.longitude, 'staff_gps')
        feedback.success(t('transportation.pickupSet'), t('common.success'))
      } finally {
        locatingId.value = null
      }
    },
    () => {
      locatingId.value = null
      feedback.error(t('transportation.geoDenied'), t('common.error'))
    },
    { enableHighAccuracy: true, timeout: 15000 },
  )
}

async function clearPickup(s: BusStudentWithPickup) {
  await savePickup(s.id, null, null, 'staff')
}

watch(studentPickQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    pickPage.value = 1
    void loadPickable()
  }, 300)
})

watch(
  () => props.busId,
  () => {
    pickPage.value = 1
    void reload()
  },
)

onMounted(() => {
  void reload()
})
</script>
