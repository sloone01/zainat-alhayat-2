import { computed, ref, watch } from 'vue'

export type ListViewMode = 'cards' | 'list'

const STORAGE_KEY = 'sm-payment-list-view-mode'

function readStored(): ListViewMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'cards' || value === 'list') return value
  } catch {
    /* ignore storage errors */
  }
  return 'cards'
}

const viewMode = ref<ListViewMode>(readStored())

watch(viewMode, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore storage errors */
  }
})

/** Shared list/card preference across payment settings list pages. */
export function useListViewMode() {
  return {
    viewMode,
    isCards: computed(() => viewMode.value === 'cards'),
    isList: computed(() => viewMode.value === 'list'),
  }
}
