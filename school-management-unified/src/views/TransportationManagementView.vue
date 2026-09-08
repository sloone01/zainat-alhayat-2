<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('transportation.title')"
        :subtitle="$t('transportation.subtitle')"
      />

      <div v-if="!selectedBusId" class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('transportation.buses') }}</h2>
            <p v-if="!loading" class="fk-card__meta">{{ $t('transportation.busesCount', { count: buses.length }) }}</p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              type="button"
              class="fk-iconbtn"
              :aria-label="$t('common.filter')"
              :aria-expanded="showFilters"
              @click="showFilters = true"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              <span
                v-if="hasActiveFilters"
                class="absolute end-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary-500"
                aria-hidden="true"
              />
            </button>
            <ListViewModeToggle v-model="viewMode" />
            <router-link
              to="/transportation/buses/new"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('transportation.addBus')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </router-link>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="buses.length">
            <p
              v-if="filteredBuses.length === 0"
              class="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
            >
              {{ $t('transportation.noFilterResults') }}
            </p>
            <div v-else-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="bus in filteredBuses"
                :key="bus.id"
                class="relative cursor-pointer rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
                @click="selectBus(bus.id)"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-primary-500 to-teal-500 opacity-80"
                  aria-hidden="true"
                />
                <div class="flex items-center gap-3 p-5">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8a2 2 0 012 2v9H6V9a2 2 0 012-2zm0 0V6a2 2 0 012-2h4a2 2 0 012 2v1M7 16h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate font-semibold text-gray-900">{{ bus.title }}</h3>
                    <p class="mt-0.5 truncate text-xs text-gray-500">{{ bus.driverName }}</p>
                  </div>
                  <span class="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-100">
                    {{ bus.students?.length ?? 0 }}/{{ bus.capacity }}
                  </span>
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
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('transportation.busTitle') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('transportation.driver') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('transportation.capacity') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="bus in filteredBuses"
                    :key="'list-' + bus.id"
                    class="cursor-pointer hover:bg-primary-50/20"
                    @click="selectBus(bus.id)"
                  >
                    <td class="px-4 py-3 font-medium text-gray-900">{{ bus.title }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ bus.driverName }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-600">{{ bus.students?.length ?? 0 }}/{{ bus.capacity }}</td>
                    <td class="px-4 py-3" @click.stop>
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
          </template>

          <div v-else class="flex min-h-[16rem] flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h8a2 2 0 012 2v9H6V9a2 2 0 012-2zm0 0V6a2 2 0 012-2h4a2 2 0 012 2v1M7 16h.01M17 16h.01" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-600">{{ $t('transportation.noBuses') }}</p>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('transportation.noBusesHint') }}</p>
          </div>
        </div>
      </div>

      <div v-else class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('transportation.backToBuses')"
              @click="clearSelection"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="min-w-0">
              <h2 class="fk-card__title truncate">{{ selectedBus?.title }}</h2>
              <p class="fk-card__meta">
                {{ $t('transportation.driver') }}: {{ selectedBus?.driverName }}
                · {{ onBusStudents.length }}/{{ selectedBus?.capacity }}
              </p>
            </div>
          </div>
        </header>

        <div class="space-y-6 p-6">
          <div class="fk-form__row">
            <label class="fk-flabel" for="bus-student-search"><span>{{ $t('transportation.addStudentsSearch') }}</span></label>
            <input
              id="bus-student-search"
              v-model="studentPickQuery"
              type="search"
              class="fk-field"
              :placeholder="$t('transportation.searchStudentsPlaceholder')"
            >
          </div>

          <div>
            <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('transportation.onThisBus') }}</h3>
            <div
              v-if="onBusStudents.length === 0"
              class="flex min-h-[10rem] flex-col items-center justify-center text-center"
            >
              <p class="text-sm font-medium text-gray-600">{{ $t('transportation.noneOnBus') }}</p>
            </div>
            <div v-else class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="s in onBusStudents"
                :key="s.id"
                class="flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold text-primary-800">
                    {{ initials(s.firstName, s.lastName) }}
                  </div>
                  <span class="truncate text-sm font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</span>
                </div>
                <button
                  type="button"
                  class="fk-iconbtn text-red-600 hover:bg-red-50 hover:text-red-700"
                  :disabled="removingId === s.id"
                  :aria-label="$t('transportation.remove')"
                  @click="removeFromSelectedBus(s.id)"
                >
                  <svg v-if="removingId === s.id" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('transportation.addFromSchool') }}</h3>
            <p v-if="pickableStudents.length === 0" class="text-sm text-gray-500">{{ $t('transportation.noMoreToAdd') }}</p>
            <div v-else class="grid gap-3 sm:grid-cols-2">
              <div
                v-for="s in pickableStudents"
                :key="s.id"
                class="flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold text-primary-800">
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
                  :disabled="addingId === s.id"
                  :aria-label="
                    studentIsMovingFromAnotherBus(s)
                      ? $t('transportation.moveToThisBus')
                      : $t('transportation.addToThisBus')
                  "
                  @click="addToSelectedBus(s.id)"
                >
                  <svg v-if="addingId === s.id" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
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
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="showFilters = false">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import { busService, type Bus } from '@/services/bus.service'
import { studentService, type Student } from '@/services/student.service'
import { chatApiService } from '@/services/chat.service'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

