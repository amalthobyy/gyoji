import { api } from './api'

export interface ChatMessage {
  id: number
  chat_room: number
  sender: number
  sender_name: string
  sender_avatar: string | null
  content: string
  timestamp: string
  is_read: boolean
}

export interface ChatRoom {
  id: number
  user: number
  user_name: string
  user_avatar: string | null
  trainer: number
  trainer_name: string
  trainer_avatar: string | null
  created_at: string
  last_message: ChatMessage | null
  unread_count: number
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const { data } = await api.get<ChatRoom[]>('/chat/rooms/')
  return data
}

export async function getRoomMessages(roomId: number | string): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(`/chat/messages/?room=${roomId}`)
  return data
}

export async function openChatRoom(params: { trainerId?: number; userId?: number }): Promise<ChatRoom> {
  if (params.trainerId) {
    const { data } = await api.post<ChatRoom>('/chat/rooms/', { trainer: params.trainerId })
    return data
  }
  if (params.userId) {
    const { data } = await api.post<ChatRoom>('/chat/rooms/', { user: params.userId })
    return data
  }
  throw new Error('trainerId or userId is required')
}

export async function markMessagesAsRead(roomId: number): Promise<void> {
  try {
    // Skip error toast for this background operation
    await api.post('/chat/messages/mark_as_read/', { room_id: roomId }, {
      skipErrorToast: true
    } as any)
  } catch (error) {
    // Silently fail - don't show error toast for this operation
    // This is a background operation and errors shouldn't interrupt the user
    console.debug('Failed to mark messages as read:', error)
  }
}
