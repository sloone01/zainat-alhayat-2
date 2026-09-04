<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    :aria-label="$t('students.searchParentDatabase')"
    @click="closeModal"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
      :dir="isRTL ? 'rtl' : 'ltr'"
      @click.stop
    >
      <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 class="text-base font-semibold text-gray-900">{{ $t('students.searchParentDatabase') }}</h2>
        <button
          type="button"
          class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
          :aria-label="$t('common.close')"
          @click="closeModal"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-3 border-b border-gray-200 p-4">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-700">{{ $t('students.searchParent') }}</label>
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="$t('students.searchQueryPlaceholder')"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            @input="scheduleSearch"
          />
        </div>

        <details class="rounded-lg border border-gray-200 bg-gray-50/80 text-sm">
          <summary class="cursor-pointer px-2.5 py-2 text-xs font-medium text-gray-700">
            {{ $t('students.searchTip') }}
          </summary>
          <div class="grid grid-cols-2 gap-2 border-t border-gray-200 p-2.5">
            <div>
              <label class="mb-0.5 block text-[11px] text-gray-500">{{ $t('students.firstName') }}</label>
              <input
                v-model="searchForm.firstName"
                type="text"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                @input="scheduleSearch"
              />
            </div>
            <div>
              <label class="mb-0.5 block text-[11px] text-gray-500">{{ $t('students.parentLastName') }}</label>
              <input
                v-model="searchForm.lastName"
                type="text"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                @input="scheduleSearch"
              />
            </div>
            <div>
              <label class="mb-0.5 block text-[11px] text-gray-500">{{ $t('students.email') }}</label>
              <input
                v-model="searchForm.email"
                type="email"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                @input="scheduleSearch"
              />
            </div>
            <div>
              <label class="mb-0.5 block text-[11px] text-gray-500">{{ $t('students.mobile') }}</label>
              <input
                v-model="searchForm.phone"
                type="tel"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-xs"
                @input="scheduleSearch"
              />
            </div>
          </div>
        </details>

        <div class="flex items-center justify-between gap-2 text-xs text-gray-600">
          <button
            type="button"
            class="rounded-md border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-50"
            @click="clearSearch"
          >
            {{ $t('common.clear') }}
          </button>
          <span>{{ searchResults.length }} {{ $t('students.resultsFound') }}</span>
        </div>
      </div>

      <div class="min-h-[10rem] flex-1 overflow-y-auto p-3">
        <div v-if="isSearching" class="flex items-center justify-center gap-2 py-10 text-sm text-gray-600">
          <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <span>{{ $t('students.searching') }}…</span>
        </div>

        <div v-else-if="searchResults.length === 0 && hasSearched" class="py-10 text-center">
          <p class="text-sm font-medium text-gray-900">{{ $t('students.noResultsFound') }}</p>
          <p class="mt-1 text-xs text-gray-600">{{ $t('students.noResultsDescription') }}</p>
        </div>

        <div
          v-else-if="searchResults.length > 0"
          class="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          <ParentPickerCard
            v-for="parent in searchResults"
            :key="parent.id"
            :parent="parent"
            variant="pick"
            @select="selectParent"
          />
        </div>

        <div v-else class="py-10 text-center">
          <p class="text-sm font-medium text-gray-900">{{ $t('students.startSearching') }}</p>
          <p class="mt-1 text-xs text-gray-600">{{ $t('students.startSearchingDescription') }}</p>
        </div>
      </div>

      <div class="border-t border-gray-200 px-4 py-2 text-[11px] text-gray-500">
        {{ $t('students.searchHelpText') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { parentService, type Parent } from '@/services/parent.service'
import ParentPickerCard from '@/components/ParentPickerCard.vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [parent: Parent]
}>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const searchQuery = ref('')
const searchForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const searchResults = ref<Parent[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | undefined

function hasAnySearchInput() {
  return (
    searchQuery.value.trim() !== '' ||
    Object.values(searchForm.value).some((v) => String(v).trim() !== '')
  )
}

function buildApiQuery(): string {
  const q = searchQuery.value.trim()
  if (q) return q
  const f = searchForm.value
  return f.lastName.trim() || f.firstName.trim() || f.email.trim() || f.phone.trim()
}

function matchesRefinement(parent: Parent): boolean {
  const f = searchForm.value
  const q = searchQuery.value.trim().toLowerCase()

  if (q) {
    const hay = `${parent.firstName ?? ''} ${parent.lastName ?? ''} ${parent.email ?? ''} ${parent.phone ?? ''}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  if (f.firstName.trim() && !parent.firstName?.toLowerCase().includes(f.firstName.trim().toLowerCase())) {
    return false
  }
  if (f.lastName.trim() && !parent.lastName?.toLowerCase().includes(f.lastName.trim().toLowerCase())) {
    return false
  }
  if (f.email.trim() && !parent.email?.toLowerCase().includes(f.email.trim().toLowerCase())) {
    return false
  }
  if (f.phone.trim() && !(parent.phone ?? '').includes(f.phone.trim())) {
    return false
  }
  return true
}

const closeModal = () => {
  emit('close')
}

const selectParent = (parent: Parent) => {
  emit('select', parent)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchForm.value = { firstName: '', lastName: '', email: '', phone: '' }
  searchResults.value = []
  hasSearched.value = false
}

const performSearch = async () => {
  if (!hasAnySearchInput()) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  const apiQuery = buildApiQuery()
  if (!apiQuery) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  isSearching.value = true
  hasSearched.value = true
  try {
    const results = await parentService.search(apiQuery)
    searchResults.value = results.filter(matchesRefinement)
  } catch (err) {
    console.error('Parent search failed:', err)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

function scheduleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    void performSearch()
  }, 300)
}
</script>
