<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationLayouts.title')"
        :subtitle="isPlatform ? $t('notificationLayouts.platformSubtitleVisual') : $t('notificationLayouts.subtitleVisual')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>
      <div v-if="flashOk" class="fk-alert fk-alert--ok">{{ flashOk }}</div>

      <div v-if="loading" class="rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
        <div class="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <p class="mt-4 text-sm text-gray-600">{{ $t('common.loading') }}…</p>
      </div>

      <template v-else>
        <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div class="flex flex-nowrap items-end gap-2">
            <div class="min-w-0 flex-1">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-layout-select">
                {{ $t('notificationLayouts.selectLayout') }}
              </label>
              <select
                id="nl-layout-select"
                class="fk-field fk-field--sm w-full"
                :value="selectedId"
                :disabled="!layouts.length"
                @change="onLayoutDropdownChange"
              >
                <option v-if="!layouts.length" value="">{{ $t('notificationLayouts.emptyList') }}</option>
                <option v-for="row in layouts" :key="row.id" :value="row.id">
                  {{ layoutLabel(row) }}{{ row.is_default ? ` (${$t('notificationLayouts.badgeDefault')})` : '' }}
                </option>
              </select>
            </div>
            <button
              type="button"
              class="fk-btn fk-btn--pearl fk-btn--sm shrink-0"
              :disabled="saving"
              @click="startCreate"
            >
              {{ $t('notificationLayouts.addLayout') }}
            </button>
          </div>
        </div>

        <div v-if="editing" class="mt-4 grid gap-4 xl:grid-cols-2">
          <!-- Editor -->
          <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
            <div class="space-y-5 p-4 sm:p-5">
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-name">
                    {{ $t('notificationLayouts.nameEn') }}
                  </label>
                  <input id="nl-name" v-model="form.name" type="text" class="fk-field" />
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-name-ar">
                    {{ $t('notificationLayouts.nameAr') }}
                  </label>
                  <input id="nl-name-ar" v-model="form.name_ar" type="text" class="fk-field" dir="rtl" />
                </div>
              </div>

              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input v-model="form.is_default" type="checkbox" class="rounded border-gray-300 text-primary-600" />
                {{ $t('notificationLayouts.badgeDefault') }}
              </label>

              <div class="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 px-4 py-3">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900">{{ $t('notificationLayouts.importWord') }}</p>
                    <p class="mt-0.5 text-xs text-gray-600">{{ $t('notificationLayouts.importWordHint') }}</p>
                  </div>
                  <div class="flex shrink-0 items-center gap-2">
                    <input
                      ref="docxInputRef"
                      type="file"
                      accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      class="hidden"
                      @change="onDocxPicked"
                    >
                    <button
                      type="button"
                      class="fk-btn fk-btn--pearl fk-btn--sm"
                      :disabled="importingDocx || saving"
                      @click="docxInputRef?.click()"
                    >
                      {{ importingDocx ? $t('common.loading') : $t('notificationLayouts.importWordButton') }}
                    </button>
                  </div>
                </div>
                <p v-if="docxImportNote" class="mt-2 text-[11px] text-amber-800">{{ docxImportNote }}</p>
              </div>

              <div v-if="legacyHtmlMode" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                {{ $t('notificationLayouts.legacyHtmlNotice') }}
                <button type="button" class="ms-1 font-semibold underline" @click="convertLegacyToVisual">
                  {{ $t('notificationLayouts.useVisualBuilder') }}
                </button>
              </div>

              <template v-if="!legacyHtmlMode">
                <div>
                  <p class="mb-2 text-xs font-medium text-gray-600">{{ $t('notificationLayouts.chooseStyle') }}</p>
                  <div class="grid grid-cols-3 gap-2" role="radiogroup" :aria-label="$t('notificationLayouts.chooseStyle')">
                    <button
                      v-for="style in styleOptions"
                      :key="style.id"
                      type="button"
                      role="radio"
                      class="rounded-xl border p-2.5 text-start transition-all"
                      :class="builder.style === style.id
                        ? 'border-primary-300 bg-primary-50/70 ring-1 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'"
                      :aria-checked="builder.style === style.id"
                      @click="setStyle(style.id)"
                    >
                      <span
                        class="mb-2 block h-8 rounded-md"
                        :style="style.swatch"
                        aria-hidden="true"
                      />
                      <span class="block text-xs font-semibold text-gray-900">{{ style.label }}</span>
                      <span class="mt-0.5 block text-[10px] leading-snug text-gray-500">{{ style.hint }}</span>
                    </button>
                  </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-color">
                      {{ $t('notificationLayouts.primaryColor') }}
                    </label>
                    <div class="flex items-center gap-2">
                      <input
                        id="nl-color"
                        v-model="builder.primaryColor"
                        type="color"
                        class="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
                        @input="syncHtmlFromBuilder"
                      >
                      <input
                        v-model="builder.primaryColor"
                        type="text"
                        dir="ltr"
                        class="fk-field flex-1 font-mono text-xs"
                        @change="syncHtmlFromBuilder"
                      >
                    </div>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-banner">
                      {{ $t('notificationLayouts.bannerUrl') }}
                    </label>
                    <input
                      id="nl-banner"
                      v-model="builder.bannerUrl"
                      type="url"
                      dir="ltr"
                      class="fk-field"
                      :placeholder="$t('notificationLayouts.bannerUrlPlaceholder')"
                      @change="syncHtmlFromBuilder"
                    >
                  </div>
                </div>

                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      v-model="builder.showLogo"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600"
                      @change="syncHtmlFromBuilder"
                    >
                    {{ $t('notificationLayouts.showLogo') }}
                  </label>
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      v-model="builder.showSchoolName"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600"
                      @change="syncHtmlFromBuilder"
                    >
                    {{ $t('notificationLayouts.showSchoolName') }}
                  </label>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-sub-en">
                      {{ $t('notificationLayouts.subtitleEn') }}
                    </label>
                    <input
                      id="nl-sub-en"
                      v-model="builder.subtitleEn"
                      type="text"
                      class="fk-field"
                      @change="syncHtmlFromBuilder"
                    >
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-sub-ar">
                      {{ $t('notificationLayouts.subtitleAr') }}
                    </label>
                    <input
                      id="nl-sub-ar"
                      v-model="builder.subtitleAr"
                      type="text"
                      class="fk-field"
                      dir="rtl"
                      @change="syncHtmlFromBuilder"
                    >
                  </div>
                </div>

                <div>
                  <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      v-model="builder.useBrandingFooter"
                      type="checkbox"
                      class="rounded border-gray-300 text-primary-600"
                      @change="syncHtmlFromBuilder"
                    >
                    {{ $t('notificationLayouts.useBrandingFooter') }}
                  </label>
                  <p class="mt-1 text-[11px] text-gray-500">{{ $t('notificationLayouts.useBrandingFooterHint') }}</p>
                </div>

                <div v-if="!builder.useBrandingFooter" class="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-foot-en">
                      {{ $t('notificationLayouts.footerEn') }}
                    </label>
                    <textarea
                      id="nl-foot-en"
                      v-model="builder.footerEn"
                      rows="2"
                      class="fk-field resize-y"
                      @change="syncHtmlFromBuilder"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nl-foot-ar">
                      {{ $t('notificationLayouts.footerAr') }}
                    </label>
                    <textarea
                      id="nl-foot-ar"
                      v-model="builder.footerAr"
                      rows="2"
                      class="fk-field resize-y"
                      dir="rtl"
                      @change="syncHtmlFromBuilder"
                    />
                  </div>
                </div>
              </template>

              <div class="overflow-hidden rounded-xl border border-gray-200">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-2 bg-gray-50 px-3 py-2.5 text-start text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  :aria-expanded="advancedOpen"
                  @click="advancedOpen = !advancedOpen"
                >
                  <span>{{ $t('notificationLayouts.advancedHtml') }}</span>
                  <svg
                    class="h-4 w-4 shrink-0 text-gray-500 transition-transform"
                    :class="advancedOpen ? 'rotate-180' : ''"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-if="advancedOpen" class="border-t border-gray-200">
                  <div class="flex flex-wrap items-end gap-2 border-b border-gray-100 bg-white px-3 py-2">
                    <div
                      class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
                      role="tablist"
                    >
                      <button
                        type="button"
                        role="tab"
                        class="rounded-md px-2.5 py-1 text-xs font-semibold"
                        :class="langTab === 'en' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                        :aria-selected="langTab === 'en'"
                        @click="langTab = 'en'"
                      >
                        {{ $t('notificationTemplates.langEn') }}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        class="rounded-md px-2.5 py-1 text-xs font-semibold"
                        :class="langTab === 'ar' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                        :aria-selected="langTab === 'ar'"
                        @click="langTab = 'ar'"
                      >
                        {{ $t('notificationTemplates.langAr') }}
                      </button>
                    </div>
                    <p class="ms-auto text-[11px] text-gray-500">{{ $t('notificationLayouts.htmlHint') }}</p>
                  </div>
                  <div
                    v-if="layoutInsertItems.length"
                    class="flex flex-wrap items-center gap-2 border-b border-slate-200/90 bg-white px-2 py-2"
                  >
                    <NotificationInsertFieldsBar
                      :title="$t('notificationTemplates.insertVariables')"
                      :hints="layoutInsertItems"
                      @insert="insertLayoutVar"
                    />
                  </div>
                  <textarea
                    id="nl-html"
                    ref="htmlRef"
                    v-model="activeHtml"
                    rows="12"
                    spellcheck="false"
                    class="block min-h-[14rem] w-full resize-y border-0 bg-transparent px-3 py-2 font-mono text-xs leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
                    :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                    @input="onAdvancedHtmlInput"
                  />
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-2 border-t border-fikr-hairline pt-4">
                <button
                  v-if="selectedId"
                  type="button"
                  class="fk-btn fk-btn--pearl text-red-700"
                  :disabled="saving || layouts.length <= 1"
                  @click="removeSelected"
                >
                  {{ $t('common.delete') }}
                </button>
                <button type="button" class="fk-btn fk-btn--primary" :disabled="saving" @click="save">
                  {{ saving ? $t('common.loading') : $t('common.save') }}
                </button>
              </div>
            </div>
          </section>

          <!-- Live preview -->
          <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] xl:sticky xl:top-4 xl:self-start">
            <header class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/40 px-4 py-3">
              <div>
                <h2 class="text-sm font-semibold text-gray-900">{{ $t('notificationLayouts.livePreview') }}</h2>
                <p class="mt-0.5 text-xs text-gray-500">{{ $t('notificationLayouts.livePreviewHint') }}</p>
              </div>
              <div
                class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  class="rounded-md px-2.5 py-1 text-xs font-semibold"
                  :class="previewLang === 'en' ? 'bg-primary-600 text-white' : 'text-gray-600'"
                  :aria-selected="previewLang === 'en'"
                  @click="previewLang = 'en'"
                >
                  {{ $t('notificationTemplates.langEn') }}
                </button>
                <button
                  type="button"
                  role="tab"
                  class="rounded-md px-2.5 py-1 text-xs font-semibold"
                  :class="previewLang === 'ar' ? 'bg-primary-600 text-white' : 'text-gray-600'"
                  :aria-selected="previewLang === 'ar'"
                  @click="previewLang = 'ar'"
                >
                  {{ $t('notificationTemplates.langAr') }}
                </button>
              </div>
            </header>
            <div class="relative min-h-[320px] bg-gray-100/80 p-3 sm:p-4">
              <div
                v-if="previewLoading"
                class="absolute inset-0 z-10 flex items-center justify-center bg-white/70"
              >
                <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              </div>
              <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <iframe
                  ref="previewIframeRef"
                  title="layout-preview"
                  class="block w-full border-0 bg-white"
                  style="min-height: 360px"
                  sandbox="allow-same-origin"
                  :srcdoc="previewHtml"
                  @load="syncPreviewIframeHeight"
                />
              </div>
              <details class="mt-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <summary class="cursor-pointer text-xs font-semibold text-gray-700">
                  {{ $t('notificationLayouts.sampleContent') }}
                </summary>
                <textarea
                  v-model="sampleContent"
                  rows="3"
                  class="fk-field mt-2 resize-y text-sm"
                />
              </details>
            </div>
          </section>
        </div>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import NotificationInsertFieldsBar from '@/components/NotificationInsertFieldsBar.vue'
