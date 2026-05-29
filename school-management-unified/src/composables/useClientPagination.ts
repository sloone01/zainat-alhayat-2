import { ref, computed, watch, type Ref } from 'vue'

export function useClientPagination<T>(items: Ref<T[]>, initialPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const pageSizeOptions = [10, 20, 50]

  const totalPages = computed(() => Math.max(1, Math.ceil(items.value.length / pageSize.value)))

  const paginatedItems = computed(() => {
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

  return {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginatedItems,
    totalPages,
    paginationFrom,
    paginationTo,
    goToPreviousPage,
    goToNextPage,
  }
}
