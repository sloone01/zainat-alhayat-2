<template>
  <DashboardLayout>
    <div class="space-y-8" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('directMessages.title') }}</h1>
        <p class="mt-1 text-sm text-gray-600">{{ $t('directMessages.subtitle') }}</p>
        <p v-if="showGroupChatLink" class="mt-2 text-sm">
          <router-link to="/chat" class="font-medium text-primary-600 hover:text-primary-800">
            {{ $t('chatRooms.title') }} →
          </router-link>
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {{ error }}
      </div>

      <template v-else>
        <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
          <label class="sr-only" for="dm-search">{{ $t('directMessages.searchPlaceholder') }}</label>
          <input
            id="dm-search"
            v-model="searchQuery"
            type="search"
            class="flex-1 min-w-0 max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            :placeholder="$t('directMessages.searchPlaceholder')"
            autocomplete="off"
          />
          <button
            v-if="searchQuery.trim()"
            type="button"
            class="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-800 py-2"
            @click="searchQuery = ''"
          >
            {{ $t('directMessages.clearSearch') }}
          </button>
        </div>

        <section class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('directMessages.recent') }}</h2>
          <p v-if="threads.length === 0" class="text-sm text-gray-600">{{ $t('directMessages.noThreads') }}</p>
          <p v-else-if="filteredThreads.length === 0" class="text-sm text-gray-600">{{ $t('directMessages.searchNoResults') }}</p>
          <ul v-else class="divide-y divide-gray-100">
            <li v-for="th in filteredThreads" :key="th.thread_id">
              <router-link
                :to="`/messages/${th.thread_id}`"
                class="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-gray-50/80 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ th.other_name }}</p>
                  <p class="text-xs text-gray-500">{{ th.other_role }}</p>
                  <p v-if="th.last_message_preview" class="text-sm text-gray-600 truncate mt-1">
                    {{ th.last_message_preview }}
                  </p>
                </div>
                <span class="text-sm font-medium text-primary-600 shrink-0">{{ $t('directMessages.openChat') }} →</span>
              </router-link>
            </li>
          </ul>
        </section>

        <section v-if="isParent && parentContacts.length" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('directMessages.parentCourses') }}</h2>
          <p v-if="filteredParentContacts.length === 0" class="text-sm text-gray-600">{{ $t('directMessages.searchNoResults') }}</p>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-left text-gray-600">
                  <th class="py-2 pr-4 font-medium">{{ $t('directMessages.colChild') }}</th>
                  <th class="py-2 pr-4 font-medium">{{ $t('directMessages.colClass') }}</th>
                  <th class="py-2 pr-4 font-medium">{{ $t('directMessages.colCourse') }}</th>
                  <th class="py-2 pr-4 font-medium">{{ $t('directMessages.colTeacher') }}</th>
                  <th class="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in filteredParentContacts" :key="idx" class="border-b border-gray-100">
                  <td class="py-3 pr-4">{{ row.student_name }}</td>
                  <td class="py-3 pr-4">{{ row.group_name }}</td>
                  <td class="py-3 pr-4">{{ row.course_name }}</td>
                  <td class="py-3 pr-4">{{ row.teacher_name }}</td>
                  <td class="py-3">
                    <button
                      type="button"
                      :disabled="openingKey === courseKey(row)"
                      class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      @click="openFromCourse(row)"
                    >
                      {{ openingKey === courseKey(row) ? $t('directMessages.starting') : $t('directMessages.chatWithTeacher') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('directMessages.startNew') }}</h2>
          <p v-if="suggested.length === 0" class="text-sm text-gray-600">{{ $t('directMessages.noSuggestions') }}</p>
          <p v-else-if="filteredSuggested.length === 0" class="text-sm text-gray-600">{{ $t('directMessages.searchNoResults') }}</p>
          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="s in filteredSuggested"
              :key="s.user_id"
              class="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div class="min-w-0">
                <p class="font-medium text-gray-900">{{ s.name }}</p>
                <p class="text-xs text-gray-500">{{ s.role }} · {{ s.subtitle }}</p>
              </div>
              <button
                type="button"
                :disabled="openingUserId === s.user_id"
                class="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                @click="openWithUser(s.user_id)"
              >
                {{ openingUserId === s.user_id ? $t('directMessages.starting') : $t('directMessages.openChat') }}
              </button>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import {
  chatApiService,
  type DirectThreadSummary,
  type ParentTeacherContactRow,
  type SuggestedContactRow,
} from '@/services/chat.service'

const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const threads = ref<DirectThreadSummary[]>([])
const suggested = ref<SuggestedContactRow[]>([])
const parentContacts = ref<ParentTeacherContactRow[]>([])
const openingUserId = ref('')
const openingKey = ref('')
const searchQuery = ref('')

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

const showGroupChatLink = computed(() => authService.getStoredUser()?.role !== 'student')

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
