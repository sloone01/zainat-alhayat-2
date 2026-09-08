<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('notificationTemplates.title')"
        :subtitle="isPlatform ? $t('notificationTemplates.platformSubtitle') : $t('notificationTemplates.subtitle')"
      />

      <p v-if="isPlatform" class="text-sm text-fikr-ink-soft">
        {{ $t('notificationTemplates.platformHint') }}
      </p>
      <div
        v-if="isPlatform"
        class="inline-flex w-full max-w-xl rounded-xl border border-teal-100/90 p-1 bg-teal-50/50 shadow-sm"
        role="tablist"
      >
        <button
          v-for="tab in audienceTabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
          :class="
            audienceFilter === tab.id
              ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
              : 'text-gray-600 hover:text-gray-900'
          "
          @click="setAudienceFilter(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
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
              <label class="mb-1 block text-[11px] font-medium text-gray-600" for="nt-template-select">{{
                $t('notificationTemplates.selectTemplate')
              }}</label>
              <select
                id="nt-template-select"
                class="fk-field fk-field--sm min-w-0 w-full"
                :value="selectedKey"
                :disabled="!templates.length"
                @change="onTemplateDropdownChange"
              >
                <option v-if="!templates.length" value="">{{ $t('notificationTemplates.emptyList') }}</option>
                <option v-for="tpl in templates" :key="tpl.template_key" :value="tpl.template_key">
                  {{ templateListLabel(tpl) }}
                </option>
              </select>
            </div>
            <div v-if="showLayoutPicker" class="min-w-0 flex-1">
              <label class="mb-1 block text-[11px] font-medium text-gray-600" for="nt-layout-select">{{
                $t('notificationTemplates.selectLayout')
              }}</label>
              <select
                id="nt-layout-select"
                v-model="selectedLayoutId"
                class="fk-field fk-field--sm w-full"
                :disabled="!layouts.length"
              >
                <option value="">{{ $t('notificationTemplates.layoutSchoolDefault') }}</option>
                <option v-for="lay in layouts" :key="lay.id" :value="lay.id">
                  {{ layoutListLabel(lay) }}{{ lay.is_default ? ` (${$t('notificationLayouts.badgeDefault')})` : '' }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="current" class="mt-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div class="space-y-4">
            <div
              class="flex flex-col items-center gap-4"
              :aria-label="$t('notificationTemplates.editorTabsAria')"
            >
              <div class="w-full max-w-md text-center">
                <p class="mb-3 text-sm font-semibold text-gray-900">
                  {{ $t('notificationTemplates.contentBodyLanguageLabel') }}
                </p>
                <div
                  class="inline-flex w-full max-w-sm justify-center rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm sm:w-auto"
                  role="tablist"
                  :aria-label="$t('notificationTemplates.contentBodyLanguageLabel')"
                >
                  <button
                    type="button"
                    role="tab"
                    class="min-w-[7.5rem] flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none"
                    :class="
                      langTab === 'en'
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                        : 'text-gray-600 hover:text-gray-900'
                    "
                    :aria-selected="langTab === 'en'"
                    :title="$t('notificationTemplates.langEnHint')"
                    @click="setLangTab('en')"
                  >
                    {{ $t('notificationTemplates.langEn') }}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="min-w-[7.5rem] flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none"
                    :class="
                      langTab === 'ar'
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                        : 'text-gray-600 hover:text-gray-900'
                    "
                    :aria-selected="langTab === 'ar'"
                    :title="$t('notificationTemplates.langArHint')"
                    @click="setLangTab('ar')"
                  >
                    {{ $t('notificationTemplates.langAr') }}
                  </button>
                </div>
              </div>
              <div v-if="isBothChannel" class="w-full max-w-md text-center">
                <p class="mb-1.5 text-xs font-medium text-gray-600">
                  {{ $t('notificationTemplates.channelGroupLabel') }}
                </p>
                <div
                  class="inline-flex justify-center rounded-xl border border-sky-100 bg-sky-50/60 p-1 shadow-sm"
                  role="tablist"
                  :aria-label="$t('notificationTemplates.channelGroupLabel')"
                >
                  <button
                    type="button"
                    role="tab"
                    class="min-w-[7.5rem] whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                    :class="
                      channelTab === 'email'
                        ? 'bg-white text-sky-800 shadow-sm ring-1 ring-sky-200'
                        : 'text-gray-600 hover:text-gray-900'
                    "
                    :aria-selected="channelTab === 'email'"
                    @click="setChannelTab('email')"
                  >
                    {{ $t('notificationTemplates.channelTabEmail') }}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    class="min-w-[7.5rem] whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
                    :class="
                      channelTab === 'sms'
                        ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-200'
                        : 'text-gray-600 hover:text-gray-900'
                    "
                    :aria-selected="channelTab === 'sms'"
                    @click="setChannelTab('sms')"
                  >
                    {{ $t('notificationTemplates.channelTabSms') }}
                  </button>
                </div>
              </div>
            </div>

            <div :dir="editorContentDir" class="space-y-4 isolate">
            <!-- Email: subject + visual body -->
            <div v-if="showEmailEditorPane" class="space-y-3">
              <NotificationEmailContentFrame>
                <div
                  class="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-5"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                >
                  <div class="flex flex-wrap items-end gap-2">
                    <div class="min-w-0 flex-1">
                      <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nt-subject">{{
                        $t('notificationTemplates.subject')
                      }}</label>
                      <div
                        v-if="isSubjectLocked"
                        id="nt-subject"
                        class="flex flex-wrap items-baseline gap-x-1 gap-y-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                      >
                        <span class="text-gray-700">{{ paymentReceiptSubjectPrefix }}</span>
                        <span class="font-semibold text-gray-900">{{ lockedSchoolDisplayName }}</span>
                      </div>
                      <input
                        v-else
                        id="nt-subject"
                        ref="subjectInputRef"
                        v-model="subject"
                        type="text"
                        class="fk-field"
                        @focus="onSubjectFocus"
                      />
                    </div>
                    <button
                      type="button"
                      class="fk-btn fk-btn--pearl shrink-0"
                      :disabled="saving || previewLoading"
                      @click="openPreviewDialog"
                    >
                      {{ $t('notificationTemplates.previewButton') }}
                    </button>
                  </div>
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
                    <div v-if="editorEmailCardChrome" v-html="editorEmailCardChrome" />
                    <div class="nt-email-body" :style="editorEmailBodyStyle">
                      <NotificationTemplateEmailEditor
                        ref="emailEditorRef"
                        v-model="bodyHtml"
                        embedded
                        in-card-body
                        :disabled="saving"
                        :remount-key="`${selectedKey}-${langTab}-${editorEpoch}`"
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
                  <NotificationTemplateEmailEditor
                    v-else
                    ref="emailEditorRef"
                    v-model="bodyHtml"
                    embedded
                    :disabled="saving"
                    :remount-key="`${selectedKey}-${langTab}-${editorEpoch}`"
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
              </NotificationEmailContentFrame>
            </div>

            <!-- SMS: plain text only -->
            <div v-if="showSmsEditorPane" class="space-y-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600" for="nt-sms">{{ $t('notificationTemplates.bodySms') }}</label>
                <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                    id="nt-sms"
                    ref="smsTextareaRef"
                    v-model="bodySms"
                    rows="7"
                    class="block min-h-[10rem] w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
                  />
                </div>
              </div>
            </div>

            </div>

            <div class="flex flex-wrap items-center justify-end gap-2 border-t border-fikr-hairline pt-4">
              <button
                v-if="!showEmailEditorPane"
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving || previewLoading"
                @click="openPreviewDialog"
              >
                {{ $t('notificationTemplates.previewButton') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--pearl"
                :disabled="saving"
                @click="resetToDefault"
              >
                {{ isPlatform ? $t('notificationTemplates.resetFactory') : $t('notificationTemplates.reset') }}
              </button>
              <button
                type="button"
                class="fk-btn fk-btn--primary"
                :disabled="saving"
                @click="save"
              >
                {{ saving ? $t('common.loading') : $t('common.save') }}
              </button>
            </div>
          </div>
        </div>

        <FikrDialog
          :show="showPreviewDialog"
          plain-footer
          size="lg"
          :title="$t('notificationTemplates.previewHeading')"
          :subtitle="current ? templateListLabel(current) : ''"
          @close="closePreviewDialog"
        >
          <div
            class="mb-4 inline-flex w-full rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm"
            role="tablist"
            :aria-label="$t('notificationTemplates.previewHeading')"
          >
            <button
              type="button"
              role="tab"
              class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
              :class="
                previewDialogTab === 'preview'
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :aria-selected="previewDialogTab === 'preview'"
              @click="setPreviewDialogTab('preview')"
            >
              {{ $t('notificationTemplates.previewHeading') }}
            </button>
            <button
              type="button"
              role="tab"
              class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
              :class="
                previewDialogTab === 'samples'
                  ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                  : 'text-gray-600 hover:text-gray-900'
              "
              :aria-selected="previewDialogTab === 'samples'"
              @click="setPreviewDialogTab('samples')"
            >
              {{ $t('notificationTemplates.sampleValues') }}
            </button>
          </div>
          <div v-show="previewDialogTab === 'preview'" class="relative min-h-[240px]">
            <div
              v-if="previewLoading"
              class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80"
              aria-busy="true"
              aria-live="polite"
            >
              <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            </div>
            <div class="transition-opacity" :class="previewLoading ? 'pointer-events-none opacity-50' : ''">
              <NotificationEmailContentFrame v-if="showPreviewEmailPane">
                <div
                  class="border-b border-gray-200 bg-gray-50 px-5 py-4"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                >
                  <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {{ $t('notificationTemplates.previewSubjectLabel') }}
                  </p>
                  <p class="mt-1.5 text-base font-semibold leading-snug text-gray-900 break-words">
                    {{ preview.subject }}
                  </p>
                </div>
                <div class="bg-white">
                  <iframe
                    ref="previewIframeRef"
                    title="email-preview"
                    class="block w-full border-0 bg-white"
                    style="min-height: 280px"
                    :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                    sandbox="allow-same-origin"
                    scrolling="no"
                    :srcdoc="previewHtmlSrcdoc"
                    @load="syncPreviewIframeHeight"
                  />
                </div>
              </NotificationEmailContentFrame>
              <NotificationEmailContentFrame v-else-if="showPreviewSmsPane">
                <div
                  class="flex min-h-[240px] flex-col justify-end bg-[#e8e8ed] px-5 py-8"
                  :class="editorContentDir === 'rtl' ? 'items-end' : 'items-start'"
                >
                  <div
                    class="max-w-[min(92%,22rem)] rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed text-gray-900 shadow-sm whitespace-pre-wrap break-words"
                    :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                  >
                    {{ preview.body_sms }}
                  </div>
                </div>
              </NotificationEmailContentFrame>
            </div>
          </div>
          <div v-show="previewDialogTab === 'samples'" class="space-y-3">
            <p class="text-xs text-gray-500">{{ $t('notificationTemplates.sampleValuesHint') }}</p>
            <div class="grid sm:grid-cols-2 gap-3">
              <div v-for="h in variableHintsForSamples" :key="h.name">
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ hintDisplayLabel(h) }}</label>
                <template v-if="isLockedSampleVarKey(h.name)">
                  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                    {{ lockedSampleDisplay(h.name) }}
                  </div>
                  <img
                    v-if="h.name === 'schoolLogo' && lockedSampleDisplay(h.name)"
                    :src="lockedSampleDisplay(h.name)"
                    alt=""
                    class="mb-2 h-10 w-auto max-w-[7rem] rounded border border-gray-200 bg-white object-contain p-1"
                  />
                  <p class="text-[11px] text-gray-500 mt-1">{{ $t('notificationTemplates.schoolNameLockedHint') }}</p>
                </template>
                <input
                  v-else
                  v-model="sampleVars[h.name]"
                  type="text"
                  class="fk-field"
                />
              </div>
            </div>
          </div>
          <template #footer>
            <button type="button" class="fk-btn fk-btn--pearl" @click="closePreviewDialog">
              {{ $t('common.close') }}
            </button>
          </template>
        </FikrDialog>
      </template>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import NotificationEmailContentFrame from '@/components/NotificationEmailContentFrame.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
