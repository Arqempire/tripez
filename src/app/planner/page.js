"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const buildTripGallery = (destination = "") => {
  const lowerDestination = destination.toLowerCase();

  if (lowerDestination.includes("gulmarg") || lowerDestination.includes("snow") || lowerDestination.includes("winter")) {
    return [
      "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  if (lowerDestination.includes("srinagar") || lowerDestination.includes("dal") || lowerDestination.includes("lake")) {
    return [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    ];
  }

  return [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
  ];
};

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripName = searchParams.get("trip") || "Your trip";
  const destination = searchParams.get("destination") || tripName;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [form, setForm] = useState({
    destination: destination || tripName,
    days: "3",
    travelers: "2",
    interests: "food, culture, scenic views",
    budget: "mid-range",
    style: "balanced",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((current) => ({ ...current, destination: destination || tripName }));
  }, [destination, tripName]);

  useEffect(() => {
    const ensureSession = async () => {
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };

    ensureSession();
  }, [router]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to generate itinerary.");
      }

      setItinerary(payload.itinerary);
      setMessage("Your AI itinerary is ready.");
    } catch (error) {
      setMessage(error.message || "Unable to generate itinerary.");
    } finally {
      setGenerating(false);
    }
  };

  const gallery = useMemo(() => buildTripGallery(destination || tripName), [destination, tripName]);

  const explorerHighlights = useMemo(() => {
    const target = (destination || tripName || "travel").toLowerCase();

    if (target.includes("gulmarg")) {
      return [
        { title: "Snowy slopes", description: "Glide through alpine meadows and cable-car views." },
        { title: "Winter charm", description: "Enjoy cozy stays and warm local tea after sunset." },
        { title: "Adventure mix", description: "Ski, ride, and explore the mountain trails at your pace." },
      ];
    }

    if (target.includes("srinagar") || target.includes("dal") || target.includes("kashmir")) {
      return [
        { title: "Lakefront calm", description: "Houseboats, shikara rides, and dawn reflections." },
        { title: "Cultural layers", description: "Markets, gardens, and heritage cafés around every corner." },
        { title: "Slow luxury", description: "A laid-back journey with scenic stays and local food." },
      ];
    }

    return [
      { title: "Local favorites", description: "Discover the signature spots that define the place." },
      { title: "Scenic routes", description: "Blend iconic views with tucked-away neighborhoods." },
      { title: "Food & culture", description: "Match your stay with the best local flavours and traditions." },
    ];
  }, [destination, tripName]);

  const explorerTags = useMemo(() => {
    const target = (destination || tripName || "travel").toLowerCase();
    if (target.includes("gulmarg")) {
      return ["Snow", "Cable car", "Adventure", "Cozy stays"];
    }
    if (target.includes("srinagar") || target.includes("dal") || target.includes("kashmir")) {
      return ["Houseboats", "Shikara", "Gardens", "Street food"];
    }
    return ["Culture", "Views", "Food", "Hidden gems"];
  }, [destination, tripName]);

  const summary = useMemo(() => {
    if (!itinerary) return null;
    return {
      title: itinerary.title || `${form.destination} Adventure`,
      overview: itinerary.overview || "A tailored plan is ready.",
      days: itinerary.days || [],
      tips: itinerary.tips || [],
    };
  }, [form.destination, itinerary]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Preparing your planner...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">AI itinerary planner</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Plan {destination || tripName} with smart recommendations</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              Generate a personalized trip plan based on your destination, pace, interests, and budget.
            </p>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </a>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 shadow-lg shadow-slate-200/70">
              <div className="relative h-64 overflow-hidden">
                <img src={gallery[0]} alt={destination || tripName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-200">Destination explorer</p>
                  <h2 className="mt-2 text-2xl font-semibold">{destination || tripName}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-200">
                    Step into the place before you plan it—browse the mood, highlights, and signature experiences that make the destination special.
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {explorerTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {explorerHighlights.map((item) => (
                    <div key={item.title} className="rounded-[1.1rem] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`${destination || tripName} view ${index + 1}`}
                      className="h-24 w-full rounded-2xl object-cover shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Destination</label>
              <input
                value={form.destination}
                onChange={(event) => setForm({ ...form, destination: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Days</label>
                <input
                  type="number"
                  min="1"
                  value={form.days}
                  onChange={(event) => setForm({ ...form, days: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Travelers</label>
                <input
                  type="number"
                  min="1"
                  value={form.travelers}
                  onChange={(event) => setForm({ ...form, travelers: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Interests</label>
              <input
                value={form.interests}
                onChange={(event) => setForm({ ...form, interests: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="food, museums, nightlife"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Budget</label>
                <select
                  value={form.budget}
                  onChange={(event) => setForm({ ...form, budget: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Style</label>
                <select
                  value={form.style}
                  onChange={(event) => setForm({ ...form, style: event.target.value })}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="balanced">Balanced</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="adventurous">Adventurous</option>
                  <option value="romantic">Romantic</option>
                </select>
              </div>
            </div>

            {message ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</p> : null}

              <button
                type="submit"
                disabled={generating}
                className="w-full rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {generating ? "Generating itinerary..." : "Generate itinerary"}
              </button>
            </form>

          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6">
            {summary ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Generated plan</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">{summary.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{summary.overview}</p>
                </div>

                <div className="space-y-4">
                  {summary.days.map((day, index) => (
                    <div key={`${day.day}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Day {day.day}</p>
                      <p className="mt-1 text-base font-medium text-slate-800">{day.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{day.plan}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-950">Helpful tips</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    {summary.tips.map((tip) => (
                      <li key={tip} className="rounded-2xl bg-slate-50 px-4 py-3">{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
                Your generated itinerary will appear here after you submit the form.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading planner...</div>}>
      <PlannerContent />
    </Suspense>
  );
}
