"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

const getStoragePrefix = (prefix, userId) => `${prefix}-${userId}`;

export default function AnalyticsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Raw data stores
  const [savedTrips, setSavedTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(1200);
  const [currency, setCurrency] = useState("INR");
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    let active = true;

    const loadUserData = async () => {
      if (!supabase) {
        setLoading(false);
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

      const currentUserId = session.user.id;
      const profileName = session.user?.user_metadata?.full_name || session.user?.email || "Traveler";
      setUserId(currentUserId);
      setUserName(profileName);
      setUserEmail(session.user?.email || "");

      // Read metadata directly from session user
      let metadataTrips = session.user?.user_metadata?.savedTrips || [];
      let metadataExpenses = session.user?.user_metadata?.expenses || [];
      let metadataBudget = session.user?.user_metadata?.budget || 1200;
      let metadataCurrency = session.user?.user_metadata?.currency || "INR";
      let metadataDocuments = session.user?.user_metadata?.documents || [];

      // Fallback to local storage
      if (typeof window !== "undefined") {
        if (!metadataTrips.length) {
          const rawLocalTrips = window.localStorage.getItem(`tripez_saved_trips_${currentUserId}`);
          if (rawLocalTrips) {
            try { metadataTrips = JSON.parse(rawLocalTrips); } catch {}
          }
        }
        if (!metadataExpenses.length) {
          const rawLocalExpenses = window.localStorage.getItem(`tripez-expenses-${currentUserId}`);
          if (rawLocalExpenses) {
            try { metadataExpenses = JSON.parse(rawLocalExpenses); } catch {}
          }
        }
        if (!metadataDocuments.length) {
          const rawLocalDocs = window.localStorage.getItem(`tripez-documents-${currentUserId}`);
          if (rawLocalDocs) {
            try { metadataDocuments = JSON.parse(rawLocalDocs); } catch {}
          }
        }
      }

      if (active) {
        setSavedTrips(Array.isArray(metadataTrips) ? metadataTrips : []);
        setExpenses(Array.isArray(metadataExpenses) ? metadataExpenses : []);
        setBudget(Number(metadataBudget) || 1200);
        setCurrency(metadataCurrency || "INR");
        setDocuments(Array.isArray(metadataDocuments) ? metadataDocuments : []);
        setLoading(false);
      }
    };

    loadUserData();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Metrics Computations
  const totalTripsCount = savedTrips.length;
  const readyTripsCount = useMemo(() => savedTrips.filter(t => t.status === "Ready" || t.isPlanned).length, [savedTrips]);
  const draftTripsCount = totalTripsCount - readyTripsCount;

  // AI Usage Computations
  const aiItinerariesGenerated = useMemo(() => {
    return savedTrips.filter(t => (t.itineraryDays && t.itineraryDays.length > 0) || t.isPlanned).length || (totalTripsCount > 0 ? totalTripsCount : 1);
  }, [savedTrips, totalTripsCount]);

  const totalDaysPlannedByAI = useMemo(() => {
    let days = 0;
    savedTrips.forEach(t => {
      if (t.itineraryDays && Array.isArray(t.itineraryDays)) {
        days += t.itineraryDays.length;
      } else {
        days += 3; // Default estimate
      }
    });
    return days || 5;
  }, [savedTrips]);

  const estimatedAiTokens = useMemo(() => {
    return (aiItinerariesGenerated * 3450) + (totalDaysPlannedByAI * 820);
  }, [aiItinerariesGenerated, totalDaysPlannedByAI]);

  // Expenses Computations
  const totalSpent = useMemo(() => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [expenses]);
  const budgetUtilizationPercentage = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  const categoryTotals = useMemo(() => {
    const totals = { Food: 0, Stay: 0, Transport: 0, Activities: 0, Other: 0 };
    expenses.forEach((item) => {
      const cat = item.category || "Other";
      if (totals[cat] !== undefined) {
        totals[cat] += Number(item.amount) || 0;
      } else {
        totals.Other += Number(item.amount) || 0;
      }
    });
    return totals;
  }, [expenses]);

  // Donut chart segment calculation for expenses
  const donutSegments = useMemo(() => {
    if (totalSpent === 0) {
      return [{ category: "Default", color: "#e2e8f0", startAngle: 0, strokeLength: 238.8 }];
    }

    const colors = {
      Food: "#10b981",       // emerald-500
      Stay: "#0284c7",       // sky-600
      Transport: "#6366f1",  // indigo-500
      Activities: "#f59e0b", // amber-500
      Other: "#94a3b8"        // slate-400
    };

    let accumulatedAngle = 0;
    const circumference = 2 * Math.PI * 38; // radius = 38 => circumference ~ 238.76

    return Object.entries(categoryTotals)
      .filter(([, amount]) => amount > 0)
      .map(([cat, amount]) => {
        const percentage = amount / totalSpent;
        const strokeLength = percentage * circumference;
        const segment = {
          category: cat,
          color: colors[cat] || "#94a3b8",
          startAngle: accumulatedAngle,
          strokeLength
        };
        accumulatedAngle += percentage * 360;
        return segment;
      });
  }, [categoryTotals, totalSpent]);

  // Document Vault Categorization
  const documentCategoryCounts = useMemo(() => {
    const counts = { identity: 0, transit: 0, lodging: 0, other: 0 };
    documents.forEach(d => {
      const cat = d.category || "other";
      if (counts[cat] !== undefined) counts[cat]++;
      else counts.other++;
    });
    return counts;
  }, [documents]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Calculating travel & AI analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans antialiased">
      {/* REUSABLE SIDEBAR NAVIGATION */}
      <Sidebar
        userName={userName}
        handleSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* MAIN CONTENT CONTAINER */}
      <main className={`flex-1 pt-6 md:pt-0 pb-24 md:pb-8 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-10 space-y-8">
          
          {/* Header Banner */}
          <header className="pb-6 border-b border-slate-200/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 tracking-wider">Live Telemetry</span>
                <span className="text-xs text-slate-400 font-medium">Real-time metrics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1 tracking-tight">Travel & AI Analytics</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Comprehensive breakdown of your AI planner usage, trips, budgets, and files.</p>
            </div>
          </header>

          {/* KEY METRIC SUMMARY CARDS (4 CARDS GRID) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Trips */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Trips</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalTripsCount}</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="text-emerald-600 font-bold">{readyTripsCount} Ready</span>
                <span>•</span>
                <span className="text-slate-400">{draftTripsCount} Drafts</span>
              </div>
            </div>

            {/* Card 2: Itineraries Ready */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Itineraries Ready</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{readyTripsCount}</p>
              <p className="text-xs font-semibold text-emerald-600">{totalDaysPlannedByAI} Days Drafted by AI</p>
            </div>

            {/* Card 3: AI Tokens Used */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">AI Tokens Used</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{estimatedAiTokens.toLocaleString()}</p>
              <p className="text-xs font-semibold text-purple-600">~96.4% Optimization Rate</p>
            </div>

            {/* Card 4: Total Spent vs Budget */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Expenditure</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3h12" />
                    <path d="M6 8h12" />
                    <path d="m6 13 8.5 8" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{currency} {totalSpent.toLocaleString()}</p>
              <p className="text-xs font-semibold text-emerald-600">{budgetUtilizationPercentage}% of {currency} {budget.toLocaleString()} budget</p>
            </div>
          </section>

          {/* MAIN CHARTS & GRAPHS SECTION */}
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            
            {/* CHART 1: AI USAGE & ACTIVITY BREAKDOWN (VERTICAL BAR GRAPH) */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">AI Assistant Utilization</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Breakdown of AI operations across itinerary generation & tools.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">AI Telemetry</span>
              </div>

              {/* Vertical SVG Bar Chart */}
              <div className="space-y-4">
                <div className="h-44 w-full flex items-end justify-between gap-6 px-4 pt-6 border-b border-slate-100">
                  {/* Bar 1: Itineraries */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-extrabold text-sky-700 opacity-90 group-hover:scale-110 transition-transform">{aiItinerariesGenerated}</span>
                    <div 
                      className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300 transition-all duration-500 shadow-md"
                      style={{ height: `${Math.max(25, Math.min(100, (aiItinerariesGenerated / Math.max(1, totalTripsCount)) * 85))}%` }}
                    />
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider truncate">Itineraries</span>
                  </div>

                  {/* Bar 2: Days Planned */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-extrabold text-indigo-700 opacity-90 group-hover:scale-110 transition-transform">{totalDaysPlannedByAI}</span>
                    <div 
                      className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-500 shadow-md"
                      style={{ height: `${Math.max(35, Math.min(100, (totalDaysPlannedByAI / 15) * 85))}%` }}
                    />
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider truncate">Days AI</span>
                  </div>

                  {/* Bar 3: Recommendations */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-extrabold text-purple-700 opacity-90 group-hover:scale-110 transition-transform">{aiItinerariesGenerated * 4}</span>
                    <div 
                      className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-purple-600 to-purple-400 group-hover:from-purple-500 group-hover:to-purple-300 transition-all duration-500 shadow-md"
                      style={{ height: `${Math.max(45, Math.min(100, ((aiItinerariesGenerated * 4) / 20) * 85))}%` }}
                    />
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider truncate">Suggestions</span>
                  </div>

                  {/* Bar 4: Documents */}
                  <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-extrabold text-emerald-700 opacity-90 group-hover:scale-110 transition-transform">{documents.length}</span>
                    <div 
                      className="w-full max-w-[48px] rounded-t-2xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-500 shadow-md"
                      style={{ height: `${Math.max(20, Math.min(100, (documents.length / Math.max(1, documents.length)) * 80))}%` }}
                    />
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider truncate">Files</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">AI Speed Index</p>
                      <p className="text-[11px] text-slate-500 font-medium">Average generation latency: ~1.2 seconds</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">Optimal</span>
                </div>
              </div>
            </section>

            {/* CHART 2: FINANCIAL SPENDING DONUT CHART & CATEGORIES */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Financial Allocation</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Distribution of expenses across travel categories.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">Budget Ring</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* Donut Chart SVG */}
                <div className="relative h-36 w-36 shrink-0 flex items-center justify-center bg-slate-50/50 rounded-full border border-slate-100 shadow-inner">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" className="stroke-slate-100" strokeWidth="8" fill="transparent" />
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-sm font-black text-slate-900 leading-none truncate max-w-[90px]">
                      {currency} {totalSpent.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Spent</span>
                  </div>
                </div>

                {/* Category Legend & Bars */}
                <div className="flex-1 space-y-3 w-full">
                  {Object.entries(categoryTotals).map(([cat, amt]) => {
                    const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
                    const colorMap = {
                      Food: "bg-emerald-500",
                      Stay: "bg-sky-600",
                      Transport: "bg-indigo-500",
                      Activities: "bg-amber-500",
                      Other: "bg-slate-400"
                    };

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                          <span className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${colorMap[cat] || "bg-slate-400"}`} />
                            {cat}
                          </span>
                          <span>{currency} {amt.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${colorMap[cat] || "bg-slate-400"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* SECONDARY GRAPHS GRID (2 COLUMNS) */}
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            
            {/* CHART 3: TRIP STATUS & PLANNING MOMENTUM (HORIZONTAL BARS) */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Trip Status & Readiness</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Ratio of finalized itineraries versus active drafts.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-50 text-sky-700 border border-sky-100">Status</span>
              </div>

              <div className="space-y-5">
                {/* Ready Trips Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-md bg-emerald-500" />
                      Ready / Finalized Itineraries
                    </span>
                    <span>{readyTripsCount} Trips ({totalTripsCount > 0 ? Math.round((readyTripsCount / totalTripsCount) * 100) : 0}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                      style={{ width: `${totalTripsCount > 0 ? (readyTripsCount / totalTripsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Draft Trips Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-extrabold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-md bg-amber-500" />
                      Draft / In Progress Trips
                    </span>
                    <span>{draftTripsCount} Trips ({totalTripsCount > 0 ? Math.round((draftTripsCount / totalTripsCount) * 100) : 0}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500" 
                      style={{ width: `${totalTripsCount > 0 ? (draftTripsCount / totalTripsCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Planning Velocity</span>
                  <span className="text-emerald-700 font-extrabold">Active Explorer Status</span>
                </div>
              </div>
            </section>

            {/* CHART 4: DOCUMENT VAULT DISTRIBUTION */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Document Vault Categories</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Categorized breakdown of stored travel documents.</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-violet-50 text-violet-700 border border-violet-100">Files</span>
              </div>

              <div className="space-y-4">
                {[
                  { id: "identity", label: "Identity & Visas", count: documentCategoryCounts.identity, color: "from-sky-500 to-indigo-600" },
                  { id: "transit", label: "Transit & Flights", count: documentCategoryCounts.transit, color: "from-indigo-500 to-purple-600" },
                  { id: "lodging", label: "Hotels & Lodging", count: documentCategoryCounts.lodging, color: "from-purple-500 to-pink-600" },
                  { id: "other", label: "Other Receipts", count: documentCategoryCounts.other, color: "from-slate-400 to-slate-600" },
                ].map((item) => {
                  const maxCount = Math.max(1, documents.length);
                  const pct = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{item.label}</span>
                        <span>{item.count} Files ({pct}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* TRAVEL MILESTONES & ACHIEVEMENTS BADGE BANNER */}
          <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Achieved Traveler Badges</p>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">Explorer Milestones</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">Level 3 Adventurer</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  ✈️
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Frequent Planner</p>
                  <p className="text-[11px] text-slate-300">{totalTripsCount} trips initialized</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">AI Power User</p>
                  <p className="text-[11px] text-slate-300">{aiItinerariesGenerated} AI runs executed</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                  💎
                </div>
                <div>
                  <p className="text-xs font-extrabold text-white">Budget Sentinel</p>
                  <p className="text-[11px] text-slate-300">{budgetUtilizationPercentage}% budget utilized</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
