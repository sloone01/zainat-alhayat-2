<template>
  <div
    class="student-id-card mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border border-primary-200/80 bg-white shadow-md ring-1 ring-black/[0.03]"
    :dir="dir"
  >
    <div class="relative bg-gradient-to-br from-primary-700 via-primary-600 to-teal-600 px-5 pb-10 pt-4 text-white">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-100/90">
            {{ $t('studentManagement.studentCardLabel') }}
          </p>
          <h3 class="mt-1 truncate text-base font-bold leading-snug">
            {{ schoolName || $t('studentManagement.studentCardSchoolFallback') }}
          </h3>
        </div>
        <img
          src="/fikr-logo.png?v=4"
          alt=""
          class="h-9 w-9 shrink-0 rounded-lg bg-white/95 object-contain p-1 shadow-sm"
        >
      </div>
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </div>

    <div class="relative -mt-8 px-5 pb-5">
      <div class="flex items-end gap-4">
        <div
          class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-gradient-to-br from-primary-50 to-teal-50 shadow-md ring-1 ring-primary-100"
        >
          <img
            v-if="photo"
            :src="photo"
            :alt="fullName"
            class="h-full w-full object-cover"
          >
          <svg
            v-else
            class="h-12 w-12 text-primary-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1 pb-1">
          <h4 class="text-lg font-bold leading-tight text-gray-900">{{ fullName }}</h4>
          <p v-if="studentId" class="mt-0.5 text-sm font-medium text-primary-700">
            {{ $t('students.studentId') }}: {{ studentId }}
          </p>
        </div>
      </div>

      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('students.dateOfBirth') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ dateOfBirthLabel || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('students.gender') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ genderLabel || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('studentManagement.group') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ groupLabel || '—' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('studentManagement.bus') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ busLabel || '—' }}</dd>
        </div>
        <div class="col-span-2">
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('studentManagement.parent') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ parentLabel || '—' }}</dd>
        </div>
        <div v-if="emergencyContact" class="col-span-2">
          <dt class="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            {{ $t('studentManagement.emergencyContact') }}
          </dt>
          <dd class="mt-0.5 font-semibold text-gray-900">{{ emergencyContact }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dir?: 'ltr' | 'rtl'
  schoolName?: string
  fullName: string
  photo?: string | null
  studentId?: string | null
  dateOfBirthLabel?: string
  genderLabel?: string
  groupLabel?: string
  busLabel?: string
  parentLabel?: string
  emergencyContact?: string | null
}>()
</script>
