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

class ChatApiService extends BaseApiService {
  async listGroups(): Promise<ChatGroupSummary[]> {
    return this.get<ChatGroupSummary[]>('/chat/groups')
  }

  async listMessages(groupId: string, limit = 100): Promise<ChatMessage[]> {
    return this.get<ChatMessage[]>(`/chat/groups/${groupId}/messages`, { limit })
  }
}

export const chatApiService = new ChatApiService()
