<template>
  <div dir="ltr" class="rounded-lg border border-violet-100/90 bg-violet-50/20 p-3 space-y-3">
    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
      <!-- Preview left (physical left in LTR grid) -->
      <div class="min-w-0 space-y-2 order-2 lg:order-1">
        <h4 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {{ $t('activities.parentApprovalPreview') }}
        </h4>
        <div class="relative min-h-[200px]">
          <div
            v-if="previewLoading"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80"
            aria-busy="true"
          >
            <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
          <div class="space-y-2 transition-opacity" :class="previewLoading ? 'pointer-events-none opacity-50' : ''">
            <NotificationEmailContentFrame>
              <div
                class="border-b border-gray-200 bg-gray-50 px-4 py-3"
                :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
              >
                <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {{ $t('notificationTemplates.previewSubjectLabel') }}
                </p>
                <p class="mt-1 text-sm font-semibold leading-snug text-gray-900 break-words">
                  {{ preview.subject || '—' }}
                </p>
              </div>
              <div class="bg-white">
                <iframe
                  ref="previewIframeRef"
                  title="activity-parent-approval-preview"
                  class="block w-full border-0 bg-white"
                  style="min-height: 200px"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                  sandbox="allow-same-origin"
                  scrolling="no"
                  :srcdoc="previewHtmlSrcdoc"
                  @load="syncPreviewIframeHeight"
                />
              </div>
            </NotificationEmailContentFrame>
            <NotificationEmailContentFrame v-if="preview.body_sms">
              <div
                class="flex min-h-[72px] flex-col justify-end bg-[#e8e8ed] px-3 py-3"
                :class="langTab === 'ar' ? 'items-end' : 'items-start'"
              >
                <div
                  class="max-w-[min(92%,18rem)] rounded-2xl bg-white px-2.5 py-1.5 text-xs leading-relaxed text-gray-900 shadow-sm whitespace-pre-wrap break-words"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                >
                  {{ preview.body_sms }}
                </div>
              </div>
            </NotificationEmailContentFrame>
          </div>
        </div>
      </div>

      <!-- Editor right -->
      <div class="min-w-0 space-y-2 order-1 lg:order-2">
        <h4 class="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {{ $t('activities.parentApprovalCompose') }}
        </h4>

        <div
          class="inline-flex w-full max-w-md rounded-lg border border-teal-100/90 bg-teal-50/40 p-0.5 shadow-sm"
          role="tablist"
          :aria-label="$t('notificationTemplates.localeTabsAria')"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="langTab === 'en'"
            class="flex-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all"
            :class="langTab === 'en' ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200' : 'text-gray-600'"
            @click="setLangTab('en')"
          >
            {{ $t('notificationTemplates.langEn') }}
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="langTab === 'ar'"
            class="flex-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all"
            :class="langTab === 'ar' ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200' : 'text-gray-600'"
            @click="setLangTab('ar')"
          >
            {{ $t('notificationTemplates.langAr') }}
          </button>
        </div>

        <div :dir="editorContentDir" class="space-y-2.5 isolate">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-1.5">
              <label class="text-[10px] font-medium text-gray-500">{{ $t('notificationTemplates.emailBodyLabel') }}</label>
              <div class="inline-flex rounded-md border border-gray-200 p-px bg-gray-50">
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
                  :class="editMode === 'visual' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                  @click="setEditMode('visual')"
                >
                  {{ $t('notificationTemplates.modeVisual') }}
                </button>
                <button
                  type="button"
                  class="rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors"
                  :class="editMode === 'html' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                  @click="setEditMode('html')"
                >
                  {{ $t('notificationTemplates.modeHtml') }}
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="ph in placeholderFields"
                :key="'ins-' + ph.name"
                type="button"
                class="rounded border border-violet-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-800 hover:bg-violet-50"
                @click="insertPlaceholderEmail(ph.name)"
              >
                {{ $t(ph.labelKey) }}
              </button>
            </div>

            <NotificationEmailContentFrame v-if="editMode === 'visual'">
              <div
                class="border-b border-gray-200 bg-gray-50 px-4 py-2.5"
                :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
              >
                <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  {{ $t('notificationTemplates.previewSubjectLabel') }}
                </p>
                <p class="mt-1 text-xs font-semibold leading-snug text-gray-900 break-words">
                  {{ editorCardSubjectLine }}
                </p>
              </div>
              <div class="bg-white" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
                <div
                  v-if="bodyRegionSplit && bodyRegionKind === 'div'"
                  class="mx-auto max-w-[560px] overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,.06)]"
                >
                  <div v-if="editorEmailCardChrome" class="email-card-chrome" v-html="editorEmailCardChrome" />
                  <div class="px-4 py-2.5" :style="editorEmailBodyStyle">
                    <NotificationTemplateEmailEditor
                      ref="emailEditorRef"
                      v-model="bodyHtml"
                      embedded
                      compact
                      in-card-body
                      :disabled="disabled"
                      :remount-key="`apl-${langTab}-${editorEpoch}`"
                      :rtl="langTab === 'ar'"
                    />
                  </div>
                </div>
                <div v-else class="px-2 py-1">
                  <NotificationTemplateEmailEditor
                    ref="emailEditorRef"
                    v-model="bodyHtml"
                    embedded
                    compact
                    :disabled="disabled"
                    :remount-key="`apl-${langTab}-${editorEpoch}`"
                    :rtl="langTab === 'ar'"
                  />
                </div>
              </div>
            </NotificationEmailContentFrame>

            <NotificationEmailContentFrame v-else>
              <div class="border-b border-gray-200 bg-gray-50 px-3 py-2" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
                <p class="text-[10px] font-semibold text-gray-500">{{ $t('notificationTemplates.modeHtml') }}</p>
              </div>
              <div class="bg-white" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
                <textarea
                  id="apl-body-html"
                  ref="htmlBodyRef"
                  v-model="htmlEditorBuffer"
                  rows="10"
                  spellcheck="false"
                  class="block min-h-[10rem] w-full resize-y border-0 bg-transparent px-3 py-2 text-[11px] font-mono leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
                />
              </div>
            </NotificationEmailContentFrame>
          </div>

          <div>
            <div class="mb-1 flex flex-wrap items-center justify-between gap-1">
              <label class="text-[10px] font-medium text-gray-500" for="apl-sms">{{ $t('notificationTemplates.bodySms') }}</label>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="ph in placeholderFields"
                  :key="'sms-' + ph.name"
                  type="button"
                  class="rounded border border-emerald-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-800 hover:bg-emerald-50"
                  @click="insertPlaceholderSms(ph.name)"
                >
                  {{ $t(ph.labelKey) }}
                </button>
              </div>
            </div>
            <div
              class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500/40"
            >
              <textarea
                id="apl-sms"
                ref="smsTextareaRef"
                v-model="bodySms"
                rows="2"
                class="block w-full resize-y border-0 bg-transparent px-2.5 py-1.5 text-xs leading-relaxed text-gray-900 focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import NotificationEmailContentFrame from '@/components/NotificationEmailContentFrame.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
