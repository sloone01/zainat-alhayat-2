<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <div class="flex flex-wrap gap-2">
        <label class="sr-only" :for="searchId">{{ placeholder }}</label>
        <input
          :id="searchId"
          ref="searchInput"
          v-model="query"
          type="search"
          class="fk-field min-w-[12rem] flex-1"
          :placeholder="placeholder"
          autocomplete="off"
          role="combobox"
          :aria-expanded="showSuggestions"
          aria-autocomplete="list"
          :aria-controls="listboxId"
          :aria-activedescendant="activeOptionId"
          @keydown.enter.prevent="addHighlighted"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.escape.prevent="query = ''"
        />
        <button
          v-if="mode === 'multi'"
          type="button"
          class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          :aria-label="$t('common.add')"
          :disabled="!matches.length"
          @click="addHighlighted"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <ul
        v-if="showSuggestions"
        :id="listboxId"
        class="absolute inset-x-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        role="listbox"
      >
        <li v-for="(person, idx) in matches" :key="person.id" role="none">
          <button
            :id="optionId(person.id)"
            type="button"
            role="option"
            :aria-selected="idx === highlightIndex"
            class="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-start transition-colors duration-200"
            :class="idx === highlightIndex ? 'bg-primary-50' : 'hover:bg-primary-50/60'"
            @mousedown.prevent="chooseMatch(person)"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
              aria-hidden="true"
            >
              {{ initials(person.name) }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-gray-900">{{ person.name }}</span>
              <span class="block truncate text-xs text-gray-500">{{ secondary(person) }}</span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <div class="h-px w-full bg-gray-200" role="separator" />

    <div v-if="loading" class="py-6 text-center text-sm text-gray-500">
      {{ $t('common.loading') }}
    </div>

    <div v-else class="flex max-h-[min(40vh,16rem)] flex-col gap-3 overflow-y-auto">
      <div
        v-if="ownerPerson"
        class="flex items-center gap-3"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
          aria-hidden="true"
        >
          {{ initials(ownerPerson.name) }}
        </span>
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="truncate text-sm font-medium text-gray-900">{{ ownerPerson.name }}</span>
          <span class="truncate text-xs text-gray-500">{{ secondary(ownerPerson) }}</span>
        </div>
        <span class="shrink-0 text-xs text-gray-500">{{ $t('chatRooms.owner') }}</span>
      </div>

      <template v-if="mode === 'multi'">
        <div
          v-for="person in selectedPeople"
          :key="person.id"
          class="flex items-center gap-3"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
            aria-hidden="true"
          >
            {{ initials(person.name) }}
          </span>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-medium text-gray-900">{{ person.name }}</span>
            <span class="truncate text-xs text-gray-500">{{ secondary(person) }}</span>
          </div>
          <label class="sr-only" :for="roleId(person.id)">{{ $t('common.actions') }}</label>
          <select
            :id="roleId(person.id)"
            class="fk-field fk-field--sm w-28 shrink-0 cursor-pointer py-1.5 text-xs"
            :value="memberValue"
            @change="onRoleChange(person.id, ($event.target as HTMLSelectElement).value)"
          >
            <option :value="memberValue">{{ $t('chatRooms.memberRole') }}</option>
            <option value="remove">{{ $t('common.remove') }}</option>
          </select>
        </div>
      </template>

      <template v-else>
        <button
          v-for="person in listPeople"
          :key="person.id"
          type="button"
          :disabled="busyId === person.id"
          class="flex w-full cursor-pointer items-center gap-3 rounded-lg text-start transition-colors duration-200 hover:bg-primary-50/60 disabled:cursor-not-allowed disabled:opacity-50"
          @click="$emit('pick', person.id)"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700"
            aria-hidden="true"
          >
            {{ initials(person.name) }}
          </span>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-sm font-medium text-gray-900">{{ person.name }}</span>
            <span class="truncate text-xs text-gray-500">
              {{ busyId === person.id ? $t('directMessages.starting') : secondary(person) }}
            </span>
          </div>
        </button>
      </template>

      <p
        v-if="showEmpty"
        class="px-1 py-6 text-center text-sm text-gray-500"
      >
        {{ emptyLabel }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export type ShareAccessPerson = {
  id: string
  name: string
  email?: string
  subtitle?: string
  role?: string
  owner?: boolean
}

const props = withDefaults(
  defineProps<{
    people: ShareAccessPerson[]
    selectedIds?: string[]
    owner?: ShareAccessPerson | null
    loading?: boolean
    placeholder: string
    emptyLabel: string
    mode?: 'multi' | 'single'
    busyId?: string
  }>(),
  {
    selectedIds: () => [],
    owner: null,
    loading: false,
    mode: 'multi',
    busyId: '',
  },
)

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  pick: [id: string]
}>()

const memberValue = 'member'
const query = ref('')
const highlightIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)
const uid = Math.random().toString(36).slice(2, 8)
const searchId = `share-access-search-${uid}`
const listboxId = `share-access-listbox-${uid}`

