<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="$t('userManagement.editUser')"
    @close="$emit('close')"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-fullname">
          {{ $t('userManagement.fullName') }} *
        </label>
        <input
          id="user-fullname"
          v-model="formData.fullName"
          type="text"
          required
          :placeholder="$t('userManagement.fullNamePlaceholder')"
          class="fk-field"
        >
      </div>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-email">
            {{ $t('userManagement.email') }} *
          </label>
          <input
            id="user-email"
            v-model="formData.email"
            type="email"
            required
            dir="ltr"
            :placeholder="$t('userManagement.emailPlaceholder')"
            class="fk-field"
          >
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium text-gray-600" for="user-mobile">
            {{ $t('userManagement.mobile') }} *
          </label>
          <input
            id="user-mobile"
            v-model="formData.mobile"
            type="tel"
            required
            dir="ltr"
            :placeholder="$t('userManagement.mobilePlaceholder')"
            class="fk-field"
          >
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="button" class="fk-btn fk-btn--primary" :disabled="!isFormValid" @click="handleSubmit">
        {{ $t('common.update') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FikrDialog from '@/components/FikrDialog.vue'

const props = defineProps<{
  show: boolean
  user?: any
  lockedUserType?: 'staff' | 'parent' | 'student'
}>()

const emit = defineEmits<{
  close: []
  save: [userData: any]
}>()

const formData = ref({
  fullName: '',
  email: '',
  mobile: '',
  userType: 'parent' as 'staff' | 'parent' | 'student',
  groupIds: [] as string[],
  status: 'active',
})

const isFormValid = computed(() =>
  formData.value.fullName.trim() !== '' &&
  formData.value.email.trim() !== '' &&
  formData.value.mobile.trim() !== '',
)

watch(
  () => [props.user, props.lockedUserType] as const,
  ([newUser, locked]) => {
    if (!newUser) return
    const ut =
      locked ||
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
  },
  { immediate: true },
)

const handleSubmit = () => {
  if (!isFormValid.value) return
  emit('save', { ...formData.value })
}
</script>
