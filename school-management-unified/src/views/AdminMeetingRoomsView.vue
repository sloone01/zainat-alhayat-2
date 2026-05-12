<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header (aligned with Transportation / admin toolbars) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900">{{ $t('meetingRooms.adminTitle') }}</h1>
            <p class="text-gray-600 mt-1 text-sm">{{ $t('meetingRooms.adminSubtitle') }}</p>
          </div>
        </div>
      </div>

      <div v-if="pageLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-3 text-gray-600 text-sm">{{ $t('common.loading') }}…</p>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <!-- Left: builder -->
        <div class="xl:col-span-7 space-y-4">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
            <div class="mb-4">
              <h2 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.createSection') }}</h2>
              <label class="block text-xs font-medium text-gray-500 mt-3 mb-1" for="meeting-scheduled-at">{{
                $t('meetingRooms.scheduledAtLabel')
              }}</label>
              <input
                id="meeting-scheduled-at"
                v-model="scheduledAtLocal"
                type="datetime-local"
                step="60"
                class="block w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500 font-mono tabular-nums"
                :class="isRTL ? 'text-start' : ''"
                style="direction: ltr"
              />
              <p class="mt-1 text-xs text-gray-500">{{ $t('meetingRooms.scheduledAtHint') }}</p>
            </div>
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ $t('meetingRooms.roomTitle') }}</label>
            <input
              v-model="title"
              type="text"
              maxlength="255"
              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              :placeholder="$t('meetingRooms.roomTitlePlaceholder')"
            />
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.rolesCardTitle') }}</h3>
            <p class="text-xs text-gray-500">{{ $t('meetingRooms.audienceHeading') }}</p>
            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label
                v-for="opt in roleOptions"
                :key="opt.key"
                class="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors"
                :class="
                  opt.model.value
                    ? 'border-primary-300 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-gray-50/80 text-gray-700 hover:border-gray-300'
                "
              >
                <input v-model="opt.model" type="checkbox" class="rounded border-gray-300 text-primary-600 shrink-0" />
                <span class="text-sm font-medium">{{ opt.label }}</span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.groupsCardTitle') }}</h3>
              <button
                v-if="selectedGroupIds.length"
                type="button"
                class="text-xs font-medium text-primary-600 hover:text-primary-800"
                @click="clearGroups"
              >
                {{ $t('meetingRooms.clearGroups') }}
              </button>
            </div>
            <p class="text-xs text-gray-500">{{ $t('meetingRooms.groupsHint') }}</p>
            <div v-if="!groups.length" class="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
              {{ $t('meetingRooms.noGroups') }}
            </div>
            <div v-else class="max-h-52 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label
                v-for="g in groups"
                :key="`grp-${g.id}-${selectionTick}`"
                class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="selectedGroupIds.includes(g.id) ? 'bg-primary-50/50' : ''"
              >
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 shrink-0"
                  :checked="selectedGroupIds.includes(g.id)"
                  @change="toggleGroup(g.id, ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-sm text-gray-900 font-medium">{{ g.name }}</span>
              </label>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.usersCardTitle') }}</h3>
              <button
                v-if="selectedUserIds.length"
                type="button"
                class="text-xs font-medium text-primary-600 hover:text-primary-800"
                @click="clearUsers"
              >
                {{ $t('meetingRooms.clearUsers') }}
              </button>
            </div>
            <p class="text-xs text-gray-500">{{ $t('meetingRooms.usersHint') }}</p>
            <input
              v-model="userSearch"
              type="search"
              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              :placeholder="$t('meetingRooms.userSearchPlaceholder')"
            />
            <div class="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              <label
                v-for="u in filteredUsers"
                :key="`usr-${u.id}-${selectionTick}`"
                class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                :class="selectedUserIds.includes(u.id) ? 'bg-indigo-50/60' : ''"
              >
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 shrink-0"
                  :checked="selectedUserIds.includes(u.id)"
                  @change="toggleUser(u.id, ($event.target as HTMLInputElement).checked)"
                />
                <span class="text-sm text-gray-900 flex-1 min-w-0">
                  <span class="font-medium">{{ u.firstName }} {{ u.lastName }}</span>
                  <span class="text-gray-500"> · {{ roleLabel(u.role) }}</span>
                </span>
                <span class="text-xs text-gray-400 truncate max-w-[9rem]">{{ u.email }}</span>
              </label>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              :disabled="saving || !title.trim() || !hasAnySelection || !scheduledAtValid"
              @click="onCreate"
            >
              <svg v-if="!saving" class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ saving ? $t('meetingRooms.creating') : $t('meetingRooms.createButton') }}
            </button>
            <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
            <p v-else-if="!hasAnySelection" class="text-sm text-amber-700">{{ $t('meetingRooms.selectAudienceHint') }}</p>
          </div>
        </div>

        <!-- Right: live summary (updates with every selection) -->
        <div class="xl:col-span-5">
          <div
            class="rounded-lg border border-gray-200 shadow-sm overflow-hidden min-h-[280px] flex flex-col bg-white sticky top-20"
          >
            <div class="bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-4 text-white shrink-0">
              <h2 class="text-base font-semibold">{{ $t('meetingRooms.summaryPanelTitle') }}</h2>
              <p class="text-xs text-primary-100 mt-1">{{ $t('meetingRooms.summaryPanelSubtitle') }}</p>
            </div>
            <div class="p-4 flex-1 space-y-4">
              <div v-if="!title.trim()" class="text-sm text-gray-500 italic">{{ $t('meetingRooms.summaryNoTitle') }}</div>
              <div v-else class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.roomTitle') }}</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ title.trim() }}</p>
              </div>

              <div v-if="scheduledAtValid" class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ $t('meetingRooms.summaryScheduledLabel') }}</p>
                <p class="text-sm font-semibold text-gray-900 mt-0.5 tabular-nums">{{ scheduledDisplayFull }}</p>
              </div>
              <div v-else class="text-sm text-amber-800 rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2">
                {{ $t('meetingRooms.scheduledAtInvalid') }}
              </div>

              <div v-if="!hasAnySelection" class="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg">
                {{ $t('meetingRooms.summaryEmpty') }}
              </div>
              <ul v-else class="space-y-2 text-sm text-gray-800">
                <li
                  v-for="(line, idx) in summaryLines"
                  :key="`sum-${selectionTick}-${idx}`"
                  class="flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                >
                  <span class="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
                  <span>{{ line }}</span>
                </li>
              </ul>

              <div
                v-if="hasAnySelection"
                class="rounded-lg border border-primary-100 bg-primary-50/90 px-3 py-2.5 text-sm text-primary-900"
              >
                <span class="font-semibold tabular-nums">{{ estimatedInviteHint }}</span>
              </div>
            </div>
          </div>

          <!-- Recent rooms (compact under summary on wide screens) -->
          <div class="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between gap-2 mb-3">
              <h2 class="text-sm font-semibold text-gray-800">{{ $t('meetingRooms.recentRooms') }}</h2>
              <button type="button" class="text-xs font-medium text-primary-600 hover:text-primary-800" @click="loadRooms">
                {{ $t('meetingRooms.refreshList') }}
              </button>
            </div>
            <div v-if="roomsLoading" class="text-xs text-gray-500 py-4 text-center">{{ $t('common.loading') }}…</div>
            <div v-else-if="!rooms.length" class="text-xs text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
              {{ $t('meetingRooms.noRoomsYet') }}
            </div>
            <ul v-else class="space-y-2 max-h-64 overflow-y-auto">
              <li
                v-for="r in rooms"
                :key="r.id"
                class="rounded-lg border border-gray-100 px-3 py-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ r.title }}</p>
                  <p class="text-xs text-gray-500 tabular-nums">
                    {{ r.invitee_count }} {{ $t('meetingRooms.inviteesShort') }} · {{ formatDate(r.scheduled_at ?? r.created_at) }}
                  </p>
                </div>
                <router-link
                  :to="{ name: 'meeting-room', params: { id: r.id } }"
                  class="text-xs font-semibold text-primary-600 hover:text-primary-800 shrink-0"
                >
                  {{ $t('meetingRooms.openRoom') }}
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import { groupService, type Group } from '@/services/group.service'
import userService, { type User } from '@/services/user.service'
import { meetingRoomService, type MeetingRoomListRow } from '@/services/meeting-room.service'
import { formatTeamsLikeDateTime, formatFullLocalDateTime, defaultScheduledDatetimeLocal } from '@/utils/meeting-datetime'