import { authService } from '@/services'
import notificationLayoutService, {
  type NotificationLayout,
} from '@/services/notification-layout.service'
import { insertIntoStringAtCursor } from '@/utils/field-insert'
import {
  applyBuilderToHtmlPair,
  defaultLayoutBuilderConfig,
  parseLayoutBuilderConfig,
  type LayoutBuilderConfig,
  type LayoutBuilderStyle,
} from '@/utils/notification-layout-builder'
import { docxFileToHtmlFragment, isDocxFile, wrapDocxHtmlAsLayout } from '@/utils/docx-to-html'

const { locale, t, te } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')
const isPlatform = computed(() => route.path.startsWith('/platform/'))

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const apiOpts = computed(() =>
  isPlatform.value ? { platform: true as const } : { platform: false as const, schoolId: schoolId.value },
)

const loading = ref(true)
const saving = ref(false)
const previewLoading = ref(false)
const flashError = ref('')
const flashOk = ref('')
const layouts = ref<NotificationLayout[]>([])
const selectedId = ref('')
const editing = ref(false)
const langTab = ref<'en' | 'ar'>('en')
const previewLang = ref<'en' | 'ar'>('en')
const previewHtml = ref('')
const sampleContent = ref(
  '<p style="margin:0 0 8px;"><strong>Welcome</strong></p><p style="margin:0;color:#374151;">This is how your notification message will look inside the layout.</p>',
)
const htmlRef = ref<HTMLTextAreaElement | null>(null)
const previewIframeRef = ref<HTMLIFrameElement | null>(null)
const advancedOpen = ref(false)
const legacyHtmlMode = ref(false)
const syncingFromBuilder = ref(false)
const importingDocx = ref(false)
const docxImportNote = ref('')
const docxInputRef = ref<HTMLInputElement | null>(null)

