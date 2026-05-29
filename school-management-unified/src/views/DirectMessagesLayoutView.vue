<template>
  <DashboardLayout content-bleed>
    <div
      class="flex min-h-0 flex-col border-t border-gray-200 bg-white lg:flex-row"
      :class="mailboxHeightClass"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <!-- Conversation list (like inbox list) -->
      <aside
        :class="[
          'flex min-h-0 w-full shrink-0 flex-col border-gray-200 bg-white lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
          hasThread ? 'hidden min-h-0 lg:flex' : 'flex min-h-[50vh] lg:min-h-0',
        ]"
      >
        <div class="shrink-0 border-b border-gray-200 px-4 py-3">
          <h1 class="text-base font-bold text-gray-900">{{ $t('directMessages.title') }}</h1>
          <div class="mt-3 flex gap-2">
            <label class="sr-only" for="dm-mailbox-search">{{ $t('directMessages.searchPlaceholder') }}</label>
            <input
              id="dm-mailbox-search"
              v-model="searchQuery"
              type="search"
              class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              :placeholder="$t('directMessages.searchPlaceholder')"
              autocomplete="off"
            />
            <button
              v-if="searchQuery.trim()"
              type="button"
              class="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50"
              @click="searchQuery = ''"
            >
              {{ $t('directMessages.clearSearch') }}
            </button>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="h-9 w-9 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
          <div v-else-if="error" class="m-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {{ error }}
          </div>
          <template v-else>
            <p class="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {{ $t('directMessages.recent') }}
            </p>
            <p v-if="threads.length === 0" class="px-4 py-2 text-sm text-gray-500">
              {{ $t('directMessages.noThreads') }}
            </p>
            <p v-else-if="filteredThreads.length === 0" class="px-4 py-2 text-sm text-gray-500">
              {{ $t('directMessages.searchNoResults') }}
            </p>
            <ul v-else class="divide-y divide-gray-100">
              <li v-for="th in filteredThreads" :key="th.thread_id">
                <router-link
                  :to="`/messages/${th.thread_id}`"
                  class="flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                  active-class="bg-primary-50/90 hover:bg-primary-50/90"
                >
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-sm font-semibold text-primary-800"
                  >
                    {{ initials(th.other_name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline justify-between gap-2">
                      <p class="truncate font-medium text-gray-900">{{ th.other_name }}</p>
                      <time
                        v-if="th.last_message_at"
                        class="shrink-0 text-[11px] text-gray-400"
                        :datetime="th.last_message_at"
                      >
                        {{ formatThreadTime(th.last_message_at) }}
                      </time>
                    </div>
                    <p class="truncate text-xs text-gray-500">{{ th.other_role }}</p>
                    <p v-if="th.last_message_preview" class="mt-0.5 truncate text-sm text-gray-600">
                      {{ th.last_message_preview }}
                    </p>
                  </div>
                </router-link>
              </li>
            </ul>

            <details v-if="isParent && parentContacts.length" class="group border-t border-gray-100">
              <summary
                class="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 marker:content-none [&::-webkit-details-marker]:hidden"
              >
                <span class="flex items-center justify-between gap-2">
                  {{ $t('directMessages.parentCourses') }}
                  <svg
                    class="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div class="border-t border-gray-50 px-2 pb-3">
                <p v-if="filteredParentContacts.length === 0" class="px-2 py-2 text-sm text-gray-500">
                  {{ $t('directMessages.searchNoResults') }}
                </p>
                <ul v-else class="max-h-48 space-y-1 overflow-y-auto text-sm">
                  <li
                    v-for="(row, idx) in filteredParentContacts"
                    :key="idx"
                    class="rounded-lg border border-gray-100 bg-gray-50/80 p-2"
                  >
                    <p class="truncate font-medium text-gray-900">{{ row.teacher_name }}</p>
                    <p class="truncate text-xs text-gray-500">
                      {{ row.student_name }} · {{ row.group_name }} · {{ row.course_name }}
                    </p>
                    <button
                      type="button"
                      :disabled="openingKey === courseKey(row)"
                      class="mt-2 w-full rounded-md bg-primary-600 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      @click="openFromCourse(row)"
                    >
                      {{
                        openingKey === courseKey(row)
                          ? $t('directMessages.starting')
                          : $t('directMessages.chatWithTeacher')
                      }}
                    </button>
                  </li>
                </ul>
              </div>
            </details>

            <details v-if="suggested.length" class="group border-t border-gray-100">
              <summary
                class="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 marker:content-none [&::-webkit-details-marker]:hidden"
              >
                <span class="flex items-center justify-between gap-2">
                  {{ $t('directMessages.startNew') }}
                  <svg
                    class="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div class="border-t border-gray-50 px-2 pb-3">
                <p v-if="filteredSuggested.length === 0" class="px-2 py-2 text-sm text-gray-500">
                  {{ $t('directMessages.searchNoResults') }}
                </p>
                <ul v-else class="max-h-40 space-y-1 overflow-y-auto">
                  <li
                    v-for="s in filteredSuggested"
                    :key="s.user_id"
                    class="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                  >
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-gray-900">{{ s.name }}</p>
                      <p class="truncate text-xs text-gray-500">{{ s.role }} · {{ s.subtitle }}</p>
                    </div>
                    <button
                      type="button"
                      :disabled="openingUserId === s.user_id"
                      class="shrink-0 rounded-md bg-primary-600 px-2 py-1 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      @click="openWithUser(s.user_id)"
                    >
                      {{ openingUserId === s.user_id ? $t('directMessages.starting') : $t('directMessages.openChat') }}
                    </button>
                  </li>
                </ul>
              </div>
            </details>
          </template>
        </div>
      </aside>

      <!-- Reading pane -->
      <section
        :class="[
          'flex min-h-0 min-w-0 flex-1 flex-col bg-gray-50/50',
          hasThread ? 'flex' : 'hidden lg:flex',
        ]"
      >
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import {
  chatApiService,
  type DirectThreadSummary,
  type ParentTeacherContactRow,
  type SuggestedContactRow,
} from '@/services/chat.service'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const mailboxHeightClass =
  'h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] min-h-[320px] lg:min-h-[calc(100dvh-4rem)]'

const loading = ref(true)
const error = ref('')
const threads = ref<DirectThreadSummary[]>([])
const suggested = ref<SuggestedContactRow[]>([])
const parentContacts = ref<ParentTeacherContactRow[]>([])
const openingUserId = ref('')
const openingKey = ref('')
const searchQuery = ref('')

const hasThread = computed(() => Boolean(route.params.threadId))

const isParent = computed(() => authService.getStoredUser()?.role === 'parent')

const needle = computed(() => searchQuery.value.trim().toLowerCase())

function rowMatches(...parts: (string | null | undefined)[]): boolean {
  const n = needle.value
  if (!n) return true
  const blob = parts.filter((p) => p != null && String(p).length > 0).join(' ').toLowerCase()
  return blob.includes(n)
}

const filteredThreads = computed(() =>
  threads.value.filter((th) =>
    rowMatches(th.other_name, th.other_role, th.last_message_preview ?? undefined),
  ),
)

const filteredSuggested = computed(() =>
  suggested.value.filter((s) => rowMatches(s.name, s.role, s.subtitle)),
)

const filteredParentContacts = computed(() =>
  parentContacts.value.filter((row) =>
    rowMatches(row.student_name, row.group_name, row.course_name, row.teacher_name),
  ),
)

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

async function openWithUser(userId: string) {
  openingUserId.value = userId
  try {
    const { thread_id } = await chatApiService.openDirectThread(userId)
    await router.push(`/messages/${thread_id}`)
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
  try {
    const { thread_id } = await chatApiService.openDirectFromCourse({
      student_id: row.student_id,
      course_id: row.course_id,
      group_id: row.group_id,
    })
    await router.push(`/messages/${thread_id}`)
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    error.value = Array.isArray(m) ? m.join(', ') : m || (e as Error).message || t('directMessages.loadError')
  } finally {
    openingKey.value = ''
  }
}

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
