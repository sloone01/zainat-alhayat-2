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
}

export const chatApiService = new ChatApiService()