const LAYOUT_INSERT_KEYS = ['content', 'schoolName', 'schoolLogoHtml', 'footerText'] as const

const layoutInsertItems = computed(() =>
  LAYOUT_INSERT_KEYS.map((name) => {
    const key = `notificationTemplates.var.${name}`
    return { name, label: te(key) ? t(key) : name }
  }),
)

const form = reactive({
  name: '',
  name_ar: '',
  html_en: '',
  html_ar: '',
  is_default: false,
})

const builder = reactive<LayoutBuilderConfig>(defaultLayoutBuilderConfig())

const styleOptions = computed(() => [
  {
    id: 'simple' as const,
    label: t('notificationLayouts.styleSimple'),
    hint: t('notificationLayouts.styleSimpleHint'),
    swatch: `linear-gradient(180deg, ${builder.primaryColor} 0 18%, #f9fafb 18% 100%)`,
  },
  {
    id: 'branded' as const,
    label: t('notificationLayouts.styleBranded'),
    hint: t('notificationLayouts.styleBrandedHint'),
    swatch: `linear-gradient(180deg, ${builder.primaryColor} 0 42%, #ffffff 42% 100%)`,
  },
  {
    id: 'formal' as const,
    label: t('notificationLayouts.styleFormal'),
    hint: t('notificationLayouts.styleFormalHint'),
    swatch: 'linear-gradient(180deg, #fafafa 0 30%, #ffffff 30% 100%)',
  },
])

