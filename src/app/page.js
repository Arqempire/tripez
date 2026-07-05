"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const features = [
  {
    title: "Smart itineraries",
    description:
      "Turn a rough idea into a day-by-day plan with stay, food, and activity suggestions.",
   // icon: "🧭",
  },
  {
    title: "Budget-aware choices",
    description:
      "Keep your trip affordable with spending estimates and recommendations that fit your style.",
    //icon: "💸",
  },
  {
    title: "Trip confidence",
    description:
      "Get packing checklists, local tips, and backup ideas that keep your plans flexible.",
    icon: "✨",
  },
];

const steps = [
  "Share your destination and travel dates",
  "Choose your vibe, pace, and budget",
  "Get a polished plan with local highlights",
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
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Checking your session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.2),_transparent_35%),linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-xl text-white shadow-lg shadow-sky-200">
            ✈
          </div>
          <span>TripEZ</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-sky-700">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-sky-700">
            How it works
          </a>
          <a
            href="#start"
            className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
          >
            Start planning
          </a>
        </nav>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-6 pb-20 pt-4 lg:px-8 lg:pt-10">
        <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-sm font-medium text-sky-700 shadow-sm">
              Your personal travel sidekick
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Plan smoother trips with less stress and more joy.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
              TripEZ helps you craft beautiful adventures around your budget, pace, and interests in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                id="start"
                href="/register"
                className="rounded-full bg-sky-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700"
              >
                Create my trip
              </a>
              <a
                href="/login"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                Log in
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              New users can register in seconds. Existing users can sign in to continue planning.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="rounded-full bg-white/80 px-3 py-2 shadow-sm">
                ✨ Fast itinerary drafts
              </div>
              <div className="rounded-full bg-white/80 px-3 py-2 shadow-sm">
                🗺️ Local recommendations
              </div>
              <div className="rounded-full bg-white/80 px-3 py-2 shadow-sm">
                🧳 Smart packing lists
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Weekend in Srinagar</span>
                <span>3 days</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Day 1</p>
                  <p className="mt-1 text-sm text-slate-300">Historic shikara ride, walk beside Dal lake, sunset at Dal lake.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Day 2</p>
                  <p className="mt-1 text-sm text-slate-300">Ride the Gondola, enjoy snow adventures, and soak in breathtaking Himalayan views.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Day 3</p>
                  <p className="mt-1 text-sm text-slate-300">Discover iconic spots like Betaab Valley, Aru Valley, and Chandanwari.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{feature.icon}</div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{feature.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </section>

        <section id="how-it-works" className="rounded-[2rem] border border-sky-100 bg-sky-50/70 p-8 shadow-sm lg:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              From idea to itinerary in a few simple steps.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                  0{index + 1}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/70 px-6 py-8 text-center text-sm text-slate-600">
        <p>TripEZ © 2026 — Made with ❤️ by ArQ & Kaiser for travelers who want better plans and fewer surprises.</p>
      </footer>
    </div>
  );
}
