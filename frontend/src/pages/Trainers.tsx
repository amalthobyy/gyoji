import { useState } from 'react'
import TrainerCard from '../components/trainers/TrainerCard'
import TrainerDetailModal from '../components/trainers/TrainerDetailModal'
import BookingModal from '../components/trainers/BookingModal'

const mock = [
  { id: 1, name: 'Alex Carter', specialization: 'Strength Training', rating: 4.8, experience: 6, rate: 40, photo: 'https://images.unsplash.com/photo-1597452485664-4b4e8bde9d78?q=80&w=1200&auto=format&fit=crop', bio: 'Certified strength coach helping clients build muscle safely and efficiently.', certifications: 'CPT, CSCS' },
  { id: 2, name: 'Mia Johnson', specialization: 'Cardio & Endurance', rating: 4.9, experience: 5, rate: 45, photo: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1200&auto=format&fit=crop', bio: 'Endurance specialist with personalized running plans and pacing strategies.', certifications: 'ACE, RRCA' },
]

export default function TrainersPage() {
  const [filters, setFilters] = useState({ specialization: '', rating: '', price: 100, availability: '' })
  const [detail, setDetail] = useState<null | number>(null)
  const [booking, setBooking] = useState<null | number>(null)

  const filtered = mock.filter(t =>
    (!filters.specialization || t.specialization === filters.specialization) &&
    (!filters.rating || t.rating >= Number(filters.rating)) &&
    t.rate <= filters.price
  )

  return (
    <div className="py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Find Your Trainer</h1>
        <p className="text-gray-600 mt-2">Browse certified trainers and book sessions at your convenience.</p>
      </div>

      <div className="bg-white rounded-xl shadow-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Specialization</label>
          <select className="border rounded-lg px-3 py-2" value={filters.specialization} onChange={e=>setFilters({...filters, specialization: e.target.value})}>
            <option value="">All</option>
            <option>Strength Training</option>
            <option>Cardio & Endurance</option>
            <option>Yoga & Flexibility</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Min Rating</label>
          <select className="border rounded-lg px-3 py-2" value={filters.rating} onChange={e=>setFilters({...filters, rating: e.target.value})}>
            <option value="">Any</option>
            <option value="4.0">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Max Price</label>
          <input type="range" min={10} max={100} value={filters.price} onChange={e=>setFilters({...filters, price: Number(e.target.value)})} />
          <div className="text-sm text-gray-700">${filters.price}/hr</div>
        </div>
        <div className="ml-auto">
          <button className="inline-flex items-center rounded-lg border px-4 py-2">Reset</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => (
          <TrainerCard key={t.id} photo={t.photo} name={t.name} specialization={t.specialization} rating={t.rating} experience={t.experience} rate={t.rate} onView={()=>setDetail(t.id)} onHire={()=>setBooking(t.id)} />
        ))}
      </div>

      {filtered.map(t => (
        <TrainerDetailModal key={`detail-${t.id}`} open={detail===t.id} onClose={()=>setDetail(null)} onHire={()=>{ setDetail(null); setBooking(t.id) }} name={t.name} photo={t.photo} bio={t.bio} certifications={t.certifications} reviews={[{ user: 'John D.', rating: 5, comment: 'Great coach!' }]} />
      ))}

      <BookingModal open={booking!==null} onClose={()=>setBooking(null)} onConfirm={(data)=>{ setBooking(null); alert('Booked!') }} />
    </div>
  )
}
