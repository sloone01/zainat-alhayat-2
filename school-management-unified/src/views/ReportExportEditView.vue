<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="pageTitle">
        <template #leading>
          <router-link
            to="/reports/exports"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToExports')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ pageTitle }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :disabled="saving || loading"
              @click="onSave"
            >
              {{ $t('common.save') }}
            </button>
          </div>
        </header>

        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
          <FikrLoader />
          <span class="text-sm">{{ $t('common.loading') }}</span>
        </div>

        <div v-else class="space-y-8 p-6">
          <div>
            <h3 class="mb-3 text-sm font-semibold text-navy-800">{{ $t('reports.studentExportColumns') }}</h3>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <label
                v-for="key in availableColumns"
                :key="key"
                class="flex items-center gap-2 rounded-lg border border-fikr-hairline px-3 py-2.5 text-sm text-navy-800"
              >
                <input
                  v-model="selectedColumns"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500/30"
                  :value="key"
                />
                <span>{{ columnLabel(key) }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="fk-flabel" for="report-export-template">{{ $t('reports.exportTemplate') }}</label>
            <div class="flex flex-wrap items-end gap-2">
              <select
                id="report-export-template"
                v-model="templateId"
                class="fk-field max-w-md"
              >
                <option value="">{{ $t('reports.studentExportLayoutNone') }}</option>
                <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
                  {{ templateLabel(tmpl) }}
                </option>
              </select>
              <router-link to="/reports/export-templates" class="fk-btn fk-btn--pearl">
                {{ $t('reports.manageTemplates') }}
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import { useFeedback } from '@/composables/useFeedback'
import reportExportService, {
  type ReportExportTemplateOption,
} from '@/services/report-export.service'

const { t, locale, te } = useI18n()
const route = useRoute()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')

const reportKey = computed(() => String(route.params.key || '').trim())
const loading = ref(true)
const saving = ref(false)
const pageTitle = ref(t('reports.exportsTitle'))
const availableColumns = ref<string[]>([])
const selectedColumns = ref<string[]>([])
const templateId = ref('')
const templates = ref<ReportExportTemplateOption[]>([])

function columnLabel(key: string) {
  const i18nKey = `reports.studentExportCol.${key}`
  return te(i18nKey) ? t(i18nKey) : key
}

function templateLabel(tmpl: ReportExportTemplateOption) {
  if (isRTL.value && tmpl.name_ar?.trim()) return tmpl.name_ar
  return tmpl.name
}

async function load() {
  if (!reportKey.value) return
  loading.value = true
  try {
    const data = await reportExportService.getExport(reportKey.value, locale.value)
    pageTitle.value = isRTL.value ? data.name_ar || data.name_en : data.name_en
    availableColumns.value = data.available_columns || []
    selectedColumns.value = data.columns?.length ? data.columns : []
    templateId.value = data.template_id || ''
    templates.value = data.templates || []
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.studentExportLoadFailed'), t('common.error'))
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!selectedColumns.value.length) {
    feedback.error(t('reports.studentExportColumnsRequired'), t('common.error'))
    return
  }
  saving.value = true
  try {
    await reportExportService.saveExport(reportKey.value, {
      columns: selectedColumns.value,
      template_id: templateId.value || null,
    })
    feedback.success(t('reports.studentExportSaved'), t('common.success'))
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.studentExportSaveFailed'), t('common.error'))
  } finally {
    saving.value = false
  }
}

watch(reportKey, () => {
  void load()
})

onMounted(() => {
  void load()
})
</script>
