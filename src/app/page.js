"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

// Custom SVG Icons for Features and branding
const SparklesIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 3.874 4.276.622-3.094 3.016.73 4.258L12 14.758l-3.824 2.012.73-4.258-3.094-3.016 4.276-.622z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 11h8v4h-8z" />
    <path d="M22 10a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2" />
  </svg>
);

const UsersCollabIcon = () => (
  <svg className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LogoIcon = () => (
  <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
  </svg>
);

const features = [
  {
    title: "Smart AI Itineraries",
    description:
      "Turn a rough destination idea into a curated day-by-day plan with stay, dining, and scenic recommendations.",
    icon: <SparklesIcon />,
    colorClass: "bg-sky-50 text-sky-600 border-sky-100/50"
  },
  {
    title: "Budget-Aware Tracking",
    description:
      "Keep your expenses organized. Log spending, view statistical breakdowns, and split costs to stay on budget.",
    icon: <WalletIcon />,
    colorClass: "bg-amber-50 text-amber-600 border-amber-100/50"
  },
  {
    title: "Real-Time Collaboration",
    description:
      "Coordinate with friends easily. Invite collaborators to plan dates, delegate vault files, and vote on activities.",
    icon: <UsersCollabIcon />,
    colorClass: "bg-violet-50 text-violet-600 border-violet-100/50"
  },
];

const steps = [
  "Share your destination and trip dates",
  "Customize your vibe, travelers count, and budget limit",
  "Acquire a polished, collaborative AI travel dashboard",
];

export default function Home() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      if (!supabase) {
        setCheckingSession(false);
        return;
      }

      // password recovery link
      if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        setCheckingSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session?.user) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/reset-password");
      } else if (session?.user) {
        // Double checking hash parameters to prevent overriding recovery redirects
        if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
          return;
        }
        router.replace("/dashboard");
      }
    }) || { data: { subscription: null } };

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
  }, [router]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Immersive Travel Destination Background */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Scenic Travel Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Soft sky-gradient overlay for high readability and palette consistency */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.93)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-xs" />
      </div>
      
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 border-b border-slate-200/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sky-100">
              <LogoIcon />
            </div>
            <span>TripEZ</span>
          </div>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-sky-700 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-sky-700 transition hidden sm:inline">
              How it works
            </a>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2 text-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 shadow-xs transition"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto flex max-w-7xl flex-col gap-20 px-6 pb-20 pt-10 lg:px-8 lg:pt-16">
        
        {/* Section 1: Hero Block */}
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/70 px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs">
              <span className="animate-pulse">✈</span> AI-Powered Travel Assistant
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
              Plan smoother trips with <span className="bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">less stress</span> and more joy.
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
              TripEZ helps you craft beautiful travel plans around your budget, pace, and interests. Generate custom itineraries, manage expenses, and collaborate with your group in real-time.
            </p>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="rounded-2xl bg-gradient-to-r from-slate-900 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold px-8 py-3.5 shadow-lg shadow-sky-100 hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-0.5"
              >
                Start Planning Free
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-slate-300 hover:border-sky-300 bg-white text-slate-700 hover:text-sky-700 font-bold px-8 py-3.5 shadow-xs transition-all duration-300 text-center transform hover:-translate-y-0.5"
              >
                Log In
              </Link>
            </div>
            
            <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 bg-white/70 border border-slate-100 rounded-full px-3 py-1.5 shadow-xs">
                ✨ Live AI Itineraries
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 border border-slate-100 rounded-full px-3 py-1.5 shadow-xs">
                  Expense Analytics
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 border border-slate-100 rounded-full px-3 py-1.5 shadow-xs">
                  Group Syncing
              </span>
            </div>
          </div>

          {/* Hero Right Mockup Panel */}
          <div className="relative rounded-[2.25rem] border border-slate-200 bg-white/70 p-5 shadow-2xl shadow-slate-200/50 backdrop-blur-md">
            
            {/* App Frame Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 px-2">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span className="h-3 w-3 rounded-full bg-slate-200" />
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
                http://tripezz.netlify.app/
              </div>
              <span className="w-8" />
            </div>

            {/* Central Mockup Workspace */}
            <div className="relative bg-slate-950 rounded-[1.5rem] p-5 text-white overflow-hidden shadow-inner min-h-[290px] flex flex-col justify-between">
              
              {/* Background Glows */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mockup Trip Info Header */}
              <div className="relative flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-white/5 pb-2.5">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <svg className="h-3.5 w-3.5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
                  </svg>
                  Srinagar, Kashmir
                </span>
                <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-semibold text-[9px]">
                  3 Days Draft Plan
                </span>
              </div>

              {/* Day slots timeline */}
              <div className="relative mt-3 space-y-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 1: Historic Dal Lake</p>
                  <p className="text-[11px] text-slate-300 line-clamp-1">Historic shikara ride, walks beside Dal Lake, and a mountain sunset view.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 2: Gondola Snow Adventure</p>
                  <p className="text-[11px] text-slate-300 line-clamp-1">Ride the high Gondola, ski in snowy meadows, and snap alpine photos.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 3: Scenic Valley Trek</p>
                  <p className="text-[11px] text-slate-300 line-clamp-1">Explore Betaab Valley, hike pines of Aru, and visit saffron farms.</p>
                </div>
              </div>
            </div>

            {/* Floating Widget 1: Expense breakdown */}
            <div className="absolute -left-12 -bottom-23 bg-white/95 border border-slate-200/70 p-4 rounded-2xl shadow-xl w-48 backdrop-blur-md hidden sm:block hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12" />
                    <path d="M6 8h12" />
                    <path d="m6 13 8.5 8" />
                    <path d="M6 13h3a4 4 0 0 0 0-8" />
                  </svg>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Expenses</p>
                  <p className="text-xs font-bold text-slate-900">Remaining Budget</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Spent: ₹32,400</span>
                  <span className="text-emerald-600">₹12,600 Left</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[72%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Floating Widget 2: Collaborators */}
            <div className="absolute -right-12 -top-10 bg-white/95 border border-slate-200/70 p-4 rounded-2xl shadow-xl w-52 backdrop-blur-md hidden sm:block hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner shrink-0">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Collab Status</p>
                  <p className="text-xs font-bold text-slate-900">Trip Members</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  <div className="h-6 w-6 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
                    AR
                  </div>
                  <div className="h-6 w-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
                    KS
                  </div>
                  <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
                    JD
                  </div>
                </div>
                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Sync Active
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Features Grid */}
        <section id="features" className="space-y-10 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Explore Capabilities</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for perfect journeys.
            </h2>
            <p className="text-sm text-slate-500">
              TripEZ coordinates all aspects of your travel planning inside one visual board.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article 
                key={feature.title} 
                className="group rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.colorClass} shadow-inner group-hover:scale-105 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3: How it Works timeline */}
        <section id="how-it-works" className="rounded-3xl border border-sky-100 bg-sky-50/50 p-8 sm:p-12 shadow-xs space-y-12 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Simple workflow</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              From draft idea to itinerary in 3 steps.
            </h2>
            <p className="text-sm text-slate-500">
              Our automated generator builds customized dashboards based on quick parameters.
            </p>
          </div>

          <div className="relative mt-8 grid gap-8 md:grid-cols-3">
            {/* Timeline connector line */}
            <div className="absolute top-10 left-10 right-10 h-0.5 bg-sky-200/50 -z-10 hidden md:block" />

            {steps.map((step, index) => (
              <div 
                key={step} 
                className="bg-white/80 border border-slate-200/70 p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative flex flex-col gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md shadow-sky-100">
                  0{index + 1}
                </div>
                <p className="text-sm font-semibold text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Final Bottom CTA */}
        <section className="rounded-[2.5rem] border border-sky-200/20 bg-gradient-to-tr from-sky-600 to-indigo-600 p-8 sm:p-14 text-center text-white shadow-xl shadow-sky-100/50 relative overflow-hidden">
          {/* Decorative glows inside CTA banner */}
          <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to organize your next adventure?</h2>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-semibold opacity-90">
              Join thousands of travelers who plan customized itineraries, balance expense budgets, and collaborate with travel groups using TripEZ.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link 
                href="/register" 
                className="rounded-2xl bg-white hover:bg-slate-50 text-sky-700 font-bold px-8 py-3.5 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Plan Your First Trip
              </Link>
              <Link 
                href="/login" 
                className="rounded-2xl border border-white/30 hover:border-white hover:bg-white/10 text-white font-bold px-8 py-3.5 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer block */}
      <footer className="border-t border-slate-200/80 bg-white/70 px-6 py-10 text-center text-xs font-semibold text-slate-500">
        <p>TripEZ © 2026 — Crafted with ❤️ by ArQ & Kaiser for travel enthusiasts seeking fewer surprises.</p>
      </footer>
    </div>
  );
}
