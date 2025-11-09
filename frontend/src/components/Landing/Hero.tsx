import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-orange-100 px-5 py-2.5 text-sm font-semibold text-orange-700 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Transform Your Fitness Journey
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Meet Your Perfect{' '}
            <span className="block mt-2">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Fitness
              </span>{' '}
              <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
                Trainer
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="mb-10 mx-auto max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl md:text-2xl">
            Connect with certified trainers who understand your goals. Get personalized
            workouts, real-time guidance, and achieve results faster than ever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link to="/trainers">
              <Button variant="gradient" size="xl" className="group gap-2">
                Find Your Trainer
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="group gap-2 border-gray-300">
              <Play className="h-5 w-5 fill-current" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-extrabold text-orange-500 sm:text-6xl md:text-7xl">
                500+
              </div>
              <div className="mt-3 text-base font-semibold text-gray-700 sm:text-lg">
                Certified Trainers
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-extrabold text-orange-500 sm:text-6xl md:text-7xl">
                50K+
              </div>
              <div className="mt-3 text-base font-semibold text-gray-700 sm:text-lg">
                Active Members
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 text-5xl font-extrabold text-orange-500 sm:text-6xl md:text-7xl">
                4.9
                <svg className="h-8 w-8 fill-orange-500 sm:h-10 sm:w-10" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
              <div className="mt-3 text-base font-semibold text-gray-700 sm:text-lg">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
