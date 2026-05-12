<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('chatRooms.title') }}</h1>
        <p class="mt-1 text-sm text-gray-600">{{ $t('chatRooms.subtitle') }}</p>
        <p class="mt-2 text-sm">
          <router-link to="/messages" class="font-medium text-primary-600 hover:text-primary-800">
            {{ $t('directMessages.title') }} →
          </router-link>
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>

      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {{ error }}
      </div>

      <div v-else-if="groups.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-200">
        <p class="text-gray-600">{{ $t('chatRooms.noGroups') }}</p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="g in groups"
          :key="g.id"
          :to="`/chat/${g.id}`"
          class="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition-all"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h2 class="font-semibold text-gray-900 truncate">{{ g.name }}</h2>
              <p v-if="g.description" class="mt-1 text-xs text-gray-500 line-clamp-2">{{ g.description }}</p>
            </div>
            <span
              class="shrink-0 inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800"
            >
              {{ g.studentCount ?? 0 }} {{ $t('chatRooms.students') }}
            </span>
          </div>
          <p class="mt-4 text-sm font-medium text-primary-600">{{ $t('chatRooms.openRoom') }} →</p>
        </router-link>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { chatApiService, type ChatGroupSummary } from '@/services/chat.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const loading = ref(true)
const error = ref('')
const groups = ref<ChatGroupSummary[]>([])

onMounted(async () => {
  try {
    loading.value = true
    groups.value = await chatApiService.listGroups()
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const m = ax.response?.data?.message
    const detail = Array.isArray(m) ? m.join(', ') : m
    error.value = detail || (e as Error).message || t('chatRooms.loadError')
  } finally {
    loading.value = false
  }
})
</script>
