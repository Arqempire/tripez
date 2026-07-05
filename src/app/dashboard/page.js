"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const TRIP_STORAGE_KEY = "tripez-trips";

const buildTripGallery = (destination) => {
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

const buildTripImage = (destination) => buildTripGallery(destination)[0];

const defaultTrips = [
  {
    id: "kashmir-1",
    name: "Kashmir Autumn Escape",
    destination: "Kashmir, India",
    dates: "Oct 12 - Oct 18",
    travelers: "2",
    interests: "houseboats, apple orchards, photography",
    notes: "Focus on scenic drives and slow mornings.",
    image: buildTripImage("Kashmir houseboats Dal Lake"),
    gallery: buildTripGallery("Kashmir houseboats Dal Lake"),
  },
  {
    id: "kashmir-2",
    name: "Gulmarg Adventure",
    destination: "Gulmarg, Kashmir",
    dates: "Dec 2 - Dec 6",
    travelers: "4",
    interests: "skiing, cable car, local food",
    notes: "Great for a short winter trip with outdoor fun.",
    image: buildTripImage("Gulmarg Kashmir snow mountains"),
    gallery: buildTripGallery("Gulmarg Kashmir snow mountains"),
  },
  {
    id: "kashmir-3",
    name: "Dal Lake Weekend",
    destination: "Srinagar, Kashmir",
    dates: "Mar 14 - Mar 17",
    travelers: "2",
    interests: "shikara ride, markets, cafe hopping",
    notes: "Perfect for a relaxed cultural break.",
    image: buildTripImage("Srinagar Kashmir lake houseboats"),
    gallery: buildTripGallery("Srinagar Kashmir lake houseboats"),
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    destination: "",
    dates: "",
    travelers: "2",
    interests: "",
    notes: "",
  });

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "your account";
      setUserName(profileName);
      setLoading(false);
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTrips = window.localStorage.getItem(TRIP_STORAGE_KEY);
    if (savedTrips) {
      try {
        const parsedTrips = JSON.parse(savedTrips);
        if (parsedTrips?.length) {
          setTrips(parsedTrips);
          return;
        }
      } catch {
        window.localStorage.removeItem(TRIP_STORAGE_KEY);
      }
    }

    setTrips(defaultTrips);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const handleCreateTrip = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.destination.trim()) {
      setMessage("Please add a trip name and destination before saving.");
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: form.name.trim(),
      destination: form.destination.trim(),
      dates: form.dates.trim(),
      travelers: form.travelers.trim(),
      interests: form.interests.trim(),
      notes: form.notes.trim(),
      image: buildTripImage(form.destination.trim()),
      gallery: buildTripGallery(form.destination.trim()),
    };

    setTrips((currentTrips) => [newTrip, ...currentTrips]);
    setForm({
      name: "",
      destination: "",
      dates: "",
      travelers: "2",
      interests: "",
      notes: "",
    });
    setMessage("Trip created. You can generate an itinerary for it now.");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Preparing your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Welcome back, {userName}</h1>
            <p className="mt-3 text-lg text-slate-600">
              Create trips and generate AI-powered itineraries for each one.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSignOut}
              className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/documents" className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">📄</div>
                  <div>
                    <p className="text-sm font-semibold text-sky-700">Document Vault</p>
                    <p className="text-sm text-slate-600">Store booking and travel files</p>
                  </div>
                </div>
              </Link>

              <Link href="/expenses" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">💸</div>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Expense Tracker</p>
                    <p className="text-sm text-slate-600">Track travel spending and stay on budget</p>
                  </div>
                </div>
              </Link>
            </div>

            <Link href="/trip-collab" className="flex items-center justify-between rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">🤝</div>
                <div>
                  <p className="text-sm font-semibold text-violet-700">Trip Collaboration</p>
                  <p className="text-sm text-slate-600">Invite friends and share trip details</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-violet-700">Open</span>
            </Link>

            <form onSubmit={handleCreateTrip} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Create a trip</h2>
              <p className="mt-1 text-sm text-slate-600">Save a trip first, then open the planner for it.</p>
            </div>

            {message ? <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</p> : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Trip name</label>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Summer in Tokyo"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Destination</label>
              <input
                value={form.destination}
                onChange={(event) => setForm({ ...form, destination: event.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Tokyo, Japan"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Dates</label>
                <input
                  type="date"
                  value={form.dates}
                  onChange={(event) => setForm({ ...form, dates: event.target.value })}
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
                placeholder="food, nightlife, museums"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="min-h-24 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3"
                placeholder="Any preferences or must-sees?"
              />
            </div>

              <button
                type="submit"
                className="w-full rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700"
              >
                Save trip
              </button>
            </form>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Your trips</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a trip to generate a personalized itinerary.</p>
            </div>

            {trips.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No trips yet. Create one to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => {
                  const isExpanded = activeTripId === trip.id;
                  const gallery = trip.gallery || [trip.image].filter(Boolean);

                  return (
                    <div
                      key={trip.id}
                      className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => setActiveTripId(isExpanded ? null : trip.id)}
                      >
                        {trip.image ? (
                          <img
                            src={trip.image}
                            alt={trip.destination}
                            className="h-36 w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-950">{trip.name}</h3>
                              <p className="mt-1 text-sm text-slate-600">{trip.destination}</p>
                              <p className="mt-2 text-sm text-slate-500">
                                {trip.dates || "Dates to be set"} · {trip.travelers || "1"} traveler{trip.travelers === "1" ? "" : "s"}
                              </p>
                            </div>
                            <Link
                              href={`/planner?trip=${encodeURIComponent(trip.name)}`}
                              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                              onClick={(event) => event.stopPropagation()}
                            >
                              Plan trip
                            </Link>
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="border-t border-slate-200 bg-white/70 p-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-800">Explore more views</p>
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-sky-700">
                              Tap to close
                            </span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {gallery.map((image, index) => (
                              <img
                                key={`${trip.id}-${index}`}
                                src={image}
                                alt={`${trip.destination} view ${index + 1}`}
                                className="h-20 w-full rounded-xl object-cover"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
