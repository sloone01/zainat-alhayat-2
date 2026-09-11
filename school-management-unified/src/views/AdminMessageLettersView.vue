<template>
  <DashboardLayout>
    <div class="fk-page" :dir="isRTL ? 'rtl' : 'ltr'">
      <FikrPageHeader
        :title="$t('messageLetters.title')"
        :subtitle="$t('messageLetters.subtitle')"
      />

      <div v-if="flashError" class="fk-alert fk-alert--error">{{ flashError }}</div>
      <div v-if="flashOk" class="fk-alert fk-alert--ok">{{ flashOk }}</div>

      <div class="fk-card">
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-fikr-hairline px-5 py-4 sm:px-6">
          <div class="min-w-0">
            <h2 class="fk-card__title truncate">{{ $t('messageLetters.listHeading') }}</h2>
            <p v-if="!pageLoading" class="fk-card__meta">
              {{ $t('messageLetters.lettersCount', { count: letters.length }) }}
            </p>
          </div>
          <div class="flex shrink-0 flex-nowrap items-center gap-2">
            <ListViewModeToggle v-model="viewMode" />
            <button
              type="button"
              class="fk-iconbtn fk-iconbtn--primary"
              :aria-label="$t('messageLetters.newLetter')"
              @click="openNew"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div class="p-6">
          <div v-if="pageLoading" class="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" aria-hidden="true" />
            <span class="text-sm">{{ $t('common.loading') }}</span>
          </div>

          <template v-else-if="letters.length">
            <div v-if="isCards" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="row in paginatedLetters"
                :key="row.id"
                class="group relative flex flex-col overflow-visible rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div
                  class="absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-80"
                  :class="row.requires_approval ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-primary-500 to-teal-500'"
                  aria-hidden="true"
                />
                <div class="flex flex-1 flex-col p-5">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      :class="row.requires_approval ? 'bg-amber-50 text-amber-800' : 'bg-primary-100 text-primary-800'"
                    >
                      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <h3 class="truncate font-semibold text-gray-900">{{ row.title }}</h3>
                      <p class="mt-0.5 text-xs text-gray-500">{{ formatDate(row.updated_at) }}</p>
                    </div>
                    <RowActionsMenu
                      :open="activeMenuId === row.id"
                      placement="up"
                      @toggle="toggleMenu(row.id)"
                    >
                      <RowActionsItem
                        v-if="row.requires_approval"
                        icon="view"
                        @click="runMenuAction(() => openApprovalTracking(row))"
                      >
                        {{ $t('messageLetters.approvalTrackingButton') }}
                      </RowActionsItem>
                      <RowActionsItem icon="edit" @click="runMenuAction(() => openEdit(row.id))">
                        {{ $t('common.edit') }}
                      </RowActionsItem>
                      <RowActionsItem
                        v-if="row.source !== 'activity'"
                        icon="delete"
                        danger
                        @click="runMenuAction(() => removeLetter(row))"
                      >
                        {{ $t('common.delete') }}
                      </RowActionsItem>
                    </RowActionsMenu>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-1.5">
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="letterTypeBadgeClass(row)"
                    >
                      {{ letterTypeLabel(row) }}
                    </span>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="row.source === 'activity' ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-100' : 'bg-slate-100 text-slate-700'"
                    >
                      {{ row.source === 'activity' ? $t('messageLetters.sourceActivity') : $t('messageLetters.sourceCustom') }}
                    </span>
                    <span class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-sky-800 ring-1 ring-sky-100">
                      {{ row.recipient_count }} {{ $t('messageLetters.colRecipients') }}
                    </span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="fk-table-wrap overflow-visible">
              <table class="min-w-full text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-start">{{ $t('messageLetters.colTitle') }}</th>
                    <th class="px-4 py-3 text-start whitespace-nowrap">{{ $t('messageLetters.colType') }}</th>
                    <th class="px-4 py-3 text-start whitespace-nowrap">{{ $t('messageLetters.colSource') }}</th>
                    <th class="px-4 py-3 text-start whitespace-nowrap">{{ $t('messageLetters.colRecipients') }}</th>
                    <th class="px-4 py-3 text-start whitespace-nowrap">{{ $t('messageLetters.colUpdated') }}</th>
                    <th class="px-4 py-3 text-end">{{ $t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="row in paginatedLetters" :key="'list-' + row.id" class="hover:bg-primary-50/20">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ row.title }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        :class="letterTypeBadgeClass(row)"
                      >
                        {{ letterTypeLabel(row) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        :class="row.source === 'activity' ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-600'"
                      >
                        {{ row.source === 'activity' ? $t('messageLetters.sourceActivity') : $t('messageLetters.sourceCustom') }}
                      </span>
                    </td>
                    <td class="px-4 py-3 tabular-nums text-gray-700">{{ row.recipient_count }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-gray-600">{{ formatDate(row.updated_at) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <RowActionsMenu
                          :open="activeMenuId === row.id"
                          placement="up"
                          @toggle="toggleMenu(row.id)"
                        >
                          <RowActionsItem
                            v-if="row.requires_approval"
                            icon="view"
                            @click="runMenuAction(() => openApprovalTracking(row))"
                          >
                            {{ $t('messageLetters.approvalTrackingButton') }}
                          </RowActionsItem>
                          <RowActionsItem icon="edit" @click="runMenuAction(() => openEdit(row.id))">
                            {{ $t('common.edit') }}
                          </RowActionsItem>
                          <RowActionsItem
                            v-if="row.source !== 'activity'"
                            icon="delete"
                            danger
                            @click="runMenuAction(() => removeLetter(row))"
                          >
                            {{ $t('common.delete') }}
                          </RowActionsItem>
                        </RowActionsMenu>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <FikrPagination
              :page="currentPage"
              :pages="totalPages"
              :show="letters.length > 0"
              @update:page="goToPage"
            />
          </template>

          <div
            v-else
            class="flex min-h-[16rem] flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-gray-800">{{ $t('messageLetters.empty') }}</h3>
            <p class="mx-auto mt-1 max-w-md text-sm text-gray-500">{{ $t('messageLetters.emptyHint') }}</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              @click="openNew"
            >
              {{ $t('messageLetters.createFirstLetter') }}
            </button>
          </div>
        </div>
      </div>

      <MessageLetterApprovalTrackingSheet
        ref="approvalTrackingRef"
        v-model:open="approvalSheetOpen"
        :school-id="schoolId"
        :letter-id="approvalSheetLetterId"
        :letter-title="approvalSheetLetterTitle"
      />


      <Teleport to="body">
        <div
          v-if="sheetOpen"
          class="fixed inset-0 z-[60] flex justify-end bg-black/40"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('messageLetters.sheetTitle')"
          @click.self="closeSheet"
        >
          <div
            class="h-full w-full max-w-6xl overflow-y-auto bg-white shadow-xl"
            :class="isRTL ? 'border-s border-gray-200' : 'border-e border-gray-200'"
            @click.stop
          >
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-fikr-hairline bg-white px-4 py-3">
              <h2 class="fk-form__title">{{ sheetTitle }}</h2>
              <button type="button" class="fk-modal__close" :aria-label="$t('common.close')" @click="closeSheet">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-6 p-4 sm:p-6 pb-28">
              <div>
                <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ $t('messageLetters.letterTitle') }}</label>
                <input
                  v-model="letterTitle"
                  type="text"
                  maxlength="200"
                  class="fk-field"
                />
              </div>

              <!-- Required action -->
              <div class="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('messageLetters.requiredActionTitle') }}</h3>
                <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div
                    class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5"
                    role="tablist"
                    :aria-label="$t('messageLetters.sendChannelsAria')"
                  >
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="dispatchChannel === 'email'"
                      class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
                      :class="dispatchChannel === 'email' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      @click="dispatchChannel = 'email'"
                    >
                      {{ $t('messageLetters.dispatchChannelEmail') }}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="dispatchChannel === 'sms'"
                      class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
                      :class="dispatchChannel === 'sms' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      @click="dispatchChannel = 'sms'"
                    >
                      {{ $t('messageLetters.dispatchChannelSms') }}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="dispatchChannel === 'chat'"
                      class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
                      :class="dispatchChannel === 'chat' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      @click="dispatchChannel = 'chat'"
                    >
                      {{ $t('messageLetters.dispatchChannelChat') }}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="dispatchChannel === 'chat_approval'"
                      class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
                      :class="dispatchChannel === 'chat_approval' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                      @click="dispatchChannel = 'chat_approval'"
                    >
                      {{ $t('messageLetters.dispatchChannelApproval') }}
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                      :disabled="!editingId || dispatching || saving"
                      @click="dispatchLetter"
                    >
                      {{ dispatching ? $t('common.loading') + '…' : $t('messageLetters.dispatchAction') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled
                      :title="$t('messageLetters.printComingSoon')"
                      :aria-label="$t('messageLetters.printAction')"
                    >
                      {{ $t('messageLetters.printAction') }}
                    </button>
                  </div>
                </div>
                <p v-if="!editingId" class="text-xs text-amber-700">{{ $t('messageLetters.dispatchNeedSave') }}</p>
              </div>

              <div class="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 space-y-5">
                  <h3 class="text-sm font-semibold text-gray-900">{{ $t('messageLetters.composerTitle') }}</h3>

                  <div
                    class="inline-flex w-full rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm"
                    role="tablist"
                    :aria-label="$t('notificationTemplates.localeTabsAria')"
                  >
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="langTab === 'en'"
                      class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                      :class="langTab === 'en' ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200' : 'text-gray-600'"
                      @click="setLangTab('en')"
                    >
                      {{ $t('notificationTemplates.langEn') }}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      :aria-selected="langTab === 'ar'"
                      class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
                      :class="langTab === 'ar' ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200' : 'text-gray-600'"
                      @click="setLangTab('ar')"
                    >
                      {{ $t('notificationTemplates.langAr') }}
                    </button>
                  </div>

                  <div :dir="editorContentDir" class="space-y-4 isolate">
                    <NotificationEmailContentFrame>
                      <div
                        class="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-5"
                        :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                      >
                        <div class="flex flex-wrap items-end gap-2">
                          <div class="min-w-0 flex-1">
                            <label class="mb-1.5 block text-xs font-medium text-gray-600" for="ml-subject">{{
                              $t('notificationTemplates.subject')
                            }}</label>
                            <input
                              id="ml-subject"
                              ref="subjectInputRef"
                              v-model="subject"
                              type="text"
                              class="fk-field"
                              @focus="onSubjectFocus"
                            />
                          </div>
                          <button
                            type="button"
                            class="fk-btn fk-btn--pearl shrink-0"
                            :disabled="saving || previewLoading"
                            @click="openPreviewDialog"
                          >
                            {{ $t('notificationTemplates.previewButton') }}
                          </button>
                        </div>
                      </div>
                      <div
                        class="bg-white"
                        :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                        @focusin="emailInsertTarget = 'body'"
                      >
                        <div
                          v-if="bodyRegionSplit && bodyRegionKind === 'div'"
                          class="mx-auto max-w-[560px] overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,.06)]"
                        >
                          <div v-if="editorEmailCardChrome" v-html="editorEmailCardChrome" />
                          <div class="nt-email-body" :style="editorEmailBodyStyle">
                            <NotificationTemplateEmailEditor
                              ref="emailEditorRef"
                              v-model="bodyHtml"
                              embedded
                              in-card-body
                              :disabled="saving"
                              :remount-key="`ml-${editingId ?? 'new'}-${langTab}-${editorEpoch}`"
                              :rtl="langTab === 'ar'"
                            >
                              <template v-if="insertableFieldItems.length" #fields>
                                <NotificationInsertFieldsBar
                                  :title="$t('notificationTemplates.insertVariables')"
                                  :hint="$t('notificationTemplates.insertHintEmail')"
                                  :hints="insertableFieldItems"
                                  @insert="insertPlaceholderFromEmailEditor"
                                />
                              </template>
                            </NotificationTemplateEmailEditor>
                          </div>
                        </div>
                        <NotificationTemplateEmailEditor
                          v-else
                          ref="emailEditorRef"
                          v-model="bodyHtml"
                          embedded
                          :disabled="saving"
                          :remount-key="`ml-${editingId ?? 'new'}-${langTab}-${editorEpoch}`"
                          :rtl="langTab === 'ar'"
                        >
                          <template v-if="insertableFieldItems.length" #fields>
                            <NotificationInsertFieldsBar
                              :title="$t('notificationTemplates.insertVariables')"
                              :hint="$t('notificationTemplates.insertHintEmail')"
                              :hints="insertableFieldItems"
                              @insert="insertPlaceholderFromEmailEditor"
                            />
                          </template>
                        </NotificationTemplateEmailEditor>
                      </div>
                    </NotificationEmailContentFrame>

                    <div>
                      <label class="mb-1.5 block text-xs font-medium text-gray-600" for="ml-sms">{{
                        $t('notificationTemplates.bodySms')
                      }}</label>
                      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div
                          v-if="insertableFieldItems.length"
                          class="flex flex-wrap items-center gap-2 border-b border-slate-200/90 bg-white px-2 py-2"
                        >
                          <NotificationInsertFieldsBar
                            :title="$t('notificationTemplates.insertVariables')"
                            :hint="$t('notificationTemplates.insertHintSms')"
                            :hints="insertableFieldItems"
                            @insert="insertPlaceholderSms"
                          />
                        </div>
                        <textarea
                          id="ml-sms"
                          ref="smsTextareaRef"
                          v-model="bodySms"
                          rows="4"
                          class="block min-h-[8rem] w-full resize-y border-0 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              <!-- Audience -->
              <div class="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <h3 class="text-sm font-semibold text-gray-800">{{ $t('messageLetters.audienceHeading') }}</h3>
                  <button type="button" class="text-xs font-medium text-primary-600 hover:text-primary-800" @click="refreshRecipientCount">
                    {{ $t('messageLetters.countRecipients') }} ({{ recipientPreviewCount ?? '—' }})
                  </button>
                </div>
                <p v-if="editingSource === 'activity'" class="text-xs text-violet-800 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  {{ $t('messageLetters.audienceFromActivity') }}
                </p>
                <p v-else class="text-xs text-gray-500">{{ $t('messageLetters.audienceHint') }}</p>
                <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap" :class="editingSource === 'activity' ? 'opacity-60 pointer-events-none' : ''">
                  <label
                    v-for="opt in roleOptions"
                    :key="opt.key"
                    class="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
                    :class="opt.model.value ? 'border-primary-300 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white text-gray-700'"
                  >
                    <input v-model="opt.model" type="checkbox" class="rounded border-gray-300 text-primary-600 shrink-0" :disabled="editingSource === 'activity'" />
                    <span class="text-sm font-medium">{{ opt.label }}</span>
                  </label>
                </div>
                <div>
                  <div class="mb-1 flex items-center justify-between gap-2">
                    <h4 class="text-xs font-semibold text-gray-700">{{ $t('meetingRooms.groupsCardTitle') }}</h4>
                    <button v-if="selectedGroupIds.length" type="button" class="text-xs text-primary-600 hover:text-primary-800" @click="clearGroups">
                      {{ $t('meetingRooms.clearGroups') }}
                    </button>
                  </div>
                  <div v-if="!groups.length" class="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-500">
                    {{ $t('meetingRooms.noGroups') }}
                  </div>
                  <div v-else class="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="g in groups"
                      :key="g.id"
                      class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50"
                      :class="selectedGroupIds.includes(g.id) ? 'bg-primary-50/50' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedGroupIds.includes(g.id)"
                        @change="toggleGroup(g.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="text-sm font-medium text-gray-900">{{ g.name }}</span>
                    </label>
                  </div>
                </div>
                <div>
                  <div class="mb-1 flex items-center justify-between gap-2">
                    <h4 class="text-xs font-semibold text-gray-700">{{ $t('meetingRooms.usersCardTitle') }}</h4>
                    <button v-if="selectedUserIds.length" type="button" class="text-xs text-primary-600 hover:text-primary-800" @click="clearUsers">
                      {{ $t('meetingRooms.clearUsers') }}
                    </button>
                  </div>
                  <input
                    v-model="userSearch"
                    type="search"
                    class="fk-field mb-2"
                    :placeholder="$t('meetingRooms.userSearchPlaceholder')"
                  />
                  <div class="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                    <label
                      v-for="u in filteredUsers"
                      :key="u.id"
                      class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50"
                      :class="selectedUserIds.includes(u.id) ? 'bg-indigo-50/60' : ''"
                    >
                      <input
                        type="checkbox"
                        class="rounded border-gray-300 text-primary-600 shrink-0"
                        :checked="selectedUserIds.includes(u.id)"
                        @change="toggleUser(u.id, ($event.target as HTMLInputElement).checked)"
                      />
                      <span class="min-w-0 flex-1 text-sm text-gray-900">
                        <span class="font-medium">{{ u.firstName }} {{ u.lastName }}</span>
                        <span class="text-gray-500"> · {{ roleLabel(u.role) }}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 flex items-center justify-end gap-2 border-t border-fikr-hairline bg-white px-4 py-3">
              <button type="button" class="fk-btn fk-btn--pearl" @click="closeSheet">
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                :disabled="saving"
                class="fk-btn fk-btn--primary"
                @click="saveLetter"
              >
                {{ saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <FikrDialog
        :show="showPreviewDialog"
        elevate
        plain-footer
        size="lg"
        :title="$t('notificationTemplates.previewHeading')"
        :subtitle="letterTitle"
        @close="closePreviewDialog"
      >
        <div
          class="mb-4 inline-flex w-full rounded-xl border border-teal-100/90 bg-teal-50/50 p-1 shadow-sm"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
            :class="
              previewDialogTab === 'preview'
                ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                : 'text-gray-600 hover:text-gray-900'
            "
            :aria-selected="previewDialogTab === 'preview'"
            @click="setPreviewDialogTab('preview')"
          >
            {{ $t('notificationTemplates.previewHeading') }}
          </button>
          <button
            type="button"
            role="tab"
            class="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all"
            :class="
              previewDialogTab === 'samples'
                ? 'bg-white text-primary-700 shadow-sm ring-1 ring-primary-200'
                : 'text-gray-600 hover:text-gray-900'
            "
            :aria-selected="previewDialogTab === 'samples'"
            @click="setPreviewDialogTab('samples')"
          >
            {{ $t('notificationTemplates.sampleValues') }}
          </button>
        </div>
        <div v-show="previewDialogTab === 'preview'" class="relative min-h-[240px]">
          <div
            v-if="previewLoading"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80"
            aria-busy="true"
            aria-live="polite"
          >
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
          <div class="transition-opacity space-y-4" :class="previewLoading ? 'pointer-events-none opacity-50' : ''">
            <NotificationEmailContentFrame>
              <div class="border-b border-gray-200 bg-gray-50 px-5 py-4" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
                <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  {{ $t('notificationTemplates.previewSubjectLabel') }}
                </p>
                <p class="mt-1.5 text-base font-semibold leading-snug text-gray-900 break-words">{{ preview.subject || '—' }}</p>
              </div>
              <div class="bg-white">
                <iframe
                  ref="previewIframeRef"
                  title="message-letter-email-preview"
                  class="block w-full border-0 bg-white"
                  style="min-height: 280px"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                  sandbox="allow-same-origin"
                  scrolling="no"
                  :srcdoc="previewHtmlSrcdoc"
                  @load="syncPreviewIframeHeight"
                />
              </div>
            </NotificationEmailContentFrame>
            <NotificationEmailContentFrame v-if="preview.body_sms">
              <div
                class="flex min-h-[120px] flex-col justify-end bg-[#e8e8ed] px-4 py-5"
                :class="editorContentDir === 'rtl' ? 'items-end' : 'items-start'"
              >
                <div
                  class="max-w-[min(92%,22rem)] rounded-2xl bg-white px-3 py-2 text-sm leading-relaxed text-gray-900 shadow-sm whitespace-pre-wrap break-words"
                  :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                >
                  {{ preview.body_sms }}
                </div>
              </div>
            </NotificationEmailContentFrame>
          </div>
        </div>
        <div v-show="previewDialogTab === 'samples'" class="space-y-3">
          <p class="text-xs text-gray-500">{{ $t('notificationTemplates.sampleValuesHint') }}</p>
          <div class="grid sm:grid-cols-2 gap-3">
            <div v-for="h in variableHintsForSamples" :key="'sv-' + h.name">
              <label class="mb-1.5 block text-xs font-medium text-gray-600">{{ hintDisplayLabel(h) }}</label>
              <template v-if="isLockedBrandingVar(h.name)">
                <img
                  v-if="h.name === 'schoolLogo' && sampleVars.schoolLogo"
                  :src="sampleVars.schoolLogo"
                  alt=""
                  class="mb-2 h-10 w-auto max-w-[7rem] rounded border border-gray-200 bg-white object-contain p-1"
                />
                <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                  {{ h.name === 'schoolLogo' && !sampleVars.schoolLogo ? $t('notificationTemplates.schoolLogoMissing') : sampleVars[h.name] }}
                </div>
                <p class="text-[11px] text-gray-500 mt-1">{{ $t('notificationTemplates.schoolNameLockedHint') }}</p>
              </template>
              <input
                v-else
                v-model="sampleVars[h.name]"
                type="text"
                class="fk-field"
              />
            </div>
          </div>
        </div>
        <template #footer>
          <button type="button" class="fk-btn fk-btn--pearl" @click="closePreviewDialog">
            {{ $t('common.close') }}
          </button>
        </template>
      </FikrDialog>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FikrPageHeader from '@/components/FikrPageHeader.vue'
import FikrDialog from '@/components/FikrDialog.vue'
import ListViewModeToggle from '@/components/ListViewModeToggle.vue'
import RowActionsMenu from '@/components/RowActionsMenu.vue'
import RowActionsItem from '@/components/RowActionsItem.vue'
import { useListViewMode } from '@/composables/useListViewMode'
import FikrPagination from '@/components/FikrPagination.vue'
import { useClientPagination } from '@/composables/useClientPagination'
import NotificationEmailContentFrame from '@/components/NotificationEmailContentFrame.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
import NotificationInsertFieldsBar from '@/components/NotificationInsertFieldsBar.vue'
import MessageLetterApprovalTrackingSheet from '@/components/MessageLetterApprovalTrackingSheet.vue'
import { authService } from '@/services'
import messageLetterService, {
  type MessageLetterDispatchChannel,
  type MessageLetterVariableHint,
  type SchoolMessageLetterRow,
} from '@/services/message-letter.service'
import notificationTemplateService from '@/services/notification-template.service'
import { groupService, type Group } from '@/services/group.service'
import userService, { type User } from '@/services/user.service'
import {
  splitNotificationBodyEditableRegion,
  splitPrefixBeforeEmailBody,
  inlineStyleFromTag,
} from '@/utils/email-template-body-region'
import { splitHtmlDocument } from '@/utils/email-template-document'
import {
  buildMessageLetterDefaultHtml,
  ensureEmailCardBodyRegion,
} from '@/utils/email-template-card-shell'
import { insertIntoStringAtCursor } from '@/utils/field-insert'
import DOMPurify from 'dompurify'
import { applyNotificationTemplateVariablesHtml } from '@/utils/notification-template-variables'

const { locale, t, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')
const { viewMode, isCards } = useListViewMode()
const activeMenuId = ref<string | null>(null)

function toggleMenu(id: string) {
  activeMenuId.value = activeMenuId.value === id ? null : id
}

function closeMenus() {
  activeMenuId.value = null
}

function runMenuAction(action: () => void) {
  closeMenus()
  action()
}

function onDocumentClick(event: MouseEvent) {
  if (activeMenuId.value && !(event.target as Element).closest('.relative')) {
    closeMenus()
  }
}

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: string } | null)?.school_id ?? 1))

const pageLoading = ref(true)
const letters = ref<SchoolMessageLetterRow[]>([])
const {
  currentPage,
  paginatedItems: paginatedLetters,
  totalPages,
  goToPage,
} = useClientPagination(letters)

const approvalSheetOpen = ref(false)
const approvalSheetLetterId = ref<string | null>(null)
const approvalSheetLetterTitle = ref('')
const approvalTrackingRef = ref<InstanceType<typeof MessageLetterApprovalTrackingSheet> | null>(null)

function openApprovalTracking(row: SchoolMessageLetterRow) {
  approvalSheetLetterId.value = row.id
  approvalSheetLetterTitle.value = row.title
  approvalSheetOpen.value = true
}

watch(approvalSheetOpen, (open) => {
  if (!open) {
    approvalSheetLetterId.value = null
    approvalSheetLetterTitle.value = ''
  }
})
const flashError = ref('')
const flashOk = ref('')

const groups = ref<Group[]>([])
const users = ref<User[]>([])
const userSearch = ref('')
const invAllParents = ref(false)
const invAllTeachers = ref(false)
const invAllStudents = ref(false)
const selectedGroupIds = ref<string[]>([])
const selectedUserIds = ref<string[]>([])

const variableHints = ref<MessageLetterVariableHint[]>([])
const sampleVars = reactive<Record<string, string>>({})

const sheetOpen = ref(false)
const editingId = ref<string | null>(null)
const editingSource = ref<'custom' | 'activity'>('custom')
const saving = ref(false)
const dispatching = ref(false)
const dispatchChannel = ref<MessageLetterDispatchChannel>('chat')
const recipientPreviewCount = ref<number | null>(null)
const langTab = ref<'en' | 'ar'>('en')
const letterTitle = ref('')

type LocaleDraft = {
  subject: string
  bodyHtml: string
  bodySms: string
  emailDocParts: { open: string; close: string } | null
  bodyRegionSplit: boolean
  bodyRegionKind: 'div' | 'table' | null
  bodyInnerPrefix: string
  bodyInnerSuffix: string
}

function emptyLocaleDraft(): LocaleDraft {
  return {
    subject: '',
    bodyHtml: '',
    bodySms: '',
    emailDocParts: null,
    bodyRegionSplit: false,
    bodyRegionKind: null,
    bodyInnerPrefix: '',
    bodyInnerSuffix: '',
  }
}

const localeState = reactive<{ en: LocaleDraft; ar: LocaleDraft }>({
  en: emptyLocaleDraft(),
  ar: emptyLocaleDraft(),
})

const subject = ref('')
const bodyHtml = ref('')
const bodySms = ref('')
const emailDocParts = ref<{ open: string; close: string } | null>(null)
const bodyInnerPrefix = ref('')
const bodyInnerSuffix = ref('')
const bodyRegionSplit = ref(false)
const bodyRegionKind = ref<'div' | 'table' | null>(null)
const editorEpoch = ref(0)

const subjectInputRef = ref<HTMLInputElement | null>(null)
const smsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const emailEditorRef = ref<InstanceType<typeof NotificationTemplateEmailEditor> | null>(null)
const emailInsertTarget = ref<'subject' | 'body'>('body')

const preview = ref({ subject: '', body_html: '', body_sms: '' })
const previewLoading = ref(false)
const showPreviewDialog = ref(false)
const previewDialogTab = ref<'preview' | 'samples'>('preview')

const editorContentDir = computed<'ltr' | 'rtl'>(() => (langTab.value === 'ar' ? 'rtl' : 'ltr'))

const DEFAULT_SUBJECT_EN = 'Message from {{schoolName}}'
const DEFAULT_SUBJECT_AR = 'رسالة من {{schoolName}}'
const DEFAULT_HTML_EN = buildMessageLetterDefaultHtml('en')
const DEFAULT_HTML_AR = buildMessageLetterDefaultHtml('ar')
const DEFAULT_SMS_EN = '{{schoolName}}: Hello {{parentName}}, regarding {{studentName}} ({{teacherName}}).'
const DEFAULT_SMS_AR = '{{schoolName}}: تحية لـ {{parentName}} بخصوص {{studentName}} ({{teacherName}}).'

const sheetTitle = computed(() => (editingId.value ? t('messageLetters.editLetter') : t('messageLetters.newLetter')))

const roleOptions = computed(() => [
  { key: 'parents', label: t('meetingRooms.optAllParents'), model: invAllParents },
  { key: 'teachers', label: t('meetingRooms.optAllTeachers'), model: invAllTeachers },
  { key: 'students', label: t('meetingRooms.optAllStudents'), model: invAllStudents },
])

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  const list = users.value
  if (!q) return list
  return list.filter((u) => {
    const name = `${u.firstName ?? ''} ${u.lastName ?? ''} ${u.email ?? ''}`.toLowerCase()
    return name.includes(q)
  })
})

function roleLabel(role: string) {
  const k = `roles.${role}`
  return te(k) ? t(k) : role
}

function audiencePayload() {
  return {
    allParents: invAllParents.value || undefined,
    allTeachers: invAllTeachers.value || undefined,
    allStudents: invAllStudents.value || undefined,
    groupIds: selectedGroupIds.value.length ? [...selectedGroupIds.value] : undefined,
    userIds: selectedUserIds.value.length ? [...selectedUserIds.value] : undefined,
  }
}

function flushActiveLocaleToStore() {
  const s = localeState[langTab.value]
  s.subject = subject.value
  s.bodyHtml = bodyHtml.value
  s.bodySms = bodySms.value
  s.emailDocParts = emailDocParts.value
  s.bodyRegionSplit = bodyRegionSplit.value
  s.bodyRegionKind = bodyRegionKind.value
  s.bodyInnerPrefix = bodyInnerPrefix.value
  s.bodyInnerSuffix = bodyInnerSuffix.value
}

function loadActiveLocaleForm() {
  const s = localeState[langTab.value]
  subject.value = s.subject
  bodyHtml.value = s.bodyHtml
  bodySms.value = s.bodySms
  emailDocParts.value = s.emailDocParts
  bodyRegionSplit.value = s.bodyRegionSplit ?? false
  bodyRegionKind.value = s.bodyRegionKind ?? null
  bodyInnerPrefix.value = s.bodyInnerPrefix ?? ''
  bodyInnerSuffix.value = s.bodyInnerSuffix ?? ''
}

function setLangTab(loc: 'en' | 'ar') {
  if (loc === langTab.value) return
  if (emailEditorRef.value) {
    const inst = emailEditorRef.value as { getModelHtml?: () => string }
    const live = inst.getModelHtml?.()
    if (typeof live === 'string') bodyHtml.value = live
  }
  flushActiveLocaleToStore()
  langTab.value = loc
  loadActiveLocaleForm()
  editorEpoch.value += 1
  if (showPreviewDialog.value) runPreview()
}

function composeLocaleBodyInner(s: LocaleDraft): string {
  if (s.bodyRegionSplit) {
    return `${s.bodyInnerPrefix ?? ''}${s.bodyHtml}${s.bodyInnerSuffix ?? ''}`
  }
  return s.bodyHtml
}

function composedForLocale(loc: 'en' | 'ar'): string {
  const s = localeState[loc]
  const parts = s.emailDocParts
  const inner = composeLocaleBodyInner(s)
  if (parts) return `${parts.open}${inner}${parts.close}`
  return inner
}

function composedEmailHtml(): string {
  const parts = emailDocParts.value
  const inner = bodyRegionSplit.value
    ? bodyInnerPrefix.value + bodyHtml.value + bodyInnerSuffix.value
    : bodyHtml.value
  if (parts) return `${parts.open}${inner}${parts.close}`
  return inner
}

function hydrateLocaleBlock(loc: 'en' | 'ar', block: { subject: string; body_html: string; body_sms: string | null | undefined }) {
  const s = localeState[loc]
  s.subject = block.subject
  const split = splitHtmlDocument(block.body_html)
  if (split) {
    s.emailDocParts = { open: split.open, close: split.close }
    const innerWithCard = ensureEmailCardBodyRegion(split.inner, loc)
    const reg = splitNotificationBodyEditableRegion(innerWithCard)
    if (reg) {
      s.bodyInnerPrefix = reg.prefix
      s.bodyInnerSuffix = reg.suffix
      s.bodyHtml = reg.middle
      s.bodyRegionSplit = true
      s.bodyRegionKind = reg.kind
    } else {
      s.bodyInnerPrefix = ''
      s.bodyInnerSuffix = ''
      s.bodyHtml = split.inner
      s.bodyRegionSplit = false
      s.bodyRegionKind = null
    }
  } else {
    s.emailDocParts = null
    s.bodyHtml = block.body_html
    s.bodyInnerPrefix = ''
    s.bodyInnerSuffix = ''
    s.bodyRegionSplit = false
    s.bodyRegionKind = null
  }
  s.bodySms = block.body_sms ?? ''
}

function onSubjectFocus() {
  emailInsertTarget.value = 'subject'
}

const LOCKED_BRANDING_VARS = new Set(['schoolName', 'schoolLogo', 'schoolLogoHtml'])

function isLockedBrandingVar(name: string): boolean {
  return LOCKED_BRANDING_VARS.has(name)
}

const placeholderHintsInsertable = computed(() =>
  (variableHints.value ?? []).filter((h) => !LOCKED_BRANDING_VARS.has(h.name)),
)

const insertableFieldItems = computed(() =>
  placeholderHintsInsertable.value.map((h) => ({
    name: h.name,
    label: hintDisplayLabel(h),
  })),
)

function hintDisplayLabel(h: MessageLetterVariableHint) {
  const key = `notificationTemplates.var.${h.name}`
  if (locale.value === 'ar' && te(key)) return t(key)
  return h.description || h.name
}

const variableHintsForSamples = computed((): MessageLetterVariableHint[] => {
  const hints = variableHints.value
  const list = hints?.length
    ? hints
    : Object.keys(sampleVars).map((name) => ({ name, description: name }))
  return list.filter((h) => h.name !== 'schoolLogoHtml')
})

function mergeSampleKeysFromHints(hints: MessageLetterVariableHint[], base: Record<string, string>) {
  if (hints.length) {
    for (const key of Object.keys(sampleVars)) {
      if (!hints.some((h) => h.name === key)) {
        delete sampleVars[key]
      }
    }
    for (const h of hints) {
      if (sampleVars[h.name] === undefined || sampleVars[h.name] === '') {
        sampleVars[h.name] = base[h.name] ?? ''
      }
    }
  } else {
    for (const k of Object.keys(base)) {
      if (sampleVars[k] === undefined) sampleVars[k] = base[k] ?? ''
    }
  }
}

function placeholderToken(name: string) {
  return `{{${name}}}`
}

function insertPlaceholderEmail(name: string) {
  const token = placeholderToken(name)
  if (emailInsertTarget.value === 'subject') {
    const { next, caret } = insertIntoStringAtCursor(
      subject.value,
      subjectInputRef.value?.selectionStart ?? null,
      subjectInputRef.value?.selectionEnd ?? null,
      token,
    )
    subject.value = next
    nextTick(() => {
      const el = subjectInputRef.value
      if (el) el.setSelectionRange(caret, caret)
    })
    return
  }
  emailEditorRef.value?.insertPlaceholder(token)
}

function insertPlaceholderFromEmailEditor(name: string) {
  emailInsertTarget.value = 'body'
  insertPlaceholderEmail(name)
}

function insertPlaceholderSms(name: string) {
  const token = placeholderToken(name)
  const sms = insertIntoStringAtCursor(
    bodySms.value,
    smsTextareaRef.value?.selectionStart ?? null,
    smsTextareaRef.value?.selectionEnd ?? null,
    token,
  )
  bodySms.value = sms.next
  nextTick(() => {
    const el = smsTextareaRef.value
    if (el) el.setSelectionRange(sms.caret, sms.caret)
  })
}

const mergedSampleVariablesForPreview = computed(() => ({ ...sampleVars }))

const editorEmailCardChrome = computed(() => {
  if (!bodyRegionSplit.value) return ''
  const { chromeHtml } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  // Substituted values are escaped, and the whole fragment is sanitized before v-html.
  return DOMPurify.sanitize(
    applyNotificationTemplateVariablesHtml(chromeHtml, mergedSampleVariablesForPreview.value),
  )
})

const editorEmailBodyStyle = computed(() => {
  if (!bodyRegionSplit.value) return undefined
  const { bodyOpenTag } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  const style = inlineStyleFromTag(bodyOpenTag)
  return style ? style : undefined
})

const previewHtmlSrcdoc = computed(() => preview.value.body_html || '')
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

function syncPreviewIframeHeight() {
  const iframe = previewIframeRef.value
  if (!iframe) return
  requestAnimationFrame(() => {
    try {
      const doc = iframe.contentDocument
      if (!doc) return
      const height = Math.max(
        doc.documentElement?.scrollHeight ?? 0,
        doc.body?.scrollHeight ?? 0,
        280,
      )
      iframe.style.height = `${height}px`
    } catch {
      iframe.style.height = '480px'
    }
  })
}

watch(previewHtmlSrcdoc, () => {
  void nextTick(() => syncPreviewIframeHeight())
})

function resetFormDefaults() {
  editingSource.value = 'custom'
  dispatchChannel.value = 'email'
  letterTitle.value = t('messageLetters.defaultTitle')
  hydrateLocaleBlock('en', { subject: DEFAULT_SUBJECT_EN, body_html: DEFAULT_HTML_EN, body_sms: DEFAULT_SMS_EN })
  hydrateLocaleBlock('ar', { subject: DEFAULT_SUBJECT_AR, body_html: DEFAULT_HTML_AR, body_sms: DEFAULT_SMS_AR })
  invAllParents.value = false
  invAllTeachers.value = false
  invAllStudents.value = false
  selectedGroupIds.value = []
  selectedUserIds.value = []
  userSearch.value = ''
  recipientPreviewCount.value = null
  langTab.value = locale.value === 'ar' ? 'ar' : 'en'
  loadActiveLocaleForm()
  editorEpoch.value += 1
}

function openNew() {
  editingId.value = null
  resetFormDefaults()
  sheetOpen.value = true
}

async function openEdit(id: string) {
  flashError.value = ''
  editingId.value = id
  sheetOpen.value = true
  try {
    const row = await messageLetterService.getOne(schoolId.value, id)
    editingSource.value = row.activity_id ? 'activity' : 'custom'
    dispatchChannel.value = row.activity_id ? 'chat_approval' : 'email'
    letterTitle.value = row.title
    hydrateLocaleBlock('en', row.en)
    hydrateLocaleBlock('ar', row.ar)
    const a = row.audience
    invAllParents.value = !!a.allParents
    invAllTeachers.value = !!a.allTeachers
    invAllStudents.value = !!a.allStudents
    selectedGroupIds.value = a.groupIds ? [...a.groupIds] : []
    selectedUserIds.value = a.userIds ? [...a.userIds] : []
    recipientPreviewCount.value = row.recipient_count
    langTab.value = locale.value === 'ar' ? 'ar' : 'en'
    loadActiveLocaleForm()
    editorEpoch.value += 1
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.loadError')
    sheetOpen.value = false
  }
}

function closeSheet() {
  closePreviewDialog()
  sheetOpen.value = false
  editingId.value = null
  editingSource.value = 'custom'
}

async function openPreviewDialog() {
  previewDialogTab.value = 'preview'
  showPreviewDialog.value = true
  await runPreview()
}

function closePreviewDialog() {
  showPreviewDialog.value = false
  previewDialogTab.value = 'preview'
}

function setPreviewDialogTab(tab: 'preview' | 'samples') {
  previewDialogTab.value = tab
  if (tab === 'preview') void nextTick(() => syncPreviewIframeHeight())
}

function toggleGroup(id: string, on: boolean) {
  const set = new Set(selectedGroupIds.value)
  if (on) set.add(id)
  else set.delete(id)
  selectedGroupIds.value = [...set]
}

function clearGroups() {
  selectedGroupIds.value = []
}

function toggleUser(id: string, on: boolean) {
  const set = new Set(selectedUserIds.value)
  if (on) set.add(id)
  else set.delete(id)
  selectedUserIds.value = [...set]
}

function clearUsers() {
  selectedUserIds.value = []
}

async function refreshRecipientCount() {
  try {
    const { count } = await messageLetterService.audiencePreview(schoolId.value, audiencePayload())
    recipientPreviewCount.value = count
  } catch {
    recipientPreviewCount.value = null
  }
}

function letterTypeLabel(row: SchoolMessageLetterRow): string {
  return row.requires_approval
    ? t('messageLetters.letterTypeApproval')
    : t('messageLetters.letterTypeStandard')
}

function letterTypeBadgeClass(row: SchoolMessageLetterRow): string {
  return row.requires_approval ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(locale.value === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

async function loadLetters() {
  letters.value = await messageLetterService.list(schoolId.value)
}

const runPreview = useDebounceFn(async () => {
  if (!showPreviewDialog.value) return
  if (!subject.value.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  const fullHtml = composedEmailHtml()
  if (!fullHtml.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  previewLoading.value = true
  try {
    const vars: Record<string, string> = { ...sampleVars }
    preview.value = await notificationTemplateService.preview({
      locale: langTab.value,
      subject: subject.value,
      body_html: fullHtml,
      body_sms: bodySms.value,
      sample_variables: vars,
      school_id: schoolId.value,
    })
  } catch {
    preview.value = { subject: '', body_html: '', body_sms: '' }
  } finally {
    previewLoading.value = false
    void nextTick(() => syncPreviewIframeHeight())
  }
}, 400)

watch([subject, bodyHtml, bodySms, langTab, showPreviewDialog], () => {
  if (showPreviewDialog.value) runPreview()
})

watch(
  () => sampleVars,
  () => {
    if (showPreviewDialog.value) runPreview()
  },
  { deep: true },
)

async function boot() {
  pageLoading.value = true
  flashError.value = ''
  try {
    const [g, u, hints, samples] = await Promise.all([
      groupService.getAll(schoolId.value),
      userService.getAllUsers(),
      messageLetterService.variableHints(),
      messageLetterService.sampleVariables(schoolId.value),
    ])
    groups.value = g
    users.value = u
    variableHints.value = hints
    Object.keys(sampleVars).forEach((k) => delete sampleVars[k])
    Object.assign(sampleVars, samples)
    mergeSampleKeysFromHints(hints, samples)
    await loadLetters()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.loadListError')
  } finally {
    pageLoading.value = false
  }
}

async function dispatchLetter() {
  if (!editingId.value) {
    flashError.value = t('messageLetters.dispatchNeedSave')
    return
  }
  if (
    !window.confirm(
      t('messageLetters.dispatchConfirm', {
        count: String(recipientPreviewCount.value ?? '?'),
        mode: t(`messageLetters.dispatchMode_${dispatchChannel.value}`),
      }),
    )
  ) {
    return
  }
  dispatching.value = true
  flashError.value = ''
  flashOk.value = ''
  try {
    const res = await messageLetterService.dispatch(schoolId.value, editingId.value, dispatchChannel.value)
    const parts: string[] = []
    if (res.channel === 'email' || res.channel === 'sms') {
      if (res.email_note) parts.push(res.email_note)
      parts.push(t('messageLetters.dispatchRecipientsCount', { count: res.recipient_count }))
      const sent = res.chat_messages_sent ?? res.email_details?.emails_sent ?? 0
      if (sent === 0) {
        flashError.value = parts.join(' ')
        return
      }
    } else {
      parts.push(
        t('messageLetters.dispatchChatSummary', {
          sent: String(res.chat_messages_sent ?? 0),
          total: String(res.recipient_count),
        }),
      )
      if (res.chat_errors && res.chat_errors > 0) {
        parts.push(t('messageLetters.dispatchChatPartialErrors', { n: String(res.chat_errors) }))
      }
    }
    flashOk.value = parts.join(' ')
    if (dispatchChannel.value === 'chat_approval') {
      await loadLetters()
      if (editingId.value) {
        const current = letters.value.find((l) => l.id === editingId.value)
        if (current?.requires_approval) {
          openApprovalTracking(current)
        }
      }
      void approvalTrackingRef.value?.reload()
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.dispatchError')
  } finally {
    dispatching.value = false
  }
}

async function saveLetter() {
  saving.value = true
  flashError.value = ''
  flashOk.value = ''
  try {
    if (emailEditorRef.value) {
      const inst = emailEditorRef.value as { getModelHtml?: () => string }
      const live = inst.getModelHtml?.()
      if (typeof live === 'string') bodyHtml.value = live
    }
    flushActiveLocaleToStore()
    const body = {
      title: letterTitle.value.trim(),
      audience: audiencePayload(),
      en: {
        subject: localeState.en.subject,
        body_html: composedForLocale('en'),
        body_sms: localeState.en.bodySms || undefined,
      },
      ar: {
        subject: localeState.ar.subject,
        body_html: composedForLocale('ar'),
        body_sms: localeState.ar.bodySms || undefined,
      },
    }
    if (!body.title) {
      flashError.value = t('messageLetters.titleRequired')
      return
    }
    if (editingId.value) {
      await messageLetterService.update(schoolId.value, editingId.value, body)
      flashOk.value = t('messageLetters.saved')
      await loadLetters()
      closeSheet()
    } else {
      const created = await messageLetterService.create({ school_id: schoolId.value, ...body })
      editingId.value = created.id
      flashOk.value = t('messageLetters.createdStayOpen')
      await loadLetters()
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.saveError')
  } finally {
    saving.value = false
  }
}

async function removeLetter(row: SchoolMessageLetterRow) {
  if (!confirm(t('messageLetters.confirmDelete'))) return
  try {
    await messageLetterService.remove(schoolId.value, row.id)
    flashOk.value = t('messageLetters.deleted')
    await loadLetters()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.deleteError')
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  boot()
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
