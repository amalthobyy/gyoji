import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts'

type Props = {
  data: { name: string; value: number }[]
}

export default function MonthlyProgress({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-lg text-sm text-gray-500 h-56 grid place-items-center">
        Log progress updates to see your monthly momentum.
      </div>
    )
  }
  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg">
      <h4 className="mb-3 font-semibold text-gray-900">Monthly Progress</h4>
      <div className="h-60 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={48} />
            <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} width={40} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