const activeHtml = computed({
  get: () => (langTab.value === 'ar' ? form.html_ar : form.html_en),
  set: (v: string) => {
    if (langTab.value === 'ar') form.html_ar = v
    else form.html_en = v
  },
})

const previewSourceHtml = computed(() =>
  previewLang.value === 'ar' ? form.html_ar || form.html_en : form.html_en,
)

function layoutLabel(row: NotificationLayout) {
  if (locale.value === 'ar' && row.name_ar?.trim()) return row.name_ar
  return row.name
}

function syncHtmlFromBuilder() {
  if (legacyHtmlMode.value) return
  syncingFromBuilder.value = true
  const pair = applyBuilderToHtmlPair({ ...builder })
  form.html_en = pair.html_en
  form.html_ar = pair.html_ar
  nextTick(() => {
    syncingFromBuilder.value = false
  })
}

function setStyle(style: LayoutBuilderStyle) {
  if (legacyHtmlMode.value) return
  builder.style = style
  syncHtmlFromBuilder()
}

function applyBuilderFromHtml(html: string) {
  const parsed = parseLayoutBuilderConfig(html)
  if (parsed) {
    Object.assign(builder, parsed)
    legacyHtmlMode.value = false
    advancedOpen.value = false
    return true
  }
  legacyHtmlMode.value = true
  advancedOpen.value = true
  return false
}

