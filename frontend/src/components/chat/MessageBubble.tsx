type Props = { me?: boolean; name: string; avatar?: string | null; time: string; text: string }

const fallbackAvatar = (name: string) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`

export default function MessageBubble({ me, name, avatar, time, text }: Props) {
  const img = avatar && avatar.length > 0 ? avatar : fallbackAvatar(name)
  return (
    <div className={`flex gap-2 ${me ? 'justify-end' : ''}`}>
      {!me && <img src={img} className="w-8 h-8 rounded-full object-cover" />}
      <div className={`max-w-[75%] ${me ? 'text-right' : 'text-left'}`}>
        <div className="mb-1 text-xs text-gray-500">{name} • {time}</div>
        <div className={`rounded-3xl px-4 py-2 text-sm shadow-sm ${
          me
            ? 'bg-gradient-to-r from-orange-500 to-teal-500 text-white'
            : 'border border-gray-200 bg-gray-100 text-gray-900'
        }`}>{text}</div>
      </div>
      {me && <img src={img} className="w-8 h-8 rounded-full object-cover" />}
    </div>
  )
}
