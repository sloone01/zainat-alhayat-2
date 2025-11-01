<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" :class="isRTL ? 'text-right' : 'text-left'">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? $t('userManagement.editUser') : $t('userManagement.addUser') }}
            </h3>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.fullName') }} *
              </label>
              <input
                v-model="formData.fullName"
                type="text"
                required
                :placeholder="$t('userManagement.fullNamePlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.email') }} *
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                :placeholder="$t('userManagement.emailPlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <!-- Mobile -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('userManagement.mobile') }} *
              </label>
              <input
                v-model="formData.mobile"
                type="tel"
                required
                :placeholder="$t('userManagement.mobilePlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <!-- Roles -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('userManagement.roles') }} *
              </label>
              <div class="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                <div
                  v-for="role in availableRoles"
                  :key="role.id"
                  class="flex items-center"
                >
                  <input
                    :id="`role-${role.id}`"
                    v-model="formData.roles"
                    :value="role.id"
                    type="checkbox"
                    class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    :for="`role-${role.id}`"
                    class="ml-2 text-sm text-gray-700 cursor-pointer"
                  >
                    {{ role.name }}
                  </label>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ $t('userManagement.selectMultipleRoles') }}
              </p>
            </div>

            <!-- Password Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="handleSubmit"
            type="button"
            :disabled="!isFormValid"
            class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </button>
          <button
            @click="$emit('close')"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

const { locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  user?: any
  availableRoles: any[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [userData: any]
}>()

// Reactive data
const formData = ref({
  fullName: '',
  email: '',
  mobile: '',
  roles: [] as string[],
  status: 'active'
})

// Computed properties
const isRTL = computed(() => locale.value === 'ar')
const isEditing = computed(() => !!props.user)

const isFormValid = computed(() => {
  return formData.value.fullName.trim() !== '' &&
         formData.value.email.trim() !== '' &&
         formData.value.mobile.trim() !== '' &&
         formData.value.roles.length > 0
})

// Watch for user changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      fullName: newUser.fullName || '',
      email: newUser.email || '',
      mobile: newUser.mobile || '',
      roles: [...(newUser.roles || [])],
      status: newUser.status || 'active'
    }
  } else {
    // Reset form for new user
    formData.value = {
      fullName: '',
      email: '',
      mobile: '',
      roles: [],
      status: 'active'
    }
  }
}, { immediate: true })

// Methods
const handleSubmit = () => {
  if (!isFormValid.value) {
    return
  }

  emit('save', { ...formData.value })
}
</script>

