type Item = { name: string; subtitle: string; timing: string; dosage: string }

const items: Item[] = [
  { name: 'Whey Protein', subtitle: 'Muscle Recovery', timing: 'Post-workout', dosage: '25g' },
  { name: 'Creatine', subtitle: 'Strength & Power', timing: 'Pre/Post workout', dosage: '5g' },
  { name: 'Multivitamin', subtitle: 'General Health', timing: 'With breakfast', dosage: '1 tablet' },
  { name: 'Omega-3', subtitle: 'Heart Health', timing: 'With meals', dosage: '1000mg' },
]

export default function Supplements() {
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
