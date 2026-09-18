<template>
  <DashboardLayout fill-viewport>
    <div class="fk-page flex h-full min-h-0 flex-col !space-y-0 gap-3 !pb-0" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :class="['shrink-0', hasRoom ? 'hidden lg:block' : '']"
        :title="$t('chatRooms.title')"
        :subtitle="$t('chatRooms.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error shrink-0">
        {{ error }}
      </div>

      <div class="fk-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside
            :class="[
              'flex min-h-0 w-full shrink-0 flex-col border-gray-200 bg-white lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
              hasRoom ? 'hidden min-h-0 lg:flex' : 'flex min-h-0 lg:min-h-0',
            ]"
          >
            <MessagingPeopleList
              v-model:search="searchQuery"
              :title="$t('chatRooms.title')"
              :section-label="$t('chatRooms.listHeading')"
              search-id="gc-mailbox-search"
              :search-placeholder="$t('chatRooms.searchRooms')"
              :search-aria="$t('chatRooms.searchRooms')"
              :plus-aria="$t('chatRooms.createAdhoc')"
              :show-plus="canCreateAdhoc"
              :loading="loading"
              :loading-label="$t('common.loading')"
              :items="peopleItems"
              :has-source-items="groups.length > 0"
              :empty-label="$t('chatRooms.noGroups')"
              :search-empty-label="$t('chatRooms.searchNoResults')"
              :unread-aria="$t('chatRooms.unread')"
              :aria-label="$t('chatRooms.title')"
              :list-dir="isRTL ? 'rtl' : 'ltr'"
              @plus="openCreateModal"
            >
              <template #kind>
                <MessagingKindSwitch />
              </template>
            </MessagingPeopleList>
          </aside>

          <section
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col bg-white',
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
      size="md"
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
            <ShareAccess2
              v-model:selected-ids="selectedUserIds"
              mode="multi"
              :people="memberPeople"
              :owner="ownerPerson"
              :loading="candidatesLoading"
              :placeholder="$t('chatRooms.searchMembers')"
              :empty-label="$t('chatRooms.noCandidates')"
            />
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
import ShareAccess2 from '@/components/ui/share-access-2.vue'
import MessagingPeopleList from '@/components/ui/messaging-people-list.vue'
import MessagingKindSwitch from '@/components/ui/messaging-kind-switch.vue'
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
import {
  scrubMessageLetterSystemSender,
  translateMessageLetterSender,
} from '@/utils/message-letter-sender'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { hasClaim, loadClaims } = useClaims()

const hasRoom = computed(() => Boolean(route.params.groupId))

const loading = ref(true)
const error = ref('')
const groups = ref<ChatGroupSummary[]>([])
const searchQuery = ref('')

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

const peopleItems = computed(() =>
  filteredGroups.value.map((g) => {
    const sender = mailboxSender(g.last_message_sender_name)
    const preview = mailboxPreview(g.last_message_preview)
    const lastMessage = preview ? (sender ? `${sender}: ${preview}` : preview) : undefined
    return {
      id: g.id,
      to: `/chat/${g.id}`,
      name: roomDisplayName(g),
      lastMessage,
      initials: roomInitials(g),
      unread: Boolean(g.has_unread) || (g.unread_count ?? 0) > 0,
      unreadCount: g.unread_count ?? (g.has_unread ? 1 : 0),
      variant: 'group' as const,
    }
  }),
)

const memberPeople = computed(() =>
  candidates.value.map((c) => ({
    id: c.user_id,
    name: c.name,
    email: c.subtitle,
    role: c.role,
  })),
)

const ownerPerson = computed(() => {
  const u = currentUser.value
  if (!u) return null
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
  return { id: u.id, name, email: u.email, owner: true as const }
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

function mailboxSender(name?: string | null) {
  return translateMessageLetterSender(name || '', t)
}

function mailboxPreview(text?: string | null) {
  return scrubMessageLetterSystemSender(text || '')
}

function roomDisplayName(g: ChatGroupSummary) {
  if (g.kind === 'approvals') return t('chatRooms.approvalsRoomName')
  return g.name
}

function roomInitials(g: ChatGroupSummary) {
  const name = (roomDisplayName(g) || '').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  if (!parts.length) return '#'
  if (parts.length === 1) {
    const w = parts[0]
    return (w.length === 1 ? w : w.charAt(0) + w.charAt(w.length - 1)).toUpperCase()
  }
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

async function loadGroups() {
  groups.value = await chatApiService.listGroups()
}

function clearUnread(roomId: string) {
  const row = groups.value.find((g) => g.id === roomId)
  if (row) {
    row.has_unread = false
    row.unread_count = 0
  }
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
