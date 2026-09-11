<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationTransactions.title')"
        :subtitle="$t('notificationTransactions.subtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('notificationTransactions.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('notificationTransactions.count', { count: total }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <select v-model="filters.channel" class="fk-input h-9 min-w-[7rem] text-sm" @change="applyFilters">
              <option value="">{{ $t('notificationTransactions.allChannels') }}</option>
              <option value="email">{{ $t('notificationTransactions.channelEmail') }}</option>
              <option value="sms">{{ $t('notificationTransactions.channelSms') }}</option>
            </select>
            <select v-model="filters.status" class="fk-input h-9 min-w-[7rem] text-sm" @change="applyFilters">
              <option value="">{{ $t('notificationTransactions.allStatuses') }}</option>
              <option value="sent">{{ $t('notificationTransactions.statusSent') }}</option>
              <option value="failed">{{ $t('notificationTransactions.statusFailed') }}</option>
              <option value="skipped">{{ $t('notificationTransactions.statusSkipped') }}</option>
            </select>
            <input
              v-model="filters.search"
              type="search"
              class="fk-input h-9 w-40 text-sm sm:w-52"
              :placeholder="$t('common.search')"
              @keyup.enter="applyFilters"
            />
            <button type="button" class="fk-iconbtn" :aria-label="$t('common.search')" @click="applyFilters">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="!rows.length"
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('notificationTransactions.empty') }}</h3>
          </div>

          <template v-else>
            <div class="overflow-visible rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('notificationTransactions.colTime') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('notificationTransactions.colChannel') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('notificationTransactions.colTo') }}</th>
                    <th class="px-4 py-3 text-start font-semibold">{{ $t('notificationTransactions.colSubject') }}</th>
                    <th class="px-4 py-3 text-start font-semibold whitespace-nowrap">{{ $t('notificationTransactions.colStatus') }}</th>
                    <th class="px-4 py-3 text-center font-semibold whitespace-nowrap">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in rows" :key="row.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">{{ formatDate(row.created_at) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ channelLabel(row.channel) }}</td>
                    <td class="px-4 py-3 text-gray-800" dir="ltr">{{ row.to_address }}</td>
                    <td class="px-4 py-3 text-gray-800 max-w-[14rem] truncate" :title="row.subject || ''">
                      {{ row.subject || row.template_key || '—' }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        :class="statusClass(row.status)"
                      >
                        {{ statusLabel(row.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-center">
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
              :show="rows.length > 0"
              :disabled="loading"
              @update:page="goToPage"
            />
          </template>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import {
  notificationTransactionService,
  type NotificationTransactionRow,
  type NotificationTransactionStatus,
} from '@/services/notification-transaction.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const route = useRoute()
const router = useRouter()

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
const filters = reactive({ channel: '', status: '', search: '' })

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
  if (status === 'failed') return 'bg-red-100 text-red-800'
  if (status === 'skipped') return 'bg-slate-100 text-slate-700'
  return 'bg-emerald-100 text-emerald-800'
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

function goToPage(p: number) {
  page.value = p
  void load()
}

onMounted(() => {
  void load()
})
</script>
