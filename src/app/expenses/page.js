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

// Inline SVG Icon components for unified sidebar navigation
const LogoIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const ExpenseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3a4 4 0 0 0 0-8" />
  </svg>
);

const CollabIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const getInitials = (name) => {
  if (!name) return "TE";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : "TE";
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
  const [userName, setUserName] = useState("");
  const [budget, setBudget] = useState("1200");
  const [currency, setCurrency] = useState("INR");
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "Food", note: "" });
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    amount: "1",
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
      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "your account";
      setUserId(currentUserId);
      setUserName(profileName);

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
  
  // fetching live currency conversion rates from free open access API
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

  const spentPercentage = useMemo(() => {
    const b = Number(budget) || 0;
    if (b <= 0) return 0;
    return (totalExpenses / b) * 100;
  }, [totalExpenses, budget]);

  const categoryTotals = useMemo(() => {
    const totals = { Food: 0, Stay: 0, Transport: 0, Activities: 0, Other: 0 };
    expenses.forEach((expense) => {
      const cat = expense.category || "Other";
      if (totals[cat] !== undefined) {
        totals[cat] += expense.amount;
      } else {
        totals.Other += expense.amount;
      }
    });
    return totals;
  }, [expenses]);

  const donutSegments = useMemo(() => {
    let accumulatedPercent = 0;
    const colors = {
      Food: "#10b981",       // emerald-500
      Stay: "#0ea5e9",       // sky-500
      Transport: "#6366f1",  // indigo-500
      Activities: "#f59e0b", // amber-500
      Other: "#94a3b8"       // slate-400
    };

    return Object.entries(categoryTotals)
      .map(([category, amount]) => {
        if (amount === 0 || totalExpenses === 0) return null;
        const percentage = (amount / totalExpenses) * 100;
        const strokeLength = (percentage / 100) * 238.8;
        const startAngle = (accumulatedPercent / 100) * 360 - 90;
        accumulatedPercent += percentage;

        return {
          category,
          amount,
          percentage,
          strokeLength,
          startAngle,
          color: colors[category] || "#94a3b8"
        };
      })
      .filter(Boolean);
  }, [categoryTotals, totalExpenses]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Preparing expense tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased">
      
      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-white/70 border-r border-slate-200/60 backdrop-blur-md p-6 z-30">
        <div className="space-y-8">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 hover:opacity-85 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-sky-100">
              <LogoIcon />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">TripEZ</span>
          </Link>

          <nav className="space-y-1.5 font-sans">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <DashboardIcon />
              <span className="text-sm">Dashboard</span>
            </Link>
            
            <Link href="/documents" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <DocumentIcon />
              <span className="text-sm">Document Vault</span>
            </Link>

            <Link href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
              <ExpenseIcon />
              <span className="text-sm">Expense Tracker</span>
            </Link>

            <Link href="/trip-collab" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <CollabIcon />
              <span className="text-sm">Collaboration</span>
            </Link>

            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <SettingsIcon />
              <span className="text-sm">Settings</span>
            </Link>
          </nav>
        </div>

        {/* User profile bottom item */}
        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
              <p className="text-sm font-bold text-slate-900 truncate" title={userName}>{userName}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-5 left-4 right-4 bg-white/90 backdrop-blur-lg border border-slate-200/60 px-4 py-2.5 rounded-3xl flex items-center justify-around md:hidden z-40 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <DashboardIcon />
          <span>Dashboard</span>
        </Link>
        <Link href="/documents" className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <DocumentIcon />
          <span>Vault</span>
        </Link>
        <Link href="/expenses" className="flex flex-col items-center gap-1 text-[10px] font-bold text-sky-600 transition-colors">
          <ExpenseIcon />
          <span>Expenses</span>
        </Link>
        <Link href="/trip-collab" className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <CollabIcon />
          <span>Collab</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
          <SettingsIcon />
          <span>Settings</span>
        </Link>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 md:pl-64 pt-6 md:pt-0 pb-24 md:pb-8 min-h-screen">
        <div className="px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl space-y-8">
            
            {/* Header Block */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 shadow-inner text-xl">
                  ₹
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Expense Tracker</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Trip Expenses</h1>
                </div>
              </div>
            </div>

            <div className="bg-white/40 border border-slate-200/50 p-4 sm:p-6 rounded-[2rem] shadow-sm backdrop-blur-md">
              <p className="text-sm font-semibold text-slate-600 leading-relaxed max-w-3xl">
                Keep travel purchases cataloged, balance costs against budgets, and convert foreign currency conversions instantly in one workspace.
              </p>
            </div>

            {/* Primary grid panels */}
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              
              {/* Budget Overview Form */}
              <div className="space-y-6">
                <div className="space-y-6 rounded-3xl border border-slate-200/70 bg-amber-50/40 p-6 shadow-xl shadow-amber-100/10 backdrop-blur-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Budget Panel</p>
                      <h2 className="text-lg font-bold text-slate-900 mt-1 tracking-tight">Financial Overview</h2>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-1.5 focus-within:ring-2 focus-within:ring-amber-200/50 transition">
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-4 appearance-none"
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
                        <span className="absolute right-2 top-2.5 text-slate-400 pointer-events-none">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>

                      <div className="rounded-xl bg-white px-4 py-2.5 shadow-xs border border-amber-200/50 min-w-28 text-right shrink-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Remaining</p>
                        <p className={`text-base font-bold mt-0.5 ${remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatCurrency(remainingBudget, currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-4">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip Budget</label>
                      <input
                        type="number"
                        min="0"
                        value={budget}
                        onChange={(event) => setBudget(event.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4.5 py-2.5 text-sm font-semibold outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                        placeholder="1200"
                      />
                    </div>
                    <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 flex flex-col justify-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spent So Far</p>
                      <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(totalExpenses, currency)}
                      </p>
                    </div>
                  </div>

                  {/* Visual Budget Progress & Categories Graphic Card */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white p-5 space-y-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Progress</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {spentPercentage.toFixed(0)}% of your budget used
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                        <p className={`text-xs font-extrabold mt-0.5 ${remainingBudget < 0 ? 'text-rose-600' : spentPercentage > 85 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {remainingBudget < 0 ? 'Over budget!' : spentPercentage > 85 ? 'Running low' : 'On Track'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out bg-[linear-gradient(90deg,_#38bdf8_0%,_#4f46e5_100%)] ${
                          remainingBudget < 0 
                            ? 'from-rose-500 to-red-600' 
                            : spentPercentage > 85 
                              ? 'from-amber-500 to-orange-600' 
                              : 'from-sky-400 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, spentPercentage)}%` }}
                      />
                    </div>

                    {/* Indicators */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-600 pt-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${remainingBudget < 0 ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                        <span>Spent: {formatCurrency(totalExpenses, currency)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {remainingBudget < 0 ? (
                          <>
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            <span className="text-rose-600 font-bold">Overspent by {formatCurrency(Math.abs(remainingBudget), currency)}</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="text-emerald-600 font-bold">Remaining: {formatCurrency(remainingBudget, currency)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Circular Categories Donut Chart & Legend */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category Breakdown</p>
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Donut Chart (SVG) */}
                        <div className="relative h-28 w-28 shrink-0 flex items-center justify-center bg-slate-50/50 rounded-full border border-slate-100 shadow-inner">
                          <svg className="h-full w-full" viewBox="0 0 100 100">
                            {/* Empty track */}
                            <circle
                              cx="50"
                              cy="50"
                              r="38"
                              className="stroke-slate-100"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            {/* Segmented arcs */}
                            {donutSegments.map((seg) => (
                              <circle
                                key={seg.category}
                                cx="50"
                                cy="50"
                                r="38"
                                stroke={seg.color}
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${seg.strokeLength} 238.8`}
                                transform={`rotate(${seg.startAngle} 50 50)`}
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out"
                              />
                            ))}
                          </svg>
                          {/* Total inside center */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 overflow-hidden">
                            <span className="text-[11px] font-black text-slate-900 leading-none truncate max-w-[80px]">
                              {formatCurrency(totalExpenses, currency)}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              Total
                            </span>
                          </div>
                        </div>

                        {/* Category List and Percentages Grid */}
                        <div className="flex-1 min-w-0 grid grid-cols-2 gap-3.5 w-full">
                          {Object.entries(categoryTotals).map(([cat, amt]) => {
                            const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                            const colors = {
                              Food: "bg-emerald-500",
                              Stay: "bg-sky-500",
                              Transport: "bg-indigo-500",
                              Activities: "bg-amber-500",
                              Other: "bg-slate-400"
                            };

                            return (
                              <div key={cat} className="flex items-start gap-2 min-w-0">
                                <span className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${colors[cat] || "bg-slate-400"}`} />
                                <div className="min-w-0">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">{cat}</p>
                                  <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                                    {formatCurrency(amt, currency)}
                                  </p>
                                  <p className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">
                                    {pct.toFixed(0)}%
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Expense Mini-form */}
                  <form onSubmit={handleAddExpense} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Expense Title</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100/60 transition-all duration-200">
                          <input
                            value={form.title}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, title: event.target.value }))}
                            className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none"
                            placeholder="e.g. Hotel stay, Flight"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Amount ({CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.INR})</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100/60 transition-all duration-200">
                          <input
                            type="number"
                            min="0"
                            value={form.amount}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, amount: event.target.value }))}
                            className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none"
                            placeholder="120"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Category</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100/60 transition-all duration-200">
                          <select
                            value={form.category}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, category: event.target.value }))}
                            className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                          >
                            <option value="Food">Food</option>
                            <option value="Stay">Stay</option>
                            <option value="Transport">Transport</option>
                            <option value="Activities">Activities</option>
                            <option value="Other">Other</option>
                          </select>
                          <span className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Notes</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100/60 transition-all duration-200">
                          <input
                            value={form.note}
                            onChange={(event) => setForm((currentForm) => ({ ...currentForm, note: event.target.value }))}
                            className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none"
                            placeholder="e.g. Dinner at Dal lake, taxi fare"
                          />
                        </div>
                      </div>
                    </div>

                    {message ? (
                      <p className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-100 animate-fade-in">{message}</p>
                    ) : null}

                    <button 
                      type="submit" 
                      className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Add Purchase
                    </button>
                  </form>
                </div>

                {/* Currency Converter */}
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Currency Converter</p>
                    <h3 className="text-base font-bold text-slate-900 mt-1 tracking-tight">Convert Values Instantly</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3.5 grid-cols-3">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Amount</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                          <input
                            type="number"
                            min="0"
                            value={converterForm.amount}
                            onChange={(event) => setConverterForm({ ...converterForm, amount: event.target.value })}
                            className="w-full px-3 py-2 bg-transparent text-xs font-semibold text-slate-900 outline-none"
                            placeholder="100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">From</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                          <select
                            value={converterForm.from}
                            onChange={(event) => setConverterForm({ ...converterForm, from: event.target.value })}
                            className="w-full pl-3 pr-6 py-2 bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
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
                          <span className="absolute right-2 top-2.5 text-slate-400 pointer-events-none">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">To</label>
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                          <select
                            value={converterForm.to}
                            onChange={(event) => setConverterForm({ ...converterForm, to: event.target.value })}
                            className="w-full pl-3 pr-6 py-2 bg-transparent text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
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
                          <span className="absolute right-2 top-2.5 text-slate-400 pointer-events-none">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-4 text-center shadow-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Converted Amount</p>
                      <p className="mt-1 text-xl font-bold text-sky-800 tracking-tight leading-none">
                        {Number(converterForm.amount || 0).toLocaleString()} {converterForm.from} = {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {converterForm.to}
                      </p>
                      {ratesUpdated && (
                        <p className="mt-2 text-[9px] font-semibold text-slate-400">Rates updated on {ratesUpdated}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Recent Spending list */}
              <section className="space-y-6">
                <div className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Expense Ledger
                      <span className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                        {expenses.length}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Scrollable history of itemized costs on your adventure board.</p>
                  </div>

                  {expenses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                      <svg className="h-10 w-10 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold">No expenses logged yet</p>
                      <p className="text-xs text-slate-400 mt-1">Record hotel bookings or meal costs on the left.</p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1 pt-2">
                      {expenses.map((expense) => (
                        <div 
                          key={expense.id} 
                          className="rounded-2xl border border-slate-200 bg-white p-4.5 flex items-center justify-between hover:shadow-md transition-all duration-300 shadow-xs group"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-900">{expense.title}</p>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                              <span className="bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">{expense.category}</span>
                              {expense.note ? <span className="truncate max-w-[200px]">{expense.note}</span> : null}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <p className="text-base font-bold text-slate-900 tracking-tight">
                              {formatCurrency(expense.amount, currency)}
                            </p>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveExpense(expense.id)} 
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
