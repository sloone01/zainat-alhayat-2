<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('chatRooms.title')" />

      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <div class="fk-card overflow-hidden">
        <div
          class="flex min-h-0 flex-col lg:flex-row"
          :class="mailboxHeightClass"
        >
          <aside
            :class="[
              'flex min-h-0 w-full shrink-0 flex-col border-gray-200 lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
              hasRoom ? 'hidden min-h-0 lg:flex' : 'flex min-h-[50vh] lg:min-h-0',
            ]"
          >
            <div class="shrink-0 border-b border-fikr-hairline px-4 py-4">
              <div class="flex gap-2">
                <label class="sr-only" for="gc-mailbox-search">{{ $t('chatRooms.searchRooms') }}</label>
                <div class="relative min-w-0 flex-1">
                  <svg
                    class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    id="gc-mailbox-search"
                    v-model="searchQuery"
                    type="search"
                    class="w-full rounded-xl border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    :placeholder="$t('chatRooms.searchRooms')"
                    autocomplete="off"
                  />
                </div>
                <button
                  v-if="searchQuery.trim()"
                  type="button"
                  class="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                  @click="searchQuery = ''"
                >
                  {{ $t('common.clear') }}
                </button>
                <button
                  v-if="canCreateAdhoc"
                  type="button"
                  class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  :aria-label="$t('chatRooms.createAdhoc')"
                  :title="$t('chatRooms.createAdhoc')"
                  @click="openCreateModal"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto">
              <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
                <span class="h-9 w-9 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
                <span class="text-sm">{{ $t('common.loading') }}</span>
              </div>
              <template v-else>
                <p class="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {{ $t('chatRooms.listHeading') }}
                </p>

                <div
                  v-if="groups.length === 0"
                  class="mx-3 mb-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-4 py-8 text-center"
                >
                  <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-gray-800">{{ $t('chatRooms.noGroups') }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ $t('chatRooms.emptyHint') }}</p>
                </div>

                <p v-else-if="filteredGroups.length === 0" class="px-4 py-3 text-sm text-gray-500">
                  {{ $t('chatRooms.searchNoResults') }}
                </p>

                <ul v-else class="divide-y divide-gray-100 px-2 pb-2">
                  <li v-for="g in filteredGroups" :key="g.id">
                    <router-link
                      :to="`/chat/${g.id}`"
                      class="flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary-50/40"
                      :class="g.has_unread ? 'bg-primary-50/50' : ''"
                      active-class="bg-primary-50 ring-1 ring-primary-100"
                    >
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-primary-800 ring-2 ring-white"
                        aria-hidden="true"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex min-w-0 items-center gap-2">
                            <p
                              class="min-w-0 truncate"
                              :class="g.has_unread ? 'font-semibold text-gray-950' : 'font-medium text-gray-900'"
                            >
                              {{ roomDisplayName(g) }}
                            </p>
                            <span
                              v-if="g.has_unread"
                              class="h-2 w-2 shrink-0 rounded-full bg-primary-500"
                              :aria-label="$t('chatRooms.unread')"
                            />
                          </div>
                          <span class="shrink-0 text-[11px] tabular-nums text-gray-400">
                            <template v-if="g.kind === 'class' || !g.kind">
                              {{ g.studentCount ?? 0 }} {{ $t('chatRooms.students') }}
                            </template>
                            <template v-else>
                              {{ g.memberCount ?? 0 }} {{ $t('chatRooms.members') }}
                            </template>
                          </span>
                        </div>
                        <p
                          v-if="g.last_message_preview"
                          class="mt-0.5 truncate text-sm"
                          :class="g.has_unread ? 'font-medium text-gray-800' : 'text-gray-600'"
                        >
                          <span
                            v-if="g.last_message_sender_name"
                            class="font-medium text-gray-700"
                          >{{ g.last_message_sender_name }}: </span>{{ g.last_message_preview }}
                        </p>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </template>
            </div>
          </aside>

          <section
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-b from-slate-50/50 to-white',
              hasRoom ? 'flex' : 'hidden lg:flex',
            ]"
          >
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </section>
        </div>
      </div>
    </div>

    <FikrDialog
      :show="showCreate"
      :title="$t('chatRooms.createAdhocTitle')"
      :subtitle="$t('chatRooms.createAdhocSubtitle')"
      size="sm"
      plain-footer
      @close="closeCreateModal"
    >
      <div class="space-y-3">
        <div v-if="createError" class="fk-alert fk-alert--error">{{ createError }}</div>

        <div
          v-if="canCreateFromBus"
          class="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1"
        >
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="createMode === 'members'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'"
            @click="createMode = 'members'"
          >
            {{ $t('chatRooms.createModeMembers') }}
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-semibold transition"
            :class="createMode === 'bus'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'"
            @click="switchToBusMode"
          >
            {{ $t('chatRooms.createModeBus') }}
          </button>
        </div>

        <template v-if="createMode === 'members'">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="adhoc-name">
              {{ $t('chatRooms.roomName') }}
            </label>
            <input
              id="adhoc-name"
              v-model="createName"
              type="text"
              class="fk-field w-full"
              :placeholder="$t('chatRooms.roomNamePlaceholder')"
            >
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="adhoc-desc">
              {{ $t('chatRooms.roomDescription') }}
            </label>
            <textarea
              id="adhoc-desc"
              v-model="createDescription"
              rows="2"
              class="fk-field w-full"
              :placeholder="$t('chatRooms.roomDescriptionPlaceholder')"
            />
          </div>
          <div>
            <div class="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <span class="text-xs font-medium text-gray-600">{{ $t('chatRooms.selectMembers') }}</span>
              <span class="text-[11px] text-gray-500">
                {{ $t('chatRooms.selectedCount', { count: selectedUserIds.length }) }}
              </span>
            </div>
            <div class="relative mb-3">
              <svg
                class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="memberSearch"
                type="search"
                class="fk-field w-full ps-9"
                :placeholder="$t('chatRooms.searchMembers')"
                autocomplete="off"
              >
            </div>
            <div v-if="candidatesLoading" class="py-6 text-center text-sm text-gray-500">
              {{ $t('common.loading') }}
            </div>
            <div
              v-else-if="!filteredCandidates.length"
              class="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500"
            >
              {{ $t('chatRooms.noCandidates') }}
            </div>
            <div v-else class="max-h-[min(40vh,14rem)] space-y-1 overflow-y-auto">
              <button
                v-for="c in filteredCandidates"
                :key="c.user_id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition"
                :class="selectedUserIds.includes(c.user_id)
                  ? 'bg-primary-50 ring-1 ring-primary-100'
                  : 'hover:bg-primary-50/60'"
                @click="toggleMember(c.user_id)"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800"
                  aria-hidden="true"
                >
                  {{ initials(c.name) }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900">{{ c.name }}</p>
                  <p class="truncate text-xs text-gray-500">{{ c.role }} · {{ c.subtitle }}</p>
                </div>
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  :class="selectedUserIds.includes(c.user_id)
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 bg-white'"
                  aria-hidden="true"
                >
                  <svg
                    v-if="selectedUserIds.includes(c.user_id)"
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="text-sm text-gray-600">{{ $t('chatRooms.createBusHint') }}</p>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">
              {{ $t('chatRooms.selectBus') }}
            </label>
            <div v-if="busesLoading" class="py-6 text-center text-sm text-gray-500">
              {{ $t('common.loading') }}
            </div>
            <div
              v-else-if="!buses.length"
              class="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500"
            >
              {{ $t('chatRooms.noBuses') }}
            </div>
            <div v-else class="max-h-[min(40vh,14rem)] space-y-1 overflow-y-auto">
              <button
                v-for="b in buses"
                :key="b.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition"
                :class="selectedBusId === b.id
                  ? 'bg-primary-50 ring-1 ring-primary-100'
                  : 'hover:bg-primary-50/60'"
                @click="selectedBusId = b.id"
              >
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800"
                  aria-hidden="true"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-gray-900">{{ b.title }}</p>
                  <p class="truncate text-xs text-gray-500">
                    {{ b.driverName }} · {{ $t('chatRooms.busCapacity', { count: b.capacity }) }}
                  </p>
                </div>
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                  :class="selectedBusId === b.id
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 bg-white'"
                  aria-hidden="true"
                >
                  <svg
                    v-if="selectedBusId === b.id"
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <template #footer>
        <button
          type="button"
          class="fk-btn fk-btn--pearl"
          :disabled="creating"
          @click="closeCreateModal"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--primary"
          :disabled="creating || !canSubmitCreate"
          @click="submitCreate"
        >
          {{ creating ? $t('common.saving') : $t('chatRooms.createAdhoc') }}
        </button>
      </template>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import { authService } from '@/services'
import busService, { type Bus } from '@/services/bus.service'
import {
  chatApiService,
  type ChatGroupSummary,
  type ChatMemberCandidate,
  reloadGroupChatListKey,
  clearGroupChatUnreadKey,
} from '@/services/chat.service'
import { useClaims } from '@/composables/useClaims'
import { getErrorMessage } from '@/utils/error-reporting'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { hasClaim, loadClaims } = useClaims()

const mailboxHeightClass =
  'min-h-[min(calc(100dvh-14rem),720px)] max-h-[min(calc(100dvh-14rem),720px)]'

const loading = ref(true)
const error = ref('')
const groups = ref<ChatGroupSummary[]>([])
const searchQuery = ref('')

const hasRoom = computed(() => Boolean(route.params.groupId))

const currentUser = computed(() => authService.getStoredUser())
const canCreateAdhoc = computed(() => hasClaim('chat', 'create'))
const canCreateFromBus = computed(
  () =>
    hasClaim('chat', 'create') &&
    (hasClaim('transportation', 'view') ||
      hasClaim('transportation', 'edit') ||
      hasClaim('transportation', 'create')),
)

const showCreate = ref(false)
const createMode = ref<'members' | 'bus'>('members')
const createName = ref('')
const createDescription = ref('')
const selectedUserIds = ref<string[]>([])
const selectedBusId = ref('')
const memberSearch = ref('')
const candidates = ref<ChatMemberCandidate[]>([])
const candidatesLoading = ref(false)
const buses = ref<Bus[]>([])
const busesLoading = ref(false)
const busesLoaded = ref(false)
const creating = ref(false)
const createError = ref('')

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return groups.value
  return groups.value.filter((g) => {
    const name = roomDisplayName(g).toLowerCase()
    const kind = kindLabel(g.kind).toLowerCase()
    return (
      name.includes(q) ||
      (g.last_message_preview || '').toLowerCase().includes(q) ||
      (g.last_message_sender_name || '').toLowerCase().includes(q) ||
      kind.includes(q)
    )
  })
})

