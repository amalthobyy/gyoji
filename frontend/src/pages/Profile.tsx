import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/user'
import { toastPush } from '../services/toast-bridge'
import { Upload, Trash2, Image, Save, Plus, Calendar, BarChart3 } from 'lucide-react'

interface MemoryEntry {
  id: string
  title: string
  mood: string
  date: string
  tags: string[]
  notes: string
}

interface MetricEntry {
  id: string
  date: string
  weight: string
  waist: string
  bodyfat: string
  notes: string
}

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athlete']

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const location = useLocation()

  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [fitnessLevel, setFitnessLevel] = useState(user?.fitness_level || '')

  const [profilePreview, setProfilePreview] = useState<string | null>(user?.profile_picture || null)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)

  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [metrics, setMetrics] = useState<MetricEntry[]>([])

  const memoryStorageKey = useMemo(() => (user ? `gyoji.memories.${user.id}` : 'gyoji.memories'), [user?.id])
  const metricStorageKey = useMemo(() => (user ? `gyoji.metrics.${user.id}` : 'gyoji.metrics'), [user?.id])

  useEffect(() => {
    setFirstName(user?.first_name || '')
    setLastName(user?.last_name || '')
    setBio(user?.bio || '')
    setFitnessLevel(user?.fitness_level || '')
    setProfilePreview(user?.profile_picture || null)
  }, [user])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(memoryStorageKey)
      if (stored) {
        setMemories(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Unable to load memories', error)
    }
  }, [memoryStorageKey])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(metricStorageKey)
      if (stored) {
        setMetrics(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Unable to load metrics', error)
    }
  }, [metricStorageKey])

  useEffect(() => {
    localStorage.setItem(memoryStorageKey, JSON.stringify(memories))
  }, [memoryStorageKey, memories])

  useEffect(() => {
    localStorage.setItem(metricStorageKey, JSON.stringify(metrics))
  }, [metricStorageKey, metrics])

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 200)
      }
    }
  }, [location.hash])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
    setRemovePhoto(false)
  }

  function handleRemovePhoto() {
    setProfileFile(null)
    setProfilePreview(null)
    setRemovePhoto(true)
  }

  async function handleProfileSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        bio,
        fitness_level: fitnessLevel,
        profile_picture: profileFile || undefined,
        remove_profile_picture: removePhoto,
      })
      await refreshUser()
      toastPush('success', 'Profile updated successfully')
      if (!profileFile && removePhoto) {
        setProfilePreview(null)
      }
      setRemovePhoto(false)
    } catch (error) {
      console.error(error)
      toastPush('error', 'Unable to update profile right now')
    }
  }

  function handleAddMemory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const title = (formData.get('title') as string || '').trim()
    if (!title) {
      toastPush('error', 'Memory title is required')
      return
    }
    const entry: MemoryEntry = {
      id: crypto.randomUUID(),
      title,
      mood: (formData.get('mood') as string || '').trim(),
      date: (formData.get('date') as string || new Date().toISOString().slice(0, 10)),
      notes: (formData.get('notes') as string || '').trim(),
      tags: (formData.get('tags') as string || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
    }
    setMemories(prev => [entry, ...prev])
    form.reset()
    toastPush('success', 'Memory added')
  }

  function handleDeleteMemory(id: string) {
    setMemories(prev => prev.filter(entry => entry.id !== id))
  }

  function handleAddMetric(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const entry: MetricEntry = {
      id: crypto.randomUUID(),
      date: (formData.get('metric_date') as string || new Date().toISOString().slice(0, 10)),
      weight: (formData.get('weight') as string || '').trim(),
      waist: (formData.get('waist') as string || '').trim(),
      bodyfat: (formData.get('bodyfat') as string || '').trim(),
      notes: (formData.get('metric_notes') as string || '').trim(),
    }
    setMetrics(prev => [entry, ...prev])
    form.reset()
    toastPush('success', 'Measurement logged')
  }

  function handleDeleteMetric(id: string) {
    setMetrics(prev => prev.filter(entry => entry.id !== id))
  }

  return (
    <div className="space-y-10">
      <section id="profile" className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
        <form onSubmit={handleProfileSave} className="space-y-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Profile settings</h1>
              <p className="text-sm text-gray-500">Update your details, upload pictures, and personalise your journey.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:from-orange-600 hover:to-teal-600"
            >
              <Save size={16} /> Save changes
            </button>
          </header>

          <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-200 to-teal-200 shadow-md">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-orange-600">
                    {(user?.first_name || user?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-3 left-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow-md transition hover:bg-white">
                  <Upload size={14} />
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                {(profilePreview || user?.profile_picture) && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-md transition hover:bg-red-600"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>
              <p className="text-center text-xs text-gray-500">PNG or JPG up to 2MB</p>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">First name</label>
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last name</label>
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Fitness level</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FITNESS_LEVELS.map(level => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => setFitnessLevel(level)}
                      className={`rounded-full border px-4 py-1 text-sm font-medium transition ${
                        fitnessLevel === level
                          ? 'border-transparent bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow'
                          : 'border-gray-300 text-gray-700 hover:border-orange-400 hover:text-orange-500'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Tell your coach what motivates you, favourite workouts or dietary needs."
                />
              </div>
            </div>
          </div>
        </form>
      </section>

      <section id="memories" className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Memory board</h2>
              <p className="text-sm text-gray-600">Capture personal highlights and wins to stay motivated.</p>
            </div>
          </div>
          <form onSubmit={handleAddMemory} className="mt-4 grid gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</label>
                <input name="title" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="Sunrise run" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mood</label>
                <input name="mood" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="Energised" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</label>
                <input name="date" type="date" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</label>
                <input name="tags" placeholder="Cardio, Outdoor" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</label>
              <textarea name="notes" rows={3} className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="What made this session memorable?" />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-orange-600 hover:to-teal-600">
              <Plus size={16} /> Add memory
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {memories.length === 0 ? (
              <p className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">No memories yet. Record your highlights above.</p>
            ) : (
              memories.map(entry => (
                <article key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{entry.title}</h3>
                      <p className="text-xs text-gray-500">{entry.mood}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{entry.date}</span>
                  </div>
                  {entry.notes && <p className="mt-3 text-sm text-gray-600">{entry.notes}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag + entry.id} className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteMemory(entry.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-400 hover:text-red-500"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div id="metrics" className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Body measurements log</h2>
              <p className="text-sm text-gray-600">Track weight, waist, body fat and any notes.</p>
            </div>
          </div>
          <form onSubmit={handleAddMetric} className="mt-4 grid gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</label>
                <input name="metric_date" type="date" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Weight (kg)</label>
                <input name="weight" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Waist (cm)</label>
                <input name="waist" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Body fat %</label>
                <input name="bodyfat" className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Notes</label>
              <textarea name="metric_notes" rows={2} className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" placeholder="Adjusting nutrition, better sleep, etc." />
            </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-orange-600 hover:to-teal-600">
              <BarChart3 size={16} /> Log measurement
            </button>
          </form>

          <div className="mt-6 space-y-3">
            {metrics.length === 0 ? (
              <p className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">No measurements logged yet. Add a new entry above.</p>
            ) : (
              metrics.map(entry => (
                <article key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-gray-900">{entry.date}</h3>
                      <p className="text-xs text-gray-500">Weight: <span className="font-semibold text-gray-800">{entry.weight || '—'} kg</span></p>
                      <p className="text-xs text-gray-500">Waist: <span className="font-semibold text-gray-800">{entry.waist || '—'} cm</span></p>
                      <p className="text-xs text-gray-500">Body fat: <span className="font-semibold text-gray-800">{entry.bodyfat || '—'}%</span></p>
                      {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMetric(entry.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:border-red-400 hover:text-red-500"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
