<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="$t('support.title')" :subtitle="$t('support.subtitle')" />

      <section class="fk-elev mb-6 p-5 sm:p-6">
        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label class="fk-label" for="support-title">{{ $t('support.requestTitle') }}</label>
            <input
              id="support-title"
              v-model="title"
              type="text"
              maxlength="200"
              class="fk-field"
              :placeholder="$t('support.requestTitlePlaceholder')"
              required
            />
          </div>
          <div>
            <span class="fk-label">{{ $t('support.description') }}</span>
            <SupportRichEditor ref="editorRef" :rtl="isRTL" :disabled="saving" />
            <p class="mt-1 text-xs text-fikr-ink-muted">{{ $t('support.imageHint') }}</p>
          </div>
          <div v-if="reportContext" class="rounded-xl border border-fikr-hairline bg-gray-50 p-4 text-sm">
            <div class="mb-2 flex items-center justify-between gap-3">
              <span class="font-medium text-fikr-ink">{{ $t('support.report.attached') }}</span>
              <button type="button" class="text-xs text-red-600 hover:underline" :disabled="saving" @click="removeReport">
                {{ $t('support.report.remove') }}
              </button>
            </div>
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <dt class="text-fikr-ink-muted">{{ $t('support.report.page') }}</dt>
              <dd class="break-all" dir="ltr">{{ reportContext.page_url }}</dd>
              <template v-if="reportUser">
                <dt class="text-fikr-ink-muted">{{ $t('support.report.user') }}</dt>
                <dd>{{ reportUser.name }}<span v-if="reportUser.email"> · {{ reportUser.email }}</span></dd>
              </template>
              <dt class="text-fikr-ink-muted">{{ $t('support.report.time') }}</dt>
              <dd>{{ formatDate(reportContext.captured_at || '') }}</dd>
              <dt class="text-fikr-ink-muted">{{ $t('support.report.browser') }}</dt>
              <dd class="break-all" dir="ltr">{{ reportContext.user_agent }}</dd>
              <dt class="text-fikr-ink-muted">{{ $t('support.report.consoleErrors') }}</dt>
              <dd>{{ reportContext.console_errors?.length || 0 }}</dd>
              <dt class="text-fikr-ink-muted">{{ $t('support.report.screenshot') }}</dt>
              <dd>{{ reportContext.screenshot_url ? $t('support.report.screenshotAttached') : $t('support.report.screenshotMissing') }}</dd>
            </dl>
          </div>
          <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>
          <div v-if="success" class="fk-alert fk-alert--ok">{{ success }}</div>
          <div class="flex justify-end">
            <button type="submit" class="fk-btn fk-btn--navy" :disabled="saving || editorRef?.uploading">
              {{ saving ? $t('support.sending') : $t('support.submit') }}
            </button>
          </div>
        </form>
      </section>

      <section class="fk-elev p-0">
        <header class="border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <h2 class="fk-card__title">{{ $t('support.myRequests') }}</h2>
        </header>
        <div v-if="loading && !routePageLoading" class="flex items-center justify-center py-12"><FikrLoader /></div>
        <div v-else-if="!items.length" class="fk-empty">
          <p class="fk-empty__title">{{ $t('support.empty') }}</p>
        </div>
        <template v-else>
          <ul class="divide-y divide-fikr-hairline">
            <li v-for="item in items" :key="item.id" class="px-5 py-4 sm:px-6">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 text-start"
                @click="toggle(item.id)"
              >
                <span class="min-w-0">
                  <span class="block truncate font-medium text-fikr-ink">{{ item.title }}</span>
                  <span class="text-xs text-fikr-ink-muted">{{ formatDate(item.created_at) }}</span>
                </span>
                <span class="fk-pill" :class="statusClass(item.status)">{{ $t(`support.status.${item.status}`) }}</span>
              </button>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import SupportRichEditor from '@/components/SupportRichEditor.vue'
import SupportRequestBody from '@/components/SupportRequestBody.vue'
import FikrPagination from '@/components/FikrPagination.vue'
import { routePageLoading } from '@/router/route-loading'
import supportService, {
  type SupportRequest,
  type SupportRequestContext,
  type SupportRequestStatus,
} from '@/services/support.service'
import {
  hasPendingIssueReport,
  takePendingIssueReport,
  type IssueReportDraft,
} from '@/utils/issue-report'

const { t, locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const editorRef = ref<InstanceType<typeof SupportRichEditor> | null>(null)
const title = ref('')
const saving = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(true)
const items = ref<SupportRequest[]>([])
const expanded = ref<string | null>(null)
const detailLoading = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)
const PAGE_SIZE = 20
/** Diagnostics from the "Report issue" button, sent along with the request. */
const reportContext = ref<SupportRequestContext | null>(null)
const reportUser = ref<IssueReportDraft['user']>(null)

/** Pre-fill the form from a pending "Report issue" capture. The user still writes and submits. */
async function applyPendingReport() {
  const draft = takePendingIssueReport()
  if (!draft) return
  reportContext.value = { ...draft.context }
  reportUser.value = draft.user
  if (!draft.screenshot) return

  // Wait for the rich editor (and TipTap) after route navigation — one nextTick is not enough.
  for (let i = 0; i < 50 && !editorRef.value; i++) {
    await nextTick()
    await new Promise((r) => setTimeout(r, 40))
  }
  const editor = editorRef.value
  if (!editor) return
  await editor.waitForEditor()
  const [url] = await editor.insertImages([draft.screenshot])
  if (url && reportContext.value) reportContext.value.screenshot_url = url
}

function removeReport() {
  reportContext.value = null
  reportUser.value = null
}

watch(hasPendingIssueReport, (draft) => {
  if (draft) void applyPendingReport()
})

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string }
  const msg = e?.response?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  return msg || fallback
}

async function load() {
  loading.value = true
  expanded.value = null
  try {
    const page = await supportService.mine(currentPage.value, PAGE_SIZE)
    items.value = page.items
    total.value = page.total
    totalPages.value = page.pages
    currentPage.value = page.page
  } catch (err) {
    error.value = errorMessage(err, t('support.loadFailed'))
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  currentPage.value = page
  void load()
}

async function submit() {
  error.value = ''
  success.value = ''
  const editor = editorRef.value
  if (!title.value.trim()) {
    error.value = t('support.titleRequired')
    return
  }
  if (!editor || editor.isEmpty()) {
    error.value = t('support.descriptionRequired')
    return
  }
  saving.value = true
  try {
    await supportService.create({
      title: title.value.trim(),
      description_html: editor.getStorableHtml(),
      ...(reportContext.value ? { context: reportContext.value } : {}),
    })
    title.value = ''
    editor.clear()
    removeReport()
    success.value = t('support.submitted')
    currentPage.value = 1
    await load()
  } catch (err) {
    error.value = errorMessage(err, t('support.submitFailed'))
  } finally {
    saving.value = false
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
  } catch (err) {
    error.value = errorMessage(err, t('support.loadFailed'))
    expanded.value = null
  } finally {
    detailLoading.value = null
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(locale.value === 'ar' ? 'ar' : 'en')
}

function statusClass(status: SupportRequestStatus) {
  if (status === 'resolved' || status === 'closed') return 'fk-pill--teal'
  return 'fk-pill--outline'
}

onMounted(() => {
  void load()
  void applyPendingReport()
})
</script>
