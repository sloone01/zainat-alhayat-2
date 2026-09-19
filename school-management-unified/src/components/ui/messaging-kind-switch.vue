<template>
  <div
    class="grid grid-cols-2 gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1"
    role="tablist"
    :aria-label="$t('chatMailbox.type')"
  >
    <button
      type="button"
      role="tab"
      class="rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="kind === 'groups'
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'"
      :aria-selected="kind === 'groups'"
      @click="go('groups')"
    >
      {{ $t('chatMailbox.groups') }}
    </button>
    <button
      type="button"
      role="tab"
      class="rounded-lg px-3 py-2 text-sm font-semibold transition"
      :class="kind === 'single'
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-gray-900'"
      :aria-selected="kind === 'single'"
      @click="go('single')"
    >
      {{ $t('chatMailbox.single') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const kind = computed<'groups' | 'single'>(() =>
  route.path.startsWith('/messages') ? 'single' : 'groups',
)

function go(next: 'groups' | 'single') {
  const to = next === 'single' ? '/messages' : '/chat'
  if (route.path !== to) void router.push(to)
}
</script>
