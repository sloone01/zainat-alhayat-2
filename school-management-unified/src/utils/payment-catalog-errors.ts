import { getErrorMessage } from '@/utils/error-reporting'

type Translate = (key: string) => string

/** User-facing message for a failed payment catalog save / delete. Never the raw axios text. */
export function paymentCatalogErrorMessage(error: unknown, t: Translate, fallbackKey = 'paymentSettings.saveError'): string {
  const status = (error as { response?: { status?: number } })?.response?.status
  const message = getErrorMessage(error, '')
  if (status === 400 && /already exists/i.test(message)) return t('paymentSettings.codeExists')
  if (status === 409 && /already used on a student charge/i.test(message)) return t('paymentSettings.itemInUse')
  if (!message || /^Request failed with status code/i.test(message) || /^Network Error$/i.test(message)) {
    return t(fallbackKey)
  }
  return message
}
