<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="w-full">
                <!-- Modal Header -->
                <div class="mb-6 border-b border-gray-200 pb-4">
                  <h3 class="text-xl leading-6 font-bold text-gray-900 mb-3"
                      :class="isRTL ? 'text-right' : 'text-left'">
                    {{ $t('weeklySessionPlans.manageTasks') }}
                  </h3>
                  <div v-if="schedule" class="bg-blue-50 rounded-lg p-4 text-sm text-gray-700"
                       :class="isRTL ? 'text-right' : 'text-left'">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">📚</span>
                        <span><strong class="text-blue-800">{{ $t('common.course') }}:</strong> {{ getCourseName(schedule.course_id) }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">👥</span>
                        <span><strong class="text-blue-800">{{ $t('common.group') }}:</strong> {{ getGroupName(schedule.group_id) }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">⏰</span>
                        <span><strong class="text-blue-800">{{ $t('common.time') }}:</strong> {{ schedule.day_of_week }} {{ schedule.start_time }} - {{ schedule.end_time }}</span>
                      </div>
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <span class="text-blue-600">📅</span>
                        <span><strong class="text-blue-800">{{ $t('weeklySessionPlans.weekOf') }}:</strong> {{ formatWeekRange(weekStartDate) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Existing Tasks -->
                <div v-if="existingTasks.length > 0" class="mb-6">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4" :class="isRTL ? 'text-right' : 'text-left'">
                    {{ $t('weeklySessionPlans.existingTasks') }}
                  </h4>
                  <div class="space-y-4">
                    <div
                      v-for="task in existingTasks"
                      :key="task.id"
                      :class="[
                        'border rounded-lg p-4 transition-all duration-200',
                        task.is_completed
                          ? 'bg-green-50 border-green-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                      ]"
                    >
                      <!-- Task Header -->
                      <div class="flex justify-between items-start mb-3" :class="isRTL ? 'flex-row-reverse' : ''">
                        <div class="flex-1">
                          <div class="flex items-center gap-3 mb-2" :class="isRTL ? 'flex-row-reverse' : ''">
                            <h5 class="font-medium text-gray-900">{{ task.task_title }}</h5>
                            <span
                              :class="[
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                task.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              ]"
                            >
                              {{ task.is_completed ? '✅ ' + $t('common.completed') : '⏳ ' + $t('common.pending') }}
                            </span>
                          </div>
                          <p v-if="task.task_description" class="text-sm text-gray-600 mb-2">{{ task.task_description }}</p>

                          <!-- Completion Details (if completed) -->
                          <div v-if="task.is_completed && task.completion_description" class="mt-3 p-3 bg-green-100 rounded-md">
                            <h6 class="text-sm font-medium text-green-900 mb-1">{{ $t('teacherWeeklySessions.completionDescription') }}:</h6>
                            <p class="text-sm text-green-800">{{ task.completion_description }}</p>
                            <div class="flex items-center justify-between mt-2">
                              <span class="text-xs text-green-700">
                                {{ $t('common.completedAt') }}: {{ formatDate(task.completed_at) }}
                              </span>
                              <button
                                @click="viewCompletionDetails(task)"
                                class="text-xs text-green-700 hover:text-green-900 underline"
                              >
                                {{ $t('teacherWeeklySessions.viewFullDetails') }}
                              </button>
                            </div>
                          </div>

                          <!-- Task Meta Info -->
                          <div class="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{{ $t('common.created') }}: {{ formatDate(task.created_at) }}</span>
                            <span v-if="task.updated_at !== task.created_at">
                              {{ $t('common.updated') }}: {{ formatDate(task.updated_at) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-3 border-t border-gray-200">
                        <!-- Complete Task Button -->
                        <button
                          v-if="!task.is_completed"
                          @click="openCompletionModal(task)"
                          type="button"
                          class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {{ $t('teacherWeeklySessions.completeTask') }}
                        </button>

                        <!-- View Details Button (for completed tasks) -->
                        <button
                          v-if="task.is_completed"
                          @click="viewCompletionDetails(task)"
                          type="button"
                          class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {{ $t('teacherWeeklySessions.viewDetails') }}
                        </button>

                        <!-- Delete Button -->
                        <button
                          @click="deleteTask(task.id)"
                          type="button"
                          class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <svg class="w-4 h-4 mr-1.5 rtl:ml-1.5 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {{ $t('common.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add New Tasks -->
                <div class="space-y-6">
                  <h4 class="text-lg font-semibold text-gray-900" :class="isRTL ? 'text-right' : 'text-left'">
                    {{ $t('weeklySessionPlans.addNewTasks') }}
                  </h4>
                  
                  <!-- Tasks List -->
                  <div v-for="(task, index) in newTasks" :key="`task-${index}`"
                       class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-4" :class="isRTL ? 'flex-row-reverse' : ''">
                      <div class="flex items-center" :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'">
                        <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {{ index + 1 }}
                        </div>
                        <h5 class="text-lg font-semibold text-gray-900">{{ $t('weeklySessionPlans.task') }} {{ index + 1 }}</h5>
                      </div>
                      <button
                        v-if="newTasks.length > 1"
                        @click="removeTask(index)"
                        type="button"
                        class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                      <!-- Task Title -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                          {{ $t('weeklySessionPlans.taskTitle') }} *
                        </label>
                        <input
                          v-model="task.title"
                          type="text"
                          :placeholder="$t('weeklySessionPlans.taskTitlePlaceholder')"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          :class="isRTL ? 'text-right' : 'text-left'"
                          required
                        />
                      </div>

                      <!-- Task Description -->
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                          {{ $t('weeklySessionPlans.taskDescription') }}
                        </label>
                        <textarea
                          v-model="task.description"
                          :placeholder="$t('weeklySessionPlans.taskDescriptionPlaceholder')"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          :class="isRTL ? 'text-right' : 'text-left'"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Add Task Button -->
                  <div class="flex justify-center">
                    <button
                      @click="addNewTask"
                      type="button"
                      class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      :class="isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>{{ $t('weeklySessionPlans.addAnotherTask') }}</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rtl:space-x-reverse">
            <button
              @click="$emit('close')"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="loading || !hasValidTasks"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 rtl:ml-2 rtl:-mr-1 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Task Completion Modal -->
  <div v-if="showCompletionModal" class="fixed inset-0 z-60 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeCompletionModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'">
        <form @submit.prevent="submitTaskCompletion">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="w-full">
              <!-- Modal Header -->
              <div class="mb-6 border-b border-gray-200 pb-4">
                <h3 class="text-xl leading-6 font-bold text-gray-900 mb-3"
                    :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.completeTask') }}
                </h3>
                <div v-if="selectedTask" class="bg-blue-50 rounded-lg p-4 text-sm text-gray-700"
                     :class="isRTL ? 'text-right' : 'text-left'">
                  <div class="font-medium text-blue-900">{{ selectedTask.task_title }}</div>
                  <div v-if="selectedTask.task_description" class="text-blue-700 mt-1">{{ selectedTask.task_description }}</div>
                </div>
              </div>

              <!-- Completion Description -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.completionDescription') }} *
                </label>
                <textarea
                  v-model="completionDescription"
                  :placeholder="$t('teacherWeeklySessions.completionDescriptionPlaceholder')"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :class="[isRTL ? 'text-right' : 'text-left', { 'border-red-500': completionErrors.description }]"
                  required
                ></textarea>
                <p v-if="completionErrors.description" class="mt-1 text-sm text-red-600">
                  {{ completionErrors.description }}
                </p>
              </div>

              <!-- Media Upload -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2" :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.uploadMedia') }}
                </label>

                <!-- Upload Buttons -->
                <div class="flex space-x-4 rtl:space-x-reverse mb-4">
                  <label class="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <svg class="w-4 h-4 inline mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.uploadPhotos') }}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      @change="handlePhotoUpload"
                      class="hidden"
                    />
                  </label>

                  <label class="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    <svg class="w-4 h-4 inline mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {{ $t('teacherWeeklySessions.uploadVideos') }}
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      @change="handleVideoUpload"
                      class="hidden"
                    />
                  </label>
                </div>

                <!-- File Info -->
                <div class="text-xs text-gray-500 mb-4" :class="isRTL ? 'text-right' : 'text-left'">
                  <p>{{ $t('teacherWeeklySessions.maxFileSize') }}: 10MB</p>
                  <p>{{ $t('teacherWeeklySessions.supportedFormats') }}: JPG, PNG, GIF | MP4, MOV, AVI</p>
                </div>

                <!-- Uploaded Files -->
                <div v-if="completionFiles.length > 0" class="space-y-2">
                  <div
                    v-for="(file, index) in completionFiles"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div class="flex items-center">
                      <svg v-if="file.type.startsWith('image/')" class="w-5 h-5 text-blue-500 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-purple-500 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                      </div>
                    </div>
                    <button
                      @click="removeFile(index)"
                      type="button"
                      class="text-red-500 hover:text-red-700"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rtl:space-x-reverse">
            <button
              @click="closeCompletionModal"
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="completionLoading || !completionDescription.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="completionLoading" class="animate-spin -ml-1 mr-2 rtl:ml-2 rtl:-mr-1 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ completionLoading ? $t('common.saving') : $t('teacherWeeklySessions.completeTask') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Task Details View Modal -->
  <div v-if="showDetailsModal" class="fixed inset-0 z-60 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDetailsModal"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
           :class="isRTL ? 'text-right' : 'text-left'"
           :dir="isRTL ? 'rtl' : 'ltr'">
        <div class="bg-white px-6 pt-6 pb-4">
          <div class="w-full">
            <!-- Modal Header -->
            <div class="mb-6 border-b border-gray-200 pb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xl leading-6 font-bold text-gray-900"
                    :class="isRTL ? 'text-right' : 'text-left'">
                  {{ $t('teacherWeeklySessions.taskDetails') }}
                </h3>
                <button
                  @click="closeDetailsModal"
                  class="text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Task Info -->
            <div v-if="selectedTask" class="space-y-4">
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="font-medium text-blue-900">{{ selectedTask.task_title }}</h4>
                <p v-if="selectedTask.task_description" class="text-blue-700 mt-1">{{ selectedTask.task_description }}</p>
              </div>

              <!-- Completion Details -->
              <div v-if="selectedTask.completion_description" class="bg-green-50 rounded-lg p-4">
                <h5 class="font-medium text-green-900 mb-2">{{ $t('teacherWeeklySessions.completionDescription') }}</h5>
                <p class="text-green-800">{{ selectedTask.completion_description }}</p>
                <div class="mt-2 text-sm text-green-700">
                  <span>{{ $t('common.completedAt') }}: {{ formatDate(selectedTask.completed_at) }}</span>
                </div>
              </div>

              <!-- Media Files (if any) -->
              <div v-if="selectedTask.media && selectedTask.media.length > 0" class="space-y-2">
                <h5 class="font-medium text-gray-900">{{ $t('teacherWeeklySessions.attachedMedia') }}</h5>
                <div class="grid grid-cols-2 gap-4">
                  <div
                    v-for="media in selectedTask.media"
                    :key="media.id"
                    class="border rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div class="flex items-center">
                      <svg v-if="media.file_type === 'photo'" class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <svg v-else class="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ media.file_name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(media.file_size) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 flex items-center justify-end">
          <button
            @click="closeDetailsModal"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { WeeklySessionPlan } from '../services'

const { t, locale } = useI18n()

// RTL support
const isRTL = computed(() => locale.value === 'ar')

// Props
interface Props {
  show: boolean
  schedule?: any | null
  groupId: string
  weekStartDate: string
  existingTasks: WeeklySessionPlan[]
  courses?: any[]
  groups?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  schedule: null,
  existingTasks: () => [],
  courses: () => [],
  groups: () => []
})

// Emits
const emit = defineEmits<{
  close: []
  save: [data: any]
  delete: [taskId: string]
  complete: [taskId: string, description: string, files: File[]]
}>()

// Reactive data
const loading = ref(false)
const showCompletionModal = ref(false)
const showDetailsModal = ref(false)
const selectedTask = ref<WeeklySessionPlan | null>(null)
const completionDescription = ref('')
const completionFiles = ref<File[]>([])
const completionLoading = ref(false)
const completionErrors = ref<{ description?: string }>({})

// Multiple tasks form data
const newTasks = ref([
  {
    title: '',
    description: ''
  }
])

// Computed
const hasValidTasks = computed(() => {
  return newTasks.value.some(task => task.title.trim().length > 0)
})

// Methods
const resetForm = () => {
  newTasks.value = [
    {
      title: '',
      description: ''
    }
  ]
}

const addNewTask = () => {
  newTasks.value.push({
    title: '',
    description: ''
  })
}

const removeTask = (index: number) => {
  if (newTasks.value.length > 1) {
    newTasks.value.splice(index, 1)
  }
}

const getCourseName = (courseId: string): string => {
  const course = props.courses?.find(c => c.id === courseId)
  return course ? course.name : 'Unknown Course'
}

const getGroupName = (groupId: string): string => {
  const group = props.groups?.find(g => g.id === groupId)
  return group ? group.name : 'Unknown Group'
}

const formatWeekRange = (weekStart: string): string => {
  const start = new Date(weekStart)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  return `${start.toLocaleDateString('ar-SA')} - ${end.toLocaleDateString('ar-SA')}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Task completion methods
const openCompletionModal = (task: WeeklySessionPlan) => {
  selectedTask.value = task
  completionDescription.value = ''
  completionFiles.value = []
  completionErrors.value = {}
  showCompletionModal.value = true
}

const closeCompletionModal = () => {
  showCompletionModal.value = false
  selectedTask.value = null
  completionDescription.value = ''
  completionFiles.value = []
  completionErrors.value = {}
}

const viewCompletionDetails = (task: WeeklySessionPlan) => {
  selectedTask.value = task
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedTask.value = null
}

const handlePhotoUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFileUpload(Array.from(files))
  }
}

const handleVideoUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    handleFileUpload(Array.from(files))
  }
}

const handleFileUpload = (files: File[]) => {
  const maxSize = 10 * 1024 * 1024 // 10MB

  files.forEach(file => {
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`)
      return
    }

    completionFiles.value.push(file)
  })
}

