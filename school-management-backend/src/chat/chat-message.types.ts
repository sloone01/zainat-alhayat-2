export interface ChatMessageDto {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  createdAt: string;
  senderName: string;
  metadata?: Record<string, unknown> | null;
}
