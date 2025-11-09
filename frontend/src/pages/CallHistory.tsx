import { useMemo, useState } from 'react'
import { Phone, Video, Clock, Calendar, PhoneOff } from 'lucide-react'

interface CallRecord {
  id: number
  callerName: string
  callType: 'video' | 'voice'
  duration: string
  date: string
  status: 'completed' | 'missed' | 'rejected'
}

export const CallHistory: React.FC = () => {
  const [calls] = useState<CallRecord[]>([])
  const [filter, setFilter] = useState<'all' | 'video' | 'voice'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed' | 'rejected'>('all')

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const typeMatch = filter === 'all' || call.callType === filter
      const statusMatch = statusFilter === 'all' || call.status === statusFilter
      return typeMatch && statusMatch
    })
  }, [calls, filter, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'missed':
        return 'bg-rose-100 text-rose-700'
      case 'rejected':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
            <p className="text-gray-600">Review your recent voice and video call activity.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {([
              { label: 'All', value: 'all' },
              { label: 'Video', value: 'video' },
              { label: 'Voice', value: 'voice' },
            ] as const).map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'
                }`}
              >
                {option.label}
              </button>
            ))}
            {([
              { label: 'All', value: 'all' },
              { label: 'Completed', value: 'completed' },
              { label: 'Missed', value: 'missed' },
              { label: 'Rejected', value: 'rejected' },
            ] as const).map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {filteredCalls.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-600">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 grid place-items-center">
                <PhoneOff size={20} />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No call history yet</h2>
            <p className="text-sm text-gray-600 mt-2">When you start voice or video calls with clients, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl divide-y">
            {filteredCalls.map(call => (
              <div key={call.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 grid place-items-center rounded-full ${call.callType === 'video' ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white' : 'bg-green-100 text-green-600'}`}>
                    {call.callType === 'video' ? <Video size={18} /> : <Phone size={18} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{call.callerName}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {call.callType === 'video' ? <Video size={14} /> : <Phone size={14} />}
                      <span className="capitalize">{call.callType} call</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock size={14} />
                    <span>{call.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>{formatDate(call.date)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                    {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
