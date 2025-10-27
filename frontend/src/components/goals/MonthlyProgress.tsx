import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

const data = [
  { name: 'January 2025', value: 85 },
  { name: 'December 2024', value: 92 },
  { name: 'November 2024', value: 78 },
]

export default function MonthlyProgress() {
  return (
    <div className="bg-white rounded-xl shadow-xl p-5">
      <h4 className="font-semibold mb-3 text-gray-900">Monthly Progress</h4>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit="%" domain={[0, 100]} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
