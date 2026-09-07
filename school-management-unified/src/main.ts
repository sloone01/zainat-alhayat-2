import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { reportClientError } from '@/utils/error-reporting'

// Force Arabic locale and clear any cached English preference
localStorage.setItem('language', 'ar')
i18n.global.locale.value = 'ar'
document.documentElement.lang = 'ar-OM'
document.documentElement.dir = 'rtl'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
  reportClientError(err, {
    component: info || instance?.$options?.name || 'vue',
    extra: { vueInfo: info },
  })
}

window.addEventListener('unhandledrejection', (event) => {
  reportClientError(event.reason, { component: 'unhandledrejection' })
})

window.addEventListener('error', (event) => {
  // Resource errors (img/script) have no useful stack — skip noise
  if (event.error) {
    reportClientError(event.error, { component: 'window.onerror' })
  }
})

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
