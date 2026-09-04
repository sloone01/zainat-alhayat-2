import { BaseApiService } from './api'

export interface ChatGroupSummary {
  id: string
  name: string
  description?: string | null
  studentCount?: number
}

export interface ChatMessage {
  id: string
  groupId: string
  userId: string
  body: string
  createdAt: string
  senderName: string
  metadata?: Record<string, unknown> | null
}

export interface DirectThreadSummary {
  thread_id: string
  other_user_id: string
  other_name: string
  other_role: string
  last_message_at: string | null
  last_message_preview: string | null
}

export interface DirectThreadPeer {
  other_user_id: string
  other_name: string
  other_role: string
}

export interface ParentTeacherContactRow {
  student_id: string
  student_name: string
  group_id: string
  group_name: string
  course_id: string
  course_name: string
  teacher_user_id: string
  teacher_name: string
}

export interface SuggestedContactRow {
  user_id: string
  name: string
  role: string
  subtitle: string
}

export type MessageLetterApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface DirectApprovalInboxRow {
  message_id: string
  thread_id: string
  letter_id: string
  title: string
  preview_text: string
  sent_at: string
  sender_user_id: string
  sender_name: string
  activity_id: string | null
  activity_title: string | null
  approval_status: MessageLetterApprovalStatus
  approval_resolved_at: string | null
  can_approve: boolean
}

export interface RenderedMessageLetter {
  locale: 'en' | 'ar'
  subject: string
  body_html: string
  body_sms: string
  preview_text: string
  activity_title?: string | null
  letter_id?: string | null
}

class ChatApiService extends BaseApiService {
  async listGroups(): Promise<ChatGroupSummary[]> {
    return this.get<ChatGroupSummary[]>('/chat/groups')
  }

  async listMessages(groupId: string, limit = 100): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/chat/groups/${groupId}/messages`, { limit })
  }

  async listDirectThreads(): Promise<DirectThreadSummary[]> {
    return this.get<DirectThreadSummary[]>('/chat/direct/threads')
  }

  async getDirectThreadPeer(threadId: string): Promise<DirectThreadPeer> {
    return this.get<DirectThreadPeer>(`/chat/direct/threads/${threadId}`)
  }

  async listDirectMessages(threadId: string, limit = 100): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/chat/direct/threads/${threadId}/messages`, { limit })
  }

  async listParentTeacherContacts(): Promise<ParentTeacherContactRow[]> {
    return this.get<ParentTeacherContactRow[]>('/chat/direct/parent-contacts')
  }

  async listSuggestedContacts(): Promise<SuggestedContactRow[]> {
    return this.get<SuggestedContactRow[]>('/chat/direct/suggested-contacts')
  }

  async openDirectThread(target_user_id: string): Promise<{ thread_id: string }> {
    return this.post<{ thread_id: string }>('/chat/direct/open', { target_user_id })
  }

  async openDirectFromCourse(body: {
    student_id: string
    course_id: string
    group_id: string
  }): Promise<{ thread_id: string; teacher_user_id: string }> {
    return this.post<{ thread_id: string; teacher_user_id: string }>(
      '/chat/direct/open-from-course',
      body,
    )
  }

  listApprovalInbox(locale?: 'en' | 'ar'): Promise<DirectApprovalInboxRow[]> {
    const q = locale ? `?locale=${locale}` : ''
    return this.get<DirectApprovalInboxRow[]>(`/chat/direct/approval-inbox${q}`)
  }

  getRenderedMessageLetter(
    messageId: string,
    locale?: 'en' | 'ar',
    recipientUserId?: string,
  ): Promise<RenderedMessageLetter> {
    const params = new URLSearchParams()
    if (locale) params.set('locale', locale)
    if (recipientUserId) params.set('recipient_user_id', recipientUserId)
    const q = params.toString() ? `?${params.toString()}` : ''
    return this.get<RenderedMessageLetter>(
      `/chat/direct/messages/${encodeURIComponent(messageId)}/letter-render${q}`,
    )
  }

  resolveMessageLetterApproval(messageId: string, decision: 'approve' | 'reject'): Promise<ChatMessage> {
    return this.patch<ChatMessage>(
      `/chat/direct/messages/${encodeURIComponent(messageId)}/message-letter-approval`,
      { decision },
    )
  }
}

export const chatApiService = new ChatApiService()
