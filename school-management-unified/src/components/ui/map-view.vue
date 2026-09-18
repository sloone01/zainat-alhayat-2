<template>
  <div ref="containerEl" class="fk-map relative h-full w-full overflow-hidden rounded-2xl">
    <div
      v-if="!isLoaded"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]"
    >
      <div class="flex gap-1" aria-hidden="true">
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-800/50" />
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-800/50 [animation-delay:150ms]" />
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-800/50 [animation-delay:300ms]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * FIKR MapView — MapLibre GL wrapper (Vue port of the mapcn marker/tooltip pattern).
 * Declarative markers with hover tooltips, click-to-pick, draggable markers,
 * and fit-to-markers. Uses the free Carto basemap (light) like the mockups.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as MapLibreGL from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export type MapMarkerKind = 'pin' | 'bus' | 'school'

export interface MapViewMarker {
  id: string
  lng: number
  lat: number
  /** Hover tooltip text. */
  tooltip?: string
  /** Always-visible small label under the marker. */
  label?: string
  kind?: MapMarkerKind
  draggable?: boolean
  /** teal = success/live, navy = default */
  color?: 'navy' | 'teal'
}

const props = withDefaults(
  defineProps<{
    center?: [number, number]
    zoom?: number
    markers?: MapViewMarker[]
    /** Fit the viewport to all markers whenever they change. */
    fitMarkers?: boolean
    /** Emit `pick` with coordinates when the map itself is clicked. */
    pickOnClick?: boolean
    interactive?: boolean
  }>(),
  {
    center: () => [58.3829, 23.588] as [number, number], // Muscat
    zoom: 11,
    markers: () => [],
    fitMarkers: false,
    pickOnClick: false,
    interactive: true,
  },
)

const emit = defineEmits<{
  (e: 'pick', lngLat: { lng: number; lat: number }): void
  (e: 'marker-click', id: string): void
  (e: 'marker-dragend', id: string, lngLat: { lng: number; lat: number }): void
  (e: 'loaded'): void
}>()

/**
 * OpenStreetMap standard raster basemap (keyless; same source the old
 * pickup iframes used). Raster avoids the vector worker pipeline, ships
 * pre-shaped Arabic labels, and renders reliably in WebViews.
 */
const MAP_STYLE: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

const containerEl = ref<HTMLDivElement | null>(null)
const isLoaded = ref(false)
let map: MapLibreGL.Map | null = null
let markerInstances = new globalThis.Map<string, MapLibreGL.Marker>()

function markerSvg(kind: MapMarkerKind): string {
  if (kind === 'bus') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M8 6h8a3 3 0 013 3v6a2 2 0 01-2 2h-1a2 2 0 11-4 0h-2a2 2 0 11-4 0H5a2 2 0 01-2-2V9a3 3 0 013-3zm-3 6h14M8 6v6m8-6v6"/></svg>'
  }
  if (kind === 'school') {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l9 5-9 5-9-5 9-5zm-6 8v5c0 1 2.7 3 6 3s6-2 6-3v-5"/></svg>'
  }
  return '<svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3"><circle cx="12" cy="12" r="8"/></svg>'
}

function buildMarkerElement(m: MapViewMarker): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'fk-map__marker'
  const isTeal = m.color === 'teal'
  const dot = document.createElement('div')
  dot.className = [
    'grid place-items-center rounded-full border-2 border-white shadow-md transition-transform',
    m.kind === 'pin' || !m.kind ? 'h-4 w-4' : 'h-8 w-8',
    isTeal ? 'bg-primary-500 text-white' : 'bg-navy-800 text-white',
    m.draggable ? 'cursor-grab' : 'cursor-pointer',
  ].join(' ')
  dot.innerHTML = m.kind && m.kind !== 'pin' ? markerSvg(m.kind) : ''
  el.appendChild(dot)
  if (m.label) {
    const label = document.createElement('div')
    label.className =
      'absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-pill bg-white/90 px-2 py-0.5 text-[10px] font-medium leading-4 text-navy-800 shadow-sm'
    label.textContent = m.label
    el.appendChild(label)
  }
  el.style.position = 'relative'
  return el
}

