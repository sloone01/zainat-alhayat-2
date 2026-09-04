<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-8 start-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
        <div class="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-100/80">
              {{ $t('directMessages.eyebrow') }}
            </p>
            <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('directMessages.title') }}</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('directMessages.subtitle') }}</p>
          </div>
          <router-link
            to="/chat"
            class="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            {{ $t('chatRooms.title') }}
            <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        {{ error }}
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
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
            <div class="shrink-0 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-4 py-4">
              <h2 class="text-sm font-semibold text-gray-900">{{ $t('directMessages.listHeading') }}</h2>
              <p v-if="!loading" class="mt-0.5 text-xs text-gray-500">
                {{ $t('directMessages.threadsCount', { count: threads.length }) }}
              </p>
              <div v-if="!loading" class="mt-3 flex flex-wrap gap-2">
                <span class="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary-800 ring-1 ring-primary-100">
                  {{ $t('directMessages.stats.total', { count: threads.length }) }}
                </span>
                <span
                  v-if="suggested.length"
                  class="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-teal-800 ring-1 ring-teal-100"
                >
                  {{ $t('directMessages.stats.suggested', { count: suggested.length }) }}
                </span>
                <span
                  v-if="isParent && parentContacts.length"
                  class="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700 ring-1 ring-gray-200"
                >
                  {{ $t('directMessages.stats.classes', { count: parentContacts.length }) }}
                </span>
              </div>
              <div class="mt-3 flex gap-2">
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

                <details v-if="isParent && parentContacts.length" class="group border-t border-gray-100" open>
                  <summary
                    class="cursor-pointer list-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 marker:content-none [&::-webkit-details-marker]:hidden"
                  >
                    <span class="flex items-center justify-between gap-2">
                      {{ $t('directMessages.parentCourses') }}
                      <svg
                        class="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </summary>
                  <div class="space-y-2 border-t border-gray-50 px-3 pb-3 pt-2">
                    <p v-if="filteredParentContacts.length === 0" class="px-1 py-2 text-sm text-gray-500">
                      {{ $t('directMessages.searchNoResults') }}
                    </p>
                    <div
                      v-for="(row, idx) in filteredParentContacts"
                      :key="idx"
                      class="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-50/80 to-white p-3 shadow-sm"
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
                </details>

                <details v-if="suggested.length" class="group border-t border-gray-100" :open="threads.length === 0">
                  <summary
                    class="cursor-pointer list-none px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 marker:content-none [&::-webkit-details-marker]:hidden"
                  >
                    <span class="flex items-center justify-between gap-2">
                      {{ $t('directMessages.startNew') }}
                      <svg
                        class="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </summary>
                  <div class="space-y-1 border-t border-gray-50 px-2 pb-3 pt-2">
                    <p v-if="filteredSuggested.length === 0" class="px-2 py-2 text-sm text-gray-500">
                      {{ $t('directMessages.searchNoResults') }}
                    </p>
                    <div
                      v-for="s in filteredSuggested"
                      :key="s.user_id"
                      class="flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-gray-50"
                    >
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-gray-900">{{ s.name }}</p>
                        <p class="truncate text-xs text-gray-500">{{ s.role }} · {{ s.subtitle }}</p>
                      </div>
                      <button
                        type="button"
                        :disabled="openingUserId === s.user_id"
                        class="shrink-0 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                        @click="openWithUser(s.user_id)"
                      >
                        {{ openingUserId === s.user_id ? $t('directMessages.starting') : $t('directMessages.openChat') }}
                      </button>
                    </div>
                  </div>
                </details>
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
  'min-h-[min(calc(100dvh-14rem),720px)] max-h-[min(calc(100dvh-14rem),720px)]'

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
