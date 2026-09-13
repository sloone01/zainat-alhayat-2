<template>
  <div dir="ltr" class="rounded-lg border border-violet-100/90 bg-violet-50/20 p-3 space-y-3">
    <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <label class="mb-1 block text-[11px] font-medium text-gray-600" for="apl-template-select">
        {{ $t('notificationTemplates.selectTemplate') }}
      </label>
      <select
        id="apl-template-select"
        class="fk-field fk-field--sm w-full"
        :value="selectedTemplateId"
        :disabled="disabled || templatesLoading"
        @change="onTemplateChange"
      >
        <option value="">{{ $t('activities.parentApprovalDefaultTemplate') }}</option>
        <option v-for="tpl in letterTemplates" :key="tpl.id" :value="tpl.id">
          {{ tpl.title || tpl.id }}
        </option>
      </select>
    </div>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
      <!-- Preview -->
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
            <div class="space-y-1">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {{ $t('notificationTemplates.channelTabSms') }}
              </p>
              <NotificationEmailContentFrame>
                <div
                  class="flex min-h-[72px] flex-col justify-end bg-[#e8e8ed] px-3 py-3"
                  :class="langTab === 'ar' ? 'items-end' : 'items-start'"
                >
                  <div
                    class="max-w-[min(92%,18rem)] rounded-2xl bg-white px-2.5 py-1.5 text-xs leading-relaxed text-gray-900 shadow-sm whitespace-pre-wrap break-words"
                    :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                  >
                    {{ preview.body_sms || '—' }}
                  </div>
                </div>
              </NotificationEmailContentFrame>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor -->
      <div class="min-w-0 space-y-3 order-1 lg:order-2">
        <div class="flex flex-col items-center gap-3">
          <p class="text-sm font-semibold text-gray-900 text-center">
            {{ $t('notificationTemplates.contentBodyLanguageLabel') }}
          </p>
          <div
            class="inline-flex w-full max-w-sm justify-center rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm"
            role="tablist"
            :aria-label="$t('notificationTemplates.contentBodyLanguageLabel')"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="langTab === 'en'"
              class="min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all sm:flex-none"
              :class="
                langTab === 'en'
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :title="$t('notificationTemplates.langEnHint')"
              @click="setLangTab('en')"
            >
              {{ $t('notificationTemplates.langEn') }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="langTab === 'ar'"
              class="min-w-[7rem] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all sm:flex-none"
              :class="
                langTab === 'ar'
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :title="$t('notificationTemplates.langArHint')"
              @click="setLangTab('ar')"
            >
              {{ $t('notificationTemplates.langAr') }}
            </button>
          </div>
        </div>

        <div :dir="editorContentDir" class="space-y-3 isolate">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              {{ $t('notificationTemplates.channelTabEmail') }}
            </p>
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

          <NotificationEmailContentFrame v-if="editMode === 'visual'">
            <div
              class="border-b border-gray-200 bg-gray-50 px-4 py-2.5"
              :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
              @focusin="emailInsertTarget = 'subject'"
            >
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="apl-subject">
                {{ $t('notificationTemplates.subject') }}
              </label>
              <input
                id="apl-subject"
                ref="subjectInputRef"
                v-model="subject"
                type="text"
                class="fk-field"
                :disabled="disabled"
                @focus="emailInsertTarget = 'subject'"
              />
            </div>
            <div
              class="bg-white"
              :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
              @focusin="emailInsertTarget = 'body'"
            >
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
                  >
                    <template v-if="insertableFieldItems.length" #fields>
                      <NotificationInsertFieldsBar
                        :title="$t('notificationTemplates.insertVariables')"
                        :hint="$t('notificationTemplates.insertHintEmail')"
                        :hints="insertableFieldItems"
                        @insert="insertPlaceholderFromEmailEditor"
                      />
                    </template>
                  </NotificationTemplateEmailEditor>
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
                >
                  <template v-if="insertableFieldItems.length" #fields>
                    <NotificationInsertFieldsBar
                      :title="$t('notificationTemplates.insertVariables')"
                      :hint="$t('notificationTemplates.insertHintEmail')"
                      :hints="insertableFieldItems"
                      @insert="insertPlaceholderFromEmailEditor"
                    />
                  </template>
                </NotificationTemplateEmailEditor>
              </div>
            </div>
          </NotificationEmailContentFrame>

          <NotificationEmailContentFrame v-else>
            <div class="border-b border-gray-200 bg-gray-50 px-3 py-2" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
              <label class="mb-1.5 block text-xs font-medium text-gray-600" for="apl-subject-html">
                {{ $t('notificationTemplates.subject') }}
              </label>
              <input
                id="apl-subject-html"
                v-model="subject"
                type="text"
                class="fk-field"
                :disabled="disabled"
              />
            </div>
            <div class="bg-white" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
              <div
                v-if="insertableFieldItems.length"
                class="flex flex-wrap items-center gap-2 border-b border-slate-200/90 bg-white px-2 py-2"
              >
                <NotificationInsertFieldsBar
                  :title="$t('notificationTemplates.insertVariables')"
                  :hint="$t('notificationTemplates.insertHintEmail')"
                  :hints="insertableFieldItems"
                  @insert="insertPlaceholderEmailHtml"
                />
              </div>
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

          <div class="space-y-2">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {{ $t('notificationTemplates.channelTabSms') }}
              </p>
              <label class="mt-0.5 block text-xs font-medium text-gray-600" for="apl-sms">
                {{ $t('notificationTemplates.bodySms') }}
              </label>
              <p class="text-[10px] text-gray-400">{{ $t('notificationTemplates.smsSectionHint') }}</p>
            </div>
            <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500/40">
              <div
                v-if="insertableFieldItems.length"
                class="flex flex-wrap items-center gap-2 border-b border-slate-200/90 bg-white px-2 py-2"
              >
                <NotificationInsertFieldsBar
                  :title="$t('notificationTemplates.insertVariables')"
                  :hint="$t('notificationTemplates.insertHintSms')"
                  :hints="insertableFieldItems"
                  @insert="insertPlaceholderSms"
                />
              </div>
              <textarea
                id="apl-sms"
                ref="smsTextareaRef"
                v-model="bodySms"
                rows="3"
                class="block w-full resize-y border-0 bg-transparent px-2.5 py-1.5 text-xs leading-relaxed text-gray-900 focus:ring-0"
                :placeholder="$t('notificationTemplates.smsPlaceholder')"
                :disabled="disabled"
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
import NotificationInsertFieldsBar from '@/components/NotificationInsertFieldsBar.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
import notificationTemplateService from '@/services/notification-template.service'
import messageLetterService, { type SchoolMessageLetterRow } from '@/services/message-letter.service'
import type { ParentApprovalLetterBundle } from '@/services/activity.service'
import {
  splitNotificationBodyEditableRegion,
  splitPrefixBeforeEmailBody,
  inlineStyleFromTag,
} from '@/utils/email-template-body-region'
import { splitHtmlDocument } from '@/utils/email-template-document'
import { ensureEmailCardBodyRegion } from '@/utils/email-template-card-shell'
import { insertIntoStringAtCursor } from '@/utils/field-insert'
import DOMPurify from 'dompurify'
import {
  applyNotificationTemplateVariables,
  applyNotificationTemplateVariablesHtml,
} from '@/utils/notification-template-variables'

const props = defineProps<{
  modelValue: ParentApprovalLetterBundle
  schoolId: string
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

const insertableFieldItems = computed(() =>
  placeholderFields.map((ph) => ({
    name: ph.name,
    label: t(ph.labelKey),
  })),
)

type LocaleDraft = {
  subject: string
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
    subject: '',
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
const subject = ref('')
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
const emailInsertTarget = ref<'subject' | 'body'>('body')

const emailEditorRef = ref<InstanceType<typeof NotificationTemplateEmailEditor> | null>(null)
const smsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const htmlBodyRef = ref<HTMLTextAreaElement | null>(null)
const subjectInputRef = ref<HTMLInputElement | null>(null)

const preview = ref({ subject: '', body_html: '', body_sms: '' })
const previewLoading = ref(false)
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

const letterTemplates = ref<SchoolMessageLetterRow[]>([])
const templatesLoading = ref(false)
const selectedTemplateId = ref('')

const editorContentDir = computed<'ltr' | 'rtl'>(() => (langTab.value === 'ar' ? 'rtl' : 'ltr'))

const mergedSampleVariablesForPreview = computed(() => ({ ...props.previewSamples }))

const editorEmailCardChrome = computed(() => {
  if (!bodyRegionSplit.value) return ''
  const { chromeHtml } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  return DOMPurify.sanitize(
    applyNotificationTemplateVariablesHtml(chromeHtml, mergedSampleVariablesForPreview.value),
  )
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
  s.subject = subject.value
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
  subject.value = s.subject
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

function hydrateLocaleBlock(
  loc: 'en' | 'ar',
  block: { subject: string; body_html: string; body_sms: string | null | undefined },
) {
  const s = localeState[loc]
  s.subject = block.subject ?? ''
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

function insertPlaceholderFromEmailEditor(name: string) {
  const token = placeholderToken(name)
  if (emailInsertTarget.value === 'subject') {
    const html = insertIntoStringAtCursor(
      subject.value,
      subjectInputRef.value?.selectionStart ?? null,
      subjectInputRef.value?.selectionEnd ?? null,
      token,
    )
    subject.value = html.next
    nextTick(() => {
      const el = subjectInputRef.value
      if (el) el.setSelectionRange(html.caret, html.caret)
    })
    return
  }
  emailEditorRef.value?.insertPlaceholder(token)
}

function insertPlaceholderEmailHtml(name: string) {
  const token = placeholderToken(name)
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
      subject: localeState.en.subject,
      body_html: composedForLocale('en'),
      body_sms: localeState.en.bodySms,
    },
    ar: {
      subject: localeState.ar.subject,
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
  const subj = subject.value.trim()
  if (!subj) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  syncHtmlBufferToModelIfNeeded()
  const fullHtml = activeComposedEmailHtml()
  if (!fullHtml.trim()) {
    preview.value = {
      subject: applyNotificationTemplateVariables(subj, mergedSampleVariablesForPreview.value),
      body_html: '',
      body_sms: '',
    }
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

async function loadTemplates() {
  if (!props.schoolId) {
    letterTemplates.value = []
    return
  }
  templatesLoading.value = true
  try {
    letterTemplates.value = await messageLetterService.list(props.schoolId)
  } catch {
    letterTemplates.value = []
  } finally {
    templatesLoading.value = false
  }
}

function onTemplateChange(ev: Event) {
  const id = (ev.target as HTMLSelectElement).value
  selectedTemplateId.value = id
  if (!id) return
  const tpl = letterTemplates.value.find((x) => x.id === id)
  if (!tpl) return
  skipEmit.value = true
  hydrateLocaleBlock('en', tpl.en)
  hydrateLocaleBlock('ar', tpl.ar)
  loadActiveLocaleForm()
  editMode.value = 'visual'
  editorEpoch.value += 1
  nextTick(() => {
    skipEmit.value = false
    emitBundleFromState()
    void runPreview()
  })
}

onMounted(() => {
  skipEmit.value = true
  hydrateFromProps()
  void loadTemplates()
  nextTick(() => {
    skipEmit.value = false
    void runPreview()
  })
})

watch(
  () => props.schoolId,
  () => {
    void loadTemplates()
  },
)

watch([subject, bodyHtml, bodySms, langTab, htmlEditorBuffer, editMode], () => {
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
