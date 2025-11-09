import { useEffect, useState } from 'react'
import { DietGoal, getRecommendedSupplements, SuggestedSupplement } from '../../services/nutrition'

type Props = {
  goal: DietGoal
}

export default function Supplements({ goal }: Props) {
  const [items, setItems] = useState<SuggestedSupplement[]>([])

  useEffect(() => {
    getRecommendedSupplements(goal).then(setItems)
  }, [goal])

  return (
    <div className="mt-8">
      <h4 className="font-semibold text-gray-900 mb-3">Recommended Supplements</h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(i => (
          <div key={i.name} className="bg-white rounded-xl shadow-xl p-4">
            <p className="font-semibold text-gray-900">{i.name}</p>
            <p className="text-sm text-gray-600">{i.subtitle}</p>
            <div className="text-xs text-gray-600 mt-2">
              <p>Timing: {i.timing}</p>
              <p>Dosage: {i.dosage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