function initials(first: string, last: string): string {
  const a = (first || '?').charAt(0)
  const b = (last || '').charAt(0)
  return `${a}${b}`.toUpperCase()
}

function currentBusTitle(student: Student): string | null {
  const list = student.buses || []
  if (list.length === 0) return null
  const bid = selectedBusId.value
  const b = list[0]
  if (!b || b.id === bid) return null
  return (b as { title?: string }).title ?? null
}

function studentIsMovingFromAnotherBus(student: Student): boolean {
  return (student.buses?.length ?? 0) > 0
}

const schoolId = computed(() => {
  const u = authService.getStoredUser() as { school_id?: number } | null
  return Number(u?.school_id ?? 1)
})

const loading = ref(true)
const buses = ref<Bus[]>([])
const allStudents = ref<Student[]>([])
const selectedBusId = ref<string | null>(null)
const studentPickQuery = ref('')
const addingId = ref<string | null>(null)
const removingId = ref<string | null>(null)
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

const onBusStudents = computed(() => {
  const bus = selectedBus.value
  if (!bus?.students?.length) return []
  return bus.students.map((st) => ({
    id: st.id,
    firstName: st.firstName ?? (st as { first_name?: string }).first_name ?? '',
    lastName: st.lastName ?? (st as { last_name?: string }).last_name ?? '',
  }))
})

const assignedIdsOnSelected = computed(() => new Set(onBusStudents.value.map((s) => s.id)))

const pickableStudents = computed(() => {
  if (!selectedBus.value) return []
  const q = studentPickQuery.value.trim().toLowerCase()
  return allStudents.value.filter((s) => {
    if (assignedIdsOnSelected.value.has(s.id)) return false
    if (!q) return true
    const fn = (s.firstName || '').toLowerCase()
    const ln = (s.lastName || '').toLowerCase()
    return fn.includes(q) || ln.includes(q)
  })
})

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
  studentPickQuery.value = ''
}

const loadBuses = async () => {
  buses.value = await busService.getAll(schoolId.value)
}

const loadStudents = async () => {
  allStudents.value = await studentService.getAll()
}

const refresh = async () => {
  loading.value = true
  try {
    await Promise.all([loadBuses(), loadStudents()])
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

const addToSelectedBus = async (studentId: string) => {
  const bid = selectedBusId.value
  if (!bid) return
  addingId.value = studentId
  try {
    await studentService.assignToBus(studentId, bid)
    await Promise.all([loadBuses(), loadStudents()])
  } catch (e: unknown) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    window.alert(msg || t('transportation.assignFailed'))
  } finally {
    addingId.value = null
  }
}

const removeFromSelectedBus = async (studentId: string) => {
  const bid = selectedBusId.value
  if (!bid) return
  removingId.value = studentId
  try {
    await studentService.removeFromBus(studentId, bid)
    await Promise.all([loadBuses(), loadStudents()])
  } catch (e) {
    console.error(e)
    window.alert(t('transportation.removeFailed'))
  } finally {
    removingId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void refresh()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