function convertLegacyToVisual() {
  Object.assign(builder, defaultLayoutBuilderConfig())
  legacyHtmlMode.value = false
  advancedOpen.value = false
  docxImportNote.value = ''
  syncHtmlFromBuilder()
}

async function onDocxPicked(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  docxImportNote.value = ''
  if (!isDocxFile(file)) {
    flashError.value = t('notificationLayouts.importWordDocxOnly')
    return
  }
  importingDocx.value = true
  flashError.value = ''
  try {
    const { html: fragment, messages } = await docxFileToHtmlFragment(file)
    form.html_en = wrapDocxHtmlAsLayout(fragment, 'en')
    form.html_ar = wrapDocxHtmlAsLayout(fragment, 'ar')
    legacyHtmlMode.value = true
    advancedOpen.value = true
    langTab.value = locale.value === 'ar' ? 'ar' : 'en'
    previewLang.value = langTab.value
    if (messages.length) {
      docxImportNote.value = t('notificationLayouts.importWordWarnings', {
        detail: messages.slice(0, 3).join(' · '),
      })
    } else {
      docxImportNote.value = t('notificationLayouts.importWordDone')
    }
    void runPreview()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value =
      err?.message === 'DOCX_ONLY'
        ? t('notificationLayouts.importWordDocxOnly')
        : t('notificationLayouts.importWordError')
  } finally {
    importingDocx.value = false
  }
}

function applyForm(row: NotificationLayout) {
  form.name = row.name
  form.name_ar = row.name_ar ?? ''
  form.html_en = row.html_en
  form.html_ar = row.html_ar ?? row.html_en
  form.is_default = row.is_default
  editing.value = true
  applyBuilderFromHtml(row.html_en || row.html_ar || '')
}

function startCreate() {
  selectedId.value = ''
  form.name = t('notificationLayouts.newName')
  form.name_ar = ''
  form.is_default = layouts.value.length === 0
  Object.assign(builder, defaultLayoutBuilderConfig())
  legacyHtmlMode.value = false
  advancedOpen.value = false
  syncHtmlFromBuilder()
  editing.value = true
  langTab.value = locale.value === 'ar' ? 'ar' : 'en'
  previewLang.value = langTab.value
}

function selectLayout(id: string) {
  selectedId.value = id
  const row = layouts.value.find((x) => x.id === id)
  if (row) applyForm(row)
}

function onLayoutDropdownChange(ev: Event) {
  const id = (ev.target as HTMLSelectElement).value
  if (id) selectLayout(id)
}

function onAdvancedHtmlInput() {
  if (syncingFromBuilder.value) return
  legacyHtmlMode.value = !parseLayoutBuilderConfig(activeHtml.value)
}

const runPreview = useDebounceFn(async () => {
  const html = (previewSourceHtml.value || '').trim()
  if (!html) {
    previewHtml.value = ''
    return
  }
  previewLoading.value = true
  try {
    const res = await notificationLayoutService.preview(isPlatform.value, {
      locale: previewLang.value,
      html,
      ...(sampleContent.value.trim() ? { sample_content: sampleContent.value } : {}),
      ...(isPlatform.value ? {} : { school_id: schoolId.value }),
    })
    previewHtml.value = res.html || ''
  } catch {
    previewHtml.value = html
  } finally {
    previewLoading.value = false
    void nextTick(() => syncPreviewIframeHeight())
  }
}, 350)

