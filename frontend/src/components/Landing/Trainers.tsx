import { useMemo, useState } from 'react'

const CATEGORIES = [
  { key: 'strength', label: 'Strength Training' },
  { key: 'cardio', label: 'Cardio & Endurance' },
  { key: 'yoga', label: 'Yoga & Flexibility' },
]

const MOCK = [
  { id: 1, name: 'Alex Carter', category: 'strength', image: 'https://images.unsplash.com/photo-1597452485664-4b4e8bde9d78?q=80&w=1200&auto=format&fit=crop' },
  { id: 2, name: 'Mia Johnson', category: 'cardio', image: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1200&auto=format&fit=crop' },
  { id: 3, name: 'Liam Brooks', category: 'yoga', image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1200&auto=format&fit=crop' },
]

export default function Trainers() {
  const [filter, setFilter] = useState('strength')
  const list = useMemo(() => MOCK.filter(t => t.category === filter), [filter])

  return (
    <section id="trainers" className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">Meet Our Certified Trainers</h2>
        <p className="text-center text-gray-600 mt-2">Choose from our network of experienced trainers.</p>

        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`px-4 py-2 rounded-full transition ${filter===c.key ? 'bg-blue-600 text-white shadow' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >{c.label}</button>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(t => (
            <article key={t.id} className="group rounded-2xl overflow-hidden shadow-xl transition bg-white">
              <div className="relative">
                <img src={t.image} alt={t.name} className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 text-xs bg-blue-600 text-white px-2 py-1 rounded-md capitalize">{CATEGORIES.find(c=>c.key===t.category)?.label}</span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg text-gray-900">{t.name}</h3>
                <button className="mt-3 inline-flex items-center rounded-lg px-4 py-2 bg-gray-800 text-white text-sm shadow hover:bg-gray-900">View Profile</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
