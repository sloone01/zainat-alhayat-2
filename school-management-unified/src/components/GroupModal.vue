<template>
  <FikrDialog
    :show="show"
    plain-footer
    :title="isEditing ? $t('groupManagement.editGroup') : $t('groupManagement.addGroup')"
    @close="$emit('close')"
  >
    <form class="fk-form" @submit.prevent="handleSubmit">
      <div class="fk-form__section">
        <div class="fk-form__row">
          <label class="fk-flabel" for="group-name"><span>{{ $t('groupManagement.groupName') }} *</span></label>
          <input
            id="group-name"
            v-model="formData.name"
            type="text"
            required
            :placeholder="$t('groupManagement.groupNamePlaceholder')"
            class="fk-field"
          />
        </div>
        <div class="fk-form__row">
          <label class="fk-flabel" for="group-desc"><span>{{ $t('groupManagement.description') }}</span></label>
          <textarea
            id="group-desc"
            v-model="formData.description"
            rows="3"
            :placeholder="$t('groupManagement.descriptionPlaceholder')"
            class="fk-field"
          ></textarea>
        </div>
      </div>

      <div class="fk-form__section">
        <div class="fk-form__grid">
          <div class="fk-form__row">
            <label class="fk-flabel" for="group-capacity"><span>{{ $t('groupManagement.capacity') }} *</span></label>
            <input
              id="group-capacity"
              v-model.number="formData.capacity"
              type="number"
              min="1"
              max="50"
              required
              :placeholder="$t('groupManagement.capacityPlaceholder')"
              class="fk-field"
            />
          </div>
          <div v-if="paymentLevels.length" class="fk-form__row">
            <label class="fk-flabel" for="group-level"><span>{{ $t('groupManagement.gradeLevel') }}</span></label>
            <select id="group-level" v-model="formData.level_id" required class="fk-field">
              <option disabled value="">{{ $t('groupManagement.selectGradeLevel') }}</option>
              <option v-for="lv in paymentLevels" :key="lv.id" :value="String(lv.id)">
                {{ lv.code }} — {{ lv.name }}
              </option>
            </select>
          </div>
        </div>
        <p v-if="!paymentLevels.length" class="fk-note fk-note--warn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ $t('groupManagement.noPaymentLevels') }}</span>
        </p>

        <div class="fk-form__row">
          <label class="fk-flabel" for="group-supervisor"><span>{{ $t('groupManagement.supervisor') }} *</span></label>
          <select id="group-supervisor" v-model="formData.supervisor" required class="fk-field">
            <option value="">{{ $t('groupManagement.selectSupervisor') }}</option>
            <option v-for="teacher in teachers" :key="teacher.id" :value="String(teacher.id)">
              {{ teacher.name }}
            </option>
          </select>
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
import FikrDialog from '@/components/FikrDialog.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import userService from '@/services/user.service'
import { resolveFeeLevelId } from '@/utils/fee-level'

function supervisorUserId(group: {
  supervisor_id?: unknown
  supervisor?: unknown
}): string {
  if (typeof group.supervisor_id === 'string' && group.supervisor_id.trim()) return group.supervisor_id
  if (typeof group.supervisor === 'string' && group.supervisor.trim()) return group.supervisor
  if (group.supervisor && typeof group.supervisor === 'object' && 'id' in group.supervisor) {
    const id = (group.supervisor as { id?: string }).id
    return id ? String(id) : ''
  }
  return ''
}

const { locale } = useI18n()

// Props
const props = withDefaults(
  defineProps<{
    show: boolean
    group?: any
    paymentLevels?: { id: string; code: string; name: string }[]
  }>(),
  { paymentLevels: () => [] },
)

// Emits
const emit = defineEmits<{
  close: []
  save: [groupData: any]
}>()

// Reactive data
const formData = ref({
  name: '',
  description: '',
  capacity: 20,
  supervisor: '',
  level_id: '' as string,
})

// Teachers data from API
const teachers = ref([])
const loadingTeachers = ref(false)

// Fetch teachers from API
const fetchTeachers = async () => {
  loadingTeachers.value = true
  try {
    const allUsers = await userService.getAllUsers()
    // Filter users who have teacher role
    teachers.value = allUsers
      .filter(user => {
        return user.roles?.includes('teacher') || user.role === 'teacher'
      })
      .map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email
      }))
  } catch (error) {
    console.error('Error fetching teachers:', error)
    teachers.value = []
  } finally {
    loadingTeachers.value = false
  }
}

// Computed properties
const isRTL = computed(() => locale.value === 'ar')
const isEditing = computed(() => !!props.group)

function emptyForm() {
  return {
    name: '',
    description: '',
    capacity: 20,
    supervisor: '' as string,
    level_id: '' as string,
  }
}

function syncFormFromProps() {
  const g = props.group as Record<string, unknown> | null | undefined
  if (g && g.id) {
    formData.value = {
      name: (g.name as string) || '',
      description: (g.description as string) || '',
      capacity: (g.capacity as number) || 20,
      supervisor: supervisorUserId(g),
      level_id: resolveFeeLevelId(g),
    }
  } else {
    formData.value = emptyForm()
  }
}

/** Only re-sync when opening the modal or switching groups — avoids wiping edits when the parent object reference moves. */
watch(
  [() => props.show, () => (props.group as { id?: string } | null | undefined)?.id ?? ''],
  () => {
    if (!props.show) return
    syncFormFromProps()
  },
  { immediate: true },
)

// Mount hook to fetch teachers
onMounted(() => {
  fetchTeachers()
})

const hasGradeLevels = computed(() => (props.paymentLevels?.length ?? 0) > 0)

// Form validation
const isFormValid = computed(() => {
  const nameOk = formData.value.name.trim() !== ''
  const supervisorOk = formData.value.supervisor !== ''
  const levelOk = !hasGradeLevels.value || String(formData.value.level_id ?? '').trim() !== ''
  return nameOk && supervisorOk && levelOk
})

// Methods
const handleSubmit = () => {
  if (!isFormValid.value) return

  emit('save', { ...formData.value })
}
</script>

