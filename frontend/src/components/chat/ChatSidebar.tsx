import { ChatRoom } from '../../services/chat'
import { useAuth } from '../../context/AuthContext'

type Props = {
  rooms: ChatRoom[]
  activeId?: number
  onSelect: (id: number) => void
  collapsed?: boolean
  onToggle?: () => void
}

export default function ChatSidebar({ rooms, activeId, onSelect, collapsed, onToggle }: Props) {
  const { user } = useAuth()
  const displayName = user?.first_name || user?.username || 'Messages'

  const containerClasses = collapsed
    ? 'hidden lg:flex'
    : 'flex'

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside
        className={`${containerClasses} z-40 lg:z-auto w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:w-80`}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">{displayName}</p>
            {onToggle && (
              <button className="text-sm text-gray-500 hover:text-gray-900 lg:hidden" onClick={onToggle}>
                Close
              </button>
            )}
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {rooms.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No conversations yet.</div>
          ) : (
            rooms.map((room) => {
              const name = room.trainer_name || room.user_name || 'User'
              const last = room.last_message?.content || 'Start chatting'
              const avatar =
                room.trainer_avatar ||
                room.user_avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
              const unreadCount = room.unread_count || 0
              const isActive = activeId === room.id

              return (
                <button
                  key={room.id}
                  onClick={() => onSelect(room.id)}
                  className={`w-full px-5 py-4 text-left transition-colors ${
                    isActive ? 'bg-white' : 'hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={avatar} className="h-12 w-12 rounded-full object-cover" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm font-medium text-gray-900 ${isActive ? 'font-semibold' : ''}`}>
                          {name}
                        </p>
                        {room.last_message && (
                          <span className="whitespace-nowrap text-xs text-gray-400">
                            {new Date(room.last_message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                      <p className={`truncate text-xs ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {last}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
