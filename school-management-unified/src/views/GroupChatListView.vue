<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('chatRooms.title')"
        :subtitle="$t('chatRooms.subtitle')"
      />

      <div v-if="error" class="fk-alert fk-alert--error">
        {{ error }}
      </div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('chatRooms.listHeading') }}</h2>
            <p v-if="!loading" class="fk-card__meta">
              {{ $t('chatRooms.roomsCount', { count: groups.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <router-link to="/messages" class="fk-btn fk-btn--pearl fk-btn--sm">
              {{ $t('directMessages.title') }}
            </router-link>
            <ListViewModeToggle v-model="viewMode" />
          </div>
        </header>

        <div class="p-6">
          <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="groups.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <router-link
                v-for="g in groups"
                :key="g.id"
                :to="`/chat/${g.id}`"
                class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-teal-500 opacity-80" aria-hidden="true" />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-800">
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ g.name }}</h3>
                      <p v-if="g.description" class="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{{ g.description }}</p>
                    </div>
                  </div>
                  <div class="mt-4">
                    <span class="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary-800 ring-1 ring-primary-100">
                      {{ g.studentCount ?? 0 }} {{ $t('chatRooms.students') }}
                    </span>
                  </div>
                </div>
                <div class="border-t border-gray-100 bg-gray-50/50 px-5 py-3">
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 group-hover:text-primary-900">
                    {{ $t('chatRooms.openRoom') }}
                    <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </router-link>
            </div>

            <div v-else class="overflow-x-auto rounded-xl border border-gray-200/80">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('chatRooms.listHeading') }}</th>
                    <th class="px-4 py-3 text-start">{{ $t('chatRooms.students') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="g in groups" :key="'list-' + g.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-900">{{ g.name }}</div>
                      <div v-if="g.description" class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ g.description }}</div>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ g.studentCount ?? 0 }}</td>
                    <td class="px-4 py-3 text-end">
                      <router-link
                        :to="`/chat/${g.id}`"
                        class="inline-flex items-center gap-1 font-semibold text-primary-700 hover:text-primary-900"
                      >
                        {{ $t('chatRooms.openRoom') }}
                        <svg class="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="slot in emptyGridSlots"
              :key="'empty-' + slot"
              class="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/90 to-white p-6 text-center"
              :class="slot === 2 ? 'hidden sm:flex' : slot === 3 ? 'hidden lg:flex' : ''"
            >
              <template v-if="slot === 1">
                <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-800">{{ $t('chatRooms.noGroups') }}</h3>
                <p class="mt-1 max-w-[14rem] text-xs leading-relaxed text-gray-500">{{ $t('chatRooms.emptyHint') }}</p>
              </template>
              <template v-else>
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100/80 text-gray-300">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p class="mt-3 text-[11px] font-medium uppercase tracking-wide text-gray-300">{{ $t('feesV2.emptyGridSlot') }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import { chatApiService, type ChatGroupSummary } from '@/services/chat.service'

const { locale, t } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const emptyGridSlots = [1, 2, 3]

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
