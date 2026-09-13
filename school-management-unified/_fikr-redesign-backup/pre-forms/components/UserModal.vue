<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" :class="isRTL ? 'text-right' : 'text-left'">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? $t('userManagement.editUser') : $t('userManagement.addUser') }}
            </h3>
            <button
              type="button"
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.fullName') }} *
              </label>
              <input
                v-model="formData.fullName"
                type="text"
                required
                :placeholder="$t('userManagement.fullNamePlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.email') }} *
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                :placeholder="$t('userManagement.emailPlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.mobile') }} *
              </label>
              <input
                v-model="formData.mobile"
                type="tel"
                required
                :placeholder="$t('userManagement.mobilePlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.userType') }} *
              </label>
              <select
                v-model="formData.userType"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="staff">{{ $t('userManagement.userTypes.staff') }}</option>
                <option value="parent">{{ $t('userManagement.userTypes.parent') }}</option>
                <option value="student">{{ $t('userManagement.userTypes.student') }}</option>
              </select>
            </div>

            <div v-if="formData.userType === 'staff'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('userManagement.staffGroups') }} *
              </label>
              <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                <p v-if="!staffGroups.length" class="text-xs text-gray-500">
                  {{ $t('common.loading') }}
                </p>
                <div
                  v-for="group in staffGroups"
                  :key="group.id"
                  class="flex items-center gap-2"
                >
                  <input
                    :id="`group-${group.id}`"
                    v-model="formData.groupIds"
                    :value="group.id"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label
                    :for="`group-${group.id}`"
                    class="text-sm text-gray-700 cursor-pointer flex-1"
                  >
                    <span>{{ group.name }}</span>
                    <span v-if="group.code" class="ms-2 font-mono text-xs text-gray-400" dir="ltr">{{ group.code }}</span>
                  </label>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('userManagement.selectStaffGroups') }}
              </p>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 me-2 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm text-blue-800">
                  <p class="font-medium">{{ $t('userManagement.passwordInfo') }}</p>
                  <p class="mt-1">{{ $t('userManagement.passwordDetails') }}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            type="button"
            :disabled="!isFormValid"
            class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 sm:ms-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </button>
          <button
            @click="$emit('close')"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 sm:mt-0 sm:ms-3 sm:w-auto sm:text-sm"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { rbacService, type RbacGroup } from '@/services/rbac.service'

const { locale } = useI18n()

const props = defineProps<{
  show: boolean
  user?: any
}>()

const emit = defineEmits<{
  close: []
  save: [userData: any]
}>()

const staffGroups = ref<RbacGroup[]>([])

const formData = ref({
  fullName: '',
  email: '',
  mobile: '',
  userType: 'staff' as 'staff' | 'parent' | 'student',
  groupIds: [] as string[],
  status: 'active',
})

const isRTL = computed(() => locale.value === 'ar')
const isEditing = computed(() => !!props.user)

const isFormValid = computed(() => {
  const base =
    formData.value.fullName.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    formData.value.mobile.trim() !== ''
  if (!base) return false
  if (formData.value.userType === 'staff') {
    return formData.value.groupIds.length > 0
  }
  return true
})

async function loadStaffGroups() {
  try {
    staffGroups.value = await rbacService.listGroups()
  } catch {
    staffGroups.value = []
  }
}

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      const ut =
        newUser.user_type ||
        (newUser.role === 'parent' || newUser.role === 'student' ? newUser.role : 'staff')
      formData.value = {
        fullName: newUser.fullName || '',
        email: newUser.email || '',
        mobile: newUser.mobile || '',
        userType: ut,
        groupIds: [...(newUser.groupIds || [])],
        status: newUser.status || 'active',
      }
    } else {
      formData.value = {
        fullName: '',
        email: '',
        mobile: '',
        userType: 'staff',
        groupIds: [],
        status: 'active',
      }
    }
  },
  { immediate: true },
)

watch(
  () => formData.value.userType,
  (t) => {
    if (t !== 'staff') formData.value.groupIds = []
  },
)

onMounted(() => {
  loadStaffGroups()
})

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('save', { ...formData.value })
}
</script>
