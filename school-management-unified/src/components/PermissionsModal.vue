<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ $t('roleManagement.managePermissions') }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('roleManagement.permissionsFor') }} "{{ role?.name }}"
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Quick Actions -->
        <div class="mb-6 p-4 bg-gray-50 rounded-xl">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ $t('roleManagement.quickActions') }}</h3>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="selectAllPermissions"
              class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
            >
              {{ $t('roleManagement.selectAll') }}
            </button>
            <button
              @click="clearAllPermissions"
              class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              {{ $t('roleManagement.clearAll') }}
            </button>
            <button
              @click="selectReadOnlyPermissions"
              class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
            >
              {{ $t('roleManagement.readOnlyAccess') }}
            </button>
          </div>
        </div>

        <!-- Permissions Grid -->
        <div class="space-y-4">
          <div
            v-for="page in pages"
            :key="page.id"
            class="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
          >
            <!-- Page Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">{{ page.name }}</h4>
                  <p class="text-sm text-gray-500">{{ page.route }}</p>
                </div>
              </div>
              
              <!-- Page Toggle -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="isPageEnabled(page.id)"
                  @change="togglePage(page.id)"
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span class="text-sm text-gray-700">{{ $t('roleManagement.enablePage') }}</span>
              </label>
            </div>

            <!-- Claims Grid -->
            <div v-if="isPageEnabled(page.id)" class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="claim in claims"
                :key="claim"
                class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                :class="{ 'bg-purple-50 border-purple-200': isClaimSelected(page.id, claim) }"
              >
                <input
                  type="checkbox"
                  :checked="isClaimSelected(page.id, claim)"
                  @change="toggleClaim(page.id, claim)"
                  class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                       :class="getClaimStyle(claim)">
                    {{ getClaimIcon(claim) }}
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ claim }}</span>
                </div>
              </label>
            </div>

            <!-- Disabled State -->
            <div v-else class="text-center py-8 text-gray-400">
              <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              <p class="text-sm">{{ $t('roleManagement.pageDisabled') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex gap-3 p-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="handleSave"
          class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {{ $t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  role: any
  pages: any[]
  claims: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [permissions: any]
}>()

const permissions = ref<Record<string, string[]>>({})

const isPageEnabled = (pageId: string) => {
  return permissions.value[pageId] && permissions.value[pageId].length > 0
}

const isClaimSelected = (pageId: string, claim: string) => {
  return permissions.value[pageId]?.includes(claim) || false
}

const togglePage = (pageId: string) => {
  if (isPageEnabled(pageId)) {
    // Disable page - remove all claims
    delete permissions.value[pageId]
  } else {
    // Enable page - add read permission by default
    permissions.value[pageId] = ['Read']
  }
}

const toggleClaim = (pageId: string, claim: string) => {
  if (!permissions.value[pageId]) {
    permissions.value[pageId] = []
  }
  
  const index = permissions.value[pageId].indexOf(claim)
  if (index > -1) {
    permissions.value[pageId].splice(index, 1)
    // If no claims left, remove the page
    if (permissions.value[pageId].length === 0) {
      delete permissions.value[pageId]
    }
  } else {
    permissions.value[pageId].push(claim)
  }
}

const selectAllPermissions = () => {
  props.pages.forEach(page => {
    permissions.value[page.id] = [...props.claims]
  })
}

const clearAllPermissions = () => {
  permissions.value = {}
}

const selectReadOnlyPermissions = () => {
  props.pages.forEach(page => {
    permissions.value[page.id] = ['Read', 'View']
  })
}

const getClaimStyle = (claim: string) => {
  const styles = {
    Read: 'bg-blue-100 text-blue-700',
    Write: 'bg-green-100 text-green-700',
    View: 'bg-purple-100 text-purple-700',
    Search: 'bg-orange-100 text-orange-700'
  }
  return styles[claim as keyof typeof styles] || 'bg-gray-100 text-gray-700'
}

const getClaimIcon = (claim: string) => {
  const icons = {
    Read: 'R',
    Write: 'W',
    View: 'V',
    Search: 'S'
  }
  return icons[claim as keyof typeof icons] || claim.charAt(0)
}

const handleSave = () => {
  emit('save', permissions.value)
}

onMounted(() => {
  // Initialize permissions from role
  permissions.value = { ...props.role?.permissions || {} }
})
</script>

