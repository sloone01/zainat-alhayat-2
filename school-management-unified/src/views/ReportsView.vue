<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ $t('dashboard.reports') }}</h1>
            <p class="mt-1 text-sm text-gray-600">
              {{ $t('reports.description') }}
            </p>
          </div>
          <button
            @click="generateReport"
            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ $t('reports.generateReport') }}
          </button>
        </div>
      </div>

      <!-- Report Categories -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Student Reports -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <span class="text-white text-lg">👨‍🎓</span>
            </div>
            <h3 class="ml-3 text-lg font-medium text-gray-900">{{ $t('reports.studentReports') }}</h3>
          </div>
          <div class="space-y-3">
            <button
              v-for="report in studentReports"
              :key="report.id"
              @click="viewReport(report)"
              class="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ report.title }}</div>
              <div class="text-sm text-gray-600">{{ report.description }}</div>
            </button>
          </div>
        </div>

        <!-- Academic Reports -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span class="text-white text-lg">📚</span>
            </div>
            <h3 class="ml-3 text-lg font-medium text-gray-900">{{ $t('reports.academicReports') }}</h3>
          </div>
          <div class="space-y-3">
            <button
              v-for="report in academicReports"
              :key="report.id"
              @click="viewReport(report)"
              class="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ report.title }}</div>
              <div class="text-sm text-gray-600">{{ report.description }}</div>
            </button>
          </div>
        </div>

        <!-- Administrative Reports -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <span class="text-white text-lg">📊</span>
            </div>
            <h3 class="ml-3 text-lg font-medium text-gray-900">{{ $t('reports.administrativeReports') }}</h3>
          </div>
          <div class="space-y-3">
            <button
              v-for="report in administrativeReports"
              :key="report.id"
              @click="viewReport(report)"
              class="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ report.title }}</div>
              <div class="text-sm text-gray-600">{{ report.description }}</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">{{ $t('reports.recentReports') }}</h2>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p class="mt-2 text-sm text-gray-600">{{ $t('common.loading') }}</p>
          </div>
          
          <div v-else-if="recentReports.length === 0" class="text-center py-8">
            <div class="text-gray-400 text-4xl mb-4">📊</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('reports.noReports') }}</h3>
            <p class="text-gray-600 mb-4">{{ $t('reports.noReportsDescription') }}</p>
            <button
              @click="generateReport"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {{ $t('reports.generateFirstReport') }}
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="report in recentReports"
              :key="report.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900">{{ report.title }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ report.description }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="text-xs text-gray-500">
                      {{ $t('reports.generatedOn') }}: {{ formatDate(report.createdAt) }}
                    </span>
                    <span class="text-xs text-gray-500">
                      {{ $t('reports.type') }}: {{ report.type }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="downloadReport(report)"
                    class="text-purple-600 hover:text-purple-900 text-sm font-medium"
                  >
                    {{ $t('common.export') }}
                  </button>
                  <button
                    @click="viewReport(report)"
                    class="text-purple-600 hover:text-purple-900 text-sm font-medium"
                  >
                    {{ $t('common.view') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Generation Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('reports.generateReport') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('reports.comingSoon') }}</p>
        <div class="flex justify-end">
          <button
            @click="showGenerateModal = false"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ $t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Reactive data
const loading = ref(false)
const showGenerateModal = ref(false)

const studentReports = ref([
  {
    id: 1,
    title: 'Student Progress Report',
    description: 'Individual student academic progress and milestones'
  },
  {
    id: 2,
    title: 'Attendance Summary',
    description: 'Student attendance patterns and statistics'
  },
  {
    id: 3,
    title: 'Behavioral Assessment',
    description: 'Student behavior tracking and development'
  }
])

const academicReports = ref([
  {
    id: 4,
    title: 'Course Performance',
    description: 'Overall course completion and success rates'
  },
  {
    id: 5,
    title: 'Learning Objectives',
    description: 'Progress towards educational goals'
  },
  {
    id: 6,
    title: 'Assessment Results',
    description: 'Comprehensive assessment outcomes'
  }
])

const administrativeReports = ref([
  {
    id: 7,
    title: 'Enrollment Statistics',
    description: 'Student enrollment trends and demographics'
  },
  {
    id: 8,
    title: 'Teacher Performance',
    description: 'Teaching effectiveness and student outcomes'
  },
  {
    id: 9,
    title: 'Resource Utilization',
    description: 'Classroom and material usage statistics'
  }
])

const recentReports = ref([
  {
    id: 1,
    title: 'Monthly Progress Report - October 2024',
    description: 'Comprehensive overview of student progress for October',
    type: 'Academic',
    createdAt: new Date('2024-10-01')
  },
  {
    id: 2,
    title: 'Attendance Summary - September 2024',
    description: 'Student attendance patterns and statistics for September',
    type: 'Administrative',
    createdAt: new Date('2024-09-30')
  }
])

// Methods
const generateReport = () => {
  showGenerateModal.value = true
}

const viewReport = (report: any) => {
  console.log('View report:', report)
  // TODO: Implement report viewing
}

const downloadReport = (report: any) => {
  console.log('Download report:', report)
  // TODO: Implement report download
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

onMounted(() => {
  // TODO: Load reports from API
})
</script>
