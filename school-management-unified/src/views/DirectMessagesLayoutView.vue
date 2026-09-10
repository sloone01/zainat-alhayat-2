<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('directMessages.title')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <div class="fk-card overflow-hidden">
        <div
          class="flex min-h-0 flex-col lg:flex-row"
          :class="mailboxHeightClass"
        >
          <!-- Conversation list -->
          <aside
            :class="[
              'flex min-h-0 w-full shrink-0 flex-col border-gray-200 lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
              hasThread ? 'hidden min-h-0 lg:flex' : 'flex min-h-[50vh] lg:min-h-0',
            ]"
          >
            <div class="shrink-0 border-b border-fikr-hairline px-4 py-4">
              <div class="flex gap-2">
                <label class="sr-only" for="dm-mailbox-search">{{ $t('directMessages.searchPlaceholder') }}</label>
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
                    id="dm-mailbox-search"
                    v-model="searchQuery"
                    type="search"
                    class="w-full rounded-xl border border-gray-200 bg-white py-2.5 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    :placeholder="$t('directMessages.searchPlaceholder')"
                    autocomplete="off"
                  />
                </div>
                <button
                  v-if="searchQuery.trim()"
                  type="button"
                  class="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
                  @click="searchQuery = ''"
                >
                  {{ $t('directMessages.clearSearch') }}
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  :aria-label="$t('directMessages.startNew')"
                  :title="$t('directMessages.startNew')"
                  @click="openNewChatDialog"
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
                  {{ $t('directMessages.recent') }}
                </p>

                <div
                  v-if="threads.length === 0"
                  class="mx-3 mb-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white px-4 py-8 text-center"
                >
                  <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-gray-800">{{ $t('directMessages.noThreads') }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ $t('directMessages.noThreadsHint') }}</p>
                </div>

                <p v-else-if="filteredThreads.length === 0" class="px-4 py-3 text-sm text-gray-500">
                  {{ $t('directMessages.searchNoResults') }}
                </p>

                <ul v-else class="divide-y divide-gray-100 px-2 pb-2">
                  <li v-for="th in filteredThreads" :key="th.thread_id">
                    <router-link
                      :to="`/messages/${th.thread_id}`"
                      class="flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary-50/40"
                      active-class="bg-primary-50 ring-1 ring-primary-100"
                    >
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-sm font-semibold text-primary-800 ring-2 ring-white"
                      >
                        {{ initials(th.other_name) }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex min-w-0 items-center gap-2">
                            <p class="truncate font-medium text-gray-900">{{ th.other_name }}</p>
                            <span
                              v-if="th.other_role"
                              class="inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 ring-1 ring-gray-200/80"
                            >
                              {{ th.other_role }}
                            </span>
                          </div>
                          <time
                            v-if="th.last_message_at"
                            class="shrink-0 text-[11px] text-gray-400"
                            :datetime="th.last_message_at"
                          >
                            {{ formatThreadTime(th.last_message_at) }}
                          </time>
                        </div>
                        <p v-if="th.last_message_preview" class="mt-0.5 truncate text-sm text-gray-600">
                          {{ th.last_message_preview }}
                        </p>
                      </div>
                    </router-link>
                  </li>
                </ul>
              </template>
            </div>
          </aside>

          <!-- Reading pane -->
          <section
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-b from-slate-50/50 to-white',
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
        <div>
          <label class="sr-only" for="dm-new-chat-search">{{ $t('directMessages.searchContactsPlaceholder') }}</label>
          <div class="relative">
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
              id="dm-new-chat-search"
              ref="newChatSearchInput"
              v-model="contactSearchQuery"
              type="search"
              class="fk-field w-full ps-9"
              :placeholder="$t('directMessages.searchContactsPlaceholder')"
              autocomplete="off"
            />
          </div>
        </div>

        <div
          v-if="isParent && filteredParentContacts.length"
          class="space-y-2"
        >
          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            {{ $t('directMessages.parentCourses') }}
          </p>
          <div
            v-for="(row, idx) in filteredParentContacts"
            :key="idx"
            class="rounded-xl border border-gray-200 bg-white p-3"
          >
            <p class="truncate text-sm font-semibold text-gray-900">{{ row.teacher_name }}</p>
            <p class="mt-0.5 truncate text-xs text-gray-500">
              {{ row.student_name }} · {{ row.group_name }} · {{ row.course_name }}
            </p>
            <button
              type="button"
              :disabled="openingKey === courseKey(row)"
              class="mt-2.5 w-full rounded-lg bg-primary-600 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              @click="openFromCourse(row)"
            >
              {{
                openingKey === courseKey(row)
                  ? $t('directMessages.starting')
                  : $t('directMessages.chatWithTeacher')
              }}
            </button>
          </div>
        </div>

        <div class="max-h-[min(50vh,22rem)] space-y-1 overflow-y-auto">
          <p
            v-if="!suggested.length"
            class="px-1 py-6 text-center text-sm text-gray-500"
          >
            {{ $t('directMessages.noSuggestions') }}
          </p>
          <p
            v-else-if="filteredSuggested.length === 0"
            class="px-1 py-6 text-center text-sm text-gray-500"
          >
            {{ $t('directMessages.searchNoResults') }}
          </p>
          <button
            v-for="s in filteredSuggested"
            :key="s.user_id"
            type="button"
            :disabled="openingUserId === s.user_id"
            class="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition hover:bg-primary-50/60 disabled:opacity-50"
            @click="openWithUser(s.user_id)"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800"
              aria-hidden="true"
            >
              {{ initials(s.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900">{{ s.name }}</p>
              <p class="truncate text-xs text-gray-500">
                {{
                  openingUserId === s.user_id
                    ? $t('directMessages.starting')
                    : `${s.role} · ${s.subtitle}`
                }}
              </p>
            </div>
          </button>
        </div>
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
import { authService } from '@/services'
import {
  chatApiService,
  reloadDirectThreadsKey,
  type DirectThreadSummary,
  type ParentTeacherContactRow,
  type SuggestedContactRow,
} from '@/services/chat.service'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const mailboxHeightClass =
  'min-h-[min(calc(100dvh-14rem),720px)] max-h-[min(calc(100dvh-14rem),720px)]'

const loading = ref(true)
const error = ref('')
const threads = ref<DirectThreadSummary[]>([])
const suggested = ref<SuggestedContactRow[]>([])
const parentContacts = ref<ParentTeacherContactRow[]>([])
const openingUserId = ref('')
const openingKey = ref('')
const searchQuery = ref('')
const contactSearchQuery = ref('')
const newChatOpen = ref(false)
const newChatSearchInput = ref<HTMLInputElement | null>(null)

const hasThread = computed(() => Boolean(route.params.threadId))

const isParent = computed(() => authService.getStoredUser()?.role === 'parent')

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

const filteredSuggested = computed(() => {
  const n = contactSearchQuery.value.trim().toLowerCase()
  return suggested.value.filter((s) => rowMatches(n, s.name, s.role, s.subtitle))
})

const filteredParentContacts = computed(() => {
  const n = contactSearchQuery.value.trim().toLowerCase()
  return parentContacts.value.filter((row) =>
    rowMatches(n, row.student_name, row.group_name, row.course_name, row.teacher_name),
  )
})

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatThreadTime(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay =
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
    const opts: Intl.DateTimeFormatOptions = sameDay
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short' }
    return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : 'en-US', opts)
  } catch {
    return ''
  }
}

function courseKey(row: ParentTeacherContactRow) {
  return `${row.student_id}:${row.group_id}:${row.course_id}`
}

async function openNewChatDialog() {
  newChatOpen.value = true
  contactSearchQuery.value = ''
  await nextTick()
  newChatSearchInput.value?.focus()
}

function closeNewChatDialog() {
  newChatOpen.value = false
  contactSearchQuery.value = ''
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

async function openFromCourse(row: ParentTeacherContactRow) {
  openingKey.value = courseKey(row)
  error.value = ''
  try {
    const { thread_id } = await chatApiService.openDirectFromCourse({
      student_id: row.student_id,
      course_id: row.course_id,
      group_id: row.group_id,
    })
    closeNewChatDialog()
    await router.push(`/messages/${thread_id}`)
    await reloadThreads()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('directMessages.loadError')
  } finally {
    openingKey.value = ''
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
    if (isParent.value) {
      try {
        parentContacts.value = await chatApiService.listParentTeacherContacts()
      } catch {
        parentContacts.value = []
      }
    }
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('directMessages.loadError')
  } finally {
    loading.value = false
  }
})
</script>
