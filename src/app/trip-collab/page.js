"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_PREFIX = "tripez-collab";

export default function TripCollabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [tripName, setTripName] = useState("Kashmir Escape");
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState([
    { id: "me", name: "You", role: "Trip host", share: "100%" },
  ]);
  const [notes, setNotes] = useState("Share the itinerary, flight details, and any split costs here.");
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Hotel", amount: 3200, paidBy: "You", split: "Equally" },
    { id: 2, title: "Shikara ride", amount: 1200, paidBy: "Mina", split: "Split 2 ways" },
  ]);
  const [message, setMessage] = useState("");

  const persistState = (nextMembers, nextNotes, nextExpenses) => {
    if (typeof window !== "undefined" && userId) {
      window.localStorage.setItem(`${STORAGE_PREFIX}-${userId}`, JSON.stringify({ tripName, members: nextMembers, notes: nextNotes, expenses: nextExpenses }));
    }
  };

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

      if (typeof window !== "undefined") {
        const savedState = window.localStorage.getItem(`${STORAGE_PREFIX}-${currentUserId}`);
        if (savedState) {
          try {
            const parsed = JSON.parse(savedState);
            if (parsed) {
              setTripName(parsed.tripName || "Kashmir Escape");
              setMembers(parsed.members || [{ id: "me", name: "You", role: "Trip host", share: "100%" }]);
              setNotes(parsed.notes || "Share the itinerary, flight details, and any split costs here.");
              setExpenses(parsed.expenses || []);
            }
          } catch {
            window.localStorage.removeItem(`${STORAGE_PREFIX}-${currentUserId}`);
          }
        }
      }

      setLoading(false);
    };

    loadSession();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    persistState(members, notes, expenses);
  }, [members, notes, expenses, userId]);

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
    persistState(nextMembers, notes, expenses);
    setMessage(`Invited ${inviteEmail.trim()} to ${tripName}.`);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();
    setMessage("Shared expense updates are ready for review.");
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
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-700">Trip overview</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{tripName}</h2>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-4 min-h-28 w-full rounded-[1.25rem] border border-slate-300 bg-white px-4 py-3"
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
                <input className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" placeholder="Hotel / transport / food" />
                <input className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3" placeholder="Amount" />
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
                    <p className="font-semibold text-slate-900">₹{expense.amount.toFixed(0)}</p>
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
