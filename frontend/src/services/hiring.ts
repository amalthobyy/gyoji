import { api } from './api'

export interface Hiring {
  id: number
  user: number
  user_name: string
  trainer: number
  trainer_name: string
  trainer_profile_picture?: string | null
  status: 'pending' | 'accepted' | 'rejected'
  payment_status: 'pending' | 'requires_payment' | 'paid' | 'failed'
  amount: number
  paid_at?: string | null
  can_pay: boolean
  start_date: string
  time_slot?: string
  session_type: 'one-time' | 'monthly'
  created_at: string
  updated_at: string
}

export interface CreateHiringPayload {
  trainer: number
  start_date: string
  session_type: 'one-time' | 'monthly'
  time_slot?: string
}

export async function createHiring(payload: CreateHiringPayload): Promise<Hiring> {
  const { data } = await api.post<Hiring>('/trainer-hiring/', payload)
  return data
}

export async function getHirings(): Promise<Hiring[]> {
  const { data } = await api.get<Hiring[]>('/trainer-hiring/')
  return data
}

export async function updateHiringStatus(id: number, status: 'accepted' | 'rejected'): Promise<Hiring> {
  const { data } = await api.patch<Hiring>(`/trainer-hiring/${id}/`, { status })
  return data
}

type CheckoutSessionResponse = {
  checkout_url: string
  session_id: string
}

export async function createHiringCheckoutSession(
  id: number,
  payload: { success_url?: string; cancel_url?: string } = {},
): Promise<CheckoutSessionResponse> {
  const { data } = await api.post<CheckoutSessionResponse>(`/trainer-hiring/${id}/create_checkout_session/`, payload, {
    skipErrorToast: true,
  })
  return data
}
