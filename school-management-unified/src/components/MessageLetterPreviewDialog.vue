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

        <div class="overflow-y-auto p-5">
          <div v-if="loading" class="py-12 text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
          <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ error }}
          </div>
          <MessageLetterCardFrame
            v-else-if="cardSrcdoc"
            :srcdoc="cardSrcdoc"
            :locale="content?.locale ?? 'ar'"
            title="message-letter-preview"
          />
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

const props = defineProps<{
  open: boolean
  messageId: string | null
  recipientUserId?: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
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
