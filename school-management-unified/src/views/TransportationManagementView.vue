<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header (matches Student Management toolbar style) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('transportation.title') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('transportation.subtitle') }}</p>
            <router-link
              to="/transportation/daily-log"
              class="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {{ $t('transportation.openDailyLog') }}
            </router-link>
          </div>
          <button
            type="button"
            @click="openCreateBus"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
            </svg>
            {{ $t('transportation.addBus') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-3 text-gray-600 text-sm">{{ $t('common.loading') }}…</p>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Bus list -->
        <div class="xl:col-span-5 space-y-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 class="text-sm font-semibold text-gray-800">{{ $t('transportation.buses') }}</h2>
          </div>

          <div v-if="buses.length === 0" class="bg-white rounded-lg shadow-sm border border-dashed border-gray-300 p-10 text-center">
            <p class="text-gray-500 text-sm">{{ $t('transportation.noBuses') }}</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
            <button
              v-for="bus in buses"
              :key="bus.id"
              type="button"
              @click="selectBus(bus.id)"
              :class="[
                'text-start rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
                selectedBusId === bus.id
                  ? 'ring-2 ring-primary-500 border-primary-200 shadow-md'
                  : 'border-gray-200 hover:border-primary-100',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner"
                  :style="{ backgroundColor: busAccent(bus.id) }"
                >
                  {{ (bus.title || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-gray-900 truncate">{{ bus.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5 truncate">{{ bus.driverName }}</p>
                  <div class="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      class="inline-flex items-center rounded-full bg-primary-50 text-primary-800 px-2 py-0.5 text-xs font-medium border border-primary-100"
                    >
                      {{ (bus.students?.length ?? 0) }}/{{ bus.capacity }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  class="text-xs font-medium text-primary-600 hover:text-primary-800"
                  @click.stop="openEditBus(bus)"
                >
                  {{ $t('common.edit') }}
                </button>
                <button
                  type="button"
                  class="text-xs font-medium text-red-600 hover:text-red-800"
                  @click.stop="confirmDeleteBus(bus)"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </button>
          </div>
        </div>

        <!-- Assign panel -->
        <div class="xl:col-span-7">
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[360px] flex flex-col overflow-hidden"
          >
            <div
              v-if="selectedBus"
              class="bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-4 text-white shrink-0"
            >
              <h2 class="text-lg font-semibold">{{ selectedBus.title }}</h2>
              <p class="text-sm text-primary-100 mt-0.5">
                {{ $t('transportation.driver') }}: {{ selectedBus.driverName }}
              </p>
              <p v-if="selectedBus.driverContacts" class="text-xs text-white/90 mt-1 leading-relaxed">
                {{ selectedBus.driverContacts }}
              </p>
            </div>

            <div v-if="!selectedBus" class="p-8 flex-1 flex items-center justify-center">
              <p class="text-gray-500 text-sm text-center max-w-sm">{{ $t('transportation.selectBusHint') }}</p>
            </div>

            <div v-else class="p-4 flex-1 flex flex-col gap-6">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{{
                  $t('transportation.addStudentsSearch')
                }}</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    v-model="studentPickQuery"
                    type="search"
                    class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    :placeholder="$t('transportation.searchStudentsPlaceholder')"
                  />
                </div>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ $t('transportation.onThisBus') }}</h3>
                <p v-if="onBusStudents.length === 0" class="text-sm text-gray-500">{{ $t('transportation.noneOnBus') }}</p>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  <div
                    v-for="s in onBusStudents"
                    :key="s.id"
                    class="rounded-lg border border-gray-200 bg-gray-50/50 p-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <div
                        class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold shrink-0"
                      >
                        {{ initials(s.firstName, s.lastName) }}
                      </div>
                      <span class="text-sm font-medium text-gray-900 truncate">{{ s.firstName }} {{ s.lastName }}</span>
                    </div>
                    <button
                      type="button"
                      class="text-xs font-medium text-red-600 hover:text-red-800 shrink-0 px-2 py-1 rounded-md hover:bg-red-50"
                      @click="removeFromSelectedBus(s.id)"
                    >
                      {{ $t('transportation.remove') }}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-3">{{ $t('transportation.addFromSchool') }}</h3>
                <div v-if="pickableStudents.length === 0" class="text-sm text-gray-500">
                  {{ $t('transportation.noMoreToAdd') }}
                </div>
                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
                  <div
                    v-for="s in pickableStudents"
                    :key="s.id"
                    class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <div
                        class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold shrink-0"
                      >
                        {{ initials(s.firstName, s.lastName) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ s.firstName }} {{ s.lastName }}</p>
                        <p v-if="currentBusTitle(s)" class="text-xs text-amber-700 font-medium truncate">
                          {{ $t('transportation.movingFrom') }}: {{ currentBusTitle(s) }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="w-full text-xs font-medium py-2 rounded-md disabled:opacity-50 transition-colors"
                      :class="
                        studentIsMovingFromAnotherBus(s)
                          ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      "
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
          </div>
        </div>
      </div>

      <!-- Bus form modal -->
      <div v-if="showBusModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-[1px]" @click="closeBusModal" />
          <div
            class="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            :dir="isRTL ? 'rtl' : 'ltr'"
            @click.stop
          >
            <div class="bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-4">
              <h3 class="text-lg font-semibold text-white">
                {{ editingBusId ? $t('transportation.editBus') : $t('transportation.addBus') }}
              </h3>
            </div>
            <div class="p-5 space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('transportation.busTitle') }}</label>
                <input
                  v-model="busForm.title"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('transportation.driverName') }}</label>
                <input
                  v-model="busForm.driverName"
                  type="text"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('transportation.capacity') }}</label>
                <input
                  v-model.number="busForm.capacity"
                  type="number"
                  min="1"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('transportation.driverContacts') }}</label>
                <textarea
                  v-model="busForm.driverContacts"
                  rows="2"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-primary-500 focus:border-primary-500"
                  :placeholder="$t('transportation.driverContactsPlaceholder')"
                />
              </div>
            </div>
            <div class="px-5 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-white"
                @click="closeBusModal"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                :disabled="savingBus || !busForm.title.trim() || !busForm.driverName.trim()"
                @click="saveBus"
              >
                {{ savingBus ? '…' : $t('common.save') }}
              </button>
            </div>
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
import { authService } from '@/services'
import { busService, type Bus } from '@/services/bus.service'
import { studentService, type Student } from '@/services/student.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

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

