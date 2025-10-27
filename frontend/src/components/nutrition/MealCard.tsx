type Props = { title: string; calories: number; image: string; ingredients: string[] }

export default function MealCard({ title, calories, image, ingredients }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <img src={image} alt={title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h5 className="font-semibold text-gray-900">{title}</h5>
          <span className="text-sm text-gray-700">{calories} cal</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ingredients.map(i => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{i}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
