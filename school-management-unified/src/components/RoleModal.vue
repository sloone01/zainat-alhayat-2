<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">
          {{ isEditing ? $t('roleManagement.editRole') : $t('roleManagement.addRole') }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Role Name -->
        <div>
          <label for="roleName" class="block text-sm font-semibold text-gray-700 mb-2">
            {{ $t('roleManagement.roleName') }}
          </label>
          <input
            id="roleName"
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :placeholder="$t('roleManagement.roleNamePlaceholder')"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
            {{ $t('roleManagement.description') }}
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            :placeholder="$t('roleManagement.descriptionPlaceholder')"
          ></textarea>
        </div>

        <!-- Color -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ $t('roleManagement.roleColor') }}
          </label>
          <div class="flex gap-3 flex-wrap">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              @click="form.color = color"
              class="w-10 h-10 rounded-lg border-2 transition-all duration-200"
              :class="form.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {{ isEditing ? $t('common.save') : $t('common.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  role?: any
}>()

const emit = defineEmits<{
  close: []
  save: [roleData: any]
}>()

const form = ref({
  name: '',
  description: '',
  color: '#8b5cf6'
})

const colorOptions = [
  '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
]

const isEditing = computed(() => !!props.role)

const handleSubmit = () => {
  emit('save', { ...form.value })
}

onMounted(() => {
  if (props.role) {
    form.value = {
      name: props.role.name,
      description: props.role.description,
      color: props.role.color
    }
  }
})
</script>

