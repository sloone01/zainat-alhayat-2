<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex items-center gap-3 py-8 text-sm text-gray-500">
      <span class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
      {{ $t('common.loading') }}
    </div>

    <template v-else-if="!groups.length">
      <p class="text-sm text-gray-500">{{ emptyMessage || $t('userManagement.noStaffGroups') }}</p>
      <slot name="empty" />
    </template>

    <template v-else>
      <div v-if="selectedGroups.length" class="flex flex-wrap gap-2">
        <button
          v-for="g in selectedGroups"
          :key="'chip-' + g.id"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800 hover:bg-primary-100"
          :aria-label="$t('userManagement.removeGroup', { name: g.name })"
          @click="toggle(g.id)"
        >
          <span class="max-w-[12rem] truncate">{{ g.name }}</span>
          <svg class="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="relative max-w-xl">
        <svg class="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="search"
          class="fk-field ps-10"
          :placeholder="$t('userManagement.searchStaffGroups')"
          :aria-label="$t('common.search')"
        >
      </div>

      <div v-if="!simple" class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="fk-btn fk-btn--pearl fk-btn--sm"
          :disabled="!filtered.length"
          @click="selectFiltered"
        >
          {{ $t('userManagement.selectFilteredGroups') }}
        </button>
        <button
          type="button"
          class="fk-btn fk-btn--pearl fk-btn--sm"
          :disabled="!modelValue.length"
          @click="emit('update:modelValue', [])"
        >
          {{ $t('userManagement.clearSelectedGroups') }}
        </button>
        <span class="ms-auto text-[11px] font-semibold tabular-nums text-primary-800">
          {{ $t('userManagement.groupsSelectedCount', { count: modelValue.length }) }}
        </span>
      </div>
      <p v-else class="text-xs text-gray-500">
        {{ $t('userManagement.groupsSelectedCount', { count: modelValue.length }) }}
      </p>

      <div class="overflow-hidden rounded-xl border border-gray-200/80">
        <div class="max-h-[22rem] overflow-y-auto divide-y divide-gray-100">
          <p
            v-if="!filtered.length"
            class="px-4 py-8 text-center text-sm text-gray-500"
          >
            {{ $t('userManagement.noMatchingGroups') }}
          </p>
          <label
            v-for="group in filtered"
            :key="group.id"
            class="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-primary-50/40"
            :class="{ 'bg-primary-50/60': modelValue.includes(group.id) }"
          >
            <input
              type="checkbox"
              class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              :checked="modelValue.includes(group.id)"
              @change="toggle(group.id)"
            >
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-gray-900">{{ group.name }}</span>
              <span v-if="group.description" class="mt-0.5 block text-xs text-gray-500 line-clamp-2">
                {{ group.description }}
              </span>
              <span
                v-if="!simple && group.code"
                class="mt-1 inline-block font-mono text-[10px] text-gray-400"
                dir="ltr"
              >{{ group.code }}</span>
            </span>
          </label>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RbacGroup } from '@/services/rbac.service'

const props = defineProps<{
  modelValue: string[]
  groups: RbacGroup[]
  loading?: boolean
  emptyMessage?: string
  /** Hide bulk actions + technical codes (employee access page). */
  simple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [ids: string[]]
}>()

const search = ref('')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.groups
  return props.groups.filter((g) => {
    const hay = `${g.name} ${g.code || ''} ${g.description || ''}`.toLowerCase()
    return hay.includes(q)
  })
})

const selectedGroups = computed(() =>
  props.groups.filter((g) => props.modelValue.includes(g.id)),
)

function toggle(id: string) {
  const set = new Set(props.modelValue)
  if (set.has(id)) set.delete(id)
  else set.add(id)
  emit('update:modelValue', [...set])
}

function selectFiltered() {
  const set = new Set(props.modelValue)
  for (const g of filtered.value) set.add(g.id)
  emit('update:modelValue', [...set])
}
</script>
