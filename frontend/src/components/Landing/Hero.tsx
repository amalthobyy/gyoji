import { Play, Search, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 pb-10 md:pt-20 md:pb-16">
      <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
            Transform Your
            <br />
            Fitness Journey
          </h1>
          <p className="mt-4 text-gray-600 max-w-prose">
            Connect with certified personal trainers, set achievable goals, and access personalized workout and
            nutrition plans.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href="#trainers" className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-6 py-3 shadow hover:bg-blue-700 transition">
              <Search size={18} /> Find Your Trainer
            </a>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-full border-2 border-gray-300 text-gray-700 px-6 py-3 hover:bg-gray-50 transition">
              <Play size={18} /> Watch Demo
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Star className="text-amber-500" size={18} /><span>4.9/5 Rating</span></div>
            <div className="flex items-center gap-2"><span className="font-semibold">10k+</span> Members</div>
            <div className="flex items-center gap-2"><span className="font-semibold">Certified</span> Trainers</div>
          </div>
        </div>

        <div className="order-1 md:order-2 relative">
          <div className="relative rounded-2xl shadow-xl overflow-hidden bg-white">
            <img
              src="https://images.unsplash.com/photo-1599058917480-5c6e9cbb0d2c?q=80&w=1600&auto=format&fit=crop"
              onError={(e)=>{(e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/800x480?text=Fitness'}}
              alt="Workout"
              className="w-full h-[320px] md:h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="absolute left-4 bottom-6 md:left-6 md:bottom-8">
            <div className="backdrop-blur-md bg-white/90 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-[float_6s_ease-in-out_infinite]">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white grid place-items-center text-xs">500+</div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Success Stories</p>
                <p className="text-xs text-gray-600">Achieved their goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1.05); } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      `}</style>
    </section>
  )
}
