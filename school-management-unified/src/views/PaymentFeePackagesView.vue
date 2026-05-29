<template>
  <DashboardLayout>
    <div class="space-y-4" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900">{{ $t('paymentSettings.feePackagesTitle') }}</h1>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
        {{ flashError }}
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('paymentSettings.feePackagesListHeading') }}</h2>
          <router-link
            to="/settings/payments/packages/new"
            class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            {{ $t('paymentSettings.createFeePackage') }}
          </router-link>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-600 text-sm">{{ $t('common.loading') }}…</div>
        <div
          v-else-if="!rows.length"
          class="text-center py-10 rounded-lg border border-dashed border-gray-300 text-sm text-gray-600"
        >
          {{ $t('paymentSettings.noFeePackages') }}
        </div>
        <template v-else>
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.packageName') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.packageLevels') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('paymentSettings.packageCourses') }}</th>
                <th class="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id" class="border-t border-gray-200 hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ row.name }}</td>
                <td class="px-4 py-3 text-gray-600 tabular-nums">{{ row.level_count }}</td>
                <td class="px-4 py-3 text-gray-600 tabular-nums">{{ row.course_count }}</td>
                <td class="px-4 py-3 text-end">
                  <router-link
                    :to="`/settings/payments/packages/${row.id}`"
                    class="text-primary-600 font-medium hover:text-primary-800"
                  >
                    {{ $t('common.edit') }}
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden space-y-3">
          <article
            v-for="row in rows"
            :key="'pkg-card-' + row.id"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-gray-900/[0.04]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="text-base font-semibold text-gray-900 leading-snug">{{ row.name }}</h3>
              </div>
              <router-link
                :to="`/settings/payments/packages/${row.id}`"
                class="shrink-0 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800 hover:bg-primary-100"
              >
                {{ $t('common.edit') }}
              </router-link>
            </div>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('paymentSettings.packageLevels') }}</dt>
                <dd class="mt-0.5 text-base font-semibold tabular-nums text-gray-900">{{ row.level_count }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('paymentSettings.packageCourses') }}</dt>
                <dd class="mt-0.5 text-base font-semibold tabular-nums text-gray-900">{{ row.course_count }}</dd>
              </div>
            </dl>
          </article>
        </div>
        </template>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { authService } from '@/services'
import feePackageService, { type FeePackageListRow } from '@/services/fee-package.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => {
  const u = authService.getStoredUser()
  return u?.school_id != null ? Number(u.school_id) : 1
})

const loading = ref(true)
const flashError = ref('')
const rows = ref<FeePackageListRow[]>([])

async function load() {
  loading.value = true
  flashError.value = ''
  try {
    rows.value = await feePackageService.list(schoolId.value)
  } catch (e: unknown) {
    flashError.value = (e as Error)?.message || t('paymentSettings.loadError')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
