type Props = {
  open: boolean
  onClose: () => void
  onHire: () => void
  name: string
  photo: string
  bio: string
  certifications: string
  reviews: { user: string; rating: number; comment: string }[]
}

export default function TrainerDetailModal({ open, onClose, onHire, name, photo, bio, certifications, reviews }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
        <div className="p-5">
          <div className="flex gap-4">
            <img src={photo} alt={name} className="w-28 h-28 object-cover rounded-lg" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
              <p className="text-gray-700 mt-2">{bio}</p>
              <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Certifications:</span> {certifications}</p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900">Reviews</h4>
            <div className="mt-2 space-y-2 max-h-48 overflow-auto pr-2">
              {reviews.map((r, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between"><span className="font-medium">{r.user}</span><span>⭐ {r.rating}</span></div>
                  <p className="text-gray-700 mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onClose} className="inline-flex items-center rounded-lg border px-4 py-2 text-sm">Close</button>
            <button onClick={onHire} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700">Hire Trainer</button>
          </div>
        </div>
      </div>
    </div>
  )
}
