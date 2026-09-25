<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader :title="pageTitle">
        <template #leading>
          <router-link
            to="/reports/export-templates"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
            :aria-label="$t('reports.backToTemplates')"
          >
            <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
        </template>
      </FikrPageHeader>

      <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-fikr-ink-muted">
        <FikrLoader />
        <span class="text-sm">{{ $t('common.loading') }}</span>
      </div>

      <section v-else class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ pageTitle }}</h2>
          </div>
          <div class="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="onSave">
              {{ $t('common.save') }}
            </button>
          </div>
        </header>

        <div class="grid gap-6 p-6 xl:grid-cols-2">
          <div class="space-y-4">
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

            <label class="flex items-center gap-2 text-sm text-navy-800">
              <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600" />
              {{ $t('notificationLayouts.badgeDefault') }}
            </label>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm"
                :class="langTab === 'en' ? '!border-primary-300 !bg-primary-50' : ''"
                @click="langTab = 'en'"
              >
                EN
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl fk-btn--sm"
                :class="langTab === 'ar' ? '!border-primary-300 !bg-primary-50' : ''"
                @click="langTab = 'ar'"
              >
                AR
              </button>
              <button type="button" class="fk-btn fk-btn--pearl fk-btn--sm" @click="applyVisualDefault">
                {{ $t('reports.exportTemplateResetVisual') }}
              </button>
            </div>

            <div>
              <label class="fk-flabel" for="ret-html">{{ $t('notificationLayouts.advancedHtml') }}</label>
              <textarea
                id="ret-html"
                v-model="activeHtml"
                rows="16"
                class="fk-field font-mono text-xs"
                :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
              />
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-sm font-semibold text-navy-800">{{ $t('notificationTemplates.previewHeading') }}</p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="previewLang === 'en' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="previewLang = 'en'"
                >
                  EN
                </button>
                <button
                  type="button"
                  class="fk-btn fk-btn--pearl fk-btn--sm"
                  :class="previewLang === 'ar' ? '!border-primary-300 !bg-primary-50' : ''"
                  @click="previewLang = 'ar'"
                >
                  AR
                </button>
              </div>
            </div>
            <div class="relative min-h-[320px] overflow-hidden rounded-xl border border-fikr-hairline bg-white">
              <div
                v-if="previewLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
              >
                <FikrLoader size="sm" />
              </div>
              <iframe
                class="h-[480px] w-full border-0"
                title="export-template-preview"
                :srcdoc="previewHtml || ''"
              />
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
import { useFeedback } from '@/composables/useFeedback'
import { authService } from '@/services'
import reportExportService from '@/services/report-export.service'
import {
  applyBuilderToHtmlPair,
  defaultLayoutBuilderConfig,
} from '@/utils/notification-layout-builder'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const feedback = useFeedback()
const isRTL = computed(() => locale.value === 'ar')
const isNew = computed(() => route.params.id === 'new' || route.name === 'reports-export-template-new')

const loading = ref(true)
const saving = ref(false)
const previewLoading = ref(false)
const langTab = ref<'en' | 'ar'>(locale.value === 'ar' ? 'ar' : 'en')
const previewLang = ref<'en' | 'ar'>(locale.value === 'ar' ? 'ar' : 'en')
const previewHtml = ref('')
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

const activeHtml = computed({
  get: () => (langTab.value === 'ar' ? form.html_ar : form.html_en),
  set: (v: string) => {
    if (langTab.value === 'ar') form.html_ar = v
    else form.html_en = v
  },
})

function applyVisualDefault() {
  const pair = applyBuilderToHtmlPair(defaultLayoutBuilderConfig())
  form.html_en = pair.html_en
  form.html_ar = pair.html_ar
}

const runPreview = useDebounceFn(async () => {
  const html = (previewLang.value === 'ar' ? form.html_ar || form.html_en : form.html_en).trim()
  if (!html) {
    previewHtml.value = ''
    return
  }
  previewLoading.value = true
  try {
    const schoolId = authService.getStoredUser()?.school_id
    const res = await reportExportService.previewTemplate({
      locale: previewLang.value,
      html,
      sample_content:
        previewLang.value === 'ar'
          ? '<table style="width:100%;border-collapse:collapse"><tr><th>اسم</th><th>مجموعة</th></tr><tr><td>آدم</td><td>أ</td></tr></table>'
          : '<table style="width:100%;border-collapse:collapse"><tr><th>Name</th><th>Group</th></tr><tr><td>Adam</td><td>A</td></tr></table>',
      ...(schoolId ? { school_id: String(schoolId) } : {}),
    })
    previewHtml.value = res.html || ''
  } catch {
    previewHtml.value = html
  } finally {
    previewLoading.value = false
  }
}, 350)

async function load() {
  loading.value = true
  try {
    if (isNew.value) {
      form.name = t('reports.exportTemplateNewName')
      form.name_ar = ''
      form.is_default = false
      applyVisualDefault()
    } else {
      const id = String(route.params.id)
      const row = await reportExportService.getTemplate(id)
      form.name = row.name
      form.name_ar = row.name_ar || ''
      form.html_en = row.html_en
      form.html_ar = row.html_ar || row.html_en
      form.is_default = row.is_default
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

watch([() => form.html_en, () => form.html_ar, previewLang], () => {
  void runPreview()
})

onMounted(() => {
  void load()
})
</script>