function syncMarkers() {
  if (!map) return
  const next = new globalThis.Map<string, MapViewMarker>()
  for (const m of props.markers) {
    if (!Number.isFinite(m.lng) || !Number.isFinite(m.lat)) continue
    next.set(m.id, m)
  }

  for (const [id, instance] of markerInstances) {
    if (!next.has(id)) {
      instance.remove()
      markerInstances.delete(id)
    }
  }

  for (const [id, m] of next) {
    const existing = markerInstances.get(id)
    if (existing) {
      existing.setLngLat([m.lng, m.lat])
      existing.setDraggable(Boolean(m.draggable))
      continue
    }
    const el = buildMarkerElement(m)
    const marker = new MapLibreGL.Marker({ element: el, draggable: Boolean(m.draggable) })
      .setLngLat([m.lng, m.lat])
      .addTo(map)
    if (m.tooltip) {
      const popup = new MapLibreGL.Popup({
        offset: 16,
        closeButton: false,
        closeOnClick: true,
        className: 'fk-map__tooltip',
      })
        .setText(m.tooltip)
        .setMaxWidth('none')
      el.addEventListener('mouseenter', () => {
        if (map) popup.setLngLat(marker.getLngLat()).addTo(map)
      })
      el.addEventListener('mouseleave', () => popup.remove())
    }
    el.addEventListener('click', (ev) => {
      ev.stopPropagation()
      emit('marker-click', id)
    })
    marker.on('dragend', () => {
      const p = marker.getLngLat()
      emit('marker-dragend', id, { lng: p.lng, lat: p.lat })
    })
    markerInstances.set(id, marker)
  }

  if (props.fitMarkers && next.size > 0) {
    const bounds = new MapLibreGL.LngLatBounds()
    for (const m of next.values()) bounds.extend([m.lng, m.lat])
    map.fitBounds(bounds, { padding: 56, maxZoom: 15, duration: 400 })
  }
}

onMounted(() => {
  if (!containerEl.value) return
  map = new MapLibreGL.Map({
    container: containerEl.value,
    style: MAP_STYLE,
    center: props.center,
    zoom: props.zoom,
    renderWorldCopies: false,
    attributionControl: { compact: true },
    interactive: props.interactive,
  })
  const markLoaded = () => {
    if (isLoaded.value) return
    isLoaded.value = true
    emit('loaded')
    syncMarkers()
  }
  map.on('load', markLoaded)
  // Some WebGL environments miss 'load'; 'idle' and a failsafe keep the loader honest.
  map.on('idle', markLoaded)
  window.setTimeout(markLoaded, 4000)
  map.on('click', (ev) => {
    if (props.pickOnClick) emit('pick', { lng: ev.lngLat.lng, lat: ev.lngLat.lat })
  })
  if (props.interactive) map.addControl(new MapLibreGL.NavigationControl({ showCompass: false }))
})

onBeforeUnmount(() => {
  for (const marker of markerInstances.values()) marker.remove()
  markerInstances = new globalThis.Map()
  map?.remove()
  map = null
})

watch(
  () => props.markers,
  () => syncMarkers(),
  { deep: true },
)

watch(
  () => props.center,
  (center) => {
    if (map && center && !props.fitMarkers) map.easeTo({ center, duration: 400 })
  },
)

defineExpose({
  flyTo(lngLat: [number, number], zoom?: number) {
    map?.flyTo({ center: lngLat, zoom: zoom ?? map.getZoom(), duration: 600 })
  },
})
</script>

<style>
/* Tooltip bubble matching the FIKR pills (global: popup renders outside component scope) */
.fk-map__tooltip .maplibregl-popup-content {
  padding: 4px 10px;
  border-radius: 8px;
  background: #0a2147;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}
.fk-map__tooltip .maplibregl-popup-tip {
  border-top-color: #0a2147;
  border-bottom-color: #0a2147;
}
.fk-map .maplibregl-ctrl-attrib {
  font-size: 10px;
}
</style>
