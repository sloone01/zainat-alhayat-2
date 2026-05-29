<template>
  <DashboardLayout>
    <div class="space-y-6" :dir="isRTL ? 'rtl' : 'ltr'">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="min-w-0">
            <h1 class="text-xl font-bold text-gray-900">{{ $t('messageLetters.title') }}</h1>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 shrink-0"
            @click="openNew"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('messageLetters.newLetter') }}
          </button>
        </div>
      </div>

      <div v-if="flashError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{{ flashError }}</div>
      <div v-if="flashOk" class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">{{ flashOk }}</div>

      <div v-if="pageLoading" class="text-center py-12">
        <div class="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        <p class="mt-3 text-gray-600 text-sm">{{ $t('common.loading') }}…</p>
      </div>

      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-start px-4 py-3 font-semibold text-gray-700">{{ $t('messageLetters.colTitle') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colType') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colSource') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colRecipients') }}</th>
                <th class="text-start px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ $t('messageLetters.colUpdated') }}</th>
                <th class="px-4 py-3 min-w-[12rem] text-center font-semibold text-gray-700">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!letters.length">
                <td colspan="6" class="px-4 py-10 text-center text-gray-500">{{ $t('messageLetters.empty') }}</td>
              </tr>
              <tr v-for="row in letters" :key="row.id" class="border-t border-gray-200 hover:bg-gray-50">
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
                <td class="px-4 py-3 text-gray-700">{{ row.recipient_count }}</td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(row.updated_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <button
                      v-if="row.requires_approval"
                      type="button"
                      class="rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-800 hover:bg-primary-100"
                      @click="openApprovalTracking(row)"
                    >
                      {{ $t('messageLetters.approvalTrackingButton') }}
                    </button>
                    <button
                      type="button"
                      class="rounded-md border border-primary-200 bg-white px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
                      @click="openEdit(row.id)"
                    >
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      v-if="row.source !== 'activity'"
                      type="button"
                      class="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      @click="removeLetter(row)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden p-4 space-y-3">
          <p
            v-if="!letters.length"
            class="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 px-4 py-10 text-center text-sm text-gray-500"
          >
            {{ $t('messageLetters.empty') }}
          </p>
          <article
            v-for="row in letters"
            :key="'letter-card-' + row.id"
            class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]"
          >
            <div class="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
              <h3 class="text-base font-semibold leading-snug text-gray-900">{{ row.title }}</h3>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  :class="letterTypeBadgeClass(row)"
                >
                  {{ letterTypeLabel(row) }}
                </span>
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  :class="row.source === 'activity' ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-600'"
                >
                  {{ row.source === 'activity' ? $t('messageLetters.sourceActivity') : $t('messageLetters.sourceCustom') }}
                </span>
              </div>
            </div>
            <dl class="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('messageLetters.colRecipients') }}</dt>
                <dd class="mt-0.5 text-base font-semibold tabular-nums text-gray-900">{{ row.recipient_count }}</dd>
              </div>
              <div class="rounded-lg bg-gray-50 px-3 py-2">
                <dt class="text-xs font-medium text-gray-500">{{ $t('messageLetters.colUpdated') }}</dt>
                <dd class="mt-0.5 text-sm font-medium text-gray-800">{{ formatDate(row.updated_at) }}</dd>
              </div>
            </dl>
            <div class="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-white px-4 py-3">
              <button
                v-if="row.requires_approval"
                type="button"
                class="rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-800 hover:bg-primary-100"
                @click="openApprovalTracking(row)"
              >
                {{ $t('messageLetters.approvalTrackingButton') }}
              </button>
              <button
                type="button"
                class="rounded-md border border-primary-200 bg-white px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50"
                @click="openEdit(row.id)"
              >
                {{ $t('common.edit') }}
              </button>
              <button
                v-if="row.source !== 'activity'"
                type="button"
                class="rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                @click="removeLetter(row)"
              >
                {{ $t('common.delete') }}
              </button>
            </div>
          </article>
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
            <div class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <h2 class="text-lg font-semibold text-gray-900">{{ sheetTitle }}</h2>
              <button type="button" class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800" :aria-label="$t('common.close')" @click="closeSheet">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="space-y-6 p-4 sm:p-6 pb-28">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-500">{{ $t('messageLetters.letterTitle') }}</label>
                <input
                  v-model="letterTitle"
                  type="text"
                  maxlength="200"
                  class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
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

              <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                <!-- Compose -->
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
                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500" for="ml-subject">{{ $t('notificationTemplates.subject') }}</label>
                      <input
                        id="ml-subject"
                        ref="subjectInputRef"
                        v-model="subject"
                        type="text"
                        class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                        @focus="onSubjectFocus"
                      />
                    </div>

                    <div v-if="placeholderHintsInsertable.length" class="rounded-xl border border-violet-100 bg-violet-50/70 p-3 space-y-2">
                      <p class="text-xs font-semibold text-gray-800">{{ $t('notificationTemplates.fieldsForEmail') }}</p>
                      <p class="text-xs text-gray-600">{{ $t('notificationTemplates.insertHintEmail') }}</p>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="h in placeholderHintsInsertable"
                          :key="'e-' + h.name"
                          type="button"
                          class="rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-violet-50"
                          @click="insertPlaceholderEmail(h.name)"
                        >
                          {{ hintDisplayLabel(h) }}
                        </button>
                      </div>
                    </div>

                    <div class="space-y-2" @focusin="emailInsertTarget = 'body'">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <label class="text-xs font-medium text-gray-500">{{ $t('notificationTemplates.emailBodyLabel') }}</label>
                        <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                          <button
                            type="button"
                            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors"
                            :class="editMode === 'visual' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                            @click="setEditMode('visual')"
                          >
                            {{ $t('notificationTemplates.modeVisual') }}
                          </button>
                          <button
                            type="button"
                            class="px-2.5 py-1 text-xs font-semibold rounded-md transition-colors"
                            :class="editMode === 'html' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600'"
                            @click="setEditMode('html')"
                          >
                            {{ $t('notificationTemplates.modeHtml') }}
                          </button>
                        </div>
                      </div>
                      <NotificationEmailContentFrame v-if="editMode === 'visual'">
                        <div
                          class="border-b border-gray-200 bg-gray-50 px-5 py-4"
                          :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                        >
                          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('notificationTemplates.previewSubjectLabel') }}
                          </p>
                          <p class="mt-1.5 text-base font-semibold leading-snug text-gray-900 break-words">
                            {{ editorCardSubjectLine }}
                          </p>
                        </div>
                        <div class="bg-white" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
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
                              />
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
                          />
                        </div>
                      </NotificationEmailContentFrame>

                      <NotificationEmailContentFrame v-else>
                        <div
                          class="border-b border-gray-200 bg-gray-50 px-5 py-3"
                          :dir="langTab === 'ar' ? 'rtl' : 'ltr'"
                        >
                          <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('notificationTemplates.modeHtml') }}
                          </p>
                          <p class="mt-1 text-xs leading-relaxed text-amber-900/90">
                            {{ $t('notificationTemplates.htmlModeWarning') }}
                          </p>
                        </div>
                        <div class="bg-white" :dir="langTab === 'ar' ? 'rtl' : 'ltr'">
                          <textarea
                            id="ml-body-html"
                            ref="htmlBodyRef"
                            v-model="htmlEditorBuffer"
                            rows="18"
                            spellcheck="false"
                            class="block min-h-[28rem] w-full resize-y border-0 bg-transparent px-4 py-3 text-xs font-mono leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500/30"
                          />
                        </div>
                      </NotificationEmailContentFrame>
                    </div>

                    <div v-if="placeholderHintsInsertable.length" class="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 space-y-2">
                      <p class="text-xs font-semibold text-gray-800">{{ $t('notificationTemplates.fieldsForSms') }}</p>
                      <p class="text-xs text-gray-600">{{ $t('notificationTemplates.insertHintSms') }}</p>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="h in placeholderHintsInsertable"
                          :key="'s-' + h.name"
                          type="button"
                          class="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-emerald-50"
                          @click="insertPlaceholderSms(h.name)"
                        >
                          {{ hintDisplayLabel(h) }}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label class="mb-1 block text-xs font-medium text-gray-500" for="ml-sms">{{ $t('notificationTemplates.bodySms') }}</label>
                      <div
                        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500"
                      >
                        <textarea
                          id="ml-sms"
                          ref="smsTextareaRef"
                          v-model="bodySms"
                          rows="4"
                          class="block w-full resize-y border-0 bg-transparent px-3 py-2 text-sm leading-relaxed text-gray-900 focus:ring-0"
                        />
                      </div>
                    </div>

                    <details class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/40">
                      <summary
                        class="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 rounded-lg [&::-webkit-details-marker]:hidden flex justify-between gap-2"
                      >
                        <span>{{ $t('notificationTemplates.sampleValues') }}</span>
                        <span class="text-gray-400 font-normal">{{ $t('notificationTemplates.sampleValuesToggle') }}</span>
                      </summary>
                      <div class="px-3 pb-3 border-t border-gray-100 space-y-3">
                        <p class="text-xs text-gray-500 pt-2">{{ $t('notificationTemplates.sampleValuesHint') }}</p>
                        <div class="grid sm:grid-cols-2 gap-3">
                          <div v-for="h in variableHintsForSamples" :key="'sv-' + h.name">
                            <label class="block text-xs font-medium text-gray-700 mb-1">{{ hintDisplayLabel(h) }}</label>
                            <input
                              v-model="sampleVars[h.name]"
                              type="text"
                              class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <!-- Preview -->
                <div class="min-w-0 space-y-3 xl:sticky xl:top-4">
                  <h3 class="text-sm font-semibold text-gray-900">{{ $t('messageLetters.previewTitle') }}</h3>
                  <div class="relative min-h-[260px]">
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
                    class="mb-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

            <div class="sticky bottom-0 flex items-center justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
              <button type="button" class="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100" @click="closeSheet">
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                :disabled="saving"
                class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                @click="saveLetter"
              >
                {{ saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import NotificationEmailContentFrame from '@/components/NotificationEmailContentFrame.vue'
import NotificationTemplateEmailEditor from '@/components/NotificationTemplateEmailEditor.vue'
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
import { applyNotificationTemplateVariables } from '@/utils/notification-template-variables'

const { locale, t, te } = useI18n()
const isRTL = computed(() => locale.value === 'ar')

const schoolId = computed(() => Number((authService.getStoredUser() as { school_id?: number } | null)?.school_id ?? 1))

const pageLoading = ref(true)
const letters = ref<SchoolMessageLetterRow[]>([])
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
const editMode = ref<'visual' | 'html'>('visual')
const editorEpoch = ref(0)
const htmlEditorBuffer = ref('')

const subjectInputRef = ref<HTMLInputElement | null>(null)
const smsTextareaRef = ref<HTMLTextAreaElement | null>(null)
const htmlBodyRef = ref<HTMLTextAreaElement | null>(null)
const emailEditorRef = ref<InstanceType<typeof NotificationTemplateEmailEditor> | null>(null)
const emailInsertTarget = ref<'subject' | 'body'>('body')

const preview = ref({ subject: '', body_html: '', body_sms: '' })
const previewLoading = ref(false)

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

function syncHtmlBufferToModelIfNeeded() {
  if (editMode.value === 'html') {
    applyFullHtmlFromBuffer(htmlEditorBuffer.value)
  }
}

function flushActiveLocaleToStore() {
  syncHtmlBufferToModelIfNeeded()
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
  if (editMode.value === 'visual' && emailEditorRef.value) {
    const inst = emailEditorRef.value as { getModelHtml?: () => string }
    const live = inst.getModelHtml?.()
    if (typeof live === 'string') bodyHtml.value = live
  }
  flushActiveLocaleToStore()
  langTab.value = loc
  loadActiveLocaleForm()
  editMode.value = 'visual'
  editorEpoch.value += 1
  runPreview()
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

function activeComposedEmailHtml(): string {
  if (editMode.value === 'html') {
    return htmlEditorBuffer.value.trim()
  }
  return composedEmailHtml()
}

function applyFullHtmlFromBuffer(fullRaw: string) {
  const full = (fullRaw ?? '').trim()
  if (!full) {
    emailDocParts.value = null
    bodyHtml.value = ''
    bodyInnerPrefix.value = ''
    bodyInnerSuffix.value = ''
    bodyRegionSplit.value = false
    bodyRegionKind.value = null
    return
  }
  const split = splitHtmlDocument(full)
  if (split) {
    emailDocParts.value = { open: split.open, close: split.close }
    const innerWithCard = ensureEmailCardBodyRegion(split.inner, langTab.value)
    const reg = splitNotificationBodyEditableRegion(innerWithCard)
    if (reg) {
      bodyInnerPrefix.value = reg.prefix
      bodyInnerSuffix.value = reg.suffix
      bodyHtml.value = reg.middle
      bodyRegionSplit.value = true
      bodyRegionKind.value = reg.kind
    } else {
      bodyInnerPrefix.value = ''
      bodyInnerSuffix.value = ''
      bodyHtml.value = innerWithCard
      bodyRegionSplit.value = false
      bodyRegionKind.value = null
    }
  } else {
    emailDocParts.value = null
    bodyHtml.value = full
    bodyInnerPrefix.value = ''
    bodyInnerSuffix.value = ''
    bodyRegionSplit.value = false
    bodyRegionKind.value = null
  }
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

const placeholderHintsInsertable = computed(() => variableHints.value ?? [])

function hintDisplayLabel(h: MessageLetterVariableHint) {
  const key = `notificationTemplates.var.${h.name}`
  if (locale.value === 'ar' && te(key)) return t(key)
  return h.description || h.name
}

const variableHintsForSamples = computed((): MessageLetterVariableHint[] => {
  const hints = variableHints.value
  if (hints?.length) return hints
  return Object.keys(sampleVars).map((name) => ({ name, description: name }))
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

function setEditMode(mode: 'visual' | 'html') {
  if (mode === editMode.value) return
  if (mode === 'html') {
    if (editMode.value === 'visual' && emailEditorRef.value) {
      const inst = emailEditorRef.value as { getModelHtml?: () => string }
      const live = inst.getModelHtml?.()
      if (typeof live === 'string') bodyHtml.value = live
    }
    htmlEditorBuffer.value = composedEmailHtml()
    editMode.value = 'html'
    editorEpoch.value += 1
    return
  }
  applyFullHtmlFromBuffer(htmlEditorBuffer.value)
  editMode.value = 'visual'
  editorEpoch.value += 1
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
  if (editMode.value === 'visual') {
    emailEditorRef.value?.insertPlaceholder(token)
    return
  }
  const html = insertIntoStringAtCursor(
    htmlEditorBuffer.value,
    htmlBodyRef.value?.selectionStart ?? null,
    htmlBodyRef.value?.selectionEnd ?? null,
    token,
  )
  htmlEditorBuffer.value = html.next
  nextTick(() => {
    const el = htmlBodyRef.value
    if (el) el.setSelectionRange(html.caret, html.caret)
  })
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

const editorCardSubjectLine = computed(() => {
  const rendered = preview.value.subject?.trim()
  if (rendered) return rendered
  const raw = subject.value.trim()
  if (!raw) return '—'
  return applyNotificationTemplateVariables(raw, mergedSampleVariablesForPreview.value)
})

const editorEmailCardChrome = computed(() => {
  if (!bodyRegionSplit.value) return ''
  const { chromeHtml } = splitPrefixBeforeEmailBody(bodyInnerPrefix.value)
  return applyNotificationTemplateVariables(chromeHtml, mergedSampleVariablesForPreview.value)
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
  editMode.value = 'visual'
  editorEpoch.value += 1
}

function openNew() {
  editingId.value = null
  resetFormDefaults()
  sheetOpen.value = true
  void runPreview()
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
    editMode.value = 'visual'
    editorEpoch.value += 1
    void runPreview()
  } catch (e: unknown) {
    const err = e as { message?: string }
    flashError.value = err?.message || t('messageLetters.loadError')
    sheetOpen.value = false
  }
}

function closeSheet() {
  sheetOpen.value = false
  editingId.value = null
  editingSource.value = 'custom'
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
  if (!sheetOpen.value) return
  if (!subject.value.trim()) {
    preview.value = { subject: '', body_html: '', body_sms: '' }
    return
  }
  syncHtmlBufferToModelIfNeeded()
  const fullHtml = activeComposedEmailHtml()
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

watch([subject, bodyHtml, bodySms, langTab, sheetOpen, htmlEditorBuffer, editMode], () => {
  runPreview()
})

watch(
  () => sampleVars,
  () => {
    runPreview()
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
    if (res.channel === 'email') {
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
    if (editMode.value === 'visual' && emailEditorRef.value) {
      const inst = emailEditorRef.value as { getModelHtml?: () => string }
      const live = inst.getModelHtml?.()
      if (typeof live === 'string') bodyHtml.value = live
    }
    syncHtmlBufferToModelIfNeeded()
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
  boot()
})
</script>
