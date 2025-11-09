import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'
import { ChatRoom, getChatRooms } from '../services/chat'
import { useAuth } from '../context/AuthContext'

export default function ChatPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeId, setActiveId] = useState<number | undefined>(undefined)
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const notificationPermissionRef = useRef<NotificationPermission | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermissionRef.current = permission
      })
    } else if ('Notification' in window) {
      notificationPermissionRef.current = Notification.permission
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const data = await getChatRooms()
        setRooms(data)
        const roomParam = searchParams.get('room')
        if (roomParam) {
          const roomId = Number(roomParam)
          const exists = data.find(r => r.id === roomId)
          setActiveId(exists ? exists.id : data[0]?.id)
        } else if (data.length > 0 && activeId === undefined) {
          setActiveId(data[0].id)
        }
      } catch (err) {
        console.error(err)
        setError('Unable to load conversations right now.')
      } finally {
        setLoading(false)
      }
    }
    load()
    
    // Refresh rooms periodically to get updated unread counts (much less frequently)
    const interval = setInterval(load, 60000) // Changed to 60 seconds to reduce load
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeId) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev)
        next.set('room', String(activeId))
        return next
      })
    }
  }, [activeId, setSearchParams])

  // Function to show browser notification
  const showNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && notificationPermissionRef.current === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'gyoji-message',
      })
    }
  }

  // Expose notification function to ChatWindow via callback
  const handleNewMessage = (message: { sender_name: string; content: string; sender_avatar?: string | null }, roomId: number) => {
    // Only show notification if not the active room
    if (roomId !== activeId) {
      showNotification(
        `New message from ${message.sender_name}`,
        message.content,
        message.sender_avatar || undefined
      )
      // Don't refresh rooms here - let the periodic refresh handle it to avoid loops
    }
  }

  const unreadTotal = rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0)

  return (
    <div className="min-h-[calc(100vh-112px)] w-full bg-gradient-to-b from-white via-white to-gray-100">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <div className="lg:hidden">
          <button
            onClick={() => setCollapsed(false)}
            className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Conversations
            {unreadTotal > 0 && (
              <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {unreadTotal > 99 ? '99+' : unreadTotal}
              </span>
            )}
          </button>
        </div>
        <ChatSidebar
          rooms={rooms}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id)
            setCollapsed(true)
          }}
          collapsed={collapsed}
          onToggle={() => setCollapsed(true)}
        />
        <div className="flex-1 min-w-0">
          <ChatWindow
            loading={loading}
            error={error}
            room={rooms.find((r) => r.id === activeId)}
            onNewMessage={handleNewMessage}
            onRoomChange={undefined}
          />
        </div>
      </div>
    </div>
  )
}