import notificationTemplateService from '@/services/notification-template.service'
import type { ParentApprovalLetterBundle } from '@/services/activity.service'
import {
  splitNotificationBodyEditableRegion,
  splitPrefixBeforeEmailBody,
  inlineStyleFromTag,
} from '@/utils/email-template-body-region'
import { splitHtmlDocument } from '@/utils/email-template-document'
import { ensureEmailCardBodyRegion } from '@/utils/email-template-card-shell'
import { insertIntoStringAtCursor } from '@/utils/field-insert'
import { applyNotificationTemplateVariables } from '@/utils/notification-template-variables'

const props = defineProps<{
  modelValue: ParentApprovalLetterBundle
  schoolId: number
  /** Sample values for preview (parentName, activityStartDate, activityEndDate, schoolName, …). */
  previewSamples: Record<string, string>
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ParentApprovalLetterBundle]
}>()

const { locale, t } = useI18n()

const placeholderFields = [
  { name: 'parentName', labelKey: 'activities.parentApprovalFields.parentName' },
  { name: 'activityStartDate', labelKey: 'activities.parentApprovalFields.activityStartDate' },
  { name: 'activityEndDate', labelKey: 'activities.parentApprovalFields.activityEndDate' },
] as const

type LocaleDraft = {
  bodyHtml: string
  bodySms: string
  emailDocParts: { open: string; close: string } | null
  bodyRegionSplit: boolean
  bodyRegionKind: 'div' | 'table' | null
  bodyInnerPrefix: string
  bodyInnerSuffix: string
}