import NotificationInsertFieldsBar from '@/components/NotificationInsertFieldsBar.vue'
import { authService } from '@/services'
import notificationTemplateService, {
  type MergedNotificationTemplate,
  type NotificationTemplateVariableHint,
} from '@/services/notification-template.service'
import notificationLayoutService, {
  type NotificationLayout,
} from '@/services/notification-layout.service'
import {
  splitNotificationBodyEditableRegion,
  splitPrefixBeforeEmailBody,
  inlineStyleFromTag,
} from '@/utils/email-template-body-region'
import { splitHtmlDocument } from '@/utils/email-template-document'
import { insertIntoStringAtCursor } from '@/utils/field-insert'
import DOMPurify from 'dompurify'
import { applyNotificationTemplateVariablesHtml } from '@/utils/notification-template-variables'

/** Placeholder keys that always use live school data — never editable as sample text. */
const LOCKED_SAMPLE_VAR_KEYS = new Set(['schoolName', 'schoolLogo', 'schoolLogoHtml'])

/** Payment receipt subject is fixed per locale; `{{schoolName}}` resolves from the school. */
const PAYMENT_RECEIPT_TEMPLATE_KEY = 'payment.receipt'
const PAYMENT_RECEIPT_SUBJECT_EN = 'Payment received — {{schoolName}}'
const PAYMENT_RECEIPT_SUBJECT_AR = 'تم استلام الدفعة — {{schoolName}}'

