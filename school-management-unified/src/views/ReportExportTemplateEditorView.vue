<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="pageTitle" />

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <section v-else class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="flex min-w-0 items-center gap-3">
            <router-link
              to="/reports/export-templates"
              class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
              :aria-label="$t('reports.backToTemplates')"
            >
              <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </router-link>
            <h2 class="fk-card__title truncate">{{ pageTitle }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="onSave">
              {{ $t('common.save') }}
            </button>
          </div>
        </header>

        <div class="space-y-5 p-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="fk-flabel" for="ret-name">{{ $t('notificationLayouts.nameEn') }}</label>
              <input id="ret-name" v-model="form.name" type="text" class="fk-field" />
            </div>
            <div>
              <label class="fk-flabel" for="ret-name-ar">{{ $t('notificationLayouts.nameAr') }}</label>
              <input id="ret-name-ar" v-model="form.name_ar" type="text" class="fk-field" dir="rtl" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label class="flex items-center gap-2 text-sm text-navy-800">
              <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600" />
              {{ $t('notificationLayouts.badgeDefault') }}
            </label>

            <div>
              <span class="fk-flabel">{{ $t('reports.pageOrientation') }}</span>
              <div class="flex flex-wrap gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="pageOrientation === 'portrait' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="setPageOrientation('portrait')"
                >
                  {{ $t('reports.pagePortrait') }}
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="pageOrientation === 'landscape' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="setPageOrientation('landscape')"
                >
                  {{ $t('reports.pageLandscape') }}
                </button>
              </div>
            </div>

            <div class="ms-auto">
              <span class="fk-flabel">{{ $t('notificationTemplates.localeTabsAria') }}</span>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="editLang === 'en' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="editLang = 'en'"
                >
                  EN
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="editLang === 'ar' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="editLang = 'ar'"
                >
                  AR
                </button>
              </div>
            </div>
          </div>

          <div class="grid items-start gap-5 xl:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.15fr)]">
            <NotificationTemplateEmailEditor
              v-model="activeBody"
              :rtl="editLang === 'ar'"
              :disabled="saving"
              :remount-key="editLang"
            />

            <div
              ref="previewStage"
              class="relative flex h-[min(78vh,840px)] min-h-[480px] items-center justify-center overflow-hidden rounded-xl border border-fikr-hairline bg-white"
            >
              <div
                v-if="previewLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
              >
                <FikrLoader size="sm" />
              </div>
              <div
                class="relative overflow-hidden border border-gray-200 bg-white shadow-sm"
                dir="ltr"
                :style="frameBoxStyle"
              >
                <iframe
                  class="absolute left-0 top-0 block border-0 bg-white"
                  title="export-template-preview"
                  :style="frameStyle"
                  :srcdoc="previewHtml || ''"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrLoader from '@/components/FikrLoader.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
import { useFeedback } from '@/composables/useFeedback'
import { authService } from '@/services'
import reportExportService from '@/services/report-export.service'
import {
  composeReportExportHtml,
  editorDocumentHtml,
  syncEditorTableColumns,
  reportBodyInner,
  reportLayoutRowVariables,
  reportPageOrientation,
  reportPagePixelSize,
  fillReportDate,
  sampleReportRowsHtml,
  type ReportPageOrientation,
} from '@/utils/report-export-layout'

const { t, te, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const isNew = computed(() => route.params.id === 'new' || route.name === 'reports-export-template-new')

const loading = ref(true)
const saving = ref(false)
const previewLoading = ref(false)
const editLang = ref<'en' | 'ar'>(locale.value === 'ar' ? 'ar' : 'en')
const bodyEn = ref('')
const bodyAr = ref('')
const pageOrientation = ref<ReportPageOrientation>('portrait')
const previewHtml = ref('')
const previewStage = ref<HTMLElement | null>(null)
const stageBox = ref({ width: 720, height: 640 })
const pageTitle = computed(() =>
  isNew.value ? t('reports.exportTemplateAdd') : t('reports.exportTemplateEdit'),
)

const form = reactive({
  name: '',
  name_ar: '',
  html_en: '',
  html_ar: '',
  is_default: false,
})

const activeBody = computed({
  get: () => (editLang.value === 'ar' ? bodyAr.value : bodyEn.value),
  set: (value: string) => {
    if (editLang.value === 'ar') bodyAr.value = value
    else bodyEn.value = value
    syncShells()
  },
})

const previewScale = computed(() => {
  const page = reportPagePixelSize(pageOrientation.value)
  const pad = 32
  const width = Math.max(stageBox.value.width - pad, 160)
  const height = Math.max(stageBox.value.height - pad, 160)
  return Math.min(1, width / page.width, height / page.height)
})

const frameBoxStyle = computed(() => {
  const page = reportPagePixelSize(pageOrientation.value)
  const scale = previewScale.value
  return {
    width: `${Math.round(page.width * scale)}px`,
    height: `${Math.round(page.height * scale)}px`,
  }
})

const frameStyle = computed(() => {
  const page = reportPagePixelSize(pageOrientation.value)
  return {
    width: `${page.width}px`,
    height: `${page.height}px`,
    transform: `scale(${previewScale.value})`,
    transformOrigin: '0 0',
  }
})

function syncShells() {
  form.html_en = composeReportExportHtml('en', pageOrientation.value, bodyEn.value)
  form.html_ar = composeReportExportHtml('ar', pageOrientation.value, bodyAr.value)
}

function setPageOrientation(next: ReportPageOrientation) {
  pageOrientation.value = next
  syncShells()
}

const runPreview = useDebounceFn(async () => {
  const html = (editLang.value === 'ar' ? form.html_ar || form.html_en : form.html_en).trim()
  if (!html) {
    previewHtml.value = ''
    return
  }
  previewLoading.value = true
  try {
    const schoolId = authService.getStoredUser()?.school_id
    const res = await reportExportService.previewTemplate({
      locale: editLang.value,
      html: fillReportDate(html, editLang.value),
      sample_content: sampleReportRowsHtml(editLang.value, reportLayoutRowVariables(html)),
      ...(schoolId ? { school_id: String(schoolId) } : {}),
    })
    previewHtml.value = res.html || ''
  } catch {
    previewHtml.value = html
  } finally {
    previewLoading.value = false
  }
}, 350)

function columnHeading(key: string, lang: 'en' | 'ar') {
  const i18nKey = `reports.studentExportCol.${key}`
  return te(i18nKey) ? t(i18nKey, {}, { locale: lang }) : key
}

/** The export that prints with this template owns the field list. */
async function columnsForTemplate(id: string, isDefault: boolean): Promise<string[] | null> {
  const items = await reportExportService.listExports().catch(() => [])
  const explicit = items.filter((item) => item.template_id === id)
  const fallback = isDefault ? items.filter((item) => !item.template_id) : []
  const linked = explicit.length ? explicit : fallback
  if (linked.length !== 1 || !linked[0].columns?.length) return null
  return linked[0].columns
}

function applyLinkedColumns(columns: string[]) {
  bodyEn.value = syncEditorTableColumns(
    bodyEn.value,
    columns.map((key) => ({ key, label: columnHeading(key, 'en') })),
  )
  bodyAr.value = syncEditorTableColumns(
    bodyAr.value,
    columns.map((key) => ({ key, label: columnHeading(key, 'ar') })),
  )
}

async function load() {
  loading.value = true
  try {
    if (isNew.value) {
      form.name = t('reports.exportTemplateNewName')
      form.name_ar = ''
      form.is_default = false
      pageOrientation.value = 'portrait'
      bodyEn.value = editorDocumentHtml('en', '')
      bodyAr.value = editorDocumentHtml('ar', '')
      syncShells()
    } else {
      const id = String(route.params.id)
      const row = await reportExportService.getTemplate(id)
      form.name = row.name
      form.name_ar = row.name_ar || ''
      form.is_default = row.is_default
      pageOrientation.value = reportPageOrientation(row.html_en || row.html_ar)
      bodyEn.value = editorDocumentHtml('en', reportBodyInner(row.html_en))
      bodyAr.value = editorDocumentHtml('ar', reportBodyInner(row.html_ar || ''))
      const columns = await columnsForTemplate(row.id, row.is_default)
      if (columns) applyLinkedColumns(columns)
      syncShells()
    }
    void runPreview()
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.exportTemplatesLoadFailed'), t('common.error'))
  } finally {
    loading.value = false
  }
}

async function onSave() {
  if (!form.name.trim() || !form.html_en.trim()) {
    feedback.error(t('reports.exportTemplateRequired'), t('common.error'))
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      html_en: form.html_en,
      html_ar: form.html_ar.trim() || null,
      is_default: form.is_default,
    }
    if (isNew.value) {
      const created = await reportExportService.createTemplate(payload)
      feedback.success(t('reports.exportTemplateSaved'), t('common.success'))
      await router.replace(`/reports/export-templates/${created.id}`)
    } else {
      await reportExportService.updateTemplate(String(route.params.id), payload)
      feedback.success(t('reports.exportTemplateSaved'), t('common.success'))
    }
  } catch (err: unknown) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: string }).message || '')
        : ''
    feedback.error(message || t('reports.exportTemplateSaveFailed'), t('common.error'))
  } finally {
    saving.value = false
  }
}

watch([() => form.html_en, () => form.html_ar, editLang], () => {
  void runPreview()
})

watch(previewStage, (el, _prev, onCleanup) => {
  if (!el || typeof ResizeObserver === 'undefined') return
  const observer = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (!rect) return
    stageBox.value = { width: rect.width, height: rect.height }
  })
  observer.observe(el)
  onCleanup(() => observer.disconnect())
})

onMounted(() => {
  void load()
})
</script>
