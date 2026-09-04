<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10" :dir="isRTL ? 'rtl' : 'ltr'">
      <section class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <router-link
          to="/settings/payments/courses"
          class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-primary-200/80 bg-primary-100 text-primary-700 shadow-sm hover:border-primary-300 hover:bg-primary-200 hover:text-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 mb-3"
          :aria-label="$t('feesV2.backToCourses')"
        >
          <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-xl font-bold text-gray-900">{{ courseTitle }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ $t('feesV2.courseLinkSubtitle') }}</p>
      </section>

      <form class="space-y-6" @submit.prevent="save">
        <div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('feesV2.selectPackage') }}</label>
          <select v-model="form.fee_package_id" required class="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm" @change="onPackageChange">
            <option value="">{{ $t('feesV2.choosePackage') }}</option>
            <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div v-if="form.fee_package_id && form.lines.length" class="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-sm">
          <div class="border-b border-gray-100 bg-sky-50/50 px-6 py-3">
            <h2 class="text-sm font-semibold text-sky-900">{{ $t('feesV2.amountsPerCharge') }}</h2>
            <p class="text-xs text-sky-700/80 mt-0.5">{{ $t('feesV2.zeroAllowed') }}</p>
          </div>
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th class="text-start px-6 py-3">{{ $t('feesV2.chargeType') }}</th>
                <th class="text-start px-6 py-3">{{ $t('feesV2.timing') }}</th>
                <th class="text-end px-6 py-3 w-40">{{ $t('feesV2.amount') }} (OMR)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(line, idx) in form.lines" :key="line.charge_type_id">
                <td class="px-6 py-3 font-medium text-gray-900">{{ line.label }}</td>
                <td class="px-6 py-3 text-gray-600 text-xs">
                  {{ line.payment_timing === 'upfront' ? $t('feesV2.upfront') : $t('feesV2.installment') }}
                  ·
                  {{ line.billing_frequency === 'once_only' ? $t('feesV2.onceOnly') : $t('feesV2.perYear') }}
                </td>
                <td class="px-6 py-3 text-end">
                  <input
                    v-model="form.lines[idx].amount"
                    type="number"
                    min="0"
                    step="0.001"
                    dir="ltr"
                    class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-end font-mono text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end gap-3">
          <button type="submit" :disabled="saving || !form.fee_package_id" class="rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {{ $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { feesV2Service } from '@/services/fees-v2.service'
import { courseService } from '@/services/course.service'
import { authService } from '@/services'

const route = useRoute()
const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const courseId = computed(() => route.params.courseId as string)

const schoolId = computed(() => authService.getStoredUser()?.school_id ?? 1)
const courseTitle = ref('')
const packages = ref<Array<{ id: string; name: string }>>([])
const saving = ref(false)

const form = ref({
  fee_package_id: '',
  lines: [] as Array<{
    charge_type_id: string
    label: string
    amount: number
    payment_timing: string
    billing_frequency: string
  }>,
})

async function onPackageChange() {
  if (!form.value.fee_package_id) {
    form.value.lines = []
    return
  }
  const pkg = await feesV2Service.getPackage(form.value.fee_package_id)
  const existing = new Map(form.value.lines.map((l) => [l.charge_type_id, l.amount]))
  form.value.lines = (pkg.charge_lines || []).map((cl) => ({
    charge_type_id: cl.charge_type_id,
    label: cl.charge_type?.label || cl.charge_type_id,
    amount: existing.get(cl.charge_type_id) ?? 0,
    payment_timing: cl.payment_timing,
    billing_frequency: cl.billing_frequency,
  }))
}

async function load() {
  const course = await courseService.getCourseById(courseId.value)
  courseTitle.value = course.name

  packages.value = await feesV2Service.listPackages(schoolId.value)
  const link = await feesV2Service.getCourseLink(schoolId.value, courseId.value).catch(() => null)
  if (link) {
    form.value.fee_package_id = link.fee_package_id
    form.value.lines = (link.lines || []).map((l) => ({
      charge_type_id: l.charge_type_id,
      label: l.chargeType?.label || l.charge_type_id,
      amount: Number(l.amount) || 0,
      payment_timing: 'installment',
      billing_frequency: 'per_year',
    }))
    if (link.fee_package_id) await onPackageChange()
    for (const l of link.lines || []) {
      const row = form.value.lines.find((x) => x.charge_type_id === l.charge_type_id)
      if (row) row.amount = Number(l.amount) || 0
    }
  }
}

async function save() {
  saving.value = true
  try {
    await feesV2Service.saveCourseLink({
      school_id: schoolId.value,
      course_id: courseId.value,
      fee_package_id: form.value.fee_package_id,
      lines: form.value.lines.map((l) => ({
        charge_type_id: l.charge_type_id,
        amount: Number(l.amount) || 0,
      })),
    })
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
