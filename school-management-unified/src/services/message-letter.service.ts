import { BaseApiService } from './api'
import type { CreateMeetingRoomInvite } from './meeting-room.service'

export interface MessageLetterVariableHint {
  name: string
  description: string
}

export interface MessageLetterLocaleBlock {
  subject: string
  body_html: string
  body_sms: string | null
}

export type MessageLetterSource = 'custom' | 'activity'

export interface SchoolMessageLetterRow {
  id: string
  school_id: number
  title: string
  source: MessageLetterSource
  activity_id: string | null
  requires_approval: boolean
  audience: CreateMeetingRoomInvite
  en: MessageLetterLocaleBlock
  ar: MessageLetterLocaleBlock
  recipient_count: number
  created_at: string
  updated_at: string
}

export interface CreateMessageLetterPayload {
  school_id: number
  title: string
  audience: CreateMeetingRoomInvite
  en: { subject: string; body_html: string; body_sms?: string }
  ar: { subject: string; body_html: string; body_sms?: string }
}

export type MessageLetterDispatchChannel = 'email' | 'chat' | 'chat_approval'

export type MessageLetterApprovalStatus = 'not_sent' | 'pending' | 'approved' | 'rejected'

export interface MessageLetterApprovalStudent {
  id: string
  name: string
}

export interface MessageLetterApprovalRecipientRow {
  message_id: string
  thread_id: string | null
  letter_id: string
  letter_title: string
  activity_id: string | null
  activity_title: string | null
  sent_at: string | null
  recipient_user_id: string
  recipient_name: string
  recipient_phone: string | null
  students: MessageLetterApprovalStudent[]
  approval_status: MessageLetterApprovalStatus
  approval_resolved_at: string | null
}

export interface MessageLetterApprovalRecipientsFilters {
  letter_id?: string
  recipient_user_id?: string
  student_id?: string
  activity_id?: string
  approval_status?: MessageLetterApprovalStatus
  locale?: 'en' | 'ar'
}

export interface MessageLetterDispatchResult {
  channel: string
  recipient_count: number
  chat_messages_sent?: number
  chat_errors?: number
  email_note?: string
  email_details?: {
    missing_config?: string[]
    smtp_error?: string
    emails_sent?: number
    skipped_no_email?: number
    failures?: Array<{ user_id: string; email?: string; error: string }>
  }
}

export type UpdateMessageLetterPayload = Omit<CreateMessageLetterPayload, 'school_id'>

class MessageLetterApiService extends BaseApiService {
  list(schoolId: number): Promise<SchoolMessageLetterRow[]> {
    return this.get<SchoolMessageLetterRow[]>('/message-letters', { school_id: schoolId })
  }

  listApprovalRecipients(
    schoolId: number,
    filters?: MessageLetterApprovalRecipientsFilters,
  ): Promise<MessageLetterApprovalRecipientRow[]> {
    return this.get<MessageLetterApprovalRecipientRow[]>('/message-letters/approval-recipients', {
      school_id: schoolId,
      ...(filters?.letter_id ? { letter_id: filters.letter_id } : {}),
      ...(filters?.recipient_user_id ? { recipient_user_id: filters.recipient_user_id } : {}),
      ...(filters?.student_id ? { student_id: filters.student_id } : {}),
      ...(filters?.activity_id ? { activity_id: filters.activity_id } : {}),
      ...(filters?.approval_status ? { approval_status: filters.approval_status } : {}),
      ...(filters?.locale ? { locale: filters.locale } : {}),
    })
  }

  getOne(schoolId: number, id: string): Promise<SchoolMessageLetterRow> {
    return this.get<SchoolMessageLetterRow>(`/message-letters/${encodeURIComponent(id)}`, { school_id: schoolId })
  }

  variableHints(): Promise<MessageLetterVariableHint[]> {
    return this.get<MessageLetterVariableHint[]>('/message-letters/variable-hints')
  }

  sampleVariables(schoolId: number): Promise<Record<string, string>> {
    return this.get<Record<string, string>>('/message-letters/sample-variables', { school_id: schoolId })
  }

  audiencePreview(schoolId: number, audience: CreateMeetingRoomInvite): Promise<{ count: number }> {
    return this.post<{ count: number }>('/message-letters/audience-preview', { school_id: schoolId, audience })
  }

  create(body: CreateMessageLetterPayload): Promise<SchoolMessageLetterRow> {
    return this.post<SchoolMessageLetterRow>('/message-letters', body)
  }

  update(schoolId: number, id: string, body: UpdateMessageLetterPayload): Promise<SchoolMessageLetterRow> {
    const q = new URLSearchParams({ school_id: String(schoolId) })
    return this.put<SchoolMessageLetterRow>(`/message-letters/${encodeURIComponent(id)}?${q}`, body)
  }

  remove(schoolId: number, id: string): Promise<void> {
    const q = new URLSearchParams({ school_id: String(schoolId) })
    return this.delete<void>(`/message-letters/${encodeURIComponent(id)}?${q}`)
  }

  dispatch(schoolId: number, letterId: string, channel: MessageLetterDispatchChannel): Promise<MessageLetterDispatchResult> {
    return this.post<MessageLetterDispatchResult>(`/message-letters/${encodeURIComponent(letterId)}/dispatch`, {
      school_id: schoolId,
      channel,
    })
  }
}

export const messageLetterService = new MessageLetterApiService()
export default messageLetterService