const { locale, t, te } = useI18n()
const route = useRoute()
const isRTL = computed(() => locale.value === 'ar')
const isPlatform = computed(() => route.path.startsWith('/platform/'))
const audienceFilter = ref<'all' | 'school' | 'system'>('all')
const audienceTabs = computed(() => [
  { id: 'all' as const, label: t('notificationTemplates.audienceAll') },
  { id: 'school' as const, label: t('notificationTemplates.audienceSchool') },
  { id: 'system' as const, label: t('notificationTemplates.audienceSystem') },
])

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const loading = ref(true)
const saving = ref(false)
const previewLoading = ref(false)
const flashError = ref('')
const flashOk = ref('')

const templates = ref<MergedNotificationTemplate[]>([])
const layouts = ref<NotificationLayout[]>([])
const selectedKey = ref('')
const selectedLayoutId = ref('')
const subject = ref('')
const bodyHtml = ref('')
const bodySms = ref('')
const sampleVars = reactive<Record<string, string>>({})
const defaultSamples = ref<Record<string, string>>({})

const preview = ref({ subject: '', body_html: '', body_sms: '' })
const showPreviewDialog = ref(false)
const previewDialogTab = ref<'preview' | 'samples'>('preview')

/** When set, `bodyHtml` is only the inner HTML; full document = open + inner + close */
const emailDocParts = ref<{ open: string; close: string } | null>(null)
const bodyInnerPrefix = ref('')
const bodyInnerSuffix = ref('')
const bodyRegionSplit = ref(false)
const bodyRegionKind = ref<'div' | 'table' | null>(null)
const editorEpoch = ref(0)

