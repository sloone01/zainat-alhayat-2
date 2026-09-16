<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'
import FikrLoader from '@/components/FikrLoader.vue'

export type MessagingPeopleListItem = {
  id: string
  to: string
  name: string
  lastMessage?: string
  initials: string
  unread?: boolean
  unreadCount?: number
  variant?: 'group' | 'person'
}

const props = withDefaults(
  defineProps<{
    title: string
    sectionLabel: string
    searchId: string
    searchPlaceholder: string
    searchAria: string
    plusAria?: string
    showPlus?: boolean
    loading?: boolean
    loadingLabel?: string
    items: MessagingPeopleListItem[]
    hasSourceItems: boolean
    emptyLabel: string
    searchEmptyLabel: string
    unreadAria?: string
    ariaLabel?: string
    listDir?: 'rtl' | 'ltr'
  }>(),
  {
    showPlus: false,
    loading: false,
    loadingLabel: '',
    plusAria: '',
    unreadAria: '',
    ariaLabel: '',
    listDir: 'ltr',
  },
)

const search = defineModel<string>('search', { default: '' })

defineEmits<{
  plus: []
}>()

const listEmptyLabel = computed(() =>
  props.hasSourceItems ? props.searchEmptyLabel : props.emptyLabel,
)

function previewText(text?: string) {
  const value = (text || '').replace(/\s+/g, ' ').trim()
  if (!value) return ''
  if (value.length <= 30) return value
  return `${value.slice(0, 30)}...`
}

function unreadCount(item: MessagingPeopleListItem) {
  if (typeof item.unreadCount === 'number' && item.unreadCount > 0) return item.unreadCount
  return item.unread ? 1 : 0
}
</script>

<template>
  <div
    :dir="listDir"
    :aria-label="ariaLabel || title"
    class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white"
    role="complementary"
  >
    <header class="flex shrink-0 flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
      <h2 class="select-none text-start text-lg font-semibold text-fikr-ink">{{ title }}</h2>
      <nav v-if="showPlus" :aria-label="plusAria">
        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-md text-fikr-ink hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          :aria-label="plusAria"
          @click="$emit('plus')"
        >
          <svg
            class="size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </nav>
    </header>

    <div class="flex shrink-0 flex-col gap-3 px-4 pt-3">
      <input
        :id="searchId"
        v-model="search"
        type="text"
        :dir="listDir"
        :aria-label="searchAria"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-start text-sm text-fikr-ink placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        :placeholder="searchPlaceholder"
      >
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-3">
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500"
      >
        <FikrLoader size="sm" />
        <span v-if="loadingLabel" class="text-sm">{{ loadingLabel }}</span>
      </div>

      <section
        v-else
        :aria-labelledby="`${searchId}-section`"
        class="flex flex-col gap-1"
      >
        <h3
          :id="`${searchId}-section`"
          class="flex items-center px-4 text-start text-xs font-semibold text-gray-500"
        >
          {{ sectionLabel }}
        </h3>
        <ul class="flex flex-col gap-0.5">
          <li
            v-if="items.length === 0"
            class="px-4 py-2 text-start text-sm text-gray-500"
          >
            {{ listEmptyLabel }}
          </li>
          <li
            v-for="item in items"
            v-else
            :key="item.id"
            class="px-0"
          >
            <router-link
              :to="item.to"
              :dir="listDir"
              :aria-label="item.name"
              :class="cn(
                'group flex w-full flex-row items-center gap-4 px-4 py-2 text-start hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                unreadCount(item) > 0 ? 'bg-primary-50/40' : '',
              )"
              active-class="bg-gray-100"
            >
              <div
                :class="cn(
                  'flex shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-fikr-ink',
                  item.variant === 'person' ? 'size-8' : 'size-7',
                )"
                aria-hidden="true"
              >
                {{ item.initials }}
              </div>
              <div class="min-w-0 flex-1 text-start" style="unicode-bidi: isolate">
                <span class="block truncate text-start font-medium text-fikr-ink">{{ item.name }}</span>
                <span
                  v-if="previewText(item.lastMessage)"
                  class="block truncate text-start text-xs text-gray-500"
                >
                  {{ previewText(item.lastMessage) }}
                </span>
              </div>
              <span
                v-if="unreadCount(item) > 0"
                class="inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-transparent bg-gray-100 px-2 py-0.5 text-xs font-semibold text-fikr-ink"
                :aria-label="unreadAria || String(unreadCount(item))"
              >
                {{ unreadCount(item) }}
              </span>
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
