<template>
  <div class="relative" data-attention-menu>
    <button
      type="button"
      class="relative inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100"
      :aria-label="label"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click.stop="open = !open"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span
        v-if="count > 0"
        class="absolute -top-1 -end-1 inline-flex items-center rounded-full bg-primary-600 px-1.5 py-0 text-xs font-semibold text-white"
      >
        {{ count > 99 ? '99+' : count }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute z-50 mt-2 w-80 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md"
      :class="align === 'center' ? 'start-1/2 -translate-x-1/2 rtl:translate-x-1/2' : 'end-0'"
      role="dialog"
      :aria-label="t('attention.title')"
    >
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2 class="flex items-center gap-2 text-sm font-medium">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {{ t('attention.title') }}
        </h2>
      </div>

      <div class="flex gap-2 overflow-x-auto border-b border-gray-200 px-4 py-2">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="inline-flex h-9 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium"
          :class="selected === cat.key ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'"
          @click="selected = cat.key"
        >
          {{ t(cat.labelKey) }}
        </button>
      </div>

      <p v-if="loading" class="p-4 text-center text-sm text-gray-500">
        {{ t('attention.loading') }}
      </p>
      <p v-else-if="filteredItems.length === 0" class="p-4 text-center text-sm text-gray-500">
        {{ t('attention.empty') }}
      </p>
      <div v-else class="max-h-80 divide-y divide-gray-200 overflow-y-auto">
        <button
          v-for="item in filteredItems"
          :key="item.id"
          type="button"
          class="w-full p-4 text-start transition hover:bg-gray-50"
          @click="choose(item)"
        >
          <div class="mb-1 flex items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-2">
              <NotificationGlyph :category="item.category" />
              <span class="truncate text-sm font-medium">{{ item.title }}</span>
            </div>
            <span v-if="item.time" class="shrink-0 text-xs text-gray-500">{{ item.time }}</span>
          </div>
          <p v-if="item.description" class="text-xs leading-relaxed text-gray-500">
            {{ item.description }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationGlyph from './notification-glyph.vue'

export type NotificationCategory = 'updates' | 'alerts' | 'reminders'

export type NotificationFilterItem = {
  id: string
  category: NotificationCategory
  title: string
  description: string
  time: string
  href: string
}

const props = withDefaults(
  defineProps<{
    items?: NotificationFilterItem[]
    count?: number
    loading?: boolean
    label?: string
    align?: 'center' | 'end'
  }>(),
  {
    items: () => [],
    count: 0,
    loading: false,
    label: '',
    align: 'end',
  },
)

const emit = defineEmits<{
  open: []
  select: [href: string]
}>()

const { t } = useI18n()
const open = ref(false)
const selected = ref('all')

const categories = [
  { key: 'all', labelKey: 'attention.filters.all' },
  { key: 'updates', labelKey: 'attention.filters.updates' },
  { key: 'alerts', labelKey: 'attention.filters.alerts' },
  { key: 'reminders', labelKey: 'attention.filters.reminders' },
]

const filteredItems = computed(() =>
  selected.value === 'all' ? props.items : props.items.filter((item) => item.category === selected.value),
)

watch(open, (isOpen) => {
  if (isOpen) emit('open')
})

function choose(item: NotificationFilterItem) {
  open.value = false
  emit('select', item.href)
}

function onDocumentClick(event: Event) {
  if (!open.value) return
  const el = event.target as Element | null
  if (el && !el.closest('[data-attention-menu]')) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>
