import { api } from './api'
import { UserProfile } from './user'

export interface AdminStats {
  totals: {
    users: number
    trainers: number
    workouts: number
    diet_plans: number
    hirings: number
    pending_hirings: number
    chat_rooms: number
  }
  recent_users: Array<{
    id: number
    name: string
    email: string
    role: string
    date_joined: string
  }>
  recent_hirings: Array<{
    id: number
    user_name: string
    trainer_name: string
    status: string
    start_date: string | null
    created_at: string
  }>
}

export interface AdminUserQuery {
  search?: string
  role?: string
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/admin/stats/')
  return data
}

export async function getAdminUsers(params: AdminUserQuery = {}): Promise<UserProfile[]> {
  const { data } = await api.get<UserProfile[]>('/admin/users/', { params })
  return Array.isArray(data) ? data : data?.results ?? []
}
