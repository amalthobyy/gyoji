type Props = { me?: boolean; name: string; avatar: string; time: string; text: string }

export default function MessageBubble({ me, name, avatar, time, text }: Props) {
  return (
    <div className={`flex gap-2 ${me ? 'justify-end' : ''}`}>
      {!me && <img src={avatar} className="w-8 h-8 rounded-full" />}
      <div className={`max-w-[75%] ${me ? 'text-right' : 'text-left'}`}>
        <div className="text-xs text-gray-500 mb-1">{name} • {time}</div>
        <div className={`rounded-2xl px-3 py-2 shadow ${me ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white rounded-bl-sm'}`}>{text}</div>
      </div>
      {me && <img src={avatar} className="w-8 h-8 rounded-full" />}
    </div>
  )
}
