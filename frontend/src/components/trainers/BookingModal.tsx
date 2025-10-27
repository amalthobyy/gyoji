import { useState } from 'react'

type Props = { open: boolean; onClose: () => void; onConfirm: (data: any) => void }

const slots = ['08:00', '09:00', '10:00', '17:00', '18:00']

export default function BookingModal({ open, onClose, onConfirm }: Props) {
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
              {slots.map(s => (
                <button key={s} onClick={()=>setTime(s)} className={`px-3 py-2 rounded-lg text-sm ${time===s ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center rounded-lg border px-4 py-2 text-sm">Cancel</button>
          <button onClick={()=>onConfirm({ session, date, time })} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm shadow hover:bg-blue-700" disabled={!date || !time}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