function insertLayoutVar(name: string) {
  const token = `{{${name}}}`
  const el = htmlRef.value
  const { next, caret } = insertIntoStringAtCursor(
    activeHtml.value,
    el?.selectionStart ?? null,
    el?.selectionEnd ?? null,
    token,
  )
  activeHtml.value = next
  legacyHtmlMode.value = !parseLayoutBuilderConfig(next)
  nextTick(() => {
    if (el) el.setSelectionRange(caret, caret)
  })
}

function syncPreviewIframeHeight() {
  const iframe = previewIframeRef.value
  if (!iframe) return
  requestAnimationFrame(() => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const height = Math.max(
        doc.documentElement?.scrollHeight ?? 0,
        doc.body?.scrollHeight ?? 0,
        280,
      )
      iframe.style.height = `${height}px`
    } catch {
      iframe.style.height = '480px'
    }
  })
}

watch([previewSourceHtml, previewLang, sampleContent, editing], () => {
  if (editing.value) void runPreview()
})

watch(
  () => [
    builder.primaryColor,
    builder.showLogo,
    builder.showSchoolName,
    builder.subtitleEn,
    builder.subtitleAr,
    builder.useBrandingFooter,
    builder.footerEn,
    builder.footerAr,
    builder.bannerUrl,
    builder.style,
  ],
  () => {
    if (!legacyHtmlMode.value && editing.value) syncHtmlFromBuilder()
  },
)

async function loadAll() {
  loading.value = true
  flashError.value = ''
  try {
    const list = await notificationLayoutService.list(apiOpts.value)
    layouts.value = list
    if (!selectedId.value && list.length) {
      selectedId.value = list.find((x) => x.is_default)?.id || list[0].id
    }
    const row = list.find((x) => x.id === selectedId.value)
    if (row) applyForm(row)
    else if (list.length) selectLayout(list[0].id)
    else startCreate()
    langTab.value = locale.value === 'ar' ? 'ar' : 'en'
    previewLang.value = langTab.value
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.loadError')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  flashOk.value = ''
  flashError.value = ''
  try {
    if (!legacyHtmlMode.value) syncHtmlFromBuilder()
    if (!form.name.trim()) throw new Error(t('notificationLayouts.nameRequired'))
    if (!/\{\{\s*content\s*\}\}/i.test(form.html_en)) {
      throw new Error(t('notificationLayouts.contentRequired'))
    }
    const payload = {
      name: form.name.trim(),
      name_ar: form.name_ar.trim() || null,
      html_en: form.html_en,
      html_ar: form.html_ar.trim() || null,
      is_default: form.is_default,
    }
    const saved = selectedId.value
      ? await notificationLayoutService.update(apiOpts.value, selectedId.value, payload)
      : await notificationLayoutService.create(apiOpts.value, payload)
    const idx = layouts.value.findIndex((x) => x.id === saved.id)
    if (idx >= 0) layouts.value[idx] = saved
    else layouts.value = [...layouts.value, saved]
    if (saved.is_default) {
      layouts.value = layouts.value.map((x) =>
        x.id === saved.id ? saved : { ...x, is_default: false },
      )
    }
    selectedId.value = saved.id
    applyForm(saved)
    flashOk.value = t('notificationLayouts.saved')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.saveError')
  } finally {
    saving.value = false
  }
}

async function removeSelected() {
  if (!selectedId.value || layouts.value.length <= 1) return
  if (!confirm(t('notificationLayouts.deleteConfirm'))) return
  saving.value = true
  flashError.value = ''
  try {
    await notificationLayoutService.remove(apiOpts.value, selectedId.value)
    layouts.value = layouts.value.filter((x) => x.id !== selectedId.value)
    selectedId.value = layouts.value.find((x) => x.is_default)?.id || layouts.value[0]?.id || ''
    if (selectedId.value) selectLayout(selectedId.value)
    else startCreate()
    flashOk.value = t('notificationLayouts.deleted')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationLayouts.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadAll()
})
</script>
