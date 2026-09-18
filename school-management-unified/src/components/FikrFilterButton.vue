<template>
  <button
    type="button"
    class="fk-lctl fk-lctl--icon"
    :class="count > 0 ? 'fk-lctl--navy' : ''"
    :aria-expanded="expanded"
    :aria-label="$t('common.filter')"
    @click="emit('click')"
  >
    <IconFilter />
    <span v-if="count > 0" class="fk-lctl__badge" aria-hidden="true">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import IconFilter from '@/components/icons/IconFilter.vue'

withDefaults(defineProps<{
  expanded?: boolean
  count?: number
}>(), {
  expanded: false,
  count: 0,
})

const emit = defineEmits<{
  click: []
}>()
</script>