const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: number } | null)?.school_id ?? 1))

const pageLoading = ref(true)
const title = ref('')
const invAllParents = ref(false)
const invAllTeachers = ref(false)
const invAllStudents = ref(false)
/** Arrays (not Set) so template updates reliably on every toggle */
const selectedGroupIds = ref<string[]>([])
const selectedUserIds = ref<string[]>([])
/** Bumped on selection change to force list row re-render for highlight classes */
const selectionTick = ref(0)

const userSearch = ref('')
const groups = ref<Group[]>([])
const users = ref<User[]>([])

const saving = ref(false)
const createError = ref('')
const rooms = ref<MeetingRoomListRow[]>([])
const roomsLoading = ref(true)

const scheduledAtLocal = ref(defaultScheduledDatetimeLocal())
const scheduledAtValid = computed(() => {
  const v = scheduledAtLocal.value
  if (!v?.trim()) return false
  const d = new Date(v)
  return !Number.isNaN(d.getTime())
})
const scheduledDisplayFull = computed(() => {
  if (!scheduledAtValid.value) return ''
  return formatFullLocalDateTime(new Date(scheduledAtLocal.value), locale.value)
})

const roleOptions = computed(() => [
  { key: 'parents', label: t('meetingRooms.optAllParents'), model: invAllParents },
  { key: 'teachers', label: t('meetingRooms.optAllTeachers'), model: invAllTeachers },
  { key: 'students', label: t('meetingRooms.optAllStudents'), model: invAllStudents },
])