const filteredCandidates = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  if (!q) return candidates.value
  return candidates.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q),
  )
})

const canSubmitCreate = computed(() => {
  if (createMode.value === 'bus') return Boolean(selectedBusId.value)
  return Boolean(createName.value.trim() && selectedUserIds.value.length)
})

function kindLabel(kind?: ChatGroupSummary['kind']) {
  if (kind === 'approvals') return t('chatRooms.kindApprovals')
  if (kind === 'bus') return t('chatRooms.kindBus')
  if (kind === 'adhoc') return t('chatRooms.kindAdhoc')
  return t('chatRooms.kindClass')
}

function roomDisplayName(g: ChatGroupSummary) {
  if (g.kind === 'approvals') return t('chatRooms.approvalsRoomName')
  return g.name
}

function initials(name: string | null | undefined) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function toggleMember(userId: string) {
  const idx = selectedUserIds.value.indexOf(userId)
  if (idx >= 0) selectedUserIds.value.splice(idx, 1)
  else selectedUserIds.value.push(userId)
}

async function loadGroups() {
  groups.value = await chatApiService.listGroups()
}

function clearUnread(roomId: string) {
  const row = groups.value.find((g) => g.id === roomId)
  if (row) row.has_unread = false
}

provide(reloadGroupChatListKey, loadGroups)
provide(clearGroupChatUnreadKey, clearUnread)

