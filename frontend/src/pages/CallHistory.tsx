import React, { useState } from 'react';
import { Phone, Video, Clock, Calendar, Filter } from 'lucide-react';

interface CallRecord {
  id: string;
  callerName: string;
  callerAvatar: string;
  callType: 'video' | 'voice';
  duration: string;
  date: string;
  status: 'completed' | 'missed' | 'rejected';
}

const mockCallHistory: CallRecord[] = [
  {
    id: '1',
    callerName: 'Sarah Johnson',
    callerAvatar: 'https://i.pravatar.cc/40?img=1',
    callType: 'video',
    duration: '12:34',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '2',
    callerName: 'Mike Chen',
    callerAvatar: 'https://i.pravatar.cc/40?img=2',
    callType: 'voice',
    duration: '08:45',
    date: '2024-01-14',
    status: 'completed',
  },
  {
    id: '3',
    callerName: 'Emma Wilson',
    callerAvatar: 'https://i.pravatar.cc/40?img=3',
    callType: 'video',
    duration: '00:00',
    date: '2024-01-13',
    status: 'missed',
  },
  {
    id: '4',
    callerName: 'David Brown',
    callerAvatar: 'https://i.pravatar.cc/40?img=4',
    callType: 'voice',
    duration: '00:00',
    date: '2024-01-12',
    status: 'rejected',
  },
];

export const CallHistory: React.FC = () => {
  const [calls] = useState<CallRecord[]>(mockCallHistory);
  const [filter, setFilter] = useState<'all' | 'video' | 'voice'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'missed' | 'rejected'>('all');

  const filteredCalls = calls.filter(call => {
    const typeMatch = filter === 'all' || call.callType === filter;
    const statusMatch = statusFilter === 'all' || call.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Call History</h1>
          <p className="text-gray-600">View your past video and voice calls</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Call Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex space-x-2">
                {['all', 'video', 'voice'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex space-x-2">
                {['all', 'completed', 'missed', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call History List */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Phone size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No calls found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <div key={call.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Caller Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={call.callerAvatar}
                        alt={call.callerName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{call.callerName}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {call.callType === 'video' ? (
                            <Video size={14} />
                          ) : (
                            <Phone size={14} />
                          )}
                          <span className="capitalize">{call.callType} call</span>
                        </div>
                      </div>
                    </div>

                    {/* Call Details */}
                    <div className="flex items-center space-x-6">
                      {/* Duration */}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{call.duration}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(call.date)}</span>
                      </div>

                      {/* Status */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {calls.filter(c => c.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed Calls</div>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {calls.filter(c => c.status === 'missed').length}
            </div>
            <div className="text-sm text-gray-600">Missed Calls</div>
          </div>
          <div className="bg-white rounded-xl shadow-xl p-6 text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {calls.filter(c => c.callType === 'video').length}
            </div>
            <div className="text-sm text-gray-600">Video Calls</div>
          </div>
        </div>
      </div>
    </div>
  );
};
