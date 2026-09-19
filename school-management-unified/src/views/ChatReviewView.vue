<template>
  <DashboardLayout fill-viewport>
    <div class="fk-page flex h-full min-h-0 flex-col !space-y-0 gap-3 !pb-0" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :class="['shrink-0', hasThread ? 'hidden lg:block' : '']"
        :title="$t('chatAudit.title')"
        :subtitle="$t('chatAudit.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error shrink-0">
        {{ error }}
      </div>

      <div class="fk-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
          <aside
            :class="[
              'flex min-h-0 w-full shrink-0 flex-col border-gray-200 bg-white lg:w-[min(100%,380px)] lg:max-w-[40vw] lg:border-e',
              hasThread ? 'hidden min-h-0 lg:flex' : 'flex min-h-0 lg:min-h-0',
            ]"
          >
            <MessagingPeopleList
              v-model:search="searchQuery"
              :title="$t('chatAudit.title')"
              :section-label="$t('chatAudit.listHeading')"
              search-id="chat-review-search"
              :search-placeholder="$t('chatAudit.searchPlaceholder')"
              :search-aria="$t('chatAudit.searchPlaceholder')"
              :loading="loading"
              :loading-label="$t('common.loading')"
              :items="peopleItems"
              :has-source-items="items.length > 0"
              :empty-label="$t('chatAudit.empty')"
              :search-empty-label="$t('directMessages.searchNoResults')"
              :aria-label="$t('chatAudit.title')"
              :list-dir="isRTL ? 'rtl' : 'ltr'"
            >
              <template #kind>
                <div
                  class="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1"
                  role="tablist"
                  :aria-label="$t('chatMailbox.type')"
                >
                  <button
                    type="button"
                    role="tab"
                    class="rounded-lg px-3 py-2 text-sm font-semibold transition"
                    :class="side === 'groups'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'"
                    :aria-selected="side === 'groups'"
                    @click="goSide('groups')"
                  >
                    {{ $t('chatMailbox.groups') }}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="rounded-lg px-3 py-2 text-sm font-semibold transition"
                    :class="side === 'single'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'"
                    :aria-selected="side === 'single'"
                    @click="goSide('single')"
                  >
                    {{ $t('chatMailbox.single') }}
                  </button>
                </div>
              </template>
            </MessagingPeopleList>
          </aside>

          <section
            :class="[
              'flex min-h-0 min-w-0 flex-1 flex-col bg-white',
              hasThread ? 'flex' : 'hidden lg:flex',
            ]"
          >
            <router-view />
          </section>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import MessagingPeopleList from '@/components/ui/messaging-people-list.vue'
import {
  chatApiService,
  chatReviewHitsKey,
  type ChatReviewHit,
} from '@/services/chat.service'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const items = ref<ChatReviewHit[]>([])
const searchQuery = ref('')

const side = computed<'groups' | 'single'>(() =>
  route.path.includes('/admin/chat-review/single') ? 'single' : 'groups',
)
const hasThread = computed(() => Boolean(route.params.id))

provide(chatReviewHitsKey, items)

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const peopleItems = computed(() =>
  items.value.map((row) => ({
    id: row.id,
    to: row.kind === 'direct'
      ? `/admin/chat-review/single/${row.id}`
      : `/admin/chat-review/groups/${row.kind}/${row.id}`,
    name: row.title,
    lastMessage: row.preview || undefined,
    initials: initials(row.title),
    variant: row.kind === 'direct' ? 'person' as const : 'group' as const,
  })),
)

function goSide(next: 'groups' | 'single') {
  if (side.value === next && !hasThread.value) return
  searchQuery.value = ''
  void router.push(next === 'single' ? '/admin/chat-review/single' : '/admin/chat-review/groups')
}

let timer: ReturnType<typeof setTimeout> | null = null

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await chatApiService.searchAdminReview(searchQuery.value, 1, side.value)
    items.value = data.items.filter((row) =>
      side.value === 'single' ? row.kind === 'direct' : row.kind !== 'direct',
    )
  } catch {
    error.value = t('chatRooms.loadError')
    items.value = []
  } finally {
    loading.value = false
  }
}

watch(searchQuery, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    void load()
  }, 300)
})

watch(side, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>
