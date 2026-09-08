<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('chatRooms.title')"
        :subtitle="$t('chatRooms.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('chatRooms.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('chatRooms.roomsCount', { count: groups.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <button
              v-if="canCreateAdhoc"
              type="button"
              class="fk-btn fk-btn--primary fk-btn--sm"
              @click="openCreateModal"
            >
              {{ $t('chatRooms.createAdhoc') }}
            </button>
            <router-link to="/messages" class="fk-btn fk-btn--pearl fk-btn--sm">
              {{ $t('directMessages.title') }}
            </router-link>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="groups.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <router-link
                v-for="g in groups"
                :key="g.id"
                :to="`/chat/${g.id}`"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ g.name }}</h3>
                      <p v-if="g.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ g.description }}</p>
                    </div>
                  </div>
                  <div class="mt-4 flex flex-wrap gap-1.5">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1"
                      :class="kindBadgeClass(g.kind)"
                    >
                      {{ kindLabel(g.kind) }}
                    </span>
                    <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary-800 ring-1 ring-primary-100">
                      <template v-if="g.kind === 'class' || !g.kind">
                        {{ g.studentCount ?? 0 }} {{ $t('chatRooms.students') }}
                      </template>
                      <template v-else>
                        {{ g.memberCount ?? 0 }} {{ $t('chatRooms.members') }}
                      </template>
                    </span>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                    {{ $t('chatRooms.openRoom') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </router-link>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('chatRooms.listHeading') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('chatRooms.kind') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('chatRooms.members') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="g in groups" :key="'list-' + g.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ g.name }}</div>
                      <div v-if="g.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ g.description }}</div>
                    </td>
                    <td class="px-4 py-3">{{ kindLabel(g.kind) }}</td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">
                      <template v-if="g.kind === 'class' || !g.kind">{{ g.studentCount ?? 0 }}</template>
                      <template v-else>{{ g.memberCount ?? 0 }}</template>
                    </td>
                    <td class="px-4 py-3 text-end">
                      <router-link
                        :to="`/chat/${g.id}`"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ $t('chatRooms.openRoom') }}
                        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('chatRooms.noGroups') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('chatRooms.emptyHint') }}</p>
                <button
                  v-if="canCreateAdhoc"
                  type="button"
                  class="fk-btn fk-btn--primary fk-btn--sm mt-4"
                  @click="openCreateModal"
                >
                  {{ $t('chatRooms.createAdhoc') }}
                </button>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <FikrDialog
        :show="showCreate"
        :title="$t('chatRooms.createAdhocTitle')"
        :subtitle="$t('chatRooms.createAdhocSubtitle')"
        size="lg"
        @close="closeCreateModal"
      >
        <div class="space-y-4">
          <div v-if="createError" class="fk-alert fk-alert--error">{{ createError }}</div>
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
            <input
              v-model="memberSearch"
              type="search"
              class="fk-field mb-3 w-full"
              :placeholder="$t('chatRooms.searchMembers')"
            >
            <div v-if="candidatesLoading" class="py-6 text-center text-sm text-gray-500">
              {{ $t('common.loading') }}
            </div>
            <div v-else-if="!filteredCandidates.length" class="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-sm text-gray-500">
              {{ $t('chatRooms.noCandidates') }}
            </div>
            <div v-else class="fk-choices max-h-64 overflow-y-auto">
              <label
                v-for="c in filteredCandidates"
                :key="c.user_id"
                class="fk-choice"
                :class="{ 'fk-choice--on': selectedUserIds.includes(c.user_id) }"
              >
                <input v-model="selectedUserIds" :value="c.user_id" type="checkbox">
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-medium">{{ c.name }}</span>
                  <span class="block truncate text-[11px] opacity-70">{{ c.role }} · {{ c.subtitle }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" :disabled="creating" @click="closeCreateModal">
            {{ $t('common.cancel') }}
          </button>
          <button
            type="button"
            class="fk-btn fk-btn--primary"
            :disabled="creating || !createName.trim() || !selectedUserIds.length"
            @click="submitCreate"
          >
            {{ creating ? $t('common.saving') : $t('chatRooms.createAdhoc') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { authService } from '@/services'
import {
  chatApiService,
  type ChatGroupSummary,
  type ChatMemberCandidate,
} from '@/services/chat.service'

const { locale, t } = useI18n()
const router = useRouter()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

const loading = ref(true)
const error = ref('')
const groups = ref<ChatGroupSummary[]>([])

const currentUser = computed(() => authService.getStoredUser())
const canCreateAdhoc = computed(() => {
  const role = currentUser.value?.role
  return role === 'admin' || role === 'teacher'
})

const showCreate = ref(false)
const createName = ref('')
const createDescription = ref('')
const selectedUserIds = ref<string[]>([])
const memberSearch = ref('')
const candidates = ref<ChatMemberCandidate[]>([])
const candidatesLoading = ref(false)
const creating = ref(false)
const createError = ref('')

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

function kindLabel(kind?: ChatGroupSummary['kind']) {
  if (kind === 'bus') return t('chatRooms.kindBus')
  if (kind === 'adhoc') return t('chatRooms.kindAdhoc')
  return t('chatRooms.kindClass')
}

function kindBadgeClass(kind?: ChatGroupSummary['kind']) {
  if (kind === 'bus') return 'bg-sky-50 text-sky-800 ring-sky-100'
  if (kind === 'adhoc') return 'bg-violet-50 text-violet-800 ring-violet-100'
  return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
}

async function loadGroups() {
  groups.value = await chatApiService.listGroups()
}

async function openCreateModal() {
  showCreate.value = true
  createError.value = ''
  createName.value = ''
  createDescription.value = ''
  selectedUserIds.value = []
  memberSearch.value = ''
  candidatesLoading.value = true
  try {
    candidates.value = await chatApiService.listMemberCandidates()
  } catch (e: unknown) {
    createError.value = (e as Error).message || t('chatRooms.createError')
    candidates.value = []
  } finally {
    candidatesLoading.value = false
  }
}

function closeCreateModal() {
  if (creating.value) return
  showCreate.value = false
}

async function submitCreate() {
  if (!createName.value.trim() || !selectedUserIds.value.length) return
  creating.value = true
  createError.value = ''
  try {
    const room = await chatApiService.createAdhocRoom({
      name: createName.value.trim(),
      description: createDescription.value.trim() || undefined,
      userIds: [...selectedUserIds.value],
    })
    showCreate.value = false
    await router.push(`/chat/${room.id}`)
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } }; message?: string }
    const m = ax.response?.data?.message
    createError.value = (Array.isArray(m) ? m.join(', ') : m) || ax.message || t('chatRooms.createError')
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await loadGroups()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    const detail = Array.isArray(m) ? m.join(', ') : m
    error.value = detail || (e as Error).message || t('chatRooms.loadError')
  } finally {
    loading.value = false
  }
})
</script>
