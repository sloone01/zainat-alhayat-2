<template>
  <div
    v-if="pages > 0 && show"
    class="fk-pagination mt-5 flex items-center justify-center border-t border-fikr-hairline pt-4"
    :class="wrapperClass"
  >
    <UiPagination
      :page="page"
      :count="pages"
      :disabled="disabled"
      :label="$t('common.pagination')"
      :prev-label="$t('common.previous')"
      :next-label="$t('common.next')"
      :page-label="(n) => t('common.pageNumber', { page: n })"
      :status-label="(current, total) => t('common.pageOf', { current, total })"
      @update:page="onPage"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UiPagination from '@/components/ui/pagination.vue'

const props = withDefaults(
  defineProps<{
    /** 1-based current page */
    page: number
    /** Total page count (at least 1 when there are items) */
    pages: number
    /** When false, hide the control (e.g. empty list). Default true. */
    show?: boolean
    disabled?: boolean
    wrapperClass?: string
  }>(),
  {
    show: true,
    disabled: false,
    wrapperClass: '',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
  previous: []
  next: []
}>()

const { t } = useI18n()

function onPage(next: number) {
  if (next < props.page) emit('previous')
  if (next > props.page) emit('next')
  emit('update:page', next)
}
</script>
