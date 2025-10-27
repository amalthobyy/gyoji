import { Dumbbell, Flame, HeartPulse, StretchHorizontal } from 'lucide-react'

const items = [
  { key: 'weight_loss', label: 'Weight Loss', icon: Flame, color: 'bg-rose-100 text-rose-700' },
  { key: 'muscle_building', label: 'Muscle Building', icon: Dumbbell, color: 'bg-indigo-100 text-indigo-700' },
  { key: 'endurance', label: 'Endurance', icon: HeartPulse, color: 'bg-emerald-100 text-emerald-700' },
  { key: 'flexibility', label: 'Flexibility', icon: StretchHorizontal, color: 'bg-amber-100 text-amber-700' },
]

export default function GoalTypeCards() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(i => {
        const Icon = i.icon
        return (
          <div key={i.key} className="bg-white rounded-xl shadow-xl p-5 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full grid place-items-center ${i.color}`}><Icon size={22} /></div>
            <p className="mt-3 font-semibold text-gray-900">{i.label}</p>
            <p className="text-sm text-gray-600">Personalized plans</p>
          </div>
        )
      })}
    </div>
  )
}
