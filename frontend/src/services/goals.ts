import { api } from './api'

export type GoalType = 'weight_loss' | 'muscle_building' | 'endurance' | 'flexibility'
export type GoalStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export interface Goal {
  id: number
  goal_type: GoalType
  target_value: string
  current_value: string
  deadline: string | null
  status: GoalStatus
  created_at: string
  updated_at: string
}

export interface GoalPayload {
  goal_type: GoalType
  target_value: number
  current_value?: number
  deadline?: string | null
  status?: GoalStatus
}

export interface ProgressLog {
  id: number
  goal: number
  date: string
  value: string
  notes: string
}

export async function getGoals(): Promise<Goal[]> {
  const { data } = await api.get<Goal[]>('/goals/')
  return Array.isArray(data) ? data : data?.results ?? []
}

export async function createGoal(payload: GoalPayload): Promise<Goal> {
  const { data } = await api.post<Goal>('/goals/', payload)
  return data
}

export async function updateGoal(id: number, payload: Partial<GoalPayload>): Promise<Goal> {
  const { data } = await api.patch<Goal>(`/goals/${id}/`, payload)
  return data
}

export async function deleteGoal(id: number): Promise<void> {
  await api.delete(`/goals/${id}/`)
}

export async function getProgressLogs(goalId?: number): Promise<ProgressLog[]> {
  const params = goalId ? { goal: goalId } : undefined
  const { data } = await api.get<ProgressLog[]>('/progress/', { params })
  return Array.isArray(data) ? data : data?.results ?? []
}
