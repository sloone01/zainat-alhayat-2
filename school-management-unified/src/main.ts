import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { reportClientError } from '@/utils/error-reporting'
import { showSystemErrorOverlay } from '@/utils/error-pages'

// Force Arabic locale and clear any cached English preference
localStorage.setItem('language', 'ar')
i18n.global.locale.value = 'ar'
document.documentElement.lang = 'ar-OM'
document.documentElement.dir = 'rtl'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  const routeName = router.currentRoute.value.name
  if (routeName === 'system-error' || routeName === 'unauthorized') {
    console.error(err)
    return
  }
  void reportClientError(err, {
    component: info || instance?.$options?.name || 'vue',
    extra: { vueInfo: info },
  }).then((ticket) => {
    showSystemErrorOverlay(ticket)
  })
}

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason as { isAxiosError?: boolean; response?: unknown; config?: unknown }
  // Axios interceptor already tickets / navigates to /error for these.
  if (reason?.isAxiosError || reason?.response || reason?.config) return
  const routeName = router.currentRoute.value.name
  if (routeName === 'system-error' || routeName === 'unauthorized') return
  void reportClientError(event.reason, { component: 'unhandledrejection' }).then((ticket) => {
    showSystemErrorOverlay(ticket)
  })
})

window.addEventListener('error', (event) => {
  // Resource errors (img/script) have no useful stack — skip noise
  if (!event.error) return
  const routeName = router.currentRoute.value.name
  if (routeName === 'system-error' || routeName === 'unauthorized') return
  void reportClientError(event.error, { component: 'window.onerror' }).then((ticket) => {
    showSystemErrorOverlay(ticket)
  })
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
