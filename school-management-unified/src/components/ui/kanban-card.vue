<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(defineProps<{
  as?: 'article' | 'button'
  title: string
  description?: string
  coverImage?: string
  muted?: boolean
  priority?: 'high' | 'medium' | 'low'
  priorityLabel?: string
}>(), {
  as: 'article',
})

const slots = useSlots()
const showFooter = computed(() => Boolean(slots.meta || slots.avatars))
const showHeader = computed(() => Boolean(slots.tags || slots.actions || props.priority))

const priorityClass = computed(() => {
  switch (props.priority) {
    case 'high':
      return 'text-red-600 bg-red-50'
    case 'medium':
      return 'text-orange-600 bg-orange-50'
    case 'low':
      return 'text-blue-600 bg-blue-50'
    default:
      return ''
  }
})

const rootClass = computed(() => cn(
  'group fk-kcard',
  props.as === 'button' && 'cursor-pointer text-start',
  props.muted && 'opacity-75',
))
</script>

<template>
  <component
    :is="as"
    :class="rootClass"
    :type="as === 'button' ? 'button' : undefined"
  >
    <div v-if="coverImage" class="fk-kcard__cover">
      <img :src="coverImage" alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
    </div>

    <div class="fk-kcard__inner">
      <div v-if="showHeader" class="fk-kcard__top">
        <div class="fk-kcard__tags">
          <slot name="tags" />
          <span
            v-if="priority && priorityLabel"
            class="fk-kprio"
            :class="priorityClass"
          >
            {{ priorityLabel }}
          </span>
        </div>
        <div v-if="$slots.actions" class="fk-kcard__actions">
          <slot name="actions" />
        </div>
      </div>

      <div class="fk-kcard__main">
        <h3 class="fk-kcard__title">{{ title }}</h3>
        <p v-if="description" class="fk-kcard__desc">{{ description }}</p>
        <slot />
      </div>

      <div v-if="showFooter" class="fk-kcard__footer">
        <div class="fk-kcard__meta">
          <slot name="meta" />
        </div>
        <div v-if="$slots.avatars" class="fk-kcard__avatars">
          <slot name="avatars" />
        </div>
      </div>
    </div>
  </component>
</template>
