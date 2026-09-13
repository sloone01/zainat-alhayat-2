import { ref, computed, watch, type Ref } from 'vue'

export function useClientPagination<T>(items: Ref<T[]>, initialPageSize = 20) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const pageSizeOptions = [10, 20, 50]

  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value) || 1))

  const paginatedItems = computed(() => {
    if (!items.value.length) return [] as T[]
    const start = (currentPage.value - 1) * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  const paginationFrom = computed(() => {
    if (!items.value.length) return 0
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const paginationTo = computed(() =>
    Math.min(currentPage.value * pageSize.value, items.value.length),
  )

  /** Up to 3 consecutive page numbers centered on the current page. */
  const visiblePages = computed(() => {
    const total = Math.max(1, totalPages.value)
    const current = Math.min(Math.max(1, currentPage.value), total)
    if (total <= 3) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    let start = current - 1
    if (start < 1) start = 1
    if (start + 2 > total) start = total - 2
    return [start, start + 1, start + 2]
  })

  watch(pageSize, () => {
    currentPage.value = 1
  })

  watch(totalPages, (pages) => {
    if (currentPage.value > pages) currentPage.value = pages
  })

  watch(
    () => items.value.length,
    () => {
      currentPage.value = 1
    },
  )

  function goToPreviousPage() {
    if (currentPage.value > 1) currentPage.value--
  }

  function goToNextPage() {
    if (currentPage.value < totalPages.value) currentPage.value++
  }

  function goToPage(page: number) {
    const next = Math.min(Math.max(1, page), Math.max(1, totalPages.value))
    currentPage.value = next
  }

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginatedItems,
    totalPages,
    visiblePages,
    paginationFrom,
    paginationTo,
    goToPreviousPage,
    goToNextPage,
    goToPage,
  }
}
