import { useState } from 'react'

type BookingData = { session: 'one-time' | 'monthly'; date: string; time: string }
type Props = { open: boolean; onClose: () => void; onConfirm: (data: BookingData) => void; loading?: boolean }

export default function BookingModal({ open, onClose, onConfirm, loading }: Props) {
  const [session, setSession] = useState<'one-time'|'monthly'>('one-time')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5">
        <h3 className="text-lg font-semibold text-gray-900">Book a Session</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <label className="block mb-1">Session Type</label>
            <select className="border rounded-lg px-3 py-2 w-full" value={session} onChange={e=>setSession(e.target.value as any)}>
              <option value="one-time">One-time</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" className="border rounded-lg px-3 py-2 w-full" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Time Slot</label>
            <div className="flex flex-wrap gap-2">
              {['Morning', 'Afternoon', 'Evening'].map(s => (
                <button
                  key={s}
                  onClick={()=>setTime(s)}
                  className={`px-3 py-2 rounded-full text-sm font-semibold transition-all ${time===s ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">Cancel</button>
          <button
            onClick={()=>onConfirm({ session, date, time })}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white px-5 py-2 text-sm font-semibold shadow-lg hover:from-orange-600 hover:to-teal-600 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!date || !time || loading}
          >
            {loading ? 'Sending…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
