type Props = {
  image: string
  title: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: number
  calories: string
  equipment: string
  exercises: string[]
  videoUrl?: string
}

export default function WorkoutCard({ image, title, difficulty, duration, calories, equipment, exercises, videoUrl }: Props) {
  const badge = difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' : difficulty === 'Intermediate' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
  const disabled = !videoUrl

  return (
    <article className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="relative">
        <img src={image} alt={title} className="h-48 w-full object-cover" />
        <button
          type="button"
          className={`absolute inset-0 grid place-items-center text-white/90 hover:text-white transition ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          onClick={() => {
            if (disabled) return
            window.open(videoUrl, '_blank', 'noopener')
          }}
        >
          <span className="w-12 h-12 rounded-full bg-black/50 grid place-items-center">
            ▶
          </span>
        </button>
        <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${badge}`}>{difficulty}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">⏱ {duration} min</div>
          <div className="flex items-center gap-1">⚡ {calories}</div>
        </div>
        <p className="text-sm text-gray-600 mt-2">Equipment: {equipment || 'Bodyweight'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {exercises.map(e => (
            <span key={e} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{e}</span>
          ))}
          {exercises.length === 0 && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Follow along</span>}
        </div>
        <button
          type="button"
          onClick={() => {
            if (disabled) return
            window.open(videoUrl, '_blank', 'noopener')
          }}
          disabled={disabled}
          className={`mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm self-start transition ${
            disabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          Start Workout
        </button>
      </div>
    </article>
  )
}
