import { useState } from 'react';
import { formatCurrency } from '../../utils/format';

type Props = {
  photo?: string | null
  name: string
  specialization?: string | null
  rating?: number | string | null
  experience?: number | string | null
  rate?: number | string | null
  onView: () => void
  onHire?: () => void
  disableHire?: boolean
}

export default function TrainerCard({ photo, name, specialization, rating, experience, rate, onView, onHire, disableHire = false }: Props) {
  const [imageSrc, setImageSrc] = useState(photo || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop');
  const safeRating = Number(rating ?? 0)
  const safeExperience = Number(experience ?? 0)
  const safeRate = Number(rate ?? 0)
  const canHire = Boolean(onHire && !disableHire)

  return (
    <article className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <img
        src={imageSrc}
        alt={name}
        className="h-48 w-full object-cover"
        onError={() => setImageSrc('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop')}
      />
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{specialization || 'Certified Personal Trainer'}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <span className="flex items-center gap-1"><span role="img" aria-label="rating">⭐</span> {safeRating > 0 ? safeRating.toFixed(1) : 'New'}</span>
          <span>{safeExperience > 0 ? `${safeExperience} yrs` : 'New trainer'}</span>
          <span>{safeRate > 0 ? `${formatCurrency(safeRate)}/session` : 'Rate on request'}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onView}
            className="inline-flex items-center rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-gray-800 transition-colors"
          >
            View
          </button>
          {canHire && (
            <button
              onClick={onHire}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl"
            >
              Hire Trainer
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
