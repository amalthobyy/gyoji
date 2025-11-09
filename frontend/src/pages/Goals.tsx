import { useCallback, useEffect, useMemo, useState } from 'react'
import GoalTypeCards from '../components/goals/GoalTypeCards'
import GoalCard from '../components/goals/GoalCard'
import GoalStats from '../components/goals/GoalStats'
import MonthlyProgress from '../components/goals/MonthlyProgress'
import AddGoalModal from '../components/goals/AddGoalModal'
import Skeleton from '../components/ui/Skeleton'
import { createGoal, getGoals, Goal, GoalPayload, GoalType, getProgressLogs } from '../services/goals'
import { toastPush } from '../services/toast-bridge'
import { api } from '../services/api'

const GOAL_LABELS: Record<GoalType, string> = {
  weight_loss: 'Weight Loss',
  muscle_building: 'Muscle Building',
  endurance: 'Endurance',
  flexibility: 'Flexibility',
}

const GOAL_UNITS: Record<GoalType, string> = {
  weight_loss: 'kg',
  muscle_building: 'kg',
  endurance: 'minutes',
  flexibility: 'sessions/week',
}

const STATUS_LABELS = {
  active: { label: 'In Progress', tone: 'success' as const },
  pending: { label: 'Planned', tone: 'warning' as const },
  completed: { label: 'Completed', tone: 'success' as const },
  cancelled: { label: 'Paused', tone: 'danger' as const },
}

type StatsResponse = {
  goals_completed: number
  active_goals: number
  success_rate: number
  days_streak: number
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [progressData, setProgressData] = useState<{ name: string; value: number }[]>([])
  const [filterType, setFilterType] = useState<GoalType | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [goalData, statsData, logData] = await Promise.all([
        getGoals(),
        api.get<StatsResponse>('/stats/').then((res) => res.data).catch(() => null),
        getProgressLogs().catch(() => []),
      ])
      setGoals(goalData)
      if (statsData) setStats(statsData)
      else setStats(null)
      const chart = buildProgressChart(goalData, logData)
      setProgressData(chart)
    } catch (err) {
      console.error(err)
      setError('Unable to load goals right now.')
      toastPush('error', 'Unable to load goals right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filteredGoals = useMemo(() => {
    if (!filterType) return goals
    return goals.filter((goal) => goal.goal_type === filterType)
  }, [goals, filterType])

  const goalCards = useMemo(() => {
    return filteredGoals.map((goal) => {
      const target = Number(goal.target_value) || 0
      const current = Number(goal.current_value) || 0
      const progress = target > 0 ? (current / target) * 100 : 0
      const statusMeta = STATUS_LABELS[goal.status]
      return {
        id: goal.id,
        title: formatGoalTitle(goal),
        category: GOAL_LABELS[goal.goal_type],
        targetLabel: formatTarget(goal.goal_type, target),
        progressPercent: goal.status === 'completed' ? 100 : progress,
        statusLabel: statusMeta.label,
        statusTone: statusMeta.tone,
        deadline: goal.deadline ? formatDate(goal.deadline) : undefined,
      }
    })
  }, [filteredGoals])

  const statsList = useMemo(() => {
    if (!stats) return []
    return [
      { label: 'Goals Completed', value: stats.goals_completed },
      { label: 'Active Goals', value: stats.active_goals },
      { label: 'Success Rate', value: `${Math.round(stats.success_rate)}%` },
      { label: 'Days Streak', value: stats.days_streak },
    ]
  }, [stats])

  async function handleCreateGoal(payload: GoalPayload) {
    setSaving(true)
    try {
      await createGoal(payload)
      toastPush('success', 'Goal created successfully.')
      setModalOpen(false)
      await load()
    } catch (err) {
      console.error(err)
      toastPush('error', 'Unable to create goal right now.')
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Set & Track Your Goals</h1>
        <p className="text-gray-600 mt-2">Define clear fitness objectives and monitor your progress with our goal tracking system.</p>
      </div>

      <GoalTypeCards
        activeType={filterType}
        onSelect={(type) => setFilterType((current) => (current === type ? null : type))}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Current Goals</h2>
          {filterType && <p className="text-sm text-gray-500">Showing goals focused on {GOAL_LABELS[filterType]}.</p>}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl"
        >
          + Add Goal
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-32 rounded-2xl" />)
          ) : goalCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center text-gray-600">
              You haven’t created any goals yet. Tap “Add Goal” to start.
            </div>
          ) : (
            goalCards.map((goal) => (
              <GoalCard
                key={goal.id}
                name={goal.title}
                category={goal.category}
                progressPercent={goal.progressPercent}
                targetLabel={goal.targetLabel}
                deadline={goal.deadline}
                statusLabel={goal.statusLabel}
                statusTone={goal.statusTone}
              />
            ))
          )}
        </div>
        <div className="space-y-4">
          <GoalStats stats={statsList} />
          <MonthlyProgress data={progressData} />
        </div>
      </div>

      <AddGoalModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreateGoal} submitting={saving} />
    </div>
  )
}

function formatTarget(type: GoalType, target: number) {
  if (!target) return '—'
  const unit = GOAL_UNITS[type]
  if (type === 'endurance') {
    return `${target} ${unit}`
  }
  return `${target.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`
}

function formatGoalTitle(goal: Goal) {
  const base = GOAL_LABELS[goal.goal_type]
  const target = Number(goal.target_value) || 0
  switch (goal.goal_type) {
    case 'weight_loss':
      return `Lose ${target.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`
    case 'muscle_building':
      return `Gain ${target.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg of muscle`
    case 'endurance':
      return `Endurance goal (${target} minutes)`
    case 'flexibility':
      return `Flexibility sessions (${target} weekly)`
    default:
      return base
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

function buildProgressChart(goals: Goal[], logs: { date: string; goal: number; value: string }[]) {
  if (!logs.length || !goals.length) return []
  const goalMap = new Map(goals.map((goal) => [goal.id, goal]))
  const grouped: Record<string, number[]> = {}

  logs.forEach((log) => {
    const goal = goalMap.get(log.goal)
    if (!goal) return
    const target = Number(goal.target_value) || 0
    if (!target) return
    const value = Number(log.value || goal.current_value) || 0
    const percent = Math.max(0, Math.min(100, (value / target) * 100))
    const date = new Date(log.date)
    if (Number.isNaN(date.getTime())) return
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(percent)
  })

  return Object.entries(grouped)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-6)
    .map(([key, values]) => {
      const [year, month] = key.split('-')
      const label = new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', {
        month: 'short',
        year: 'numeric',
      })
      const avg = values.reduce((acc, val) => acc + val, 0) / values.length
      return { name: label, value: Math.round(avg) }
    })
}
