import { formatCurrency } from '../../utils/format'

type Review = { user: string; rating: number; comment: string }

type Props = {
  open: boolean
  onClose: () => void
  onHire?: () => void
  onMessage?: () => void
  name: string
  photo?: string
  bio?: string
  certifications?: string
  specialization?: string
  experience?: number | string
  rate?: number | string
  rating?: number | string
  reviews?: Review[]
  canHire?: boolean
}

export default function TrainerDetailModal({
  open,
  onClose,
  onHire,
  name,
  photo,
  bio,
  certifications,
  specialization,
  experience,
  rate,
  rating,
  reviews = [],
  canHire = true,
  onMessage,
}: Props) {
  if (!open) return null

  const safeRate = Number(rate || 0)
  const safeRating = Number(rating || 0)
  const safeExperience = Number(experience || 0)
  const displayBio = bio && bio.trim().length > 0 ? bio : 'This trainer is setting up their story. Reach out to learn more about them.'

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img src={photo || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop'} alt={name} className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-2xl" />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900">{name}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {specialization && <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-3 py-1">{specialization}</span>}
                {safeExperience > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-3 py-1">{safeExperience} yrs experience</span>}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1">⭐ {safeRating > 0 ? safeRating.toFixed(1) : 'New'}</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{displayBio}</p>
              {certifications && (
                <p className="text-sm text-gray-600"><span className="font-medium text-gray-800">Certifications:</span> {certifications}</p>
              )}
              <div className="text-lg font-semibold text-gray-900">Session rate: {safeRate > 0 ? `${formatCurrency(safeRate)}/session` : 'Set your rate to appear in searches'}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900">Reviews</h4>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-600 mt-2">No reviews yet. Be the first to work with this trainer!</p>
            ) : (
              <div className="mt-3 space-y-3 max-h-48 overflow-auto pr-2">
                {reviews.map((r, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 text-sm">
                    <div className="flex items-center justify-between"><span className="font-medium text-gray-900">{r.user}</span><span>⭐ {r.rating}</span></div>
                    <p className="text-gray-700 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {onMessage && (
              <button onClick={onMessage} className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">Message</button>
            )}
            <button onClick={onClose} className="inline-flex items-center rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">Close</button>
            {canHire && onHire && (
              <button onClick={onHire} className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl">Hire Trainer</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
