<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('support.adminTitle')" />

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-elev p-0">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <h2 class="fk-card__title">{{ $t('support.allRequests') }} ({{ total }})</h2>
          <select v-model="statusFilter" class="fk-field w-auto min-w-[9rem]" @change="onFilter">
            <option value="">{{ $t('support.allStatuses') }}</option>
            <option v-for="s in SUPPORT_REQUEST_STATUSES" :key="s" :value="s">{{ $t(`support.status.${s}`) }}</option>
          </select>
        </header>
        <div v-if="loading && !routePageLoading" class="flex items-center justify-center py-12"><FikrLoader /></div>
        <div v-else-if="!items.length" class="fk-empty">
          <p class="fk-empty__title">{{ $t('support.empty') }}</p>
        </div>
        <template v-else>
        <ul class="divide-y divide-fikr-hairline">
          <li v-for="item in items" :key="item.id" class="px-5 py-4 sm:px-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <button type="button" class="min-w-0 flex-1 text-start" @click="toggle(item.id)">
                <span class="flex items-center gap-2">
                  <span class="truncate font-medium text-fikr-ink">{{ item.title }}</span>
                  <span
                    v-if="item.fixed"
                    class="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100"
                  >
                    {{ $t('support.fixed') }}
                  </span>
                </span>
                <span class="text-xs text-fikr-ink-muted">
                  {{ userName(item) }} · {{ formatDate(item.created_at) }}
                </span>
              </button>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--sm"
                  :class="item.fixed ? 'fk-btn--primary' : 'fk-btn--pearl'"
                  :disabled="busyId === item.id"
                  @click="toggleFixed(item)"
                >
                  {{ item.fixed ? $t('support.markUnfixed') : $t('support.markFixed') }}
                </button>
                <select
                  :value="item.status"
                  class="fk-field w-auto min-w-[9rem]"
                  :aria-label="$t('support.statusLabel')"
                  @change="changeStatus(item, ($event.target as HTMLSelectElement).value as SupportRequestStatus)"
                >
                  <option v-for="s in SUPPORT_REQUEST_STATUSES" :key="s" :value="s">{{ $t(`support.status.${s}`) }}</option>
                </select>
              </div>
            </div>
            <div v-if="expanded === item.id" class="mt-3">
              <div v-if="detailLoading === item.id" class="flex justify-center py-6"><FikrLoader size="sm" /></div>
              <SupportRequestBody v-else-if="item.description_html" :html="item.description_html" />
            </div>
          </li>
        </ul>
        <FikrPagination
          wrapper-class="mx-5 mb-5 sm:mx-6"
          :page="currentPage"
          :pages="totalPages"
          :show="total > 0"
          @update:page="goToPage"
        />
        </template>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import SupportRequestBody from '@/components/SupportRequestBody.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { routePageLoading } from '@/router/route-loading'
import supportService, {
  SUPPORT_REQUEST_STATUSES,
  type SupportRequest,
  type SupportRequestStatus,
} from '@/services/support.service'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const items = ref<SupportRequest[]>([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref<SupportRequestStatus | ''>('')
const expanded = ref<string | null>(null)
const detailLoading = ref<string | null>(null)
const busyId = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const PAGE_SIZE = 20

async function load() {
  loading.value = true
  error.value = ''
  expanded.value = null
  try {
    const page = await supportService.getAll(statusFilter.value || undefined, currentPage.value, PAGE_SIZE)
    items.value = page.items
    total.value = page.total
    totalPages.value = page.pages
    currentPage.value = page.page
  } catch {
    error.value = t('support.loadFailed')
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  currentPage.value = page
  void load()
}

function onFilter() {
  currentPage.value = 1
  void load()
}

async function changeStatus(item: SupportRequest, status: SupportRequestStatus) {
  error.value = ''
  try {
    const updated = await supportService.updateStatus(item.id, status)
    item.status = updated.status
  } catch {
    error.value = t('support.statusFailed')
  }
}

async function toggleFixed(item: SupportRequest) {
  if (busyId.value) return
  busyId.value = item.id
  error.value = ''
  try {
    const updated = await supportService.updateFixed(item.id, !item.fixed)
    item.fixed = updated.fixed
    item.fixed_at = updated.fixed_at
    item.status = updated.status
  } catch {
    error.value = t('support.statusFailed')
  } finally {
    busyId.value = null
  }
}

async function toggle(id: string) {
  if (expanded.value === id) {
    expanded.value = null
    return
  }
  expanded.value = id
  const item = items.value.find((row) => row.id === id)
  if (!item || item.description_html != null) return
  detailLoading.value = id
  try {
    const full = await supportService.getOne(id)
    item.description_html = full.description_html
    item.context = full.context
  } catch {
    error.value = t('support.loadFailed')
    expanded.value = null
  } finally {
    detailLoading.value = null
  }
}

function userName(item: SupportRequest): string {
  const u = item.user
  if (!u) return ''
  const ar = [u.first_name_ar, u.last_name_ar].filter(Boolean).join(' ')
  const en = [u.first_name_en || u.firstName, u.last_name_en || u.lastName].filter(Boolean).join(' ')
  return (locale.value === 'ar' ? ar || en : en || ar) || u.username || u.email || ''
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(locale.value === 'ar' ? 'ar' : 'en')
}

onMounted(load)
</script>