/** Pickable list excludes students already on the selected bus; any bus here means move from another route. */
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

const showBusModal = ref(false)
const editingBusId = ref<string | null>(null)
const savingBus = ref(false)
const busForm = ref({
  title: '',
  driverName: '',
  capacity: 40,
  driverContacts: '',
})

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

const openCreateBus = () => {
  editingBusId.value = null
  busForm.value = { title: '', driverName: '', capacity: 40, driverContacts: '' }
  showBusModal.value = true
}

const openEditBus = (bus: Bus) => {
  editingBusId.value = bus.id
  busForm.value = {
    title: bus.title,
    driverName: bus.driverName,
    capacity: bus.capacity,
    driverContacts: bus.driverContacts || '',
  }
  showBusModal.value = true
}

const closeBusModal = () => {
  showBusModal.value = false
  editingBusId.value = null
}

const saveBus = async () => {
  savingBus.value = true
  try {
    if (editingBusId.value) {
      await busService.update(editingBusId.value, {
        title: busForm.value.title.trim(),
        driverName: busForm.value.driverName.trim(),
        capacity: Number(busForm.value.capacity) || 40,
        driverContacts: busForm.value.driverContacts.trim() || undefined,
      })
    } else {
      await busService.create({
        title: busForm.value.title.trim(),
        driverName: busForm.value.driverName.trim(),
        capacity: Number(busForm.value.capacity) || 40,
        driverContacts: busForm.value.driverContacts.trim() || undefined,
        school_id: schoolId.value,
      })
    }
    await loadBuses()
    closeBusModal()
  } catch (e) {
    console.error(e)
    window.alert(t('transportation.saveFailed'))
  } finally {
    savingBus.value = false
  }
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

onMounted(() => {
  refresh()
})
</script>
