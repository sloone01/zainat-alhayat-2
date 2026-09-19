<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('transportation.title')"
        :subtitle="$t('transportation.subtitle')"
      />

      <div v-if="!selectedBusId" class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-display truncate text-lg font-bold leading-7 text-navy-800">{{ $t('transportation.buses') }}</h2>
            <p v-if="!loading" class="text-sm text-fikr-ink-muted">{{ $t('transportation.busesCount', { count: buses.length }) }}</p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
            <router-link
              to="/transportation/buses/new"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('transportation.addBus')"
            >
              <IconPlus />
            </router-link>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
            <FikrLoader />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="buses.length">
            <!-- Live fleet map (mock-8c): buses with a reported GPS position -->
            <div v-if="fleetMarkers.length" class="mb-4 h-72 overflow-hidden rounded-2xl shadow-fee">
              <MapView :markers="fleetMarkers" fit-markers class="h-full" />
            </div>
            <p v-else class="mb-4 rounded-lg bg-fikr-mist px-4 py-3 text-center text-xs text-fikr-ink-muted">
              {{ $t('transportation.liveNone') }}
            </p>
            <p
              v-if="filteredBuses.length === 0"
              class="rounded-lg bg-fikr-mist px-4 py-8 text-center text-sm font-medium text-navy-800"
            >
              {{ $t('transportation.noFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="bus in paginatedBuses"
                :key="bus.id"
                class="fk-kcard flex cursor-pointer flex-col gap-3 p-5"
                @click="selectBus(bus.id)"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate text-base font-medium leading-5 text-navy-800">{{ bus.title }}</p>
                    <p class="truncate text-xs text-fikr-ink-muted">
                      {{ $t('transportation.driver') }}: {{ bus.driverName }}
                    </p>
                  </div>
                  <RowActionsMenu
                    :open="activeMenuId === bus.id"
                    placement="up"
                    @toggle="toggleMenu(bus.id)"
                    @click.stop
                  >
                    <RowActionsItem icon="view" @click="selectBus(bus.id)">
                      {{ $t('transportation.assignStudents') }}
                    </RowActionsItem>
                    <RowActionsItem icon="chat" @click="createBusParentsChat(bus)">
                      {{ $t('transportation.createParentsChat') }}
                    </RowActionsItem>
                    <RowActionsItem icon="edit" @click="goEdit(bus)">
                      {{ $t('common.edit') }}
                    </RowActionsItem>
                    <RowActionsItem icon="delete" danger @click="confirmDeleteBus(bus)">
                      {{ $t('common.delete') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </div>
                <div class="mt-auto flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-2.5">
                  <span class="text-sm text-fikr-ink-muted">{{ $t('transportation.capacity') }}</span>
                  <span class="text-sm font-medium tabular-nums text-navy-800" dir="ltr">{{ bus.students?.length ?? 0 }}/{{ bus.capacity }}</span>
                </div>
              </article>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th>{{ $t('transportation.busTitle') }}</th>
                    <th>{{ $t('transportation.driver') }}</th>
                    <th>{{ $t('transportation.capacity') }}</th>
                    <th class="!text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="bus in paginatedBuses"
                    :key="'list-' + bus.id"
                    class="cursor-pointer hover:bg-fikr-mist/40"
                    @click="selectBus(bus.id)"
                  >
                    <td class="font-medium">{{ bus.title }}</td>
                    <td class="text-fikr-ink-muted">{{ bus.driverName }}</td>
                    <td class="tabular-nums" dir="ltr">{{ bus.students?.length ?? 0 }}/{{ bus.capacity }}</td>
                    <td @click.stop>
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === bus.id"
                          placement="up"
                          @toggle="toggleMenu(bus.id)"
                        >
                          <RowActionsItem icon="view" @click="selectBus(bus.id)">
                            {{ $t('transportation.assignStudents') }}
                          </RowActionsItem>
                          <RowActionsItem icon="chat" @click="createBusParentsChat(bus)">
                            {{ $t('transportation.createParentsChat') }}
                          </RowActionsItem>
                          <RowActionsItem icon="edit" @click="goEdit(bus)">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem icon="delete" danger @click="confirmDeleteBus(bus)">
                            {{ $t('common.delete') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="filteredBuses.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-fikr-mist text-navy-800">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h8a2 2 0 012 2v9H6V9a2 2 0 012-2zm0 0V6a2 2 0 012-2h4a2 2 0 012 2v1M7 16h.01M17 16h.01" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-navy-800">{{ $t('transportation.noBuses') }}</p>
            <p class="mx-auto mt-1 max-w-md text-sm text-fikr-ink-muted">{{ $t('transportation.noBusesHint') }}</p>
          </div>
        </div>
      </div>

      <div v-else class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fikr-mist text-navy-800 hover:bg-fikr-surface-high focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('transportation.backToBuses')"
              @click="clearSelection"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="min-w-0">
              <h2 class="fk-display truncate text-lg font-bold leading-7 text-navy-800">{{ selectedBus?.title }}</h2>
              <p class="text-sm text-fikr-ink-muted">
                {{ $t('transportation.driver') }}: {{ selectedBus?.driverName }}
                · <span dir="ltr" class="tabular-nums">{{ onBusStudents.length }}/{{ selectedBus?.capacity }}</span>
              </p>
            </div>
          </div>
        </header>

        <div class="p-6">
          <BusTrackStudentsPanel
            :bus-id="selectedBusId"
            :capacity="selectedBus?.capacity ?? 40"
            @changed="loadBuses"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('transportation.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="showFilters = false" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('transportation.filtersTitle') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="showFilters = false"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="buses-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="buses-search"
              v-model="searchQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('transportation.searchBusesPlaceholder')"
            >
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--mist" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--navy" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import MapView, { type MapViewMarker } from '@/components/ui/map-view.vue'
import BusTrackStudentsPanel from '@/components/BusTrackStudentsPanel.vue'
import { authService } from '@/services'
import { busService, type Bus } from '@/services/bus.service'
import { chatApiService } from '@/services/chat.service'
import FikrLoader from '@/components/FikrLoader.vue'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: string } | null
  const raw = u?.school_id
  return raw != null && String(raw).trim() !== '' ? String(raw) : undefined
})

const loading = ref(true)
const buses = ref<Bus[]>([])
const selectedBusId = ref<string | null>(null)
const showFilters = ref(false)
const searchQuery = ref('')
const activeMenuId = ref<string | null>(null)

const selectedBus = computed(() => buses.value.find((b) => b.id === selectedBusId.value) ?? null)

const hasActiveFilters = computed(() => Boolean(searchQuery.value.trim()))

const filteredBuses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return buses.value
  return buses.value.filter((bus) => {
    const haystack = `${bus.title} ${bus.driverName} ${bus.driverContacts || ''}`.toLowerCase()
    return haystack.includes(q)
  })
})

const {
  currentPage,
  paginatedItems: paginatedBuses,
  totalPages,
  goToPage,
} = useClientPagination(filteredBuses)

watch([searchQuery], () => {
  currentPage.value = 1
})

const onBusStudents = computed(() => selectedBus.value?.students ?? [])

function clearFilters() {
  searchQuery.value = ''
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function handleClickOutside(event: Event) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    activeMenuId.value = null
  }
}

function goEdit(bus: Bus) {
  activeMenuId.value = null
  void router.push(`/transportation/buses/${bus.id}`)
}

async function createBusParentsChat(bus: Bus) {
  activeMenuId.value = null
  try {
    const room = await chatApiService.createBusParentsRoom(bus.id)
    await router.push(`/chat/${room.id}`)
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg || t('transportation.createParentsChatFailed'))
  }
}

function clearSelection() {
  selectedBusId.value = null
}

const loadBuses = async () => {
  buses.value = await busService.getAll(schoolId.value)
}

/* ---- Live fleet map -------------------------------------------------- */
const fleetMarkers = computed<MapViewMarker[]>(() =>
  buses.value
    .filter(
      (b) =>
        b.is_active && b.last_lat != null && b.last_lng != null && Number.isFinite(Number(b.last_lat)),
    )
    .map((b) => ({
      id: b.id,
      lng: Number(b.last_lng),
      lat: Number(b.last_lat),
      kind: 'bus' as const,
      color: 'teal' as const,
      label: b.title,
      tooltip: b.last_position_at
        ? t('transportation.liveLastSeen', { time: new Date(b.last_position_at).toLocaleTimeString(locale.value === 'ar' ? 'ar-OM' : 'en-OM', { hour: '2-digit', minute: '2-digit' }) })
        : b.title,
    })),
)

let fleetPoll: ReturnType<typeof setInterval> | null = null

const refresh = async () => {
  loading.value = true
  try {
    await loadBuses()
  } finally {
    loading.value = false
  }
}

const selectBus = (id: string) => {
  activeMenuId.value = null
  selectedBusId.value = id
}

const confirmDeleteBus = async (bus: Bus) => {
  activeMenuId.value = null
  if (!window.confirm(t('transportation.confirmDelete', { title: bus.title }))) return
  try {
    await busService.deleteBus(bus.id)
    if (selectedBusId.value === bus.id) selectedBusId.value = null
    await loadBuses()
  } catch (e) {
    console.error(e)
    window.alert(t('transportation.deleteFailed'))
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void refresh()
  // Keep live bus positions fresh while the fleet list is open.
  fleetPoll = setInterval(() => {
    if (!selectedBusId.value) void loadBuses().catch(() => undefined)
  }, 15000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (fleetPoll) clearInterval(fleetPoll)
})
</script>