const usersInSchool = computed(() => {
  const sid = schoolId.value
  return users.value.filter((u) => {
    const usid = u.school_id
    if (usid != null && Number(usid) !== sid) return false
    if (u.role === 'admin') return false
    if (!u.isActive) return false
    return true
  })
})

function countRole(role: 'parent' | 'teacher' | 'student'): number {
  return usersInSchool.value.filter((u) => u.role === role).length
}

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  const list = usersInSchool.value
  if (!q) return list
  return list.filter((u) => {
    const blob = `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase()
    return blob.includes(q)
  })
})

const hasAnySelection = computed(() => {
  return (
    invAllParents.value ||
    invAllTeachers.value ||
    invAllStudents.value ||
    selectedGroupIds.value.length > 0 ||
    selectedUserIds.value.length > 0
  )
})

const summaryLines = computed(() => {
  const lines: string[] = []
  if (invAllParents.value) {
    lines.push(t('meetingRooms.summaryLineAllParents', { n: countRole('parent') }))
  }
  if (invAllTeachers.value) {
    lines.push(t('meetingRooms.summaryLineAllTeachers', { n: countRole('teacher') }))
  }
  if (invAllStudents.value) {
    lines.push(t('meetingRooms.summaryLineAllStudents', { n: countRole('student') }))
  }
  for (const gid of selectedGroupIds.value) {
    const g = groups.value.find((x) => x.id === gid)
    lines.push(t('meetingRooms.summaryLineGroup', { name: g?.name ?? gid.slice(0, 8) }))
  }
  if (selectedUserIds.value.length) {
    lines.push(t('meetingRooms.summaryLineUsers', { n: selectedUserIds.value.length }))
  }
  return lines
})

/** Lower bound: role pools + explicit users; groups add more parents server-side */
const estimatedInviteHint = computed(() => {
  let n = 0
  if (invAllParents.value) n += countRole('parent')
  if (invAllTeachers.value) n += countRole('teacher')
  if (invAllStudents.value) n += countRole('student')
  n += selectedUserIds.value.length
  const g = selectedGroupIds.value.length
  if (g > 0) {
    return t('meetingRooms.summaryEstimateWithGroups', { base: n, groups: g })
  }
  return t('meetingRooms.summaryEstimate', { n })
})

function bumpSelection() {
  selectionTick.value += 1
}

function roleLabel(role: string) {
  const key = `dashboard.${role}`
  const tr = t(key)
  return tr === key ? role : tr
}

function toggleGroup(id: string, on: boolean) {
  const arr = [...selectedGroupIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedGroupIds.value = arr
  bumpSelection()
}

function toggleUser(id: string, on: boolean) {
  const arr = [...selectedUserIds.value]
  const i = arr.indexOf(id)
  if (on && i < 0) arr.push(id)
  if (!on && i >= 0) arr.splice(i, 1)
  selectedUserIds.value = arr
  bumpSelection()
}

function clearGroups() {
  selectedGroupIds.value = []
  bumpSelection()
}

function clearUsers() {
  selectedUserIds.value = []
  bumpSelection()
}

const formatDate = (iso?: string) => formatTeamsLikeDateTime(iso, locale.value, t)

async function loadRooms() {
  roomsLoading.value = true
  try {
    rooms.value = await meetingRoomService.list(schoolId.value)
  } finally {
    roomsLoading.value = false
  }
}

async function onCreate() {
  createError.value = ''
  saving.value = true
  try {
    const invite = {
      allParents: invAllParents.value || undefined,
      allTeachers: invAllTeachers.value || undefined,
      allStudents: invAllStudents.value || undefined,
      groupIds: selectedGroupIds.value.length ? [...selectedGroupIds.value] : undefined,
      userIds: selectedUserIds.value.length ? [...selectedUserIds.value] : undefined,
    }
    const created = await meetingRoomService.create({
      school_id: schoolId.value,
      title: title.value.trim(),
      scheduled_at: new Date(scheduledAtLocal.value).toISOString(),
      invite,
    })
    await loadRooms()
    await router.push({ name: 'meeting-room', params: { id: created.id } })
  } catch (e: unknown) {
    createError.value = e instanceof Error ? e.message : t('meetingRooms.createFailed')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    const [g, u] = await Promise.all([groupService.getAll(schoolId.value), userService.getAllUsers()])
    groups.value = g
    users.value = u
    await loadRooms()
  } finally {
    pageLoading.value = false
  }
})
</script>
