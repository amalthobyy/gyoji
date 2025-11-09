import { useState, useEffect } from 'react'
import { GoalType, GoalStatus, GoalPayload } from '../../services/goals'

const GOAL_OPTIONS: { value: GoalType; label: string; helper: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss', helper: 'Track kg to lose from your current weight' },
  { value: 'muscle_building', label: 'Muscle Building', helper: 'Track kg of muscle you want to gain' },
  { value: 'endurance', label: 'Endurance', helper: 'Track target finish time or distance' },
  { value: 'flexibility', label: 'Flexibility', helper: 'Track number of sessions per week' },
]

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Planned' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: GoalPayload) => Promise<void>
  submitting?: boolean
}

export default function AddGoalModal({ open, onClose, onSubmit, submitting }: Props) {
  const [goalType, setGoalType] = useState<GoalType>('weight_loss')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<GoalStatus>('active')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setGoalType('weight_loss')
      setTargetValue('')
      setCurrentValue('')
      setDeadline('')
      setStatus('active')
      setError(null)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!targetValue) {
      setError('Please specify your target value.')
      return
    }
    const payload: GoalPayload = {
      goal_type: goalType,
      target_value: Number(targetValue),
      current_value: currentValue ? Number(currentValue) : undefined,
      deadline: deadline || undefined,
      status,
    }
    try {
      setError(null)
      await onSubmit(payload)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to save goal right now.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Create a Goal</h3>
            <p className="text-sm text-gray-500">Set a measurable target and track your progress over time.</p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
        </header>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Goal focus</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGoalType(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    goalType === option.value
                      ? 'border-transparent bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg'
                      : 'border-gray-200 hover:border-orange-400 hover:text-orange-500'
                  }`}
                >
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className={`text-xs mt-1 ${goalType === option.value ? 'text-white/80' : 'text-gray-500'}`}>{option.helper}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Target value</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Example: 9"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Current progress</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-teal-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Save Goal'}
          </button>
        </div>
      </form>
    </div>
  )
}
