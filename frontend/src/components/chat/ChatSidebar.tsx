type Thread = { id: string; name: string; avatar: string; last: string; unread?: number; typing?: boolean }

type Props = { threads: Thread[]; active?: string; onSelect: (id: string) => void; collapsed?: boolean; onToggle?: () => void }

export default function ChatSidebar({ threads, active, onSelect, collapsed, onToggle }: Props) {
  return (
    <aside className={`border-r bg-white ${collapsed ? 'hidden md:block md:w-72' : 'w-full md:w-72'} md:block` }>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Conversations</h3>
        <button className="md:hidden text-sm underline" onClick={onToggle}>Close</button>
      </div>
      <div className="divide-y max-h-[calc(100vh-10rem)] overflow-auto">
        {threads.map(t => (
          <button key={t.id} onClick={()=>onSelect(t.id)} className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 ${active===t.id ? 'bg-gray-50' : ''}`}>
            <img src={t.avatar} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{t.name}</p>
                {t.unread ? <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">{t.unread}</span> : null}
              </div>
              <p className="text-xs text-gray-600 truncate">{t.typing ? 'Typing…' : t.last}</p>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}