const removeFile = (index: number) => {
  completionFiles.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const validateCompletion = (): boolean => {
  completionErrors.value = {}

  if (!completionDescription.value.trim()) {
    completionErrors.value.description = t('teacherWeeklySessions.completionDescriptionRequired')
    return false
  }

  return true
}

const submitTaskCompletion = async () => {
  if (!validateCompletion() || !selectedTask.value) return

  completionLoading.value = true

  try {
    // Emit the completion event with task ID, description, and files
    emit('complete', selectedTask.value.id, completionDescription.value, completionFiles.value)

    // Close the modal
    closeCompletionModal()

  } catch (error) {
    console.error('Error completing task:', error)
    alert('Error completing task: ' + error.message)
  } finally {
    completionLoading.value = false
  }
}

const deleteTask = (taskId: string) => {
  if (confirm(t('weeklySessionPlans.confirmDelete'))) {
    emit('delete', taskId)
  }
}

// Watch for show changes to reset form
watch(() => props.show, (show) => {
  if (show) {
    resetForm()
  }
})

const handleSubmit = async () => {
  if (!props.groupId || !props.weekStartDate || !props.schedule) {
    alert('Missing required information. Please close and try again.')
    return
  }

  // Filter out tasks with empty titles
  const validTasks = newTasks.value.filter(task => task.title.trim().length > 0)

  if (validTasks.length === 0) {
    alert('At least one task title is required')
    return
  }

  loading.value = true

  try {
    // Emit all valid tasks for saving
    const tasksData = validTasks.map(task => ({
      groupId: props.groupId,
      weekStartDate: props.weekStartDate,
      scheduleId: props.schedule.id,
      title: task.title.trim(),
      description: task.description.trim()
    }))

    emit('save', tasksData)

    // Reset form after successful save
    resetForm()
  } catch (error) {
    console.error('Error preparing form data:', error)
    alert('Error preparing form data: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
