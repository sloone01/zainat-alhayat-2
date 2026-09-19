<template>
  <DashboardLayout fill-viewport>
    <div class="fk-page flex h-full min-h-0 flex-col !space-y-0 gap-3 !pb-0" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :class="['shrink-0', hasThread ? 'hidden lg:block' : '']"
        :title="$t('directMessages.title')"
        :subtitle="$t('directMessages.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error shrink-0">
        {{ error }}
      </div>
      <ChatAuditNotice />

      <div class="fk-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
          <!-- Conversation list -->
          <aside
            :class="[
              'flex min-h-0 w-full shrink-0 flex-col border-gray-200 bg-white lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
              hasThread ? 'hidden min-h-0 lg:flex' : 'flex min-h-0 lg:min-h-0',
            ]"
          >
            <MessagingPeopleList
              v-model:search="searchQuery"
              :title="$t('directMessages.title')"
              :section-label="$t('directMessages.recent')"
              search-id="dm-mailbox-search"
              :search-placeholder="$t('directMessages.searchPlaceholder')"
              :search-aria="$t('directMessages.searchPlaceholder')"
              :plus-aria="$t('directMessages.startNew')"
              show-plus
              :loading="loading"
              :loading-label="$t('common.loading')"
              :items="peopleItems"
              :has-source-items="threads.length > 0"
              :empty-label="$t('directMessages.noThreads')"
              :search-empty-label="$t('directMessages.searchNoResults')"
              :aria-label="$t('directMessages.title')"
              :list-dir="isRTL ? 'rtl' : 'ltr'"
              @plus="openNewChatDialog"
            >
              <template v-if="showKindSwitch" #kind>
                <MessagingKindSwitch />
              </template>
            </MessagingPeopleList>
          </aside>

          <!-- Reading pane -->
          <section
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col bg-white',
              hasThread ? 'flex' : 'hidden lg:flex',
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
      :show="newChatOpen"
      :title="$t('directMessages.startNew')"
      :subtitle="$t('directMessages.startNewSubtitle')"
      size="md"
      @close="closeNewChatDialog"
    >
      <div class="space-y-4">
        <ShareAccess2
          ref="shareAccess"
          mode="single"
          :people="suggestedPeople"
          :busy-id="openingUserId"
          :placeholder="$t('directMessages.searchContactsPlaceholder')"
          :empty-label="suggested.length ? $t('directMessages.searchNoResults') : $t('directMessages.noSuggestions')"
          @pick="openWithUser"
        />
      </div>
    </FikrDialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ChatAuditNotice from '@/components/ChatAuditNotice.vue'
import ShareAccess2 from '@/components/ui/share-access-2.vue'
import MessagingPeopleList from '@/components/ui/messaging-people-list.vue'
import MessagingKindSwitch from '@/components/ui/messaging-kind-switch.vue'
import { getSessionPersona } from '@/utils/auth-token'
import { scrubMessageLetterSystemSender } from '@/utils/message-letter-sender'
import {
  chatApiService,
  reloadDirectThreadsKey,
  type DirectThreadSummary,
  type SuggestedContactRow,
} from '@/services/chat.service'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const threads = ref<DirectThreadSummary[]>([])
const suggested = ref<SuggestedContactRow[]>([])
const openingUserId = ref('')
const searchQuery = ref('')
const newChatOpen = ref(false)
const shareAccess = ref<{ focus: () => void } | null>(null)

const hasThread = computed(() => Boolean(route.params.threadId))
const showKindSwitch = computed(() => getSessionPersona() !== 'student')

function rowMatches(needle: string, ...parts: (string | null | undefined)[]): boolean {
  if (!needle) return true
  const blob = parts.filter((p) => p != null && String(p).length > 0).join(' ').toLowerCase()
  return blob.includes(needle)
}

const filteredThreads = computed(() => {
  const n = searchQuery.value.trim().toLowerCase()
  return threads.value.filter((th) =>
    rowMatches(n, th.other_name, th.other_role, th.last_message_preview ?? undefined),
  )
})

const suggestedPeople = computed(() =>
  suggested.value.map((s) => ({
    id: s.user_id,
    name: s.name,
    email: s.subtitle,
    role: s.role,
    subtitle: s.subtitle && s.subtitle !== s.role ? `${s.role} · ${s.subtitle}` : s.role,
  })),
)

const peopleItems = computed(() =>
  filteredThreads.value.map((th) => ({
    id: th.thread_id,
    to: `/messages/${th.thread_id}`,
    name: th.other_name,
    lastMessage: mailboxPreview(th.last_message_preview) || undefined,
    initials: initials(th.other_name),
    variant: 'person' as const,
  })),
)

function mailboxPreview(text?: string | null) {
  return scrubMessageLetterSystemSender(text || '')
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

async function openNewChatDialog() {
  newChatOpen.value = true
  await nextTick()
  shareAccess.value?.focus()
}

function closeNewChatDialog() {
  newChatOpen.value = false
}

async function reloadThreads() {
  try {
    threads.value = await chatApiService.listDirectThreads()
  } catch {
    /* keep the list we already have */
  }
}

provide(reloadDirectThreadsKey, reloadThreads)

async function openWithUser(userId: string) {
  openingUserId.value = userId
  error.value = ''
  try {
    const { thread_id } = await chatApiService.openDirectThread(userId)
    closeNewChatDialog()
    await router.push(`/messages/${thread_id}`)
    await reloadThreads()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('directMessages.loadError')
  } finally {
    openingUserId.value = ''
  }
}

watch(
  () => String(route.params.threadId || ''),
  (id, prev) => {
    if (id && id !== prev) void reloadThreads()
  },
)

onMounted(async () => {
  error.value = ''
  try {
    loading.value = true
    const [th, sug] = await Promise.all([
      chatApiService.listDirectThreads(),
      chatApiService.listSuggestedContacts(),
    ])
    threads.value = th
    suggested.value = sug
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('directMessages.loadError')
  } finally {
    loading.value = false
  }
})
</script>
