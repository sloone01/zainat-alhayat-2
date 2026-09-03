<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('transportation.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('transportation.subtitle') }}</p>
        </div>
      </section>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200/80 bg-white py-20 text-gray-500 shadow-sm">
        <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div class="space-y-4 xl:col-span-5">
          <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
            <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-5 py-4">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ $t('transportation.buses') }}</h2>
                  <p class="mt-0.5 text-xs text-gray-500">{{ $t('transportation.busesCount', { count: buses.length }) }}</p>
                </div>
                <ListViewModeToggle v-model="viewMode" />
              </div>
            </div>

            <div class="p-5">
              <div class="mb-4 flex justify-end">
                <router-link
                  to="/transportation/buses/new"
                  class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ $t('transportation.addBus') }}
                </router-link>
              </div>

              <template v-if="buses.length">
                <div v-if="isCards" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <article
                    v-for="bus in buses"
                    :key="bus.id"
                    class="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white text-start shadow-sm transition-all hover:shadow-md"
                    :class="selectedBusId === bus.id ? 'border-primary-300 ring-2 ring-primary-500/30 shadow-md' : 'border-gray-200/80 hover:border-primary-200'"
                    @click="selectBus(bus.id)"
                  >
                    <div
                      class="absolute inset-x-0 top-0 h-1 opacity-90"
                      :style="{ background: `linear-gradient(to right, ${busAccent(bus.id)}, ${busAccent(bus.id)}99)` }"
                      aria-hidden="true"
                    />
                    <div class="flex flex-1 flex-col p-4">
                      <div class="flex items-start gap-3">
                        <div
                          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-inner"
                          :style="{ backgroundColor: busAccent(bus.id) }"
                        >
                          {{ (bus.title || '?').charAt(0).toUpperCase() }}
                        </div>
                        <div class="min-w-0 flex-1">
                          <h3 class="truncate font-semibold text-gray-900">{{ bus.title }}</h3>
                          <p class="mt-0.5 truncate text-xs text-gray-500">{{ bus.driverName }}</p>
                          <p v-if="bus.driverContacts" class="mt-1 truncate text-[11px] text-gray-400">{{ bus.driverContacts }}</p>
                        </div>
                      </div>
                      <div class="mt-3">
                        <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-800 ring-1 ring-primary-100 tabular-nums">
                          {{ (bus.students?.length ?? 0) }}/{{ bus.capacity }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-2.5">
                      <router-link
                        :to="`/transportation/buses/${bus.id}`"
                        class="text-xs font-semibold text-primary-700 hover:text-primary-900"
                        @click.stop
                      >
                        {{ $t('common.edit') }}
                      </router-link>
                      <button
                        type="button"
                        class="text-xs font-semibold text-red-600 hover:text-red-800"
                        @click.stop="confirmDeleteBus(bus)"
                      >
                        {{ $t('common.delete') }}
                      </button>
                    </div>
                  </article>
                </div>

                <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
                  <table class="min-w-full text-sm">
                    <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th class="px-3 py-2.5 text-start">{{ $t('transportation.busTitle') }}</th>
                        <th class="px-3 py-2.5 text-start">{{ $t('transportation.driver') }}</th>
                        <th class="px-3 py-2.5 text-start">{{ $t('transportation.capacity') }}</th>
                        <th class="px-3 py-2.5 text-end">{{ $t('common.actions') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr
                        v-for="bus in buses"
                        :key="'list-' + bus.id"
                        class="cursor-pointer transition-colors hover:bg-primary-50/20"
                        :class="selectedBusId === bus.id ? 'bg-primary-50/40' : ''"
                        @click="selectBus(bus.id)"
                      >
                        <td class="px-3 py-2.5 font-medium text-gray-900">{{ bus.title }}</td>
                        <td class="px-3 py-2.5 text-gray-600">{{ bus.driverName }}</td>
                        <td class="px-3 py-2.5 tabular-nums text-gray-600">{{ (bus.students?.length ?? 0) }}/{{ bus.capacity }}</td>
                        <td class="px-3 py-2.5 text-end">
                          <div class="flex items-center justify-end gap-2">
                            <router-link
                              :to="`/transportation/buses/${bus.id}`"
                              class="text-xs font-semibold text-primary-700 hover:text-primary-900"
                              @click.stop
                            >
                              {{ $t('common.edit') }}
                            </router-link>
                            <button type="button" class="text-xs font-semibold text-red-600 hover:text-red-800" @click.stop="confirmDeleteBus(bus)">
                              {{ $t('common.delete') }}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <div v-else class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('transportation.noBuses') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('transportation.noBusesHint') }}</p>
                <router-link
                  to="/transportation/buses/new"
                  class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  + {{ $t('transportation.addBus') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <div class="xl:col-span-7">
          <div class="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
            <div v-if="!selectedBus" class="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <p class="max-w-sm text-sm text-gray-500">{{ $t('transportation.selectBusHint') }}</p>
            </div>

            <template v-else>
              <div class="shrink-0 bg-gradient-to-r from-primary-700 via-primary-600 to-teal-700 px-6 py-5 text-white">
                <div class="flex items-start gap-4">
                  <div
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white shadow-inner"
                    :style="{ backgroundColor: busAccent(selectedBus.id) }"
                  >
                    {{ (selectedBus.title || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <h2 class="text-xl font-semibold tracking-tight">{{ selectedBus.title }}</h2>
                    <p class="mt-1 text-sm text-primary-100">
                      {{ $t('transportation.driver') }}: {{ selectedBus.driverName }}
                    </p>
                    <p v-if="selectedBus.driverContacts" class="mt-1 text-xs leading-relaxed text-white/85">
                      {{ selectedBus.driverContacts }}
                    </p>
                    <span class="mt-2 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                      {{ onBusStudents.length }}/{{ selectedBus.capacity }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-1 flex-col gap-6 p-5">
                <div>
                  <label class="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ $t('transportation.addStudentsSearch') }}
                  </label>
                  <div class="relative">
                    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      v-model="studentPickQuery"
                      type="search"
                      class="block w-full rounded-lg border border-gray-200 py-2.5 ps-10 pe-3 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                      :placeholder="$t('transportation.searchStudentsPlaceholder')"
                    />
                  </div>
                </div>

                <div>
                  <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('transportation.onThisBus') }}</h3>
                  <p v-if="onBusStudents.length === 0" class="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
                    {{ $t('transportation.noneOnBus') }}
                  </p>
                  <div v-else class="grid max-h-[220px] grid-cols-1 gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
                    <div
                      v-for="s in onBusStudents"
                      :key="s.id"
                      class="flex items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
                    >
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                          {{ initials(s.firstName, s.lastName) }}
                        </div>
                        <span class="truncate text-sm font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</span>
                      </div>
                      <button
                        type="button"
                        class="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        @click="removeFromSelectedBus(s.id)"
                      >
                        {{ $t('transportation.remove') }}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ $t('transportation.addFromSchool') }}</h3>
                  <p v-if="pickableStudents.length === 0" class="text-sm text-gray-500">{{ $t('transportation.noMoreToAdd') }}</p>
                  <div v-else class="grid max-h-[280px] grid-cols-1 gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
                    <div
                      v-for="s in pickableStudents"
                      :key="s.id"
                      class="flex flex-col gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm"
                    >
                      <div class="flex min-w-0 items-center gap-2">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                          {{ initials(s.firstName, s.lastName) }}
                        </div>
                        <div class="min-w-0">
                          <p class="truncate text-sm font-medium text-gray-900">{{ s.firstName }} {{ s.lastName }}</p>
                          <p v-if="currentBusTitle(s)" class="truncate text-xs font-medium text-amber-700">
                            {{ $t('transportation.movingFrom') }}: {{ currentBusTitle(s) }}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="w-full rounded-lg py-2 text-xs font-semibold text-white disabled:opacity-50"
                        :class="studentIsMovingFromAnotherBus(s) ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700'"
                        :disabled="addingId === s.id"
                        @click="addToSelectedBus(s.id)"
                      >
                        {{
                          addingId === s.id
                            ? '…'
                            : studentIsMovingFromAnotherBus(s)
                              ? $t('transportation.moveToThisBus')
                              : $t('transportation.addToThisBus')
                        }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import { busService, type Bus } from '@/services/bus.service'
import { studentService, type Student } from '@/services/student.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()

const ACCENTS = ['#4f46e5', '#7c3aed', '#0d9488', '#2563eb', '#c026d3', '#db2777', '#0891b2']

function busAccent(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return ACCENTS[h % ACCENTS.length]
}

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

const selectedBus = computed(() => buses.value.find((b) => b.id === selectedBusId.value) ?? null)

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
  selectedBusId.value = id
}

const confirmDeleteBus = async (bus: Bus) => {
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
  try {
    await studentService.removeFromBus(studentId, bid)
    await Promise.all([loadBuses(), loadStudents()])
  } catch (e) {
    console.error(e)
    window.alert(t('transportation.removeFailed'))
  }
}

onMounted(refresh)
</script>
