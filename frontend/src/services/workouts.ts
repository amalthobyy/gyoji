import { api } from './api'

export interface WorkoutCategory {
  id: number
  name: string
}

export interface Workout {
  id: number
  title: string
  description: string
  category: WorkoutCategory
  difficulty_level: string
  difficulty_label: string
  duration: number
  calories_burned: number
  equipment_needed: string
  video_url: string
  thumbnail: string
  exercises_list: string[]
}

export interface WorkoutQuery {
  category?: number | string
  difficulty?: string
  search?: string
}

export async function getWorkoutCategories(): Promise<WorkoutCategory[]> {
  const { data } = await api.get<WorkoutCategory[]>('/workout-categories/')
  return data
}

export async function getWorkouts(query: WorkoutQuery = {}): Promise<Workout[]> {
  const { data } = await api.get<Workout[]>('/workouts/', { params: query })
  return Array.isArray(data) ? data : data?.results ?? []
}
