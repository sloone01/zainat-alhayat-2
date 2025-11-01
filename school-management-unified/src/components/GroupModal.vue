<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" :dir="isRTL ? 'rtl' : 'ltr'">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" :class="isRTL ? 'text-right' : 'text-left'">
        <!-- Header -->
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-center justify-between mb-4" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? $t('groupManagement.editGroup') : $t('groupManagement.addGroup') }}
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
            <!-- Group Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('groupManagement.groupName') }} *
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                :placeholder="$t('groupManagement.groupNamePlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('groupManagement.description') }}
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                :placeholder="$t('groupManagement.descriptionPlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              ></textarea>
            </div>


            <!-- Capacity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('groupManagement.capacity') }} *
              </label>
              <input
                v-model.number="formData.capacity"
                type="number"
                min="1"
                max="50"
                required
                :placeholder="$t('groupManagement.capacityPlaceholder')"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>

            <!-- Group Supervisor -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('groupManagement.supervisor') }} *
              </label>
              <select
                v-model="formData.supervisor"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="">{{ $t('groupManagement.selectSupervisor') }}</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                {{ $t('groupManagement.supervisorPlaceholder') }}
              </p>
            </div>

            <!-- Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ $t('groupManagement.groupColor') }}
              </label>
              <div class="flex gap-3 mt-2" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  @click="formData.color = color"
                  class="w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  :class="[
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  ]"
                  :style="{ backgroundColor: color }"
                ></button>
              </div>
            </div>

            <!-- Active Year Info -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex items-center" :class="isRTL ? 'flex-row-reverse' : 'flex-row'">
                <svg :class="isRTL ? 'w-5 h-5 text-blue-600 ml-2' : 'w-5 h-5 text-blue-600 mr-2'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-blue-800">
                  {{ $t('groupManagement.linkedToYear') }}: <strong>{{ activeYear.name }}</strong>
                </span>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex" :class="isRTL ? 'sm:flex-row' : 'sm:flex-row-reverse'">
          <button
            @click="handleSubmit"
            type="button"
            :disabled="!isFormValid"
            :class="[
              'w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed',
              isRTL ? 'sm:mr-3' : 'sm:ml-3'
            ]"
          >
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </button>
          <button
            @click="$emit('close')"
            type="button"
            :class="[
              'mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm',
              isRTL ? 'sm:mr-3' : 'sm:ml-3'
            ]"
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
import userService from '@/services/user.service'

const { locale } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  group?: any
  activeYear: any
}>()

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
  color: '#EC4899'
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

const colorOptions = [
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16'  // Lime
]

// Computed properties
const isRTL = computed(() => locale.value === 'ar')
const isEditing = computed(() => !!props.group)

// Watch for group changes
watch(() => props.group, (newGroup) => {
  if (newGroup) {
    formData.value = {
      name: newGroup.name || '',
      description: newGroup.description || '',
      capacity: newGroup.capacity || 20,
      supervisor: newGroup.supervisor || '',
      color: newGroup.color || '#EC4899'
    }
  } else {
    // Reset form for new group
    formData.value = {
      name: '',
      description: '',
      capacity: 20,
      supervisor: '',
      color: '#EC4899'
    }
  }
}, { immediate: true })

// Mount hook to fetch teachers
onMounted(() => {
  fetchTeachers()
})

// Form validation
const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && formData.value.supervisor !== ''
})

// Methods
const handleSubmit = () => {
  console.log('handleSubmit called', { formData: formData.value, isEditing: isEditing.value })
  
  if (!isFormValid.value) {
    console.log('Form validation failed')
    return
  }

  emit('save', { ...formData.value })
}
</script>

