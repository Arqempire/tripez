"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_PREFIX = "tripez-expenses";

const formatCurrency = (value) => `₹${Number(value).toFixed(0)}`;

export default function ExpensesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [budget, setBudget] = useState("1200");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", note: "" });
  const [message, setMessage] = useState("");

  const persistExpenses = (nextExpenses) => {
    if (typeof window !== "undefined" && userId) {
      window.localStorage.setItem(`${STORAGE_PREFIX}-${userId}`, JSON.stringify(nextExpenses));
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
        const savedExpenses = window.localStorage.getItem(`${STORAGE_PREFIX}-${currentUserId}`);
        if (savedExpenses) {
          try {
            setExpenses(JSON.parse(savedExpenses));
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
    persistExpenses(expenses);
  }, [expenses, userId]);

  const handleAddExpense = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.amount) {
      setMessage("Add an expense name and amount first.");
      return;
    }

    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setMessage("Enter a valid expense amount.");
      return;
    }

    const nextExpenses = [
      {
        id: Date.now(),
        title: form.title.trim(),
        amount,
        category: form.category,
        note: form.note.trim(),
      },
      ...expenses,
    ];

    setExpenses(nextExpenses);
    persistExpenses(nextExpenses);
    setForm({ title: "", amount: "", category: form.category, note: "" });
    setMessage("Expense added to your tracker.");
  };

  const handleRemoveExpense = (expenseId) => {
    const nextExpenses = expenses.filter((expense) => expense.id !== expenseId);
    setExpenses(nextExpenses);
    persistExpenses(nextExpenses);
    setMessage("Expense removed.");
  };

  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
  const remainingBudget = Number(budget || 0) - totalExpenses;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Preparing your expense tracker...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">Expense Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Keep your trip spending in check</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">Track travel purchases, compare them against your budget, and see where your money is going.</p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
          >
            <span aria-hidden="true">←</span>
            <span>Back to dashboard</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-amber-50 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Budget overview</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Stay on top of your trip costs</h2>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining</p>
                <p className="text-lg font-semibold text-slate-900">{formatCurrency(remainingBudget)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="text-sm text-slate-500">Trip budget</p>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3"
                  placeholder="1200"
                />
              </div>
              <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4">
                <p className="text-sm text-slate-500">Spent so far</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 rounded-[1.25rem] border border-slate-200 bg-white p-4">
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Expense title</label>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="Hotel"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, amount: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  >
                    <option value="Food">Food</option>
                    <option value="Stay">Stay</option>
                    <option value="Transport">Transport</option>
                    <option value="Activities">Activities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                  <input
                    value={form.note}
                    onChange={(event) => setForm((currentForm) => ({ ...currentForm, note: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                    placeholder="Breakfast, tickets, etc."
                  />
                </div>
              </div>

              {message ? <p className="text-sm text-amber-700">{message}</p> : null}

              <button type="submit" className="w-full rounded-full bg-amber-600 px-5 py-3 font-semibold text-white transition hover:bg-amber-700">
                Add expense
              </button>
            </form>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">Expense log</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Your recent spending</h2>
            </div>

            {expenses.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                No expenses added yet. Start logging your trip costs.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{expense.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{expense.category}</p>
                        {expense.note ? <p className="mt-1 text-sm text-slate-500">{expense.note}</p> : null}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
                        <button type="button" onClick={() => handleRemoveExpense(expense.id)} className="mt-2 text-sm font-semibold text-rose-600">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
