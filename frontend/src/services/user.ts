import { api } from './api'

export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile_picture: string | null
  bio: string
  fitness_level: string
  role: string
  is_staff: boolean
  is_superuser: boolean
  date_joined: string
}

export type UpdateUserProfilePayload = {
  first_name?: string
  last_name?: string
  bio?: string
  fitness_level?: string
  profile_picture?: File | null
  remove_profile_picture?: boolean
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me/')
  return data
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
  const formData = new FormData()

  if (payload.first_name !== undefined) {
    formData.append('first_name', payload.first_name)
  }
  if (payload.last_name !== undefined) {
    formData.append('last_name', payload.last_name)
  }
  if (payload.bio !== undefined) {
    formData.append('bio', payload.bio)
  }
  if (payload.fitness_level !== undefined) {
    formData.append('fitness_level', payload.fitness_level)
  }

  if (payload.remove_profile_picture) {
    formData.append('remove_profile_picture', 'true')
  }

  if (payload.profile_picture instanceof File) {
    formData.append('profile_picture', payload.profile_picture)
  }

  const { data } = await api.patch<UserProfile>('/auth/me/', formData)
  return data
}
