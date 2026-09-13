<template>
  <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
    <FikrPageHeader :title="title" :subtitle="subtitle">
      <template v-if="$slots.leading" #leading>
        <slot name="leading" />
      </template>
    </FikrPageHeader>

    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
      <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-5">
        <div class="flex flex-col items-center gap-5">
          <ol class="flex w-full max-w-4xl items-center justify-between gap-1">
            <li
              v-for="(step, index) in steps"
              :key="step.key"
              class="flex min-w-0 flex-1 items-center"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition"
                  :class="stepCircleClass(index + 1)"
                >
                  <svg
                    v-if="currentStep > index + 1"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span
                  class="hidden max-w-[4.5rem] truncate text-[11px] font-semibold sm:block"
                  :class="currentStep === index + 1 ? 'text-primary-800' : 'text-gray-500'"
                >
                  {{ step.shortTitle }}
                </span>
              </div>
              <div
                v-if="index < steps.length - 1"
                class="mx-1 h-1 flex-1 rounded-full sm:mx-2"
                :class="currentStep > index + 1 ? 'bg-primary-500' : 'bg-gray-200'"
                aria-hidden="true"
              />
            </li>
          </ol>
          <div class="text-center">
            <h2 class="text-base font-semibold text-gray-900">{{ current?.title }}</h2>
            <p class="mt-1 text-sm text-gray-500">{{ current?.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.02]">
      <div class="border-b border-gray-100 bg-gradient-to-r from-primary-50/80 via-white to-teal-50/50 px-6 py-4">
        <div class="flex items-start gap-3">
          <div class="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 sm:flex">
            <slot name="icon">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="currentIcon" />
              </svg>
            </slot>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-gray-900">{{ current?.title }}</h3>
            <p class="mt-0.5 text-xs text-gray-500">{{ current?.description }}</p>
          </div>
        </div>
      </div>
      <div class="p-6">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FikrPageHeader from '@/components/FikrPageHeader.vue'

export type EnrollmentWizardStep = {
  key: string
  shortTitle: string
  title: string
  description: string
}

const props = defineProps<{
  title: string
  subtitle: string
  steps: EnrollmentWizardStep[]
  currentStep: number
}>()

const { locale } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const current = computed(() => props.steps[props.currentStep - 1])

const ICON_PATHS: Record<string, string> = {
  student: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  academic: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  health: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  guardian: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  address: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  group: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  review: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  payment: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
}

const currentIcon = computed(
  () => ICON_PATHS[current.value?.key] || ICON_PATHS.student,
)

const stepCircleClass = (stepNumber: number) => {
  if (props.currentStep > stepNumber) return 'bg-primary-600 text-white shadow-sm'
  if (props.currentStep === stepNumber) return 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100'
  return 'bg-white text-gray-400 ring-2 ring-gray-200'
}
</script>