function emptyLocaleDraft(): LocaleDraft {
  return {
    bodyHtml: '',
    bodySms: '',
    emailDocParts: null,
    bodyRegionSplit: false,
    bodyRegionKind: null,
    bodyInnerPrefix: '',
    bodyInnerSuffix: '',
  }
}

const localeState = reactive<{ en: LocaleDraft; ar: LocaleDraft }>({
  en: emptyLocaleDraft(),
  ar: emptyLocaleDraft(),
})

const langTab = ref<'en' | 'ar'>('en')
const bodyHtml = ref('')
const bodySms = ref('')
const emailDocParts = ref<{ open: string; close: string } | null>(null)
const bodyInnerPrefix = ref('')
const bodyInnerSuffix = ref('')
const bodyRegionSplit = ref(false)
const bodyRegionKind = ref<'div' | 'table' | null>(null)
const editMode = ref<'visual' | 'html'>('visual')
const editorEpoch = ref(0)
const htmlEditorBuffer = ref('')

const emailEditorRef = ref<InstanceType<typeof NotificationTemplateEmailEditor> | null>(null)
const smsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const htmlBodyRef = ref<HTMLTextAreaElement | null>(null)

const preview = ref({ subject: '', body_html: '', body_sms: '' })
const previewLoading = ref(false)
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

const editorContentDir = computed<'ltr' | 'rtl'>(() => (langTab.value === 'ar' ? 'rtl' : 'ltr'))

const mergedSampleVariablesForPreview = computed(() => ({ ...props.previewSamples }))

const subjectForActiveLocale = computed(() => props.modelValue[langTab.value].subject)

const editorCardSubjectLine = computed(() => {
  const rendered = preview.value.subject?.trim()
  if (rendered) return rendered
  const raw = subjectForActiveLocale.value.trim()
  if (!raw) return '—'
  return applyNotificationTemplateVariables(raw, mergedSampleVariablesForPreview.value)
})

const editorEmailCardChrome = computed(() => {
  if (!bodyRegionSplit.value) return ''
  const { chromeHtml } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  return applyNotificationTemplateVariables(chromeHtml, mergedSampleVariablesForPreview.value)
})

const editorEmailBodyStyle = computed(() => {
  if (!bodyRegionSplit.value) return undefined
  const { bodyOpenTag } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  const style = inlineStyleFromTag(bodyOpenTag)
  return style ? style : undefined
})

const previewHtmlSrcdoc = computed(() => preview.value.body_html || '')

function syncPreviewIframeHeight() {
  const iframe = previewIframeRef.value
  if (!iframe) return
  requestAnimationFrame(() => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const height = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0, 200)
      iframe.style.height = `${height}px`
    } catch {
      iframe.style.height = '280px'
    }
  })
}

watch(previewHtmlSrcdoc, () => {
  void nextTick(() => syncPreviewIframeHeight())
})

function syncHtmlBufferToModelIfNeeded() {
  if (editMode.value === 'html') {
    applyFullHtmlFromBuffer(htmlEditorBuffer.value)
  }
}

function flushActiveLocaleToStore() {
  syncHtmlBufferToModelIfNeeded()
  const s = localeState[langTab.value]
  s.bodyHtml = bodyHtml.value
  s.bodySms = bodySms.value
  s.emailDocParts = emailDocParts.value
  s.bodyRegionSplit = bodyRegionSplit.value
  s.bodyRegionKind = bodyRegionKind.value
  s.bodyInnerPrefix = bodyInnerPrefix.value
  s.bodyInnerSuffix = bodyInnerSuffix.value
}

function loadActiveLocaleForm() {
  const s = localeState[langTab.value]
  bodyHtml.value = s.bodyHtml
  bodySms.value = s.bodySms
  emailDocParts.value = s.emailDocParts
  bodyRegionSplit.value = s.bodyRegionSplit ?? false
  bodyRegionKind.value = s.bodyRegionKind ?? null
  bodyInnerPrefix.value = s.bodyInnerPrefix ?? ''
  bodyInnerSuffix.value = s.bodyInnerSuffix ?? ''
}

