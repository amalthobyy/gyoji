import { useEffect, useMemo, useRef, useState } from 'react'
import { Phone, Video } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useWebRTC } from '../../hooks/useWebRTC'
import { CallInterface } from '../call/CallInterface'
import { IncomingCallModal } from '../call/IncomingCallModal'
import { CallData } from '../../hooks/useWebRTC'
import { ChatMessage, ChatRoom, getRoomMessages, markMessagesAsRead } from '../../services/chat'
import { useAuth } from '../../context/AuthContext'

type Props = {
  room?: ChatRoom
  loading?: boolean
  error?: string | null
  onNewMessage?: (message: { sender_name: string; content: string; sender_avatar?: string | null }, roomId: number) => void
  onRoomChange?: () => void
}

export default function ChatWindow({ room, loading, error, onNewMessage, onRoomChange }: Props) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  const {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
    registerMessageSender,
    handleCallSignaling,
  } = useWebRTC()

  const counterpart = useMemo(() => {
    if (!room || !user) return { name: 'Trainer', avatar: null }
    const isTrainer = user.role === 'trainer'
    return isTrainer
      ? { name: room.user_name, avatar: room.user_avatar }
      : { name: room.trainer_name, avatar: room.trainer_avatar }
  }, [room, user])

  useEffect(() => {
    if (!room) {
      setMessages([])
      return
    }
    
    let timeoutId: NodeJS.Timeout | null = null
    
    // Load messages from API when room changes
    async function load() {
      try {
        const data = await getRoomMessages(room.id)
        // Ensure all messages have proper sender IDs as numbers
        const normalizedMessages = data.map(msg => ({
          ...msg,
          sender: Number(msg.sender),
          content: msg.content || '' // Ensure content is always a string
        }))
        setMessages(normalizedMessages)
        // Mark messages as read when room is selected (only once, debounced)
        // Clear any existing timeout to avoid multiple calls
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        timeoutId = setTimeout(() => {
          markMessagesAsRead(room.id).catch(() => {
            // Silently fail - already handled in markMessagesAsRead
          })
        }, 1000) // Wait 1 second before marking as read
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }
    load()
    
    // Cleanup timeout on unmount or room change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [room?.id]) // Removed onRoomChange from dependencies to avoid loops

  useEffect(() => {
    if (!room) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('access')
    if (!token) {
      console.error('No access token found')
      return
    }
    
    // Create WebSocket URL with token
    const wsUrl = `ws://${location.hostname}:8000/ws/chat/${room.id}/?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    
    ws.onopen = () => {
      console.log('WebSocket connected for room', room.id)
      
      // Register message sender with WebRTC hook
      registerMessageSender((data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data))
        }
      })
    }
    
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        
        // Handle connection confirmation
        if (data.type === 'connection') {
          console.log('WebSocket connection confirmed')
          return
        }
        
        // Handle typing indicators
        if (data.type === 'typing') {
          setTyping(true)
          setTimeout(() => setTyping(false), 1200)
          return
        }
        
        // Handle call signaling - route to WebRTC hook first
        if (['call-offer', 'call-answer', 'ice-candidate', 'call-end', 'call-reject'].includes(data.type)) {
          // Handle call-offer separately to show incoming call modal
          if (data.type === 'call-offer') {
            setIncomingCall({
              roomId: String(room.id),
              callerId: data.callerId || String(data.sender || ''),
              callerName: counterpart.name,
              callType: data.callType || 'video',
              offer: data.offer,
            })
          }
          
          // Route all call signaling to WebRTC hook
          handleCallSignaling(data)
          return
        }
        
        // Handle incoming messages
        // Accept messages with type 'message' OR with an id field (from serializer)
        if (data.type === 'message' || (data.id && data.content !== undefined)) {
          // Ensure message has all required fields, especially content
          // The content field is critical - check multiple possible sources
          const messageContent = data.content || data.message || ''
          
          // Only skip if it's explicitly a message type without content
          // If it has an id, it's from the database and should have content
          if (!messageContent && data.type === 'message' && !data.id) {
            console.warn('Received message without content:', data)
            return
          }
          
          // Ensure we have a valid message ID
          if (!data.id) {
            console.warn('Received message without ID:', data)
            return
          }
          
          const messageData: ChatMessage = {
            id: data.id,
            chat_room: data.chat_room || room?.id || 0,
            sender: Number(data.sender), // Ensure sender is a number
            sender_name: data.sender_name || 'Unknown',
            sender_avatar: data.sender_avatar || null,
            content: messageContent,
            timestamp: data.timestamp || new Date().toISOString(),
            is_read: data.is_read || false,
          }
          
          // Debug log to see what we're receiving
          console.log('Received message via WebSocket:', {
            id: messageData.id,
            sender: messageData.sender,
            content: messageData.content,
            sender_name: messageData.sender_name,
            isMyMessage: Number(messageData.sender) === Number(user?.id),
            user_id: user?.id
          })
          
          // Check if message already exists to avoid duplicates
          // Also check for temporary messages from the same sender with same content
          setMessages((prev) => {
            // Check by ID first
            const existsById = prev.some(m => m.id === messageData.id)
            if (existsById) return prev
            
            // If this is a message from the current user, check for temporary messages
            // with the same content and sender to replace them
            // Use Number() for consistent comparison
            if (Number(messageData.sender) === Number(user?.id)) {
              // Find and remove temporary messages with same content and sender
              const filtered = prev.filter(m => {
                // Keep messages that don't match this one
                if (m.id === messageData.id) return false
                // Remove temporary messages from same sender with same content
                if (String(m.id).startsWith('temp_') && 
                    Number(m.sender) === Number(messageData.sender) && 
                    m.content === messageData.content) {
                  return false
                }
                return true
              })
              return [...filtered, messageData]
            }
            
            // For messages from other users, just add if not exists
            return [...prev, messageData]
          })
          
          // Show notification if message is from someone else and not in active room
          if (Number(messageData.sender) !== Number(user?.id) && room && onNewMessage) {
            onNewMessage(
              {
                sender_name: messageData.sender_name,
                content: messageData.content,
                sender_avatar: messageData.sender_avatar,
              },
              room.id
            )
          }
          
          // Mark as read if this is the active room (silently, don't show errors)
          // Don't trigger onRoomChange here to avoid infinite loops
          if (room && Number(messageData.sender) !== Number(user?.id)) {
            markMessagesAsRead(room.id).catch(() => {
              // Silently fail - already handled in markMessagesAsRead
            })
          }
          
          return
        }
        
        // Handle errors
        if (data.error) {
          console.error('WebSocket error:', data.error)
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket closed for room', room.id)
      wsRef.current = null
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      // Unregister message sender
      registerMessageSender(() => {})
    }
  }, [room?.id, counterpart.name, registerMessageSender, handleCallSignaling])

  useEffect(() => {
    const el = document.getElementById('chat-scroll')
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  function send() {
    if (!text.trim() || !room || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not ready')
      return
    }
    
    const messageContent = text.trim()
    const tempId = `temp_${Date.now()}_${user?.id || 0}`
    
    // Optimistically add message to UI (will be replaced by server response)
    const meMessage: ChatMessage = {
      id: tempId as any, // Temporary ID
      chat_room: room.id,
      sender: Number(user?.id) || 0, // Ensure sender is a number
      sender_name: user?.first_name || user?.username || 'You',
      sender_avatar: user?.profile_picture || null,
      content: messageContent,
      timestamp: new Date().toISOString(),
      is_read: false,
    }
    setMessages((prev) => [...prev, meMessage])
    setText('')
    
    // Send message via WebSocket
    wsRef.current.send(JSON.stringify({ 
      type: 'message',
      message: messageContent
    }))
    
    // Also reload messages from API after a short delay to ensure consistency
    // This is a fallback in case WebSocket doesn't deliver the message
    setTimeout(async () => {
      if (room) {
        try {
          const data = await getRoomMessages(room.id)
          const normalizedMessages = data.map(msg => ({
            ...msg,
            sender: Number(msg.sender),
            content: msg.content || ''
          }))
          setMessages(normalizedMessages)
        } catch (err) {
          console.error('Error reloading messages:', err)
        }
      }
    }, 2000) // Wait 2 seconds then reload to catch any missed messages
  }

  function onTyping() {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing' }))
    }
  }

  const handleStartCall = async (callType: 'video' | 'voice') => {
    if (!room || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot start call: WebSocket not ready')
      return
    }
    try {
      await startCall(String(room.id), callType)
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const handleAcceptCall = async (callType: 'video' | 'voice') => {
    if (!incomingCall || !incomingCall.offer) {
      console.error('Cannot answer call: No offer received')
      return
    }
    try {
      await answerCall(incomingCall.roomId, incomingCall.offer, callType)
      setIncomingCall(null)
    } catch (error) {
      console.error('Error answering call:', error)
      setIncomingCall(null)
    }
  }

  const handleRejectCall = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'call-reject' }))
    }
    setIncomingCall(null)
  }

  if (loading) {
    return <div className="flex-1 grid place-items-center text-gray-500">Loading messages…</div>
  }

  if (error) {
    return <div className="flex-1 grid place-items-center text-red-600 text-sm">{error}</div>
  }

  if (!room) return <div className="flex-1 grid place-items-center text-gray-600">Select a conversation</div>

  return (
    <>
      <div className="flex h-full min-h-[65vh] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={counterpart.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(counterpart.name)}`}
              alt={counterpart.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">{counterpart.name}</p>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartCall('voice')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
              title="Voice call"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={() => handleStartCall('video')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 text-white shadow-sm transition-all hover:from-orange-600 hover:to-teal-600"
              title="Video call"
            >
              <Video size={16} />
            </button>
          </div>
        </div>

        <div id="chat-scroll" className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-gray-500">No messages yet. Say hello!</div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => {
                const isMyMessage = Number(m.sender) === Number(user?.id)
                return (
                  <MessageBubble
                    key={m.id}
                    me={isMyMessage}
                    name={isMyMessage ? (user?.first_name || user?.username || 'You') : counterpart.name}
                    avatar={isMyMessage ? user?.profile_picture || '' : counterpart.avatar || ''}
                    time={new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    text={m.content}
                  />
                )
              })}
            </div>
          )}
          {typing && <div className="mt-3 text-center text-xs text-gray-500">{counterpart.name} is typing…</div>}
        </div>

        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onInput={onTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              className="flex-1 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
              placeholder="Message..."
            />
            <button
              onClick={send}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-orange-600 hover:to-teal-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <CallInterface
        callState={callState}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callerName={counterpart.name}
      />

      <IncomingCallModal
        callData={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </>
  )
}
