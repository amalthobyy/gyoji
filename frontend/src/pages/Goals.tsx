import GoalTypeCards from '../components/goals/GoalTypeCards'
import GoalCard from '../components/goals/GoalCard'
import GoalStats from '../components/goals/GoalStats'
import MonthlyProgress from '../components/goals/MonthlyProgress'

const mockGoals = [
  { name: 'Lose 20 lbs', category: 'Weight Loss', progressPercent: 65, targetLabel: '20 lbs', deadline: 'March 2025', status: 'On Track' as const },
  { name: 'Run 5K under 25 minutes', category: 'Endurance', progressPercent: 40, targetLabel: '25:00', deadline: 'April 2025', status: 'Behind' as const },
  { name: 'Bench Press 150 lbs', category: 'Strength', progressPercent: 72, targetLabel: '150 lbs', deadline: undefined, status: 'Ahead' as const },
]

export default function GoalsPage() {
  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Set & Track Your Goals</h1>
        <p className="text-gray-600 mt-2">Define clear fitness objectives and monitor your progress with our goal tracking system.</p>
      </div>

      <GoalTypeCards />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Current Goals</h2>
        <button className="inline-flex items-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700">+ Add Goal</button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {mockGoals.map(g => (
            <GoalCard key={g.name} {...g} />
          ))}
        </div>
        <div className="space-y-4">
          <GoalStats />
          <MonthlyProgress />
        </div>
      </div>
    </div>
  )
}
