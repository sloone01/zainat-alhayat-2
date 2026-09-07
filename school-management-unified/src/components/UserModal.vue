<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="isEditing ? $t('userManagement.editUser') : $t('userManagement.addUser')"
    @close="$emit('close')"
  >
    <form class="fk-form" @submit.prevent="handleSubmit">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label class="fk-flabel" for="user-fullname">
            <span>{{ $t('userManagement.fullName') }} *</span>
          </label>
          <input
            id="user-fullname"
            v-model="formData.fullName"
            type="text"
            required
            :placeholder="$t('userManagement.fullNamePlaceholder')"
            class="fk-field"
          />
        </div>

        <div class="fk-form__grid">
          <div class="fk-form__row">
            <label class="fk-flabel" for="user-email"><span>{{ $t('userManagement.email') }} *</span></label>
            <input
              id="user-email"
              v-model="formData.email"
              type="email"
              required
              dir="ltr"
              :placeholder="$t('userManagement.emailPlaceholder')"
              class="fk-field"
            />
          </div>
          <div class="fk-form__row">
            <label class="fk-flabel" for="user-mobile"><span>{{ $t('userManagement.mobile') }} *</span></label>
            <input
              id="user-mobile"
              v-model="formData.mobile"
              type="tel"
              required
              dir="ltr"
              :placeholder="$t('userManagement.mobilePlaceholder')"
              class="fk-field"
            />
          </div>
        </div>
      </div>

      <div class="fk-form__section">
        <div class="fk-form__row">
          <span class="fk-flabel"><span>{{ $t('userManagement.userType') }} *</span></span>
          <div class="fk-segmented" role="radiogroup">
            <button
              v-for="ut in (['staff', 'parent', 'student'] as const)"
              :key="ut"
              type="button"
              class="fk-segmented__opt"
              :class="{ 'fk-segmented__opt--on': formData.userType === ut }"
              role="radio"
              :aria-checked="formData.userType === ut"
              @click="formData.userType = ut"
            >
              {{ $t(`userManagement.userTypes.${ut}`) }}
            </button>
          </div>
        </div>

        <div v-if="formData.userType === 'staff'" class="fk-form__row">
          <span class="fk-flabel">
            <span>{{ $t('userManagement.staffGroups') }} *</span>
            <span class="fk-flabel__hint">{{ $t('userManagement.selectStaffGroups') }}</span>
          </span>
          <p v-if="!staffGroups.length" class="fk-form__hint">{{ $t('common.loading') }}</p>
          <div v-else class="fk-choices">
            <label
              v-for="group in staffGroups"
              :key="group.id"
              class="fk-choice"
              :class="{ 'fk-choice--on': formData.groupIds.includes(group.id) }"
            >
              <input v-model="formData.groupIds" :value="group.id" type="checkbox" />
              <span>{{ group.name }}</span>
              <span v-if="group.code" class="font-mono text-[11px] opacity-70" dir="ltr">{{ group.code }}</span>
            </label>
          </div>
        </div>

        <div class="fk-note">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold text-fikr-ink">{{ $t('userManagement.passwordInfo') }}</p>
            <p class="mt-0.5">{{ $t('userManagement.passwordDetails') }}</p>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--pearl" @click="$emit('close')">{{ $t('common.cancel') }}</button>
      <button type="button" class="fk-btn fk-btn--primary" :disabled="!isFormValid" @click="handleSubmit">
        {{ isEditing ? $t('common.update') : $t('common.create') }}
      </button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { rbacService, type RbacGroup } from '@/services/rbac.service'
import FikrDialog from '@/components/FikrDialog.vue'

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
