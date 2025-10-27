type Props = {
  photo: string
  name: string
  specialization: string
  rating: number
  experience: number
  rate: number
  onView: () => void
  onHire: () => void
}

export default function TrainerCard({ photo, name, specialization, rating, experience, rate, onView, onHire }: Props) {
  return (
    <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <img src={photo} alt={name} className="h-40 w-full object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{specialization}</p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
          <span>⭐ {rating.toFixed(1)}</span>
          <span>{experience} yrs</span>
          <span>${rate}/hr</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={onView} className="inline-flex items-center rounded-lg bg-gray-800 text-white px-3 py-2 text-sm shadow hover:bg-gray-900">View</button>
          <button onClick={onHire} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-3 py-2 text-sm shadow hover:bg-blue-700">Hire Trainer</button>
        </div>
      </div>
    </article>
  )
}