watch(
  () => String(route.params.groupId || ''),
  (id) => {
    if (id) clearUnread(id)
  },
)

async function openCreateModal() {
  showCreate.value = true
  createError.value = ''
  createMode.value = 'members'
  createName.value = ''
  createDescription.value = ''
  selectedUserIds.value = []
  selectedBusId.value = ''
  memberSearch.value = ''
  candidatesLoading.value = true
  try {
    candidates.value = await chatApiService.listMemberCandidates()
  } catch (e: unknown) {
    createError.value = getErrorMessage(e, t('chatRooms.createError'))
    candidates.value = []
  } finally {
    candidatesLoading.value = false
  }
}

async function switchToBusMode() {
  createMode.value = 'bus'
  createError.value = ''
  if (busesLoaded.value || busesLoading.value) return
  busesLoading.value = true
  try {
    const schoolId = currentUser.value?.school_id
    buses.value =
      schoolId != null
        ? ((await busService.getAll(schoolId)) || []).filter((b) => b.is_active !== false)
        : []
    busesLoaded.value = true
  } catch (e: unknown) {
    createError.value = getErrorMessage(e, t('chatRooms.createError'))
    buses.value = []
  } finally {
    busesLoading.value = false
  }
}

function closeCreateModal() {
  if (creating.value) return
  showCreate.value = false
}

async function submitCreate() {
  if (!canSubmitCreate.value) return
  creating.value = true
  createError.value = ''
  try {
    let room: ChatGroupSummary
    if (createMode.value === 'bus') {
      room = await chatApiService.createBusParentsRoom(selectedBusId.value)
    } else {
      room = await chatApiService.createAdhocRoom({
        name: createName.value.trim(),
        description: createDescription.value.trim() || undefined,
        userIds: [...selectedUserIds.value],
      })
    }
    showCreate.value = false
    await loadGroups()
    await router.push(`/chat/${room.id}`)
  } catch (e: unknown) {
    createError.value = getErrorMessage(e, t('chatRooms.createError'))
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await loadClaims()
    await loadGroups()
  } catch (e: unknown) {
    error.value = getErrorMessage(e, t('chatRooms.loadError'))
  } finally {
    loading.value = false
  }
})
</script>