const subjectInputRef = ref<HTMLInputElement | null>(null)
const smsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const emailEditorRef = ref<InstanceType<typeof NotificationTemplateEmailEditor> | null>(null)

/** For templates with `both`, which editor pane is active. */
const channelTab = ref<'email' | 'sms'>('email')
/** When editing email, whether placeholders go to subject or body. */
const emailInsertTarget = ref<'subject' | 'body'>('body')

type LocaleDraft = {
  subject: string
  bodyHtml: string
  bodySms: string
  emailDocParts: { open: string; close: string } | null
  /** When true, `bodyHtml` is only the main cell region; prefix/suffix keep the receipt card chrome. */
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

/** Which language variant is being edited (English / Arabic). */
const langTab = ref<'en' | 'ar'>('en')

/** Subject/body fields follow the template language tab (not the UI locale). */
const editorContentDir = computed<'ltr' | 'rtl'>(() => (langTab.value === 'ar' ? 'rtl' : 'ltr'))

const paymentReceiptSubjectPrefix = computed(() => {
  const raw = langTab.value === 'ar' ? PAYMENT_RECEIPT_SUBJECT_AR : PAYMENT_RECEIPT_SUBJECT_EN
  return raw.replace(/\{\{\s*schoolName\s*\}\}/, '').trimEnd()
})

const current = computed(() => templates.value.find((x) => x.template_key === selectedKey.value))

const isBothChannel = computed(() => current.value?.channel === 'both')

const emailChannelAvailable = computed(() => {
  const ch = current.value?.channel
  return ch === 'email' || ch === 'both'
})

const smsChannelAvailable = computed(() => {
  const ch = current.value?.channel
  return ch === 'sms' || ch === 'both'
})

const isSubjectLocked = computed(() => selectedKey.value === PAYMENT_RECEIPT_TEMPLATE_KEY)

const lockedSchoolDisplayName = computed(() => defaultSamples.value.schoolName?.trim() || '—')

function mergedSampleVariables(): Record<string, string> {
  const out = { ...sampleVars }
  for (const key of LOCKED_SAMPLE_VAR_KEYS) {
    const v = defaultSamples.value[key]
    if (v !== undefined) out[key] = v
  }
  return out
}

const mergedSampleVariablesForPreview = computed(() => mergedSampleVariables())

const showEmailEditorPane = computed(() => {
  const ch = current.value?.channel
  if (ch === 'email') return true
  if (ch === 'both') return channelTab.value === 'email'
  return false
})

const showSmsEditorPane = computed(() => {
  const ch = current.value?.channel
  if (ch === 'sms') return true
  if (ch === 'both') return channelTab.value === 'sms'
  return false
})

const showPreviewEmailPane = computed(() => showEmailEditorPane.value)
const showPreviewSmsPane = computed(() => showSmsEditorPane.value)

const showLayoutPicker = computed(
  () => !isPlatform.value && !!current.value && emailChannelAvailable.value,
)

function layoutListLabel(lay: NotificationLayout): string {
  if (locale.value === 'ar' && lay.name_ar?.trim()) return lay.name_ar
  return lay.name
}

const runPreview = useDebounceFn(async () => {
  const tpl = templates.value.find((x) => x.template_key === selectedKey.value)
  const ch = tpl?.channel ?? 'both'
  const needHtml = ch === 'email' || ch === 'both'
  const needSms = ch === 'sms' || ch === 'both'
  if (!subject.value.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  const fullHtml = composedEmailHtml()
  if (needHtml && !fullHtml.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  previewLoading.value = true
  try {
    const htmlPayload = needHtml ? fullHtml : '<p></p>'
    const payload = {
      locale: langTab.value,
      subject: subject.value,
      body_html: htmlPayload,
      body_sms: needSms ? bodySms.value : '',
      sample_variables: mergedSampleVariablesForPreview.value,
      ...(isPlatform.value
        ? {}
        : {
            school_id: schoolId.value,
            layout_id: selectedLayoutId.value || null,
          }),
    }
    preview.value = isPlatform.value
      ? await notificationTemplateService.previewPlatform(payload)
      : await notificationTemplateService.preview(payload)
  } catch {
    preview.value = { subject: '', body_html: '', body_sms: '' }
  } finally {
    previewLoading.value = false
    void nextTick(() => syncPreviewIframeHeight())
  }
}, 400)

function syncChannelTab() {
  const ch = current.value?.channel
  if (ch === 'sms') channelTab.value = 'sms'
  else if (ch === 'email') channelTab.value = 'email'
  else if (ch === 'both') {
    const s = localeState[langTab.value]
    const html = (s.bodyHtml ?? '').trim()
    const sms = (s.bodySms ?? '').trim()
    channelTab.value = html || !sms ? 'email' : 'sms'
  } else {
    channelTab.value = 'email'
  }
}

function flushActiveLocaleToStore() {
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
  flushActiveLocaleToStore()
  langTab.value = loc
  loadActiveLocaleForm()
  editorEpoch.value += 1
  if (showPreviewDialog.value) runPreview()
}

function setChannelTab(ch: 'email' | 'sms') {
  if (ch === 'email' && !emailChannelAvailable.value) return
  if (ch === 'sms' && !smsChannelAvailable.value) return
  if (ch === channelTab.value) return
  channelTab.value = ch
  if (showPreviewDialog.value) runPreview()
}

async function openPreviewDialog() {
  previewDialogTab.value = 'preview'
  showPreviewDialog.value = true
  await runPreview()
}

function closePreviewDialog() {
  showPreviewDialog.value = false
  previewDialogTab.value = 'preview'
}

function setPreviewDialogTab(tab: 'preview' | 'samples') {
  previewDialogTab.value = tab
  if (tab === 'preview') {
    void nextTick(() => syncPreviewIframeHeight())
  }
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

function hydrateLocaleFromMerged(
  templateKey: string,
  loc: 'en' | 'ar',
  block: { subject: string; body_html: string; body_sms: string },
) {
  const s = localeState[loc]
  let subj = block.subject
  if (templateKey === PAYMENT_RECEIPT_TEMPLATE_KEY) {
    subj = loc === 'ar' ? PAYMENT_RECEIPT_SUBJECT_AR : PAYMENT_RECEIPT_SUBJECT_EN
  }
  s.subject = subj
  const split = splitHtmlDocument(block.body_html)
  if (split) {
    s.emailDocParts = { open: split.open, close: split.close }
    const reg = splitNotificationBodyEditableRegion(split.inner)
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

function onSubjectFocus() {
  if (isSubjectLocked.value) return
  if (showEmailEditorPane.value) emailInsertTarget.value = 'subject'
}

const placeholderHintsInsertable = computed((): NotificationTemplateVariableHint[] =>
  (current.value?.variable_hints ?? []).filter((h) => !LOCKED_SAMPLE_VAR_KEYS.has(h.name)),
)

/** Arabic UI: show Arabic names for merge fields; otherwise use API description (English). */
function hintDisplayLabel(h: NotificationTemplateVariableHint): string {
  const key = `notificationTemplates.var.${h.name}`
  if (locale.value === 'ar' && te(key)) return t(key)
  return h.description
}

const insertableFieldItems = computed(() =>
  placeholderHintsInsertable.value.map((h) => ({
    name: h.name,
    label: hintDisplayLabel(h),
  })),
)

const variableHintsForSamples = computed((): NotificationTemplateVariableHint[] => {
  const hints = current.value?.variable_hints
  const list = hints?.length
    ? hints
    : Object.keys(sampleVars).map((name) => ({ name, description: name }))
  return list.filter((h) => h.name !== 'schoolLogoHtml')
})

function isLockedSampleVarKey(name: string): boolean {
  return LOCKED_SAMPLE_VAR_KEYS.has(name)
}

function lockedSampleDisplay(name: string): string {
  if (name === 'schoolLogoHtml') {
    return defaultSamples.value.schoolLogo?.trim()
      ? t('notificationTemplates.schoolLogoFromSettings')
      : t('notificationTemplates.schoolLogoMissing')
  }
  return defaultSamples.value[name] ?? ''
}

const editorEmailCardChrome = computed(() => {
  if (!bodyRegionSplit.value) return ''
  const { chromeHtml } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  // Substituted values are escaped, and the whole fragment is sanitized before v-html.
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

function purgeLockedSampleVarsFromReactive() {
  for (const key of LOCKED_SAMPLE_VAR_KEYS) {
    delete sampleVars[key]
  }
}

function composedEmailHtml(): string {
  const parts = emailDocParts.value
  const inner = bodyRegionSplit.value
    ? bodyInnerPrefix.value + bodyHtml.value + bodyInnerSuffix.value
    : bodyHtml.value
  if (parts) return `${parts.open}${inner}${parts.close}`
  return inner
}

const previewHtmlSrcdoc = computed(() => preview.value.body_html || '')
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

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

watch(previewHtmlSrcdoc, () => {
  void nextTick(() => syncPreviewIframeHeight())
})

function applyFormFromMerged(m: MergedNotificationTemplate) {
  hydrateLocaleFromMerged(m.template_key, 'en', m.en)
  hydrateLocaleFromMerged(m.template_key, 'ar', m.ar)
  selectedLayoutId.value = m.layout_id ?? ''
  loadActiveLocaleForm()
  editorEpoch.value += 1
}

function mergeSampleKeys(m: MergedNotificationTemplate, base: Record<string, string>) {
  const hints = m.variable_hints || []
  for (const key of Object.keys(sampleVars)) {
    if (!hints.some((h) => h.name === key)) {
      delete sampleVars[key]
    }
  }
  for (const h of hints) {
    if (LOCKED_SAMPLE_VAR_KEYS.has(h.name)) {
      delete sampleVars[h.name]
      continue
    }
    if (sampleVars[h.name] === undefined || sampleVars[h.name] === '') {
      sampleVars[h.name] = base[h.name] ?? ''
    }
  }
}

function placeholderToken(name: string): string {
  return `{{${name}}}`
}

function insertPlaceholderEmail(name: string) {
  const token = placeholderToken(name)
  if (emailInsertTarget.value === 'subject') {
    if (isSubjectLocked.value) return
    const { next, caret } = insertIntoStringAtCursor(
      subject.value,
      subjectInputRef.value?.selectionStart ?? null,
      subjectInputRef.value?.selectionEnd ?? null,
      token,
    )
    subject.value = next
    nextTick(() => {
      const el = subjectInputRef.value
      if (el) el.setSelectionRange(caret, caret)
    })
    return
  }
  emailEditorRef.value?.insertPlaceholder(token)
}

function insertPlaceholderFromEmailEditor(name: string) {
  emailInsertTarget.value = 'body'
  insertPlaceholderEmail(name)
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

/** Dropdown / sort: use i18n title when present (Arabic UI + English parity). */
function templateListLabel(tpl: MergedNotificationTemplate): string {
  const slug = tpl.template_key.replace(/\./g, '_')
  const key = `notificationTemplates.templateTitles.${slug}`
  if (te(key)) return t(key)
  return tpl.display_name
}

function setAudienceFilter(id: 'all' | 'school' | 'system') {
  audienceFilter.value = id
  void loadAll()
}

async function loadAll() {
  loading.value = true
  flashError.value = ''
  try {
    const [list, samples, layoutList] = isPlatform.value
      ? await Promise.all([
          notificationTemplateService.listForPlatform(audienceFilter.value),
          notificationTemplateService.sampleVariablesPlatform(),
          Promise.resolve([] as NotificationLayout[]),
        ])
      : await Promise.all([
          notificationTemplateService.listForSchool(schoolId.value),
          notificationTemplateService.sampleVariables(schoolId.value),
          notificationLayoutService.list({ schoolId: schoolId.value }).catch(() => [] as NotificationLayout[]),
        ])
    layouts.value = layoutList
    const collator = locale.value === 'ar' ? 'ar' : 'en'
    templates.value = [...list].sort((a, b) =>
      templateListLabel(a).localeCompare(templateListLabel(b), collator),
    )
    defaultSamples.value = { ...samples }
    Object.keys(sampleVars).forEach((k) => delete sampleVars[k])
    Object.assign(sampleVars, samples)
    purgeLockedSampleVarsFromReactive()
    if (!selectedKey.value && list.length) {
      selectedKey.value = list[0].template_key
    }
    const m = list.find((x) => x.template_key === selectedKey.value)
    langTab.value = locale.value === 'ar' ? 'ar' : 'en'
    if (m) {
      applyFormFromMerged(m)
      mergeSampleKeys(m, defaultSamples.value)
      syncChannelTab()
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationTemplates.loadError')
  } finally {
    loading.value = false
  }
}

function selectTemplate(key: string) {
  flushActiveLocaleToStore()
  selectedKey.value = key
  const m = templates.value.find((x) => x.template_key === key)
  if (!m) return
  applyFormFromMerged(m)
  mergeSampleKeys(m, { ...defaultSamples.value, ...sampleVars })
  syncChannelTab()
}

function onTemplateDropdownChange(ev: Event) {
  const key = (ev.target as HTMLSelectElement).value
  if (key) selectTemplate(key)
}

watch([subject, bodyHtml, bodySms, langTab, selectedLayoutId, channelTab], () => {
  if (showPreviewDialog.value) runPreview()
})
watch(
  sampleVars,
  () => {
    if (showPreviewDialog.value) runPreview()
  },
  { deep: true },
)

/** Persist latest Quill HTML before the email editor unmounts when switching Email ↔ SMS. */
watch(
  channelTab,
  (_newTab, oldTab) => {
    if (!isBothChannel.value) return
    if (oldTab === 'email') {
      const inst = emailEditorRef.value as { getModelHtml?: () => string } | null
      const html = inst?.getModelHtml?.()
      if (typeof html === 'string') bodyHtml.value = html
      flushActiveLocaleToStore()
    }
  },
  { flush: 'pre' },
)

async function save() {
  if (!selectedKey.value) return
  saving.value = true
  flashOk.value = ''
  flashError.value = ''
  try {
    flushActiveLocaleToStore()
    const payload = {
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
      ...(isPlatform.value ? {} : { layout_id: selectedLayoutId.value || null }),
    }
    const updated = isPlatform.value
      ? await notificationTemplateService.updatePlatform(selectedKey.value, payload)
      : await notificationTemplateService.update(schoolId.value, selectedKey.value, payload)
    const idx = templates.value.findIndex((x) => x.template_key === selectedKey.value)
    if (idx >= 0) templates.value[idx] = updated
    applyFormFromMerged(updated)
    flashOk.value = t('notificationTemplates.saved')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
    await runPreview()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationTemplates.saveError')
  } finally {
    saving.value = false
  }
}

async function resetToDefault() {
  if (!selectedKey.value) return
  saving.value = true
  flashOk.value = ''
  flashError.value = ''
  try {
    const updated = isPlatform.value
      ? await notificationTemplateService.resetPlatform(selectedKey.value)
      : await notificationTemplateService.reset(schoolId.value, selectedKey.value)
    const idx = templates.value.findIndex((x) => x.template_key === selectedKey.value)
    if (idx >= 0) templates.value[idx] = updated
    applyFormFromMerged(updated)
    flashOk.value = isPlatform.value
      ? t('notificationTemplates.resetFactoryDone')
      : t('notificationTemplates.resetDone')
    setTimeout(() => {
      flashOk.value = ''
    }, 3000)
    await runPreview()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('notificationTemplates.saveError')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadAll()
  await runPreview()
})
</script>
