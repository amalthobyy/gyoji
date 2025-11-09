import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { fetchTrainerMe, Trainer, updateTrainerMe, TrainerUpdatePayload } from '../services/trainers'
import { formatCurrency } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import { toastPush } from '../services/toast-bridge'
import Skeleton from '../components/ui/Skeleton'
import { Link, useNavigate } from 'react-router-dom'
import { getHirings, Hiring, updateHiringStatus } from '../services/hiring'
import { openChatRoom } from '../services/chat'

const SPECIALIZATION_OPTIONS = ['Strength Training', 'Cardio & Endurance', 'Yoga & Flexibility', 'Mobility & Recovery', 'HIIT & Conditioning']

const initialForm = {
  specialization: SPECIALIZATION_OPTIONS[0],
  experience_years: '',
  hourly_rate: '',
  certifications: '',
  bio: '',
}

type TrainerForm = typeof initialForm

export default function TrainerDashboard() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Trainer | null>(null)
  const [form, setForm] = useState<TrainerForm>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [specializationOptions, setSpecializationOptions] = useState<string[]>(SPECIALIZATION_OPTIONS)
  const [hiringRequests, setHiringRequests] = useState<Hiring[]>([])
  const [hiringLoading, setHiringLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTrainerMe()
        setProfile(data)
        setForm({
          specialization: data.specialization || SPECIALIZATION_OPTIONS[0],
          experience_years: data.experience_years !== null && data.experience_years !== undefined ? String(data.experience_years) : '',
          hourly_rate: data.hourly_rate !== null && data.hourly_rate !== undefined ? String(data.hourly_rate) : '',
          certifications: data.certifications || '',
          bio: data.bio || '',
        })
        setProfileImagePreview(data.profile_picture)
        if (data.specialization && !SPECIALIZATION_OPTIONS.includes(data.specialization as string)) {
          setSpecializationOptions(prev => Array.from(new Set([...prev, data.specialization as string])))
        }
      } catch (error) {
        console.error(error)
        toastPush('error', 'Unable to load your trainer profile right now.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    async function loadHires() {
      if (user?.role !== 'trainer') {
        setHiringLoading(false)
        return
      }
      try {
        const data = await getHirings()
        setHiringRequests(data)
      } catch (error) {
        console.error(error)
        toastPush('error', 'Unable to load booking requests.')
      } finally {
        setHiringLoading(false)
      }
    }
    loadHires()
  }, [])

  useEffect(() => {
    return () => {
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview)
      }
    }
  }, [profileImagePreview])

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    const fields = [profile.specialization, profile.experience_years, profile.hourly_rate, profile.certifications, profile.bio, profile.profile_picture]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview)
    }
    setProfileImageFile(file)
    setRemovePhoto(false)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  function handleRemovePhoto() {
    if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profileImagePreview)
    }
    setProfileImageFile(null)
    setProfileImagePreview(null)
    setRemovePhoto(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: TrainerUpdatePayload = {
        specialization: form.specialization.trim() || SPECIALIZATION_OPTIONS[0],
        certifications: form.certifications,
        bio: form.bio,
      }
      const experience = form.experience_years.trim()
      if (experience !== '') payload.experience_years = Number(experience)
      const rate = form.hourly_rate.trim()
      if (rate !== '') payload.hourly_rate = Number(rate)
      if (profileImageFile) {
        payload.upload_profile_picture = profileImageFile
      } else if (removePhoto) {
        payload.upload_profile_picture = ''
      }

      const data = await updateTrainerMe(payload)
      setProfile(data)
      setForm({
        specialization: data.specialization || SPECIALIZATION_OPTIONS[0],
        experience_years: data.experience_years !== null && data.experience_years !== undefined ? String(data.experience_years) : '',
        hourly_rate: data.hourly_rate !== null && data.hourly_rate !== undefined ? String(data.hourly_rate) : '',
        certifications: data.certifications || '',
        bio: data.bio || '',
      })
      if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview)
      }
      setProfileImagePreview(data.profile_picture)
      setProfileImageFile(null)
      setRemovePhoto(false)
      toastPush('success', 'Trainer profile updated')
      await refreshUser()
      if (data.specialization && !SPECIALIZATION_OPTIONS.includes(data.specialization as string)) {
        setSpecializationOptions(prev => Array.from(new Set([...prev, data.specialization as string])))
      }
    } catch (error: any) {
      console.error(error)
      const detail = error?.response?.data
      let message = 'Could not save your trainer profile. Please try again.'
      if (typeof detail === 'string') {
        message = detail
      } else if (detail && typeof detail === 'object') {
        const joined = Object.values(detail)
          .flat()
          .map(String)
          .join(' ')
        if (joined) message = joined
      }
      toastPush('error', message)
    } finally {
      setSaving(false)
    }
  }

  async function handleRespond(id: number, status: 'accepted' | 'rejected') {
    setRespondingId(id)
    try {
      const updated = await updateHiringStatus(id, status)
      setHiringRequests(prev => prev.map(h => (h.id === id ? updated : h)))
      toastPush('success', `Request ${status}`)
    } catch (error) {
      console.error(error)
      toastPush('error', 'Could not update booking status.')
    } finally {
      setRespondingId(null)
    }
  }

  async function handleOpenChat(userId: number) {
    try {
      const room = await openChatRoom({ userId })
      toastPush('success', 'Chat opened')
      navigate(`/chat?room=${room.id}`)
    } catch (error) {
      console.error(error)
      toastPush('error', 'Unable to open chat right now.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-orange-500 via-orange-400 to-teal-500 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="uppercase text-xs tracking-[0.3em] text-white/70">Trainer Hub</p>
            <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.first_name || user?.username}</h1>
            <p className="mt-2 text-white/80 max-w-2xl">
              Keep your profile up to date so clients can find you. Manage your specializations, rates and certifications from here.
            </p>
          </div>
          <div className="bg-white/15 rounded-2xl px-6 py-4 text-center backdrop-blur">
            <p className="text-sm text-white/80">Profile completeness</p>
            <p className="text-3xl font-semibold">{profileCompletion}%</p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8">
        <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Public profile details</h2>
          <p className="text-sm text-gray-600 mt-1">These details appear on the trainers marketplace.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-100 to-teal-100 text-orange-700 font-semibold grid place-items-center text-lg uppercase">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user?.first_name?.[0] || user?.username?.[0] || 'T')?.toUpperCase()
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="font-semibold text-gray-800">Profile photo</div>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {(profile?.profile_picture || profileImageFile || removePhoto) && (
                  <button type="button" onClick={handleRemovePhoto} className="text-orange-600 hover:text-orange-700 font-semibold text-xs">
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <select
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={form.specialization}
                onChange={e => setForm(prev => ({ ...prev, specialization: e.target.value }))}
              >
                {specializationOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="5"
                  value={form.experience_years}
                  onChange={e => setForm(prev => ({ ...prev, experience_years: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Session rate (INR)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1500"
                  value={form.hourly_rate}
                  onChange={e => setForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="NASM CPT, CrossFit Level 2"
                value={form.certifications}
                onChange={e => setForm(prev => ({ ...prev, certifications: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                placeholder="Share your training philosophy, signature programs, or success stories."
                value={form.bio}
                onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-6 py-3 font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Booking requests</h3>
              {hiringLoading && <span className="text-xs text-gray-500">Loading…</span>}
            </div>
            {(!hiringRequests || hiringRequests.length === 0) && !hiringLoading ? (
              <p className="text-sm text-gray-600">No booking requests yet.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-auto">
                {hiringRequests.map(req => (
                  <div key={req.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{req.user_name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : req.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{req.session_type === 'monthly' ? 'Monthly plan' : 'One-time session'}</span>
                      <span>• {new Date(req.start_date).toLocaleDateString('en-IN')}</span>
                      {req.time_slot && <span>• {req.time_slot}</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Fee</span>
                      <span className="font-semibold text-gray-800">
                        {req.amount > 0 ? formatCurrency(Number(req.amount)) : 'Not set'}
                      </span>
                    </div>
                    {req.status === 'accepted' && (
                      <div
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          req.payment_status === 'paid'
                            ? 'text-emerald-600'
                            : req.payment_status === 'failed'
                              ? 'text-red-600'
                              : 'text-orange-500'
                        }`}
                      >
                        {req.payment_status === 'paid'
                          ? 'Payment received'
                          : req.payment_status === 'failed'
                            ? 'Payment failed'
                            : 'Awaiting payment'}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRespond(req.id, 'accepted')}
                            disabled={respondingId === req.id}
                            className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-3 py-1.5 font-semibold text-xs shadow hover:from-orange-600 hover:to-teal-600 disabled:opacity-50"
                          >
                            {respondingId === req.id ? 'Saving…' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRespond(req.id, 'rejected')}
                            disabled={respondingId === req.id}
                            className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-300 px-3 py-1.5 font-semibold text-xs text-gray-700 hover:border-rose-400 hover:text-rose-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenChat(req.user)}
                          className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-800"
                        >
                          Message
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Snapshot</h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>Status</span><span>{profileCompletion >= 80 ? 'Profile ready' : 'Needs details'}</span></div>
              <div className="flex justify-between"><span>Public rate</span><span>{formatCurrency(Number(profile?.hourly_rate ?? 0))}/session</span></div>
              <div className="flex justify-between"><span>Rating</span><span>{profile?.rating ? Number(profile.rating).toFixed(1) : 'New'}</span></div>
            </div>
            <Link to="/trainers" className="mt-6 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">
              View marketplace profile
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick tips</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>• Add a strong specialization so clients find you faster.</li>
              <li>• Mention top certifications to build credibility.</li>
              <li>• Set a competitive rate in INR to attract local clients.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
