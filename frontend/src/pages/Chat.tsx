import { useState } from 'react'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatWindow from '../components/chat/ChatWindow'

const threads = [
  { id: '1', name: 'Alex Carter', avatar: 'https://i.pravatar.cc/40?img=14', last: 'See you at 6 PM!', unread: 2 },
  { id: '2', name: 'Mia Johnson', avatar: 'https://i.pravatar.cc/40?img=18', last: 'Great job today!', typing: true },
]

export default function ChatPage() {
  const [active, setActive] = useState<string | undefined>('1')
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="py-6 flex gap-4">
      <div className="md:hidden">
        <button onClick={()=>setCollapsed(false)} className="inline-flex items-center rounded-lg border px-3 py-2 text-sm">Conversations</button>
      </div>
      <ChatSidebar threads={threads} active={active} onSelect={(id)=>{ setActive(id); setCollapsed(true) }} collapsed={collapsed} onToggle={()=>setCollapsed(true)} />
      <ChatWindow roomId={active} />
    </div>
  )
}
