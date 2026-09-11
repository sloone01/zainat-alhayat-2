import { BaseApiService } from './api'

export type NotificationTransactionChannel = 'email' | 'sms'
export type NotificationTransactionStatus = 'sent' | 'failed' | 'skipped'

export type NotificationTransactionRow = {
  id: string
  school_id: string | null
  channel: NotificationTransactionChannel
  status: NotificationTransactionStatus
  to_address: string
  subject: string | null
  body_html?: string | null
  body_text?: string | null
  template_key: string | null
  recipient_user_id: string | null
  error_message: string | null
  provider_message_id: string | null
  source: string | null
  resent_from_id: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
}

export type NotificationTransactionListResult = {
  items: NotificationTransactionRow[]
  total: number
  page: number
  pageSize: number
}

class NotificationTransactionService extends BaseApiService {
  async list(params?: {
    channel?: string
    status?: string
    search?: string
    page?: number
    pageSize?: number
  }): Promise<NotificationTransactionListResult> {
    return this.get<NotificationTransactionListResult>('/notification-transactions', params)
  }

  async getById(id: string): Promise<NotificationTransactionRow> {
    return this.get<NotificationTransactionRow>(`/notification-transactions/${id}`)
  }

  async resend(id: string): Promise<NotificationTransactionRow> {
    return this.post<NotificationTransactionRow>(`/notification-transactions/${id}/resend`)
  }
}

export const notificationTransactionService = new NotificationTransactionService()
