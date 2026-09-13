<template>
  <div class="space-y-6">
    <p v-if="!busId" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      {{ $t('transportation.saveBusBeforeStudents') }}
    </p>

    <template v-else>
      <div class="fk-form__row">
        <label class="fk-flabel" for="bus-track-student-search">
          <span>{{ $t('transportation.addStudentsSearch') }}</span>
        </label>
        <input
          id="bus-track-student-search"
          v-model="studentPickQuery"
          type="search"
          class="fk-field"
          :placeholder="$t('transportation.searchStudentsPlaceholder')"
        />
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold text-gray-900">
          {{ $t('transportation.onThisBus') }}
          <span class="font-normal text-gray-500">({{ onBusStudents.length }}/{{ capacity }})</span>
        </h3>
        <div
          v-if="loadingRoster"
          class="flex min-h-[8rem] items-center justify-center text-sm text-gray-500"
        >
          {{ $t('common.loading') }}
        </div>
        <div
          v-else-if="onBusStudents.length === 0"
          class="flex min-h-[8rem] flex-col items-center justify-center text-center"
        >
          <p class="text-sm font-medium text-gray-600">{{ $t('transportation.noneOnBus') }}</p>
        </div>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="s in onBusStudents"
            :key="s.id"
            class="rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex min-w-0 items-center gap-2">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold text-primary-800"
                >
                  {{ initials(s.firstName, s.lastName) }}
                </div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-gray-900">
                    {{ s.firstName }} {{ s.lastName }}
                  </p>
                  <p v-if="hasPickup(s)" class="truncate text-[11px] text-primary-700">
                    {{ $t('transportation.pickupSet') }} · {{ formatCoords(s) }}
                  </p>
                  <p v-else class="truncate text-[11px] text-gray-400">
                    {{ $t('transportation.pickupMissing') }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="fk-iconbtn text-red-600 hover:bg-red-50 hover:text-red-700"
                :disabled="removingId === s.id"
                :aria-label="$t('transportation.remove')"
                @click="removeStudent(s.id)"
              >
                <svg v-if="removingId === s.id" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--pearl text-xs"
                :disabled="locatingId === s.id"
                @click="setPickupFromGps(s)"
              >
                {{ locatingId === s.id ? $t('common.loading') : $t('transportation.useCurrentLocation') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl text-xs"
                @click="openMapPicker(s)"
              >
                {{ $t('transportation.setOnMap') }}
              </button>
              <button
                v-if="hasPickup(s)"
                type="button"
                class="fk-btn fk-btn--pearl text-xs text-red-700"
                @click="clearPickup(s)"
              >
                {{ $t('transportation.clearPickup') }}
              </button>
            </div>
            <div v-if="hasPickup(s)" class="mt-2 overflow-hidden rounded-lg border border-gray-200">
              <iframe
                :title="$t('transportation.pickupMap')"
                class="h-36 w-full border-0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                :src="osmEmbedUrl(s.pickup_lat!, s.pickup_lng!)"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('transportation.addFromSchool') }}</h3>
        <p v-if="pickableStudents.length === 0" class="text-sm text-gray-500">
          {{ $t('transportation.noMoreToAdd') }}
        </p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="s in pickableStudents"
            :key="s.id"
            class="flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
          >
            <div class="flex min-w-0 items-center gap-2">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold text-primary-800"
              >
                {{ initials(s.firstName, s.lastName) }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</p>
                <p v-if="currentBusTitle(s)" class="truncate text-xs text-amber-700">
                  {{ $t('transportation.movingFrom') }}: {{ currentBusTitle(s) }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :disabled="addingId === s.id || onBusStudents.length >= capacity"
              :aria-label="
                studentIsMovingFromAnotherBus(s)
                  ? $t('transportation.moveToThisBus')
                  : $t('transportation.addToThisBus')
              "
              @click="addStudent(s.id)"
            >
              <svg v-if="addingId === s.id" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <FikrDialog
      :show="mapDialogOpen"
      :title="$t('transportation.setOnMap')"
      plain-footer
      size="lg"
      @close="mapDialogOpen = false"
    >
      <div class="space-y-3">
        <p class="text-xs text-gray-500">{{ $t('transportation.mapPickerHint') }}</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="pickup-lat">Lat</label>
            <input id="pickup-lat" v-model.number="mapLat" type="number" step="any" class="fk-field" dir="ltr" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="pickup-lng">Lng</label>
            <input id="pickup-lng" v-model.number="mapLng" type="number" step="any" class="fk-field" dir="ltr" />
          </div>
        </div>
        <iframe
          v-if="Number.isFinite(mapLat) && Number.isFinite(mapLng)"
          :title="$t('transportation.pickupMap')"
          class="h-56 w-full rounded-lg border border-gray-200"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          :src="osmEmbedUrl(mapLat, mapLng)"
        />
        <a
          v-if="Number.isFinite(mapLat) && Number.isFinite(mapLng)"
          class="inline-flex text-sm font-medium text-primary-700 hover:text-primary-800"
          :href="osmOpenUrl(mapLat, mapLng)"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('transportation.openInOpenStreetMap') }}
        </a>
      </div>
      <template #footer>
        <button type="button" class="fk-btn fk-btn--pearl" @click="mapDialogOpen = false">
          {{ $t('common.cancel') }}
        </button>
        <button type="button" class="fk-btn fk-btn--primary" :disabled="savingPickup" @click="saveMapPickup">
          {{ savingPickup ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </FikrDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrDialog from '@/components/FikrDialog.vue'
import { busService, type BusStudentWithPickup } from '@/services/bus.service'
import { studentService, type Student } from '@/services/student.service'

const props = defineProps<{
  busId: string | null
  capacity: number
}>()

const { t } = useI18n()

const allStudents = ref<Student[]>([])
const onBusStudents = ref<BusStudentWithPickup[]>([])
const loadingRoster = ref(false)
const studentPickQuery = ref('')
const addingId = ref<string | null>(null)
const removingId = ref<string | null>(null)
const locatingId = ref<string | null>(null)
const savingPickup = ref(false)
const mapDialogOpen = ref(false)
const mapStudentId = ref<string | null>(null)
const mapLat = ref<number>(23.588)
const mapLng = ref<number>(58.3829)

function initials(first: string, last: string): string {
  const a = (first || '?').charAt(0)
  const b = (last || '').charAt(0)
  return `${a}${b}`.toUpperCase()
}

function hasPickup(s: BusStudentWithPickup) {
  return s.pickup_lat != null && s.pickup_lng != null && Number.isFinite(Number(s.pickup_lat))
}

function formatCoords(s: BusStudentWithPickup) {
  if (!hasPickup(s)) return ''
  return `${Number(s.pickup_lat).toFixed(5)}, ${Number(s.pickup_lng).toFixed(5)}`
}

function osmEmbedUrl(lat: number, lng: number) {
  const d = 0.01
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`
}

function osmOpenUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
}

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

const pickableStudents = computed(() => {
  const q = studentPickQuery.value.trim().toLowerCase()
  return allStudents.value.filter((s) => {
    if (assignedIds.value.has(s.id)) return false
    if (!q) return true
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase()
    return name.includes(q)
  })
})

async function reload() {
  if (!props.busId) {
    onBusStudents.value = []
    return
  }
  loadingRoster.value = true
  try {
    const [roster, students] = await Promise.all([
      busService.getStudentsOnBus(props.busId),
      studentService.getAll(),
    ])
    onBusStudents.value = roster
    allStudents.value = students
  } catch (e) {
    console.error(e)
    onBusStudents.value = []
  } finally {
    loadingRoster.value = false
  }
}

async function addStudent(studentId: string) {
  if (!props.busId) return
  addingId.value = studentId
  try {
    await studentService.assignToBus(studentId, props.busId)
    await reload()
  } catch (e: unknown) {
    const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : ''
    window.alert(msg || t('transportation.assignFailed'))
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
  } catch {
    window.alert(t('transportation.removeFailed'))
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
    await reload()
  } catch {
    window.alert(t('transportation.pickupSaveFailed'))
  } finally {
    savingPickup.value = false
  }
}

function setPickupFromGps(s: BusStudentWithPickup) {
  if (!navigator.geolocation) {
    window.alert(t('transportation.geoNotSupported'))
    return
  }
  locatingId.value = s.id
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await savePickup(s.id, pos.coords.latitude, pos.coords.longitude, 'staff_gps')
      } finally {
        locatingId.value = null
      }
    },
    () => {
      locatingId.value = null
      window.alert(t('transportation.geoDenied'))
    },
    { enableHighAccuracy: true, timeout: 15000 },
  )
}

function openMapPicker(s: BusStudentWithPickup) {
  mapStudentId.value = s.id
  mapLat.value = s.pickup_lat != null ? Number(s.pickup_lat) : 23.588
  mapLng.value = s.pickup_lng != null ? Number(s.pickup_lng) : 58.3829
  mapDialogOpen.value = true
}

async function saveMapPickup() {
  if (!mapStudentId.value) return
  if (!Number.isFinite(mapLat.value) || !Number.isFinite(mapLng.value)) return
  await savePickup(mapStudentId.value, mapLat.value, mapLng.value, 'staff_map')
  mapDialogOpen.value = false
}

async function clearPickup(s: BusStudentWithPickup) {
  await savePickup(s.id, null, null, 'staff')
}

watch(
  () => props.busId,
  () => {
    void reload()
  },
)

onMounted(() => {
  void reload()
})
</script>
