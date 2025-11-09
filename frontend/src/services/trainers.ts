import { api, publicApi } from './api'

export interface Trainer {
  id: number
  user_id: number
  username: string
  name: string
  email: string
  profile_picture: string | null
  bio: string | null
  specialization: string | null
  experience_years: number | null
  hourly_rate: number | string | null
  certifications: string | null
  rating: number | null
}

export type TrainerUpdatePayload = {
  specialization?: string | null
  experience_years?: number | null
  hourly_rate?: number | string | null
  certifications?: string | null
  bio?: string | null
  upload_profile_picture?: File | '' | null
}

export async function fetchTrainers(): Promise<Trainer[]> {
  const { data } = await publicApi.get<Trainer[]>('/trainers/')
  return data
}

export async function fetchTrainerMe(): Promise<Trainer> {
  const { data } = await api.get<Trainer>('/trainers/me/')
  return data
}

export async function updateTrainerMe(payload: TrainerUpdatePayload): Promise<Trainer> {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }
    if (key === 'upload_profile_picture' && value instanceof File) {
      formData.append(key, value)
      return
    }
    formData.append(key, String(value))
  })

  const { data } = await api.patch<Trainer>('/trainers/me/', formData)
  return data
}
