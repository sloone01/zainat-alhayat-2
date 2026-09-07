<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('standaloneCourses.title')"
        :subtitle="$t('standaloneCourses.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">{{ error }}</div>

      <section class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('standaloneCourses.addHeading') }}</h2>
          </div>
        </header>
        <div class="p-4 sm:p-6">
        <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="createCourse">
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('standaloneCourses.name') }} *</label>
            <input v-model="name" required class="fk-field" />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('standaloneCourses.description') }}</label>
            <input v-model="description" class="fk-field" />
          </div>
          <div class="sm:col-span-2">
            <button
              type="submit"
              class="fk-btn fk-btn--primary"
              :disabled="saving"
            >
              {{ saving ? $t('common.saving') : $t('standaloneCourses.create') }}
            </button>
          </div>
        </form>
        </div>
      </section>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('standaloneCourses.listHeading') }}</h2>
          </div>
        </header>
        <div v-if="loading" class="flex justify-center py-12">
          <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
        <div v-else-if="!courses.length" class="py-12 text-center text-sm text-gray-500">
          {{ $t('standaloneCourses.empty') }}
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="c in courses" :key="c.id" class="flex items-center justify-between gap-3 px-6 py-4">
            <div>
              <div class="font-medium text-gray-900">{{ c.name || c.title }}</div>
              <div v-if="c.description" class="text-xs text-gray-500">{{ c.description }}</div>
            </div>
            <router-link
              :to="{ path: '/course-materials', query: { course: c.id } }"
              class="text-sm font-semibold text-primary-700 hover:text-primary-900"
            >
              {{ $t('courseMaterials.navTitle') }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import authService from '@/services/auth.service'
import courseService, { type Course } from '@/services/course.service'

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)

const courses = ref<Course[]>([])
const loading = ref(false)
const name = ref('')
const description = ref('')
const saving = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  try {
    courses.value = await courseService.getAllCourses(schoolId.value, 'standalone')
  } catch {
    courses.value = []
  } finally {
    loading.value = false
  }
}

async function createCourse() {
  saving.value = true
  error.value = ''
  try {
    await courseService.createCourse({
      name: name.value.trim(),
      title: name.value.trim(),
      description: description.value.trim() || undefined,
      school_id: schoolId.value,
      course_kind: 'standalone',
      status: 'active',
      is_active: true,
      category: 'standalone',
    })
    name.value = ''
    description.value = ''
    await load()
  } catch (e: unknown) {
    error.value = (e as { message?: string })?.message || 'Failed'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void load()
})
</script>
