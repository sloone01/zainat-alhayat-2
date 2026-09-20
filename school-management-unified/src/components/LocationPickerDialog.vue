<template>
  <FikrDialog
    :show="show"
    :title="title || $t('transportation.locationDialogTitle')"
    :subtitle="$t('transportation.locationDialogHint')"
    size="md"
    plain-footer
    elevate
    @close="onCancel"
  >
    <div class="space-y-3">
      <div class="h-72 overflow-hidden rounded-2xl sm:h-80">
        <MapView
          ref="mapRef"
          :markers="markers"
          :zoom="16"
          pick-on-click
          class="h-full"
          @pick="onMapPick"
          @marker-dragend="onMarkerDrag"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="min-h-[1.25rem] text-sm" :class="error ? 'font-medium text-red-700' : 'text-fikr-ink-muted'">
          <template v-if="error">{{ error }}</template>
          <template v-else-if="manual">{{ $t('transportation.locationManualPin') }}</template>
          <template v-else-if="!fix">{{ $t('common.loading') }}…</template>
          <template v-else-if="fix.accuracy != null">
            {{ $t('transportation.locationAccuracy', { m: Math.round(fix.accuracy) }) }}
            <span v-if="improving" class="text-fikr-ink-muted"> · {{ $t('transportation.locationImproving') }}</span>
          </template>
        </p>
        <!-- Back to live GPS after a manual pin (WhatsApp's crosshair) -->
        <button
          v-if="manual"
          type="button"
          class="fk-btn fk-btn--mist fk-btn--sm"
          @click="followGpsAgain"
        >
          {{ $t('transportation.useCurrentLocation') }}
        </button>
      </div>
    </div>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="onCancel">
        {{ $t('common.cancel') }}
      </button>
      <button
        type="button"
        class="fk-btn fk-btn--primary"
        :disabled="!fix || busy"
        @click="onConfirm"
      >
        {{ busy ? $t('common.loading') : $t('transportation.locationConfirm') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
/**
 * WhatsApp-style location picker: opens a live map, keeps refining the GPS fix
 * (adopts a new fix only when it is at least as accurate, or the shown one went
 * stale), and lets the user drag the pin / tap the map when GPS is off target.
 * The caller saves the confirmed coordinates itself.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrDialog from '@/components/FikrDialog.vue'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import {
  watchDevicePosition,
  type DeviceCoords,
  type DeviceLocationError,
} from '@/utils/device-location'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    /** Confirm button shows a loading state while the caller is saving. */
    busy?: boolean
    /** Pre-set pin (e.g. an already saved pickup) shown until the first GPS fix. */
    initial?: { latitude: number; longitude: number } | null
  }>(),
  { title: '', busy: false, initial: null },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', coords: { latitude: number; longitude: number; accuracy: number | null; manual: boolean }): void
}>()

const { t } = useI18n()

const mapRef = ref<InstanceType<typeof MapView> | null>(null)
const fix = ref<(DeviceCoords & { at: number }) | null>(null)
const manual = ref(false)
const error = ref('')
/** Still expecting better fixes (GPS usually converges within ~30 s). */
const improving = ref(true)

let stopWatch: (() => void) | null = null
let improveTimer: number | null = null

const markers = computed<MapViewMarker[]>(() => {
  if (!fix.value) return []
  return [
    {
      id: 'picked-location',
      lng: fix.value.longitude,
      lat: fix.value.latitude,
      kind: 'pin',
      color: 'teal',
      draggable: true,
    },
  ]
})

function locationErrorText(err: DeviceLocationError): string {
  if (err.code === 'unsupported') return t('transportation.geoNotSupported')
  if (err.code === 'denied') return t('transportation.geoDenied')
  return t('transportation.geoUnavailable')
}

function adoptFix(pos: DeviceCoords) {
  if (manual.value) return
  const prev = fix.value
  const newAcc = pos.accuracy ?? Number.POSITIVE_INFINITY
  const prevAcc = prev?.accuracy ?? Number.POSITIVE_INFINITY
  const prevStale = !prev || Date.now() - prev.at > 20_000
  if (prev && !prevStale && newAcc > prevAcc) return
  fix.value = { ...pos, at: Date.now() }
  error.value = ''
  mapRef.value?.flyTo([pos.longitude, pos.latitude], newAcc <= 30 ? 17 : 16)
}

async function startWatching() {
  error.value = ''
  improving.value = true
  stopWatching()
  if (improveTimer) window.clearTimeout(improveTimer)
  improveTimer = window.setTimeout(() => {
    improving.value = false
  }, 30_000)
  stopWatch = await watchDevicePosition(
    (pos) => adoptFix(pos),
    (err) => {
      // Keep whatever fix we already have usable; only surface the error.
      error.value = locationErrorText(err)
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
  )
}

function stopWatching() {
  if (stopWatch) {
    stopWatch()
    stopWatch = null
  }
  if (improveTimer) {
    window.clearTimeout(improveTimer)
    improveTimer = null
  }
}

function setManual(lngLat: { lng: number; lat: number }) {
  manual.value = true
  error.value = ''
  fix.value = { latitude: lngLat.lat, longitude: lngLat.lng, accuracy: null, at: Date.now() }
}

function onMapPick(lngLat: { lng: number; lat: number }) {
  setManual(lngLat)
}

function onMarkerDrag(_id: string, lngLat: { lng: number; lat: number }) {
  setManual(lngLat)
}

function followGpsAgain() {
  manual.value = false
  fix.value = null
  void startWatching()
}

function onCancel() {
  emit('close')
}

function onConfirm() {
  if (!fix.value) return
  emit('confirm', {
    latitude: fix.value.latitude,
    longitude: fix.value.longitude,
    accuracy: manual.value ? null : (fix.value.accuracy ?? null),
    manual: manual.value,
  })
}

watch(
  () => props.show,
  (open) => {
    if (open) {
      manual.value = false
      error.value = ''
      fix.value = props.initial
        ? { latitude: props.initial.latitude, longitude: props.initial.longitude, accuracy: null, at: 0 }
        : null
      void startWatching()
    } else {
      stopWatching()
    }
  },
)

onBeforeUnmount(stopWatching)
</script>
