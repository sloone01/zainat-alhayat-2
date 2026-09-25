<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationTransactions.title')"
        :subtitle="$t('notificationTransactions.subtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('notificationTransactions.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('notificationTransactions.count', { count: total }) }}
            </p>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FikrFilterButton
              :expanded="showFilters"
              :count="hasActiveFilters ? 1 : 0"
              @click="showFilters = true"
            />
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
            <template v-if="!routePageLoading">
              <FikrLoader />
              <span class="text-sm">{{ $t('common.loading') }}</span>
            </template>
          </div>

          <div
            v-else-if="!rows.length"
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <h3 class="text-sm font-semibold text-navy-800">
              {{ hasActiveFilters ? $t('notificationTransactions.noFilterResults') : $t('notificationTransactions.empty') }}
            </h3>
          </div>

          <template v-else>
            <div v-if="isCards" class="fk-grid">
              <KanbanCard
                v-for="row in rows"
                :key="'card-' + row.id"
                :title="row.to_address"
                :description="row.subject || row.template_key || '—'"
              >
                <template #tags>
                  <KanbanTag :dot="statusDot(row.status)">{{ statusLabel(row.status) }}</KanbanTag>
                  <KanbanTag :dot="row.channel === 'sms' ? 'amber' : 'sky'">
                    {{ channelLabel(row.channel) }}
                  </KanbanTag>
                </template>
                <template #actions>
                  <RowActionsMenu
                    :open="activeMenuId === row.id"
                    placement="up"
                    @toggle="toggleMenu(row.id)"
                  >
                    <RowActionsItem icon="view" @click="runMenu(() => openRow(row.id))">
                      {{ $t('common.view') }}
                    </RowActionsItem>
                  </RowActionsMenu>
                </template>
                <template #meta>
                  <KanbanMeta icon="calendar">{{ formatDate(row.created_at) }}</KanbanMeta>
                </template>
              </KanbanCard>
            </div>

            <div v-else class="overflow-visible">
              <table class="fk-feetable min-w-full">
                <thead>
                  <tr>
                    <th class="whitespace-nowrap">{{ $t('notificationTransactions.colTime') }}</th>
                    <th class="whitespace-nowrap">{{ $t('notificationTransactions.colChannel') }}</th>
                    <th>{{ $t('notificationTransactions.colTo') }}</th>
                    <th>{{ $t('notificationTransactions.colSubject') }}</th>
                    <th class="whitespace-nowrap">{{ $t('notificationTransactions.colStatus') }}</th>
                    <th class="whitespace-nowrap !text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.id">
                    <td class="whitespace-nowrap tabular-nums">{{ formatDate(row.created_at) }}</td>
                    <td class="whitespace-nowrap">{{ channelLabel(row.channel) }}</td>
                    <td dir="ltr">{{ row.to_address }}</td>
                    <td class="max-w-[14rem] truncate" :title="row.subject || ''">
                      {{ row.subject || row.template_key || '—' }}
                    </td>
                    <td class="whitespace-nowrap">
                      <span class="fk-pill" :class="statusClass(row.status)">
                        {{ statusLabel(row.status) }}
                      </span>
                    </td>
                    <td>
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === row.id"
                          placement="up"
                          @toggle="toggleMenu(row.id)"
                        >
                          <RowActionsItem icon="view" @click="runMenu(() => openRow(row.id))">
                            {{ $t('common.view') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="page"
              :pages="pages"
              :show="total > 0"
              :disabled="loading"
              @update:page="goToPage"
            />
          </template>
        </div>
      </section>
    </div>

    <div
      v-if="showFilters"
      class="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('notificationTransactions.filtersTitle')"
    >
      <div class="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px]" @click="closeFilters" />
      <aside class="fk-drawer" :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="fk-drawer__header items-start">
          <div>
            <h3 class="fk-form__title">{{ $t('notificationTransactions.filtersTitle') }}</h3>
          </div>
          <button
            type="button"
            class="fk-modal__close"
            :aria-label="$t('common.close')"
            @click="closeFilters"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="fk-drawer__body">
          <div class="fk-form__row">
            <label class="fk-flabel" for="ntx-search"><span>{{ $t('common.search') }}</span></label>
            <input
              id="ntx-search"
              v-model="draftFilters.search"
              type="search"
              class="fk-field"
              :placeholder="$t('notificationTransactions.searchPlaceholder')"
            >
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="ntx-channel"><span>{{ $t('notificationTransactions.colChannel') }}</span></label>
            <select id="ntx-channel" v-model="draftFilters.channel" class="fk-field">
              <option value="">{{ $t('notificationTransactions.allChannels') }}</option>
              <option value="email">{{ $t('notificationTransactions.channelEmail') }}</option>
              <option value="sms">{{ $t('notificationTransactions.channelSms') }}</option>
            </select>
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="ntx-status"><span>{{ $t('notificationTransactions.colStatus') }}</span></label>
            <select id="ntx-status" v-model="draftFilters.status" class="fk-field">
              <option value="">{{ $t('notificationTransactions.allStatuses') }}</option>
              <option value="sent">{{ $t('notificationTransactions.statusSent') }}</option>
              <option value="failed">{{ $t('notificationTransactions.statusFailed') }}</option>
              <option value="skipped">{{ $t('notificationTransactions.statusSkipped') }}</option>
            </select>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--pearl" @click="clearFilters">{{ $t('common.clear') }}</button>
            <button type="button" class="fk-btn fk-btn--primary" @click="applyAndCloseFilters">{{ $t('common.close') }}</button>
          </div>
        </div>
      </aside>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import FikrFilterButton from '@/components/FikrFilterButton.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import KanbanCard from '@/components/ui/kanban-card.vue'
import KanbanTag from '@/components/ui/kanban-tag.vue'
import KanbanMeta from '@/components/ui/kanban-meta.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { routePageLoading } from '@/router/route-loading'
import {
  notificationTransactionService,
  type NotificationTransactionRow,
  type NotificationTransactionStatus,
} from '@/services/notification-transaction.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()
const { viewMode, isCards } = useListViewMode()

const isPlatform = computed(() => route.path.startsWith('/platform/'))
const listBase = computed(() =>
  isPlatform.value ? '/platform/notification-transactions' : '/settings/notification-transactions',
)

const loading = ref(true)
const flashError = ref('')
const rows = ref<NotificationTransactionRow[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(1)
const pageSize = 20
const activeMenuId = ref<string | null>(null)
const showFilters = ref(false)

const filters = reactive({ channel: '', status: '', search: '' })
const draftFilters = reactive({ channel: '', status: '', search: '' })

const hasActiveFilters = computed(
  () => Boolean(filters.channel || filters.status || filters.search.trim()),
)

watch(showFilters, (open) => {
  if (open) {
    draftFilters.channel = filters.channel
    draftFilters.status = filters.status
    draftFilters.search = filters.search
  }
})

function channelLabel(channel: string) {
  return channel === 'sms'
    ? t('notificationTransactions.channelSms')
    : t('notificationTransactions.channelEmail')
}

function statusLabel(status: NotificationTransactionStatus) {
  if (status === 'failed') return t('notificationTransactions.statusFailed')
  if (status === 'skipped') return t('notificationTransactions.statusSkipped')
  return t('notificationTransactions.statusSent')
}

function statusClass(status: NotificationTransactionStatus) {
  if (status === 'failed') return 'fk-pill--navy'
  if (status === 'skipped') return 'fk-pill--mist'
  return 'fk-pill--teal'
}

function statusDot(status: NotificationTransactionStatus): 'emerald' | 'red' | 'gray' {
  if (status === 'failed') return 'red'
  if (status === 'skipped') return 'gray'
  return 'emerald'
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function runMenu(fn: () => void) {
  activeMenuId.value = null
  fn()
}

function openRow(id: string) {
  void router.push(`${listBase.value}/${id}`)
}

async function load() {
  loading.value = true
  flashError.value = ''
  activeMenuId.value = null
  try {
    const data = await notificationTransactionService.list({
      page: page.value,
      pageSize,
      channel: filters.channel || undefined,
      status: filters.status || undefined,
      search: filters.search.trim() || undefined,
    })
    rows.value = data.items
    total.value = data.total
    page.value = data.page
    pages.value = Math.max(1, Math.ceil(data.total / data.pageSize))
  } catch {
    flashError.value = t('notificationTransactions.loadError')
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  void load()
}

function applyAndCloseFilters() {
  filters.channel = draftFilters.channel
  filters.status = draftFilters.status
  filters.search = draftFilters.search
  showFilters.value = false
  applyFilters()
}

function closeFilters() {
  showFilters.value = false
}

function clearFilters() {
  draftFilters.channel = ''
  draftFilters.status = ''
  draftFilters.search = ''
  filters.channel = ''
  filters.status = ''
  filters.search = ''
  showFilters.value = false
  applyFilters()
}

function goToPage(p: number) {
  page.value = p
  void load()
}

onMounted(() => {
  void load()
})
</script>
