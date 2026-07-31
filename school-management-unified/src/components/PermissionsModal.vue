<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            {{ $t('roleManagement.managePermissions') }}
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            {{ $t('roleManagement.permissionsFor') }} "{{ roleDisplayName }}"
          </p>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          :aria-label="$t('common.close')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div class="mb-6 p-4 bg-gray-50 rounded-xl flex gap-2 flex-wrap">
          <button
            type="button"
            @click="selectAllPermissions"
            class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
          >
            {{ $t('roleManagement.selectAll') }}
          </button>
          <button
            type="button"
            @click="clearAllPermissions"
            class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
          >
            {{ $t('roleManagement.clearAll') }}
          </button>
          <button
            type="button"
            @click="selectReadOnlyPermissions"
            class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
          >
            {{ $t('roleManagement.readOnlyAccess') }}
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="page in pages"
            :key="page.id"
            class="border border-gray-200 rounded-xl p-4"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="font-semibold text-gray-900">{{ pageLabel(page) }}</h4>
                <p class="text-sm text-gray-500">{{ page.route }}</p>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="isPageEnabled(page.id)"
                  @change="togglePage(page)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700">{{ $t('roleManagement.enablePage') }}</span>
              </label>
            </div>

            <div v-if="isPageEnabled(page.id)" class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="claim in pageActions(page)"
                :key="claim"
                class="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                :class="{ 'bg-primary-50 border-primary-200': isClaimSelected(page.id, claim) }"
              >
                <input
                  type="checkbox"
                  :checked="isClaimSelected(page.id, claim)"
                  @change="toggleClaim(page.id, claim)"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span class="text-sm font-medium text-gray-700 capitalize">{{ claimLabel(claim) }}</span>
              </label>
            </div>
            <div v-else class="text-center py-6 text-gray-400 text-sm">
              {{ $t('roleManagement.pageDisabled') }}
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 p-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSave"
          class="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-600"
        >
          {{ $t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

type PageRow = {
  id: string
  route: string
  allowedActions?: string[]
  nameEn?: string
  nameAr?: string
}

const props = defineProps<{
  role: { name?: string; permissions?: Record<string, string[]> }
  pages: PageRow[]
  claims: string[]
}>()

const emit = defineEmits<{
  close: []
  save: [permissions: Record<string, string[]>]
}>()

const { t, te, locale } = useI18n()
const permissions = ref<Record<string, string[]>>({})

const roleDisplayName = computed(() => props.role?.name || '')

function pageLabel(page: PageRow) {
  if (locale.value === 'ar' && page.nameAr) return page.nameAr
  if (page.nameEn) return page.nameEn
  const key = `roleManagement.pages.${page.id}`
  return te(key) ? t(key) : page.id
}

function claimLabel(claim: string) {
  const key = `roleManagement.claims.${claim}`
  return te(key) ? t(key) : claim
}

function pageActions(page: PageRow) {
  if (page.allowedActions?.length) return page.allowedActions
  return props.claims
}

function isPageEnabled(pageId: string) {
  return !!(permissions.value[pageId]?.length)
}

function isClaimSelected(pageId: string, claim: string) {
  return permissions.value[pageId]?.includes(claim) || false
}

function togglePage(page: PageRow) {
  if (isPageEnabled(page.id)) {
    delete permissions.value[page.id]
  } else {
    permissions.value[page.id] = ['view']
  }
}

function toggleClaim(pageId: string, claim: string) {
  if (!permissions.value[pageId]) permissions.value[pageId] = []
  const index = permissions.value[pageId].indexOf(claim)
  if (index > -1) {
    permissions.value[pageId].splice(index, 1)
    if (!permissions.value[pageId].length) delete permissions.value[pageId]
  } else {
    permissions.value[pageId].push(claim)
    if (!permissions.value[pageId].includes('view')) {
      permissions.value[pageId].unshift('view')
    }
  }
}

function selectAllPermissions() {
  props.pages.forEach((page) => {
    permissions.value[page.id] = [...pageActions(page)]
  })
}

function clearAllPermissions() {
  permissions.value = {}
}

function selectReadOnlyPermissions() {
  props.pages.forEach((page) => {
    const allowed = pageActions(page)
    permissions.value[page.id] = allowed.filter((a) => a === 'view' || a === 'search')
    if (!permissions.value[page.id].length && allowed.includes('view')) {
      permissions.value[page.id] = ['view']
    }
  })
}

function handleSave() {
  emit('save', { ...permissions.value })
}

onMounted(() => {
  permissions.value = { ...(props.role?.permissions || {}) }
})
</script>
