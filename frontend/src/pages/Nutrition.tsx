import { useState } from 'react'
import MacrosPanel from '../components/nutrition/MacrosPanel'
import MealCard from '../components/nutrition/MealCard'
import Supplements from '../components/nutrition/Supplements'

const TABS = ['Weight Loss', 'Muscle Gain'] as const

export default function NutritionPage() {
  const [active, setActive] = useState<(typeof TABS)[number]>('Weight Loss')

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Nutrition & Diet Plans</h1>
        <p className="text-gray-600 mt-2">Personalized meal plans and nutrition tracking to fuel your fitness journey.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1"><MacrosPanel /></div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {TABS.map(t => (
                <button key={t} onClick={() => setActive(t)} className={`px-4 py-2 rounded-full ${active===t ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{t}</button>
              ))}
            </div>
            <span className="text-sm bg-white rounded-full shadow px-3 py-1 text-gray-700">1,500-1,800/day</span>
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <MealCard title="Breakfast" calories={350} image="https://images.unsplash.com/photo-1543339308-43fba6f1d079?q=80&w=1200&auto=format&fit=crop" ingredients={["Greek Yogurt","Berries","Granola","Honey"]} />
            <MealCard title="Lunch" calories={450} image="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1200&auto=format&fit=crop" ingredients={["Grilled Chicken","Quinoa","Vegetables","Olive Oil"]} />
            <MealCard title="Dinner" calories={400} image="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop" ingredients={["Salmon","Sweet Potato","Broccoli","Lemon"]} />
          </div>

          <button className="mt-4 inline-flex items-center rounded-lg bg-gray-800 text-white px-4 py-2 text-sm hover:bg-gray-900">Customize This Plan</button>

          <Supplements />
        </div>
      </div>
    </div>
  )
}