function setLangTab(loc: 'en' | 'ar') {
  if (loc === langTab.value) return
  if (editMode.value === 'visual' && emailEditorRef.value) {
    const inst = emailEditorRef.value as { getModelHtml?: () => string }
    const live = inst.getModelHtml?.()
    if (typeof live === 'string') bodyHtml.value = live
  }
  flushActiveLocaleToStore()
  langTab.value = loc
  loadActiveLocaleForm()
  editMode.value = 'visual'
  editorEpoch.value += 1
  debouncedEmit()
  void runPreview()
}

function composeLocaleBodyInner(s: LocaleDraft): string {
  if (s.bodyRegionSplit) {
    return `${s.bodyInnerPrefix ?? ''}${s.bodyHtml}${s.bodyInnerSuffix ?? ''}`
  }
  return s.bodyHtml
}

function composedForLocale(loc: 'en' | 'ar'): string {
  const s = localeState[loc]
  const parts = s.emailDocParts
  const inner = composeLocaleBodyInner(s)
  if (parts) return `${parts.open}${inner}${parts.close}`
  return inner
}

function composedEmailHtml(): string {
  const parts = emailDocParts.value
  const inner = bodyRegionSplit.value
    ? bodyInnerPrefix.value + bodyHtml.value + bodyInnerSuffix.value
    : bodyHtml.value
  if (parts) return `${parts.open}${inner}${parts.close}`
  return inner
}

function activeComposedEmailHtml(): string {
  if (editMode.value === 'html') {
    return htmlEditorBuffer.value.trim()
  }
  return composedEmailHtml()
}

function applyFullHtmlFromBuffer(fullRaw: string) {
  const full = (fullRaw ?? '').trim()
  if (!full) {
    emailDocParts.value = null
    bodyHtml.value = ''
    bodyInnerPrefix.value = ''
    bodyInnerSuffix.value = ''
    bodyRegionSplit.value = false
    bodyRegionKind.value = null
    return
  }
  const split = splitHtmlDocument(full)
  if (split) {
    emailDocParts.value = { open: split.open, close: split.close }
    const innerWithCard = ensureEmailCardBodyRegion(split.inner, langTab.value)
    const reg = splitNotificationBodyEditableRegion(innerWithCard)
    if (reg) {
      bodyInnerPrefix.value = reg.prefix
      bodyInnerSuffix.value = reg.suffix
      bodyHtml.value = reg.middle
      bodyRegionSplit.value = true
      bodyRegionKind.value = reg.kind
    } else {
      bodyInnerPrefix.value = ''
      bodyInnerSuffix.value = ''
      bodyHtml.value = innerWithCard
      bodyRegionSplit.value = false
      bodyRegionKind.value = null
    }
  } else {
    emailDocParts.value = null
    bodyHtml.value = full
    bodyInnerPrefix.value = ''
    bodyInnerSuffix.value = ''
    bodyRegionSplit.value = false
    bodyRegionKind.value = null
  }
}

function hydrateLocaleBlock(loc: 'en' | 'ar', block: { body_html: string; body_sms: string | null | undefined }) {
  const s = localeState[loc]
  const split = splitHtmlDocument(block.body_html)
  if (split) {
    s.emailDocParts = { open: split.open, close: split.close }
    const innerWithCard = ensureEmailCardBodyRegion(split.inner, loc)
    const reg = splitNotificationBodyEditableRegion(innerWithCard)
    if (reg) {
      s.bodyInnerPrefix = reg.prefix
      s.bodyInnerSuffix = reg.suffix
      s.bodyHtml = reg.middle
      s.bodyRegionSplit = true
      s.bodyRegionKind = reg.kind
    } else {
      s.bodyInnerPrefix = ''
      s.bodyInnerSuffix = ''
      s.bodyHtml = split.inner
      s.bodyRegionSplit = false
      s.bodyRegionKind = null
    }
  } else {
    s.emailDocParts = null
    s.bodyHtml = block.body_html
    s.bodyInnerPrefix = ''
    s.bodyInnerSuffix = ''
    s.bodyRegionSplit = false
    s.bodyRegionKind = null
  }
  s.bodySms = block.body_sms ?? ''
}

