<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-primary-800 to-teal-800 p-6 text-white shadow-xl sm:p-8">
        <div class="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div class="relative">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{{ $t('activityLog.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-200/95">{{ $t('activityLog.subtitle') }}</p>
        </div>
      </section>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
        <div class="flex flex-wrap items-center gap-3">
          <span>{{ error }}</span>
          <button type="button" class="font-semibold text-red-700 underline hover:text-red-900" @click="load">
            {{ $t('platformBilling.tryAgain') }}
          </button>
        </div>
      </div>

      <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
        <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
          <div class="flex flex-wrap items-end gap-3">
            <div class="min-w-[12rem] flex-1">
              <label class="field-label">{{ $t('common.search') }}</label>
              <input
                v-model="filters.search"
                type="search"
                class="input-field"
                :placeholder="$t('activityLog.searchPlaceholder')"
                @keyup.enter="applyFilters"
              />
            </div>
            <div>
              <label class="field-label">{{ $t('activityLog.colAction') }}</label>
              <select v-model="filters.method" class="input-field" @change="applyFilters">
                <option value="">{{ $t('activityLog.allMethods') }}</option>
                <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">{{ $t('activityLog.from') }}</label>
              <input v-model="filters.from" type="date" class="input-field" @change="applyFilters" />
            </div>
            <div>
              <label class="field-label">{{ $t('activityLog.to') }}</label>
              <input v-model="filters.to" type="date" class="input-field" @change="applyFilters" />
            </div>
            <button
              type="button"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              @click="applyFilters"
            >
              {{ $t('activityLog.refresh') }}
            </button>
            <button
              v-if="hasFilters"
              type="button"
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              @click="clearFilters"
            >
              {{ $t('activityLog.clearFilters') }}
            </button>
          </div>
          <p v-if="!loading" class="mt-3 text-xs text-gray-500">
            {{ $t('activityLog.count', { count: total }) }}
          </p>
        </div>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <div
            v-else-if="rows.length === 0"
            class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-6 py-16 text-center"
          >
            <h3 class="text-base font-semibold text-gray-900">{{ $t('activityLog.empty') }}</h3>
            <p class="mt-1 max-w-sm text-sm text-gray-500">{{ $t('activityLog.emptyHint') }}</p>
          </div>

          <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="whitespace-nowrap px-4 py-3 text-start">{{ $t('activityLog.colTime') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('activityLog.colUser') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('activityLog.colAction') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('activityLog.colStatus') }}</th>
                  <th class="px-4 py-3 text-start">{{ $t('activityLog.colError') }}</th>
                  <th class="whitespace-nowrap px-4 py-3 text-start">{{ $t('activityLog.colDuration') }}</th>
                  <th class="whitespace-nowrap px-4 py-3 text-start">{{ $t('activityLog.colIp') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="row in rows" :key="row.id" class="hover:bg-primary-50/20">
                  <td class="whitespace-nowrap px-4 py-3 tabular-nums text-gray-700" dir="ltr">
                    {{ formatTime(row.created_at) }}
                  </td>
                  <td class="px-4 py-3">
                    <!-- Signed-in is decided by user_id: some accounts have no username set. -->
                    <template v-if="row.user_id">
                      <div v-if="row.username" class="font-medium text-gray-900">{{ row.username }}</div>
                      <div v-else class="font-mono text-xs text-gray-700" dir="ltr">
                        {{ row.user_id.slice(0, 8) }}
                      </div>
                    </template>
                    <div v-else class="font-medium text-gray-400">{{ $t('activityLog.anonymous') }}</div>
                    <div v-if="row.user_role" class="text-xs text-gray-500">{{ row.user_role }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ring-1"
                      :class="methodClass(row.method)"
                      dir="ltr"
                    >{{ row.method }}</span>
                    <span class="ms-2 break-all font-mono text-xs text-gray-600" dir="ltr">{{ row.path }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ring-1"
                      :class="statusClass(row.status_code)"
                    >{{ row.status_code }}</span>
                  </td>
                  <td class="max-w-xs px-4 py-3">
                    <div v-if="row.error_code">
                      <span class="inline-flex rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 ring-1 ring-red-100" dir="ltr">
                        {{ row.error_code }}
                      </span>
                      <p
                        v-if="row.error_message"
                        class="mt-0.5 break-words text-xs text-gray-600"
                        :title="row.error_message"
                        dir="ltr"
                      >
                        {{ row.error_message }}
                      </p>
                    </div>
                    <span v-else class="text-gray-300">{{ $t('activityLog.noError') }}</span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 tabular-nums text-gray-600" dir="ltr">{{ row.duration_ms }} ms</td>
                  <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-500" dir="ltr">{{ row.ip || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!loading && pages > 1" class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span class="text-xs text-gray-500">{{ $t('activityLog.pageOf', { page, pages }) }}</span>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                :disabled="page <= 1"
                @click="goTo(page - 1)"
              >
                {{ $t('activityLog.prev') }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                :disabled="page >= pages"
                @click="goTo(page + 1)"
              >
                {{ $t('activityLog.next') }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { activityLogService, type ActivityLogRow } from '@/services/activity-log.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const rows = ref<ActivityLogRow[]>([])
const methods = ref<string[]>([])
const total = ref(0)
const page = ref(1)
const pages = ref(1)
const limit = 50

const filters = reactive({ search: '', method: '', from: '', to: '' })

const hasFilters = computed(() =>
  Boolean(filters.search || filters.method || filters.from || filters.to),
)

function methodClass(method: string) {
  switch (method) {
    case 'POST':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
    case 'DELETE':
      return 'bg-red-50 text-red-700 ring-red-100'
    default:
      return 'bg-amber-50 text-amber-800 ring-amber-100'
  }
}

function statusClass(status: number) {
  if (status >= 500) return 'bg-red-50 text-red-700 ring-red-100'
  if (status >= 400) return 'bg-amber-50 text-amber-800 ring-amber-100'
  return 'bg-emerald-50 text-emerald-800 ring-emerald-100'
}

function formatTime(value: string) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-GB', { hour12: false })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await activityLogService.list({
      page: page.value,
      limit,
      search: filters.search,
      method: filters.method,
      // Cover the whole of the chosen end day, not just its midnight boundary.
      from: filters.from || undefined,
      to: filters.to ? `${filters.to}T23:59:59` : undefined,
    })
    rows.value = data.logs
    total.value = data.total
    pages.value = data.pages
    page.value = data.page
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string } }; message?: string }
    error.value = ax.response?.data?.message || ax.message || t('activityLog.loadError')
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  load()
}

function clearFilters() {
  filters.search = ''
  filters.method = ''
  filters.from = ''
  filters.to = ''
  applyFilters()
}

function goTo(next: number) {
  page.value = Math.min(Math.max(1, next), pages.value)
  load()
}

onMounted(async () => {
  try {
    methods.value = await activityLogService.methods()
  } catch {
    methods.value = ['POST', 'PUT', 'PATCH', 'DELETE']
  }
  await load()
})
</script>

<style scoped>
.field-label {
  @apply mb-1 block text-sm font-medium text-gray-700;
}
.input-field {
  @apply w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
