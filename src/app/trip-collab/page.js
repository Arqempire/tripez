"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_PREFIX = "tripez-collab";

const persistCollabData = async (userId, tripId, data) => {
  if (typeof window !== "undefined" && userId && tripId) {
    const key = `${STORAGE_PREFIX}-store-${userId}`;
    const stored = window.localStorage.getItem(key);
    let store = {};
    try {
      store = stored ? JSON.parse(stored) : {};
    } catch {}
    store[tripId] = data;
    window.localStorage.setItem(key, JSON.stringify(store));
    
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { collab: store }
        });
      } catch (error) {
        console.error("Failed to sync collab data:", error);
      }
    }
  }
};

export default function TripCollabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  
  const [tripsList, setTripsList] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripName, setTripName] = useState("Select a trip");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState([
    { id: "me", name: "You", role: "Trip host", share: "100%" },
  ]);
  const [notes, setNotes] = useState("Share the itinerary, flight details, and any split costs here.");
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", paidBy: "You" });
  const [message, setMessage] = useState("");
  const [collabStore, setCollabStore] = useState({});

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const currentUserId = session.user.id;
      setUserId(currentUserId);

      // Fetch user's saved trips
      const { data: savedTrips } = await supabase
        .from("trips")
        .select("id, name")
        .order("created_at", { ascending: false });

      let activeTripId = "";
      if (savedTrips && savedTrips.length > 0) {
        setTripsList(savedTrips);
        activeTripId = savedTrips[0].id;
        setSelectedTripId(activeTripId);
        setTripName(savedTrips[0].name);
      }

      // Fetch collaboration metadata from user metadata
      let cloudCollabStore = session.user?.user_metadata?.collab;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.collab) {
          cloudCollabStore = user.user_metadata.collab;
        }
      } catch (err) {
        console.error("Failed to load user metadata:", err);
      }

      const activeStore = cloudCollabStore || {};
      setCollabStore(activeStore);

      if (activeTripId && activeStore[activeTripId]) {
        const tripData = activeStore[activeTripId];
        setMembers(tripData.members || [{ id: "me", name: "You", role: "Trip host", share: "100%" }]);
        setNotes(tripData.notes || "Share the itinerary, flight details, and any split costs here.");
        setExpenses(tripData.expenses || []);
      } else {
        if (typeof window !== "undefined") {
          const userStorageKey = `${STORAGE_PREFIX}-store-${currentUserId}`;
          const savedCollab = window.localStorage.getItem(userStorageKey);
          if (savedCollab) {
            try {
              const parsed = JSON.parse(savedCollab);
              if (parsed) {
                setCollabStore(parsed);
                if (activeTripId && parsed[activeTripId]) {
                  const tripData = parsed[activeTripId];
                  setMembers(tripData.members || [{ id: "me", name: "You", role: "Trip host", share: "100%" }]);
                  setNotes(tripData.notes || "Share the itinerary, flight details, and any split costs here.");
                  setExpenses(tripData.expenses || []);
                }
              }
            } catch {}
          }
        }
      }

      setLoading(false);
    };

    loadSession();
  }, [router]);

  useEffect(() => {
    if (!loading && userId && selectedTripId) {
      persistCollabData(userId, selectedTripId, { members, notes, expenses });
    }
  }, [members, notes, expenses, userId, selectedTripId, loading]);

  const handleTripChange = (tripId) => {
    setSelectedTripId(tripId);
    const selected = tripsList.find(t => t.id === tripId);
    if (selected) {
      setTripName(selected.name);
    }
    
    const tripData = collabStore[tripId] || {
      members: [{ id: "me", name: "You", role: "Trip host", share: "100%" }],
      notes: "Share the itinerary, flight details, and any split costs here.",
      expenses: []
    };
    
    setMembers(tripData.members);
    setNotes(tripData.notes);
    setExpenses(tripData.expenses);
  };

  const totalShared = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);

  const handleInvite = (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      setMessage("Please enter an email address.");
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: inviteEmail.trim(),
      role: "Companion",
      share: "Shared",
    };

    const nextMembers = [...members, newMember];
    setMembers(nextMembers);
    setInviteEmail("");
    setMessage(`Invited ${inviteEmail.trim()} to ${tripName}.`);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();

    if (!expenseForm.title.trim() || !expenseForm.amount) {
      setMessage("Please enter a title and amount for the shared expense.");
      return;
    }

    const amount = Number(expenseForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      title: expenseForm.title.trim(),
      amount,
      paidBy: expenseForm.paidBy,
      split: "Equally"
    };

    setExpenses([newExpense, ...expenses]);
    setExpenseForm({ title: "", amount: "", paidBy: "You" });
    setMessage(`Shared expense "${newExpense.title}" added.`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading trip collaboration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">Trip Collaboration</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Invite friends and share trip details</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">Coordinate travel plans, shared expenses, and trip updates with everyone on the same journey.</p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          >
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-violet-50 p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">Trip overview</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">{tripName}</h2>
                </div>
                {tripsList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trip</label>
                    <select
                      value={selectedTripId}
                      onChange={(event) => handleTripChange(event.target.value)}
                      className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-violet-500 focus:outline-none"
                    >
                      {tripsList.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full min-h-28 rounded-[1.25rem] border border-slate-300 bg-white px-4 py-3"
                placeholder="Share updates, hotel details, checkpoints, and plan notes"
              />
            </div>

            <form onSubmit={handleInvite} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Invite a friend</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="friend@example.com"
                />
                <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700">
                  Invite
                </button>
              </div>
              {message ? <p className="mt-3 text-sm text-violet-700">{message}</p> : null}
            </form>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">Travelers</p>
              <div className="mt-3 space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">{member.share}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">Shared expenses</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Keep costs transparent</h2>
            </div>

            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Total shared</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">₹{totalShared.toFixed(0)}</p>
            </div>

            <form onSubmit={handleAddExpense} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Add shared expense</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
                  <input
                    value={expenseForm.title}
                    onChange={(event) => setExpenseForm({ ...expenseForm, title: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none"
                    placeholder="Hotel / transport / food"
                  />
                </div>
                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={expenseForm.amount}
                      onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none"
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Paid By</label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(event) => setExpenseForm({ ...expenseForm, paidBy: event.target.value })}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-violet-500 focus:outline-none"
                    >
                      {members.map((member) => (
                        <option key={member.id} value={member.name}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
                  Save shared expense
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{expense.title}</p>
                      <p className="mt-1 text-sm text-slate-500">Paid by {expense.paidBy} · {expense.split}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₹{expense.amount.toFixed(0)}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setExpenses(expenses.filter((e) => e.id !== expense.id));
                          setMessage(`Removed shared expense "${expense.title}".`);
                        }}
                        className="mt-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
