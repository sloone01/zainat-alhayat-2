<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" @click.stop :dir="isRTL ? 'rtl' : 'ltr'">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">{{ $t('students.searchParentDatabase') }}</h2>
        <button
          @click="closeModal"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Search Form -->
      <div class="p-6 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.firstName') }}
            </label>
            <input
              v-model="searchForm.firstName"
              type="text"
              :placeholder="$t('students.firstNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.secondName') }}
            </label>
            <input
              v-model="searchForm.secondName"
              type="text"
              :placeholder="$t('students.secondNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.thirdName') }}
            </label>
            <input
              v-model="searchForm.thirdName"
              type="text"
              :placeholder="$t('students.thirdNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.familyName') }}
            </label>
            <input
              v-model="searchForm.familyName"
              type="text"
              :placeholder="$t('students.familyNamePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.email') }}
            </label>
            <input
              v-model="searchForm.email"
              type="email"
              :placeholder="$t('students.emailPlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ $t('students.mobile') }}
            </label>
            <input
              v-model="searchForm.mobile"
              type="tel"
              :placeholder="$t('students.mobilePlaceholder')"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="performSearch"
            />
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-4">
            <button
              @click="clearSearch"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              {{ $t('common.clear') }}
            </button>
            <span class="text-sm text-gray-600">
              {{ searchResults.length }} {{ $t('students.resultsFound') }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ $t('students.searchTip') }}</span>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div class="flex-1 overflow-y-auto max-h-96">
        <div v-if="isSearching" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="text-gray-600">{{ $t('students.searching') }}...</span>
          </div>
        </div>

        <div v-else-if="searchResults.length === 0 && hasSearched" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('students.noResultsFound') }}</h3>
          <p class="text-gray-600 text-center">{{ $t('students.noResultsDescription') }}</p>
        </div>

        <div v-else-if="searchResults.length > 0" class="divide-y divide-gray-200">
          <div
            v-for="parent in searchResults"
            :key="parent.id"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            @click="selectParent(parent)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ parent.firstName[0] }}{{ parent.familyName[0] }}
                  </span>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900">
                    {{ parent.firstName }} {{ parent.secondName }} {{ parent.thirdName }} {{ parent.familyName }}
                  </h4>
                  <div class="flex items-center gap-4 mt-1">
                    <span class="text-sm text-gray-600">{{ parent.email }}</span>
                    <span class="text-sm text-gray-600">{{ parent.mobile }}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span v-if="parent.hasUserAccount" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {{ $t('students.hasAccount') }}
                    </span>
                    <span v-else class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {{ $t('students.noAccount') }}
                    </span>
                    <span v-if="parent.children && parent.children.length > 0" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {{ parent.children.length }} {{ $t('students.children') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center">
                <button
                  @click.stop="selectParent(parent)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {{ $t('common.select') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('students.startSearching') }}</h3>
          <p class="text-gray-600 text-center">{{ $t('students.startSearchingDescription') }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200">
        <div class="text-sm text-gray-600">
          {{ $t('students.searchHelpText') }}
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Parent } from '@/types'

const { locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
  select: [parent: Parent]
}>()

// Reactive data
const searchForm = ref({
  firstName: '',
  secondName: '',
  thirdName: '',
  familyName: '',
  email: '',
  mobile: ''
})

const searchResults = ref<Parent[]>([])
const isSearching = ref(false)
const hasSearched = ref(false)

// Mock parent database (in real app, this would come from API)
const parentDatabase = ref<Parent[]>([
  {
    id: '1',
    firstName: 'أحمد',
    secondName: 'محمد',
    thirdName: 'علي',
    familyName: 'الرواحي',
    email: 'ahmed.mohammed@zahratalhayat.om',
    mobile: '+968 9123 4567',
    hasUserAccount: true,
    children: [
      { id: '1', name: 'سارة أحمد الرواحي', group: 'مجموعة الورود' }
    ]
  },
  {
    id: '2',
    firstName: 'فاطمة',
    secondName: 'أحمد',
    thirdName: 'سالم',
    familyName: 'البلوشي',
    email: 'fatima.ahmed@zahratalhayat.om',
    mobile: '+968 9234 5678',
    hasUserAccount: false,
    children: []
  },
  {
    id: '3',
    firstName: 'محمد',
    secondName: 'سالم',
    thirdName: 'أحمد',
    familyName: 'الحارثي',
    email: 'mohammed.salem@zahratalhayat.om',
    mobile: '+968 9345 6789',
    hasUserAccount: true,
    children: [
      { id: '2', name: 'عمر محمد الحارثي', group: 'مجموعة النجوم' },
      { id: '3', name: 'ليلى محمد الحارثي', group: 'مجموعة القمر' }
    ]
  },
  {
    id: '4',
    firstName: 'عائشة',
    secondName: 'علي',
    thirdName: 'محمد',
    familyName: 'الشامسي',
    email: 'aisha.ali@zahratalhayat.om',
    mobile: '+968 9456 7890',
    hasUserAccount: false,
    children: []
  },
  {
    id: '5',
    firstName: 'سالم',
    secondName: 'أحمد',
    thirdName: 'محمد',
    familyName: 'العبري',
    email: 'salem.ahmed@zahratalhayat.om',
    mobile: '+968 9567 8901',
    hasUserAccount: true,
    children: [
      { id: '4', name: 'نور سالم العبري', group: 'مجموعة الشمس' }
    ]
  }
])

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Methods
const closeModal = () => {
  emit('close')
}

const selectParent = (parent: any) => {
  emit('select', parent)
}

const clearSearch = () => {
  searchForm.value = {
    firstName: '',
    secondName: '',
    thirdName: '',
    familyName: '',
    email: '',
    mobile: ''
  }
  searchResults.value = []
  hasSearched.value = false
}

const performSearch = async () => {
  // Check if any search field has content
  const hasSearchTerms = Object.values(searchForm.value).some(value => value.trim() !== '')
  
  if (!hasSearchTerms) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  isSearching.value = true
  hasSearched.value = true

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Filter parents based on search criteria
  const results = parentDatabase.value.filter(parent => {
    const searchTerms = searchForm.value
    
    return (
      (!searchTerms.firstName || parent.firstName.toLowerCase().includes(searchTerms.firstName.toLowerCase())) &&
      (!searchTerms.secondName || parent.secondName.toLowerCase().includes(searchTerms.secondName.toLowerCase())) &&
      (!searchTerms.thirdName || parent.thirdName.toLowerCase().includes(searchTerms.thirdName.toLowerCase())) &&
      (!searchTerms.familyName || parent.familyName.toLowerCase().includes(searchTerms.familyName.toLowerCase())) &&
      (!searchTerms.email || parent.email.toLowerCase().includes(searchTerms.email.toLowerCase())) &&
      (!searchTerms.mobile || parent.mobile.includes(searchTerms.mobile))
    )
  })

  searchResults.value = results
  isSearching.value = false
}

// Debounced search
let searchTimeout: number
watch(searchForm, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(performSearch, 300)
}, { deep: true })
</script>

<style scoped>
/* Custom scrollbar for search results */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

