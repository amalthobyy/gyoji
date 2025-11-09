type Props = {
  title: string
  calories: number
  image: string
  ingredients: string[]
  macros?: { protein: number; carbs: number; fat: number }
}

export default function MealCard({ title, calories, image, ingredients, macros }: Props) {
  const badge = macros
    ? [
        { label: `${macros.protein}g P`, tone: 'bg-emerald-100 text-emerald-700' },
        { label: `${macros.carbs}g C`, tone: 'bg-sky-100 text-sky-700' },
        { label: `${macros.fat}g F`, tone: 'bg-amber-100 text-amber-700' },
      ]
    : []

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <img src={image} alt={title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-gray-900">{title}</h5>
          <span className="text-sm text-gray-700">{calories} cal</span>
        </div>
        {badge.length > 0 && (
          <div className="mt-2 flex gap-2">
            {badge.map((b) => (
              <span key={b.label} className={`text-xs px-2 py-0.5 rounded-full ${b.tone}`}>{b.label}</span>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {ingredients.map(i => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{i}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