const ownerPerson = computed(() => props.owner ?? null)
const ownerId = computed(() => ownerPerson.value?.id ?? '')

const addablePeople = computed(() =>
  props.people.filter((p) => p.id && p.id !== ownerId.value && !p.owner),
)

const selectedIdSet = computed(() => new Set(props.selectedIds))

const selectedPeople = computed(() =>
  addablePeople.value.filter((p) => selectedIdSet.value.has(p.id)),
)

const unselectedPeople = computed(() =>
  addablePeople.value.filter((p) => !selectedIdSet.value.has(p.id)),
)

const needle = computed(() => query.value.trim().toLowerCase())

function matchesQuery(person: ShareAccessPerson, n: string) {
  if (!n) return true
  return [person.name, person.email, person.subtitle, person.role]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(n))
}

const matches = computed(() => {
  const pool = props.mode === 'multi' ? unselectedPeople.value : addablePeople.value
  const n = needle.value
  if (!n) return []
  return pool.filter((p) => matchesQuery(p, n))
})

const listPeople = computed(() => {
  const n = needle.value
  return addablePeople.value.filter((p) => matchesQuery(p, n))
})

const showSuggestions = computed(
  () => Boolean(needle.value) && matches.value.length > 0 && props.mode === 'multi',
)

const highlighted = computed(() => matches.value[highlightIndex.value] ?? matches.value[0] ?? null)

const activeOptionId = computed(() =>
  showSuggestions.value && highlighted.value ? optionId(highlighted.value.id) : undefined,
)

const showEmpty = computed(() => {
  if (props.loading) return false
  if (props.mode === 'multi') {
    return !ownerPerson.value && selectedPeople.value.length === 0 && addablePeople.value.length === 0
  }
  return listPeople.value.length === 0
})

function optionId(id: string) {
  return `share-access-opt-${uid}-${id}`
}

function roleId(id: string) {
  return `share-access-role-${uid}-${id}`
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function secondary(person: ShareAccessPerson) {
  return person.subtitle || person.email || person.role || ''
}

function moveHighlight(delta: number) {
  if (!matches.value.length) return
  const next = highlightIndex.value + delta
  highlightIndex.value = (next + matches.value.length) % matches.value.length
}

function addPerson(person: ShareAccessPerson) {
  if (props.mode === 'single') {
    emit('pick', person.id)
    return
  }
  if (selectedIdSet.value.has(person.id) || person.id === ownerId.value) return
  emit('update:selectedIds', [...props.selectedIds, person.id])
  query.value = ''
}

function chooseMatch(person: ShareAccessPerson) {
  addPerson(person)
}

function addHighlighted() {
  if (props.mode === 'single') {
    const first = listPeople.value[0]
    if (first) emit('pick', first.id)
    return
  }
  if (highlighted.value) addPerson(highlighted.value)
}

function onRoleChange(id: string, value: string) {
  if (value === 'remove') {
    emit(
      'update:selectedIds',
      props.selectedIds.filter((x) => x !== id),
    )
  }
}

watch(matches, () => {
  highlightIndex.value = 0
})

defineExpose({ focus: () => searchInput.value?.focus() })
</script>
