import { Capacitor } from '@capacitor/core'
import { pushApiService, type PushPlatform } from '@/services/push.service'
import { getStoredToken } from '@/utils/auth-token'
import { isNativeApp } from '@/utils/native-app'

const DEVICE_ID_KEY = 'fikr_push_device_id'
const LAST_TOKEN_KEY = 'fikr_push_last_token'

let started = false
let currentToken: string | null = null

function deviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    return `dev-${Date.now()}`
  }
}

function platform(): PushPlatform {
  const p = Capacitor.getPlatform()
  if (p === 'ios') return 'ios'
  if (p === 'android') return 'android'
  return 'web'
}

function routeFromPushData(data: Record<string, string> | undefined): string | null {
  if (!data) return null
  if (data.route) return data.route
  if (data.url) return data.url
  const key = data.templateKey || ''
  if (key.includes('chat.direct') || key.includes('CHAT_DIRECT')) return '/messages'
  if (key.includes('chat.group') || key.includes('CHAT_GROUP')) return '/chat'
  if (key.includes('meeting') || key.includes('MEETING')) {
    return data.meetingRoomId ? `/meeting-room/${data.meetingRoomId}` : '/my-meeting-rooms'
  }
  if (key.includes('attendance') || key.includes('ATTENDANCE')) return '/parent/attendance'
  if (key.includes('bus') || key.includes('BUS')) return '/parent/bus'
  if (key.includes('fee') || key.includes('FEE') || key.includes('payment')) return '/parent/fees'
  return null
}

async function uploadToken(token: string): Promise<void> {
  if (!getStoredToken()) return
  currentToken = token
  try {
    localStorage.setItem(LAST_TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
  try {
    await pushApiService.register({
      token,
      platform: platform(),
      device_id: deviceId(),
    })
  } catch (err) {
    console.warn('[push] register failed', err)
  }
}

/**
 * Start Capacitor push listeners and register the FCM/APNs token with the API.
 * No-op in the browser (unless `fikr_native_shell` override — still no native plugin).
 */
export async function startPushNotifications(router?: {
  push: (path: string) => unknown
}): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  if (started) {
    if (currentToken && getStoredToken()) await uploadToken(currentToken)
    return
  }
  started = true

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    PushNotifications.addListener('registration', (t) => {
      void uploadToken(t.value)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.warn('[push] registrationError', err)
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (event) => {
      const data = (event.notification?.data || {}) as Record<string, string>
      const route = routeFromPushData(data)
      if (route && router) router.push(route)
    })

    let perm = await PushNotifications.checkPermissions()
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') {
      perm = await PushNotifications.requestPermissions()
    }
    if (perm.receive !== 'granted') {
      console.warn('[push] permission not granted')
      return
    }

    await PushNotifications.register()
  } catch (err) {
    console.warn('[push] start failed', err)
  }
}

/** Drop this device token from the server (call before clearing auth). */
export async function stopPushNotifications(): Promise<void> {
  if (!isNativeApp() && !Capacitor.isNativePlatform()) return
  const token = currentToken || (() => {
    try {
      return localStorage.getItem(LAST_TOKEN_KEY)
    } catch {
      return null
    }
  })()
  try {
    await pushApiService.unregister({
      token: token || undefined,
      device_id: deviceId(),
    })
  } catch {
    /* ignore logout failures */
  }
  currentToken = null
}
