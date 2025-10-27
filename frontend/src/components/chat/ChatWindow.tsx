import { useEffect, useMemo, useRef, useState } from 'react'
import { Phone, Video } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { useWebRTC } from '../../hooks/useWebRTC'
import { CallInterface } from '../call/CallInterface'
import { IncomingCallModal } from '../call/IncomingCallModal'
import { CallData } from '../../hooks/useWebRTC'

type Msg = { id: number; me?: boolean; name: string; avatar: string; time: string; text: string }

type Props = { roomId?: string }

export default function ChatWindow({ roomId }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const me = { name: 'You', avatar: 'https://i.pravatar.cc/40?img=1' }
  const other = { name: 'Trainer', avatar: 'https://i.pravatar.cc/40?img=2' }

  const {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
  } = useWebRTC()

  useEffect(() => {
    if (!roomId) return
    const url = `ws://${location.hostname}:8000/ws/chat/${roomId}/`
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.typing) {
        setTyping(true)
        setTimeout(()=>setTyping(false), 1200)
        return
      }
      if (data.type === 'call-offer') {
        setIncomingCall({
          roomId: roomId,
          callerId: data.callerId || 'trainer',
          callerName: other.name,
          callType: data.callType || 'video',
        })
        return
      }
      setMessages((prev) => [...prev, { id: Date.now(), name: other.name, avatar: other.avatar, time: new Date().toLocaleTimeString(), text: data.content }])
    }
    ws.onclose = () => { wsRef.current = null }
    return () => ws.close()
  }, [roomId])

  useEffect(() => {
    const el = document.getElementById('chat-scroll')
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  function send() {
    if (!text.trim()) return
    setMessages((prev) => [...prev, { id: Date.now(), me: true, name: me.name, avatar: me.avatar, time: new Date().toLocaleTimeString(), text }])
    wsRef.current?.send(JSON.stringify({ message: text }))
    setText('')
  }

  function onTyping() {
    wsRef.current?.send(JSON.stringify({ typing: true }))
  }

  const handleStartCall = (callType: 'video' | 'voice') => {
    if (roomId) {
      startCall(roomId, callType)
    }
  }

  const handleAcceptCall = (callType: 'video' | 'voice') => {
    if (incomingCall) {
      answerCall(incomingCall.roomId, incomingCall as any, callType)
      setIncomingCall(null)
    }
  }

  const handleRejectCall = () => {
    wsRef.current?.send(JSON.stringify({ type: 'call-reject' }))
    setIncomingCall(null)
  }

  if (!roomId) return <div className="flex-1 grid place-items-center text-gray-600">Select a conversation</div>

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-50 rounded-xl shadow-xl">
        {/* Call Controls */}
        <div className="p-3 border-b bg-white rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Call {other.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStartCall('voice')}
              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Voice call"
            >
              <Phone size={16} />
            </button>
            <button
              onClick={() => handleStartCall('video')}
              className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              title="Video call"
            >
              <Video size={16} />
            </button>
          </div>
        </div>

        <div id="chat-scroll" className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map(m => (
            <MessageBubble key={m.id} me={m.me} name={m.name} avatar={m.avatar} time={m.time} text={m.text} />
          ))}
          {typing && <div className="text-xs text-gray-500">Trainer is typing…</div>}
        </div>
        <div className="p-3 border-t bg-white rounded-b-xl flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} onInput={onTyping} onKeyDown={e=>{ if (e.key==='Enter') send() }} className="flex-1 border rounded-lg px-3 py-2" placeholder="Type a message" />
          <button onClick={send} className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700">Send</button>
        </div>
      </div>

      {/* Call Interface */}
      <CallInterface
        callState={callState}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onEndCall={endCall}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callerName={other.name}
      />

      {/* Incoming Call Modal */}
      <IncomingCallModal
        callData={incomingCall}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
    </>
  )
}
