<template>
  <FikrDialog
    :show="show"
    size="md"
    plain-footer
    :title="group?.name || ''"
    :subtitle="ageRangeLabel || undefined"
    @close="$emit('close')"
  >
    <div class="fk-form">
      <div class="flex flex-wrap items-center gap-4 rounded-lg bg-fikr-surface-low p-4">
        <div class="fk-monogram fk-monogram--navy h-14 w-14 text-lg">{{ group?.name?.charAt(0) }}</div>
        <div class="min-w-0 flex-1">
          <span class="fk-chip" :class="group?.status === 'active' ? 'fk-chip--green' : 'fk-chip--neutral'">
            {{ group?.status === 'active' ? $t('groupManagement.active') : $t('groupManagement.inactive') }}
          </span>
          <p class="mt-2 text-sm text-fikr-ink-muted">{{ group?.description || $t('groupManagement.noDescription') }}</p>
        </div>
      </div>

      <div class="fk-form__section">
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ group?.studentCount || 0 }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('groupManagement.students') }}</div>
          </div>
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ group?.teacherCount || 0 }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('groupManagement.teachers') }}</div>
          </div>
          <div class="rounded-lg bg-fikr-surface-low px-3 py-3">
            <div class="text-xl font-semibold tabular-nums text-navy-800">{{ group?.capacity || 0 }}</div>
            <div class="mt-0.5 text-xs text-fikr-ink-soft">{{ $t('groupManagement.capacity') }}</div>
          </div>
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="font-semibold text-fikr-ink">{{ $t('groupManagement.occupancy') }}</span>
            <span class="text-fikr-ink-soft tabular-nums">
              {{ group?.studentCount || 0 }} / {{ group?.capacity || 0 }}
              ({{ Math.round(((group?.studentCount || 0) / (group?.capacity || 1)) * 100) }}%)
            </span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-fikr-surface-high">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="occupancyPercentage >= 90 ? 'bg-red-500' : occupancyPercentage >= 75 ? 'bg-amber-500' : 'bg-primary-500'"
              :style="{ width: `${Math.min(occupancyPercentage, 100)}%` }"
            />
          </div>
        </div>
      </div>

      <div class="fk-form__section">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p class="fk-form__eyebrow mb-2">{{ $t('groupManagement.groupInfo') }}</p>
            <dl class="divide-y divide-fikr-hairline">
              <div class="flex justify-between gap-3 py-2">
                <dt class="text-sm text-fikr-ink-soft">{{ $t('groupManagement.createdDate') }}</dt>
                <dd class="text-sm font-medium text-fikr-ink">{{ formatDate(group?.createdAt) }}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p class="fk-form__eyebrow mb-2">{{ $t('groupManagement.quickStats') }}</p>
            <dl class="divide-y divide-fikr-hairline">
              <div class="flex justify-between gap-3 py-2">
                <dt class="text-sm text-fikr-ink-soft">{{ $t('groupManagement.availableSpots') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ Math.max(0, (group?.capacity || 0) - (group?.studentCount || 0)) }}</dd>
              </div>
              <div class="flex justify-between gap-3 py-2">
                <dt class="text-sm text-fikr-ink-soft">{{ $t('groupManagement.studentTeacherRatio') }}</dt>
                <dd class="text-sm font-medium tabular-nums text-fikr-ink">{{ group?.teacherCount > 0 ? Math.round((group?.studentCount || 0) / group.teacherCount) : 0 }}:1</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="fk-form__section">
        <p class="fk-form__eyebrow">{{ $t('groupManagement.recentActivities') }}</p>
        <ul class="divide-y divide-fikr-hairline rounded-lg ring-1 ring-fikr-hairline">
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-primary-500" aria-hidden="true" />
            <p class="flex-1 text-sm font-medium text-fikr-ink">{{ $t('groupManagement.newStudentJoined') }}</p>
            <p class="text-xs text-fikr-ink-soft">{{ $t('groupManagement.timeAgo', { time: '2 hours' }) }}</p>
          </li>
          <li class="flex items-center gap-3 px-4 py-3">
            <span class="h-2 w-2 shrink-0 rounded-full bg-navy-800" aria-hidden="true" />
            <p class="flex-1 text-sm font-medium text-fikr-ink">{{ $t('groupManagement.activityCompleted') }}</p>
            <p class="text-xs text-fikr-ink-soft">{{ $t('groupManagement.timeAgo', { time: '1 day' }) }}</p>
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button type="button" class="fk-btn fk-btn--primary" @click="$emit('close')">{{ $t('common.close') }}</button>
    </template>
  </FikrDialog>
</template>

<script setup lang="ts">
import FikrDialog from '@/components/FikrDialog.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatGroupAgeRangeLabel } from '@/utils/groupAgeRange'

const { locale, t } = useI18n()

// Props
const props = defineProps<{
  show: boolean
  group?: any
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

const ageRangeLabel = computed(() =>
  formatGroupAgeRangeLabel(props.group?.age_range_min, props.group?.age_range_max, t('groupManagement.years'))
)

const occupancyPercentage = computed(() => {
  if (!props.group?.capacity) return 0
  return Math.round(((props.group?.studentCount || 0) / props.group.capacity) * 100)
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : 'en-US')
}
</script>

