<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile Header -->
    <div class="bg-gradient-to-r from-kindergarten-600 to-kindergarten-500 text-white">
      <div class="px-4 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-lg font-bold">ز</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold">{{ $t('dashboard.welcome') }}</h1>
              <p class="text-kindergarten-100 text-sm">{{ currentUser.name }}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2" :class="{ 'space-x-reverse': isRTL }">
            <button @click="toggleNotifications" class="relative p-2 bg-white bg-opacity-20 rounded-full">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {{ unreadNotifications }}
              </span>
            </button>
            <button @click="openProfile" class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="px-4 -mt-4 mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalStudents }}</p>
              <p class="text-xs text-gray-600">{{ $t('dashboard.stats.students') }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ stats.presentToday }}</p>
              <p class="text-xs text-gray-600">{{ $t('dashboard.stats.present') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Activities -->
    <div class="px-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.todaysActivities') }}</h2>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="activity in todaysActivities" :key="activity.id" class="flex items-center space-x-3" :class="{ 'space-x-reverse': isRTL }">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="activity.statusColor">
              <svg class="w-4 h-4" :class="activity.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activity.icon" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-xs text-gray-600">{{ activity.time }}</p>
            </div>
            <span class="text-xs px-2 py-1 rounded-full" :class="activity.badgeClass">
              {{ activity.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="px-4 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('dashboard.quickActions') }}</h2>
      <div class="grid grid-cols-3 gap-4">
        <button 
          v-for="action in quickActions" 
          :key="action.id"
          @click="navigateToAction(action.route)"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-shadow duration-200"
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="action.bgColor">
            <svg class="w-6 h-6" :class="action.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
            </svg>
          </div>
          <span class="text-xs font-medium text-gray-900 text-center">{{ action.title }}</span>
        </button>
      </div>
    </div>

    <!-- Recent Photos -->
    <div class="px-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ $t('dashboard.recentPhotos') }}</h2>
          <button @click="viewAllPhotos" class="text-kindergarten-600 text-sm font-medium">
            {{ $t('dashboard.viewAll') }}
          </button>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-4 gap-2">
            <div 
              v-for="photo in recentPhotos" 
              :key="photo.id"
              @click="openPhotoViewer(photo)"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
            >
              <img :src="photo.thumbnail" :alt="photo.description" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div class="flex items-center justify-around">
        <button 
          v-for="navItem in bottomNavigation" 
          :key="navItem.id"
          @click="navigateToAction(navItem.route)"
          class="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors duration-200"
          :class="navItem.active ? 'text-kindergarten-600 bg-kindergarten-50' : 'text-gray-600'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="navItem.icon" />
          </svg>
          <span class="text-xs font-medium">{{ navItem.title }}</span>
        </button>
      </div>
    </div>

    <!-- Spacer for bottom navigation -->
    <div class="h-20"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t, locale } = useI18n()
const router = useRouter()

const isRTL = computed(() => locale.value === 'ar')

// Mock user data
const currentUser = ref({
  name: 'أحمد محمد',
  role: 'parent',
  avatar: '/api/placeholder/40/40'
})

// Mock stats
const stats = ref({
  totalStudents: 24,
  presentToday: 22
})

const unreadNotifications = ref(3)

// Today's activities
const todaysActivities = ref([
  {
    id: 1,
    title: 'وقت اللعب الحر',
    time: '9:00 ص',
    status: 'جاري',
    statusColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 2,
    title: 'وجبة الإفطار',
    time: '10:30 ص',
    status: 'مكتمل',
    statusColor: 'bg-green-100',
    iconColor: 'text-green-600',
    badgeClass: 'bg-green-100 text-green-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 3,
    title: 'النشاط الفني',
    time: '11:00 ص',
    status: 'قادم',
    statusColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  }
])

// Quick actions
const quickActions = ref([
  {
    id: 1,
    title: 'الحضور',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    route: '/attendance'
  },
  {
    id: 2,
    title: 'الرسائل',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    route: '/messages'
  },
  {
    id: 3,
    title: 'التقدم',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    route: '/progress'
  },
  {
    id: 4,
    title: 'الصور',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    bgColor: 'bg-pink-100',
    iconColor: 'text-pink-600',
    route: '/photos'
  },
  {
    id: 5,
    title: 'الجدول',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    bgColor: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    route: '/schedule'
  },
  {
    id: 6,
    title: 'الإعدادات',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    route: '/settings'
  }
])

// Recent photos
const recentPhotos = ref([
  { id: 1, thumbnail: '/api/placeholder/80/80', description: 'نشاط فني' },
  { id: 2, thumbnail: '/api/placeholder/80/80', description: 'وقت اللعب' },
  { id: 3, thumbnail: '/api/placeholder/80/80', description: 'وجبة الغداء' },
  { id: 4, thumbnail: '/api/placeholder/80/80', description: 'القراءة' }
])

// Bottom navigation
const bottomNavigation = ref([
  {
    id: 1,
    title: 'الرئيسية',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    route: '/dashboard',
    active: true
  },
  {
    id: 2,
    title: 'الأطفال',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    route: '/children',
    active: false
  },
  {
    id: 3,
    title: 'الرسائل',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    route: '/messages',
    active: false
  },
  {
    id: 4,
    title: 'الملف',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    route: '/profile',
    active: false
  }
])

// Methods
const toggleNotifications = () => {
  // Handle notifications
  console.log('Toggle notifications')
}

const openProfile = () => {
  router.push('/profile')
}

const navigateToAction = (route: string) => {
  router.push(route)
}

const viewAllPhotos = () => {
  router.push('/photos')
}

const openPhotoViewer = (photo: any) => {
  // Open photo viewer modal
  console.log('Open photo:', photo)
}

onMounted(() => {
  // Load dashboard data
  console.log('Mobile dashboard mounted')
})
</script>

<style scoped>
.touch-button {
  min-height: 44px;
  min-width: 44px;
}
</style>