function hydrateFromProps() {
  hydrateLocaleBlock('en', props.modelValue.en)
  hydrateLocaleBlock('ar', props.modelValue.ar)
  langTab.value = locale.value === 'ar' ? 'ar' : 'en'
  loadActiveLocaleForm()
  editMode.value = 'visual'
  editorEpoch.value += 1
}

function setEditMode(mode: 'visual' | 'html') {
  if (mode === editMode.value) return
  if (mode === 'html') {
    if (editMode.value === 'visual' && emailEditorRef.value) {
      const inst = emailEditorRef.value as { getModelHtml?: () => string }
      const live = inst.getModelHtml?.()
      if (typeof live === 'string') bodyHtml.value = live
    }
    htmlEditorBuffer.value = composedEmailHtml()
    editMode.value = 'html'
    editorEpoch.value += 1
    return
  }
  applyFullHtmlFromBuffer(htmlEditorBuffer.value)
  editMode.value = 'visual'
  editorEpoch.value += 1
}

function placeholderToken(name: string) {
  return `{{${name}}}`
}

function insertPlaceholderEmail(name: string) {
  const token = placeholderToken(name)
  if (editMode.value === 'visual') {
    emailEditorRef.value?.insertPlaceholder(token)
    return
  }
  const html = insertIntoStringAtCursor(
    htmlEditorBuffer.value,
    htmlBodyRef.value?.selectionStart ?? null,
    htmlBodyRef.value?.selectionEnd ?? null,
    token,
  )
  htmlEditorBuffer.value = html.next
  nextTick(() => {
    const el = htmlBodyRef.value
    if (el) el.setSelectionRange(html.caret, html.caret)
  })
}

function insertPlaceholderSms(name: string) {
  const token = placeholderToken(name)
  const sms = insertIntoStringAtCursor(
    bodySms.value,
    smsTextareaRef.value?.selectionStart ?? null,
    smsTextareaRef.value?.selectionEnd ?? null,
    token,
  )
  bodySms.value = sms.next
  nextTick(() => {
    const el = smsTextareaRef.value
    if (el) el.setSelectionRange(sms.caret, sms.caret)
  })
}

function emitBundleFromState() {
  if (editMode.value === 'visual' && emailEditorRef.value) {
    const inst = emailEditorRef.value as { getModelHtml?: () => string }
    const live = inst.getModelHtml?.()
    if (typeof live === 'string') bodyHtml.value = live
  }
  syncHtmlBufferToModelIfNeeded()
  flushActiveLocaleToStore()
  const next: ParentApprovalLetterBundle = {
    en: {
      subject: props.modelValue.en.subject,
      body_html: composedForLocale('en'),
      body_sms: localeState.en.bodySms,
    },
    ar: {
      subject: props.modelValue.ar.subject,
      body_html: composedForLocale('ar'),
      body_sms: localeState.ar.bodySms,
    },
  }
  emit('update:modelValue', next)
}

const skipEmit = ref(false)

const debouncedEmit = useDebounceFn(() => {
  if (skipEmit.value) return
  emitBundleFromState()
}, 280)

const runPreview = useDebounceFn(async () => {
  const subj = subjectForActiveLocale.value.trim()
  if (!subj) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  syncHtmlBufferToModelIfNeeded()
  const fullHtml = activeComposedEmailHtml()
  if (!fullHtml.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  previewLoading.value = true
  try {
    const vars: Record<string, string> = { ...props.previewSamples }
    preview.value = await notificationTemplateService.preview({
      locale: langTab.value,
      subject: subj,
      body_html: fullHtml,
      body_sms: bodySms.value,
      sample_variables: vars,
      school_id: props.schoolId,
    })
  } catch {
    preview.value = { subject: '', body_html: '', body_sms: '' }
  } finally {
    previewLoading.value = false
    void nextTick(() => syncPreviewIframeHeight())
  }
}, 400)

onMounted(() => {
  skipEmit.value = true
  hydrateFromProps()
  nextTick(() => {
    skipEmit.value = false
    void runPreview()
  })
})

watch(
  () => [props.modelValue.en.subject, props.modelValue.ar.subject] as const,
  () => {
    void runPreview()
  },
)

watch([bodyHtml, bodySms, langTab, htmlEditorBuffer, editMode], () => {
  debouncedEmit()
  void runPreview()
})

defineExpose({ flushAndEmit: emitBundleFromState })
</script>

<style scoped>
.email-card-chrome :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
