<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('messageLetters.viewLetter')"
      @click.self="emit('update:open', false)"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
        :dir="isRTL ? 'rtl' : 'ltr'"
      >
        <div class="flex items-start justify-between gap-2 border-b border-gray-200 px-5 py-4">
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ $t('messageLetters.viewLetter') }}</h3>
            <p v-if="content?.subject" class="mt-1 text-sm font-medium text-gray-700 line-clamp-2">
              {{ content.subject }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            :aria-label="$t('common.close')"
            @click="emit('update:open', false)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-5">
          <div v-if="loading" class="py-12 text-center">
            <FikrLoader size="sm" />
          </div>
          <div v-else-if="error" role="alert" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ error }}
          </div>
          <MessageLetterCardFrame
            v-else-if="cardSrcdoc"
            :srcdoc="cardSrcdoc"
            :locale="content?.locale ?? 'ar'"
            title="message-letter-preview"
          />
        </div>

        <div
          v-if="canApprove || statusLabel"
          class="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 px-5 py-4"
        >
          <span
            v-if="statusLabel && !canApprove"
            class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
          <template v-if="canApprove">
            <button
              type="button"
              class="fk-btn fk-btn--danger"
              :disabled="busy"
              @click="emit('reject')"
            >
              {{ $t('messageLetters.rejectLetter') }}
            </button>
            <button
              type="button"
              class="fk-btn fk-btn--primary"
              :disabled="busy"
              @click="emit('approve')"
            >
              {{ $t('messageLetters.approveLetter') }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MessageLetterCardFrame from '@/components/MessageLetterCardFrame.vue'
import { chatApiService, type RenderedMessageLetter } from '@/services/chat.service'
import { buildEmailCardPreviewSrcdoc } from '@/utils/email-template-card-preview'
import FikrLoader from '@/components/FikrLoader.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    messageId: string | null
    recipientUserId?: string | null
    canApprove?: boolean
    busy?: boolean
    status?: 'not_sent' | 'pending' | 'approved' | 'rejected' | string | null
  }>(),
  {
    canApprove: false,
    busy: false,
    status: null,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  approve: []
  reject: []
}>()

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(false)
const error = ref('')
const content = ref<RenderedMessageLetter | null>(null)

const cardSrcdoc = computed(() => {
  if (!content.value?.body_html) return ''
  const loc = content.value.locale === 'ar' ? 'ar' : 'en'
  return buildEmailCardPreviewSrcdoc(content.value.body_html, loc)
})

const statusLabel = computed(() => {
  if (props.status === 'approved') return t('messageLetters.letterApproved')
  if (props.status === 'rejected') return t('messageLetters.letterRejected')
  return ''
})

const statusClass = computed(() => {
  if (props.status === 'approved') return 'bg-emerald-100 text-emerald-900'
  if (props.status === 'rejected') return 'bg-red-100 text-red-900'
  return 'bg-gray-100 text-gray-800'
})

async function load() {
  if (!props.messageId) return
  loading.value = true
  error.value = ''
  content.value = null
  try {
    const loc = locale.value === 'ar' ? 'ar' : 'en'
    content.value = await chatApiService.getRenderedMessageLetter(
      props.messageId,
      loc,
      props.recipientUserId ?? undefined,
    )
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err?.message || t('messageLetters.previewError')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.open, props.messageId, props.recipientUserId] as const,
  ([open, id]) => {
    if (open && id) void load()
  },
)
</script>
