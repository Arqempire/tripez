"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_PREFIX = "tripez-expenses";

const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  AED: "Dh",
  SGD: "S$"
};

const formatCurrency = (value, currencyCode = "INR") => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "₹";
  return `${symbol}${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const persistExpensesData = async (userId, nextExpenses, nextBudget, nextCurrency) => {
  if (typeof window !== "undefined" && userId) {
    window.localStorage.setItem(`${STORAGE_PREFIX}-${userId}`, JSON.stringify(nextExpenses));
    window.localStorage.setItem(`${STORAGE_PREFIX}-budget-${userId}`, String(nextBudget));
    window.localStorage.setItem(`${STORAGE_PREFIX}-currency-${userId}`, String(nextCurrency));
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: {
            expenses: nextExpenses,
            budget: Number(nextBudget) || 1200,
            currency: nextCurrency
          }
        });
      } catch (error) {
        console.error("Failed to sync expenses and budget with Supabase Auth:", error);
      }
    }
  }
};

export default function ExpensesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [budget, setBudget] = useState("1200");
  const [currency, setCurrency] = useState("INR");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", note: "" });
  const [message, setMessage] = useState("");

  const [rates, setRates] = useState({
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 160.5,
    CAD: 1.37,
    AUD: 1.50,
    AED: 3.67,
    SGD: 1.35
  });
  const [converterForm, setConverterForm] = useState({
    amount: "100",
    from: "USD",
    to: "INR"
  });
  const [ratesUpdated, setRatesUpdated] = useState("");

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

      // Try loading from user metadata first
      let userMetadataExpenses = session.user?.user_metadata?.expenses;
      let userMetadataBudget = session.user?.user_metadata?.budget;
      let userMetadataCurrency = session.user?.user_metadata?.currency;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          if (user.user_metadata.expenses) {
            userMetadataExpenses = user.user_metadata.expenses;
          }
          if (user.user_metadata.budget !== undefined) {
            userMetadataBudget = user.user_metadata.budget;
          }
          if (user.user_metadata.currency) {
            userMetadataCurrency = user.user_metadata.currency;
          }
        }
      } catch (err) {
        console.error("Failed to load user metadata:", err);
      }

      if (userMetadataExpenses && Array.isArray(userMetadataExpenses)) {
        setExpenses(userMetadataExpenses);
        if (userMetadataBudget !== undefined) {
          setBudget(String(userMetadataBudget));
        }
        if (userMetadataCurrency) {
          setCurrency(userMetadataCurrency);
        }
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        const savedExpenses = window.localStorage.getItem(`${STORAGE_PREFIX}-${currentUserId}`);
        const savedBudget = window.localStorage.getItem(`${STORAGE_PREFIX}-budget-${currentUserId}`);
        const savedCurrency = window.localStorage.getItem(`${STORAGE_PREFIX}-currency-${currentUserId}`);
        if (savedExpenses) {
          try {
            const parsedExpenses = JSON.parse(savedExpenses);
            setExpenses(parsedExpenses);
            const loadedBudget = savedBudget || "1200";
            setBudget(loadedBudget);
            const loadedCurrency = savedCurrency || "INR";
            setCurrency(loadedCurrency);

            // Sync to cloud metadata immediately
            await supabase.auth.updateUser({
              data: {
                expenses: parsedExpenses,
                budget: Number(loadedBudget) || 1200,
                currency: loadedCurrency
              }
            });
            setLoading(false);
            return;
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
    if (!loading && userId) {
      persistExpensesData(userId, expenses, budget, currency);
    }
  }, [expenses, budget, currency, userId, loading]);

  useEffect(() => {
    let active = true;
    const fetchRates = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        if (active && data && data.rates) {
          setRates(data.rates);
          setRatesUpdated(new Date().toLocaleDateString());
        }
      } catch (err) {
        console.warn("Using fallback exchange rates:", err);
      }
    };
    fetchRates();
    return () => {
      active = false;
    };
  }, []);

  const convertedValue = useMemo(() => {
    const amt = Number(converterForm.amount) || 0;
    const fromRate = rates[converterForm.from] || 1;
    const toRate = rates[converterForm.to] || 1;
    const inUsd = amt / fromRate;
    return inUsd * toRate;
  }, [converterForm, rates]);

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
    setForm({ title: "", amount: "", category: form.category, note: "" });
    setMessage("Expense added to your tracker.");
  };

  const handleRemoveExpense = (expenseId) => {
    const nextExpenses = expenses.filter((expense) => expense.id !== expenseId);
    setExpenses(nextExpenses);
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
          <div className="space-y-6">
            <div className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Budget overview</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Stay on top of your trip costs</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Base</label>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm border border-amber-100">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Remaining</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(remainingBudget, currency)}</p>
                </div>
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
                <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(totalExpenses, currency)}</p>
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

          <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Currency Converter</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Quick convert</h3>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-3 grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={converterForm.amount}
                    onChange={(event) => setConverterForm({ ...converterForm, amount: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">From</label>
                  <select
                    value={converterForm.from}
                    onChange={(event) => setConverterForm({ ...converterForm, from: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">To</label>
                  <select
                    value={converterForm.to}
                    onChange={(event) => setConverterForm({ ...converterForm, to: event.target.value })}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-sky-400 focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="SGD">SGD (S$)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 text-center border border-sky-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-400">Converted Amount</p>
                <p className="mt-1 text-2xl font-bold text-sky-800">
                  {Number(converterForm.amount || 0).toLocaleString()} {converterForm.from} = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {converterForm.to}
                </p>
                {ratesUpdated && (
                  <p className="mt-2 text-2xs text-slate-400">Live rates retrieved on {ratesUpdated}</p>
                )}
              </div>
            </div>
          </div>
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
                        <p className="font-semibold text-slate-900">{formatCurrency(expense.amount, currency)}</p>
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
