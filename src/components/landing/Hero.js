import Link from "next/link";
import Image from "next/image";
import DashboardMockup from "./DashboardMockup";

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      {/* Immersive Travel Destination Background */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft sky-gradient overlay for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.93)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-[2px]" />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] pt-4 sm:pt-6">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/70 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-sm">
            <span className="animate-pulse" aria-hidden="true">✈</span> AI-Powered Travel Assistant
          </span>
          <h1 id="hero-heading" className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
            Plan smoother trips with <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">less stress</span> and more joy.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
            TripEZ helps you craft travel plans around your budget, pace, and interests. Generate custom itineraries, manage expenses, and collaborate with your group in real-time.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-gradient-to-r from-slate-900 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold px-8 py-3.5 shadow-lg shadow-sky-100 hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Start Planning Free
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-slate-300 hover:border-sky-300 bg-white text-slate-700 hover:text-sky-700 font-bold px-8 py-3.5 shadow-sm transition-all duration-300 text-center transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Log In
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/60 rounded-full px-3.5 py-1.5 shadow-sm">
              ✨ Live AI Itineraries
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/60 rounded-full px-3.5 py-1.5 shadow-sm">
              Expense Analytics
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/60 rounded-full px-3.5 py-1.5 shadow-sm">
              Group Syncing
            </span>
          </div>
        </div>

        {/* Hero Right Mockup Panel */}
        <DashboardMockup />
      </div>
    </section>
  );
}
