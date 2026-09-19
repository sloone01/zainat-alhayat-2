import { Capacitor } from '@capacitor/core'

export type DeviceCoords = {
  latitude: number
  longitude: number
  accuracy?: number | null
}

export type DeviceLocationErrorCode = 'unsupported' | 'denied' | 'unavailable'

export class DeviceLocationError extends Error {
  readonly code: DeviceLocationErrorCode

  constructor(code: DeviceLocationErrorCode, message?: string) {
    super(message || code)
    this.name = 'DeviceLocationError'
    this.code = code
  }
}

export function isDeviceLocationError(err: unknown): err is DeviceLocationError {
  return err instanceof DeviceLocationError
}

type PositionOptions = {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

function browserUnsupported(): boolean {
  return typeof navigator === 'undefined' || !navigator.geolocation
}

async function ensureNativePermission(): Promise<void> {
  const { Geolocation } = await import('@capacitor/geolocation')
  let status = await Geolocation.checkPermissions()
  if (status.location === 'granted' || status.coarseLocation === 'granted') return
  status = await Geolocation.requestPermissions()
  if (status.location === 'granted' || status.coarseLocation === 'granted') return
  throw new DeviceLocationError('denied', 'Location permission denied')
}

function mapNativeError(err: unknown): DeviceLocationError {
  const message = err instanceof Error ? err.message : String(err || '')
  const lower = message.toLowerCase()
  if (
    lower.includes('denied') ||
    lower.includes('permission') ||
    lower.includes('not authorized') ||
    lower.includes('kclerrordomain')
  ) {
    return new DeviceLocationError('denied', message || 'Location permission denied')
  }
  return new DeviceLocationError('unavailable', message || 'Location unavailable')
}

function mapBrowserError(err: GeolocationPositionError | null | undefined): DeviceLocationError {
  if (err?.code === 1) return new DeviceLocationError('denied', err.message)
  return new DeviceLocationError('unavailable', err?.message || 'Location unavailable')
}

function browserGetCurrentPositionOnce(options: PositionOptions): Promise<DeviceCoords> {
  if (browserUnsupported()) {
    return Promise.reject(new DeviceLocationError('unsupported'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => reject(mapBrowserError(err)),
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 15000,
        maximumAge: options.maximumAge ?? 0,
      },
    )
  })
}

/** Desktop browsers often have no GPS; a high-accuracy miss is not a permission denial. */
function browserGetCurrentPosition(options: PositionOptions): Promise<DeviceCoords> {
  return browserGetCurrentPositionOnce(options).catch((err: unknown) => {
    if (
      isDeviceLocationError(err) &&
      err.code === 'unavailable' &&
      options.enableHighAccuracy !== false
    ) {
      return browserGetCurrentPositionOnce({ ...options, enableHighAccuracy: false })
    }
    throw err
  })
}

/** Ask for OS location permission (native) then return the current fix. */
export async function getDevicePosition(
  options: PositionOptions = {},
): Promise<DeviceCoords> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNativePermission()
      const { Geolocation } = await import('@capacitor/geolocation')
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 15000,
        maximumAge: options.maximumAge ?? 0,
      })
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }
    } catch (err) {
      if (isDeviceLocationError(err)) throw err
      throw mapNativeError(err)
    }
  }
  return browserGetCurrentPosition(options)
}

/**
 * Continuous GPS for the daily bus log. Returns a cancel function.
 * On native, requests permission first.
 */
export async function watchDevicePosition(
  onFix: (coords: DeviceCoords) => void,
  onError: (err: DeviceLocationError) => void,
  options: PositionOptions = {},
): Promise<() => void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNativePermission()
      const { Geolocation } = await import('@capacitor/geolocation')
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 20000,
          maximumAge: options.maximumAge ?? 5000,
        },
        (pos, err) => {
          if (err || !pos) {
            onError(mapNativeError(err || 'Location unavailable'))
            return
          }
          onFix({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          })
        },
      )
      return () => {
        void Geolocation.clearWatch({ id })
      }
    } catch (err) {
      const mapped = isDeviceLocationError(err) ? err : mapNativeError(err)
      onError(mapped)
      return () => {}
    }
  }

  if (browserUnsupported()) {
    onError(new DeviceLocationError('unsupported'))
    return () => {}
  }

  let watchId = 0
  let stopped = false
  const startWatch = (opts: PositionOptions, allowFallback: boolean) => {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        onFix({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => {
        const mapped = mapBrowserError(err)
        if (allowFallback && mapped.code === 'unavailable' && opts.enableHighAccuracy !== false) {
          navigator.geolocation.clearWatch(watchId)
          if (!stopped) startWatch({ ...opts, enableHighAccuracy: false }, false)
          return
        }
        onError(mapped)
      },
      {
        enableHighAccuracy: opts.enableHighAccuracy ?? true,
        timeout: opts.timeout ?? 20000,
        maximumAge: opts.maximumAge ?? 5000,
      },
    )
  }
  startWatch(options, true)
  return () => {
    stopped = true
    navigator.geolocation.clearWatch(watchId)
  }
}
