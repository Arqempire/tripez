"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const STORAGE_PREFIX = "tripez-collab";

// Inline SVG Icon components for unified sidebar navigation
const LogoIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
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
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
  const [userName, setUserName] = useState("");
  
  const [tripsList, setTripsList] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [tripName, setTripName] = useState("Select a trip");
  const [travellerName, setTravellerName] = useState("");
  const [travellerRole, setTravellerRole] = useState("Companion");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [travellerToDelete, setTravellerToDelete] = useState(null);
  const [members, setMembers] = useState([
    { id: "me", name: "You", role: "Trip host", share: "100%" },
  ]);
  const [notes, setNotes] = useState("Share the itinerary, flight details, and any split costs here.");
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "", paidBy: "You" });
  const [message, setMessage] = useState("");
  const [collabStore, setCollabStore] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleAddTraveller = (event) => {
    event.preventDefault();
    if (!travellerName.trim()) {
      setMessage("Please enter a traveller name.");
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: travellerName.trim(),
      role: travellerRole.trim() || "Companion",
      share: "Shared",
    };

    const nextMembers = [...members, newMember];
    setMembers(nextMembers);
    setTravellerName("");
    setTravellerRole("Companion");
    setMessage(`Added traveller ${newMember.name} to ${tripName}.`);
  };

  const startEditMember = (member) => {
    if (member.id === "me") {
      setMessage("Cannot edit the trip host.");
      return;
    }
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const handleSaveEditMember = (memberId) => {
    if (!editName.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    const oldMember = members.find((m) => m.id === memberId);
    if (!oldMember) return;
    const oldName = oldMember.name;

    const nextMembers = members.map((member) =>
      member.id === memberId ? { ...member, name: editName.trim(), role: editRole.trim() || "Companion" } : member
    );

    setMembers(nextMembers);
    setEditingMemberId(null);
    setEditName("");
    setEditRole("");

    const nextExpenses = expenses.map((expense) =>
      expense.paidBy === oldName ? { ...expense, paidBy: editName.trim() } : expense
    );
    setExpenses(nextExpenses);
    setMessage("Traveller details updated.");
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditName("");
    setEditRole("");
  };

  const triggerDeleteMember = (member) => {
    if (member.id === "me") {
      setMessage("Cannot delete the trip host.");
      return;
    }
    setTravellerToDelete(member);
  };

  const confirmDeleteMember = () => {
    if (!travellerToDelete) return;
    const memberId = travellerToDelete.id;
    const memberName = travellerToDelete.name;
    setTravellerToDelete(null);

    const nextMembers = members.filter((member) => member.id !== memberId);
    setMembers(nextMembers);

    const nextExpenses = expenses.filter((expense) => expense.paidBy !== memberName);
    setExpenses(nextExpenses);
    setMessage(`Removed ${memberName} and their shared expenses.`);
  };

  const handleAddExpense = (event) => {
    event.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) {
      setMessage("Add an expense title and amount first.");
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
      split: "Split equally",
    };

    setExpenses([newExpense, ...expenses]);
    setExpenseForm({ title: "", amount: "", paidBy: members[0]?.name || "You" });
    setMessage(`Logged expense "${newExpense.title}" split equally.`);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Setting up collaboration workspace...</p>
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

            <Link href="/expenses" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <ExpenseIcon />
              <span className="text-sm">Expense Tracker</span>
            </Link>

            <Link href="/trip-collab" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
              <CollabIcon />
              <span className="text-sm">Collaboration</span>
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

      {/* MOBILE HEADER BAR */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white/70 border-b border-slate-200/60 backdrop-blur-md fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <LogoIcon />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">TripEZ</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MenuIcon />
        </button>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div 
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={`absolute top-0 bottom-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 hover:opacity-85 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                  <LogoIcon />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TripEZ</span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="space-y-1.5">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <DashboardIcon />
                <span className="text-sm">Dashboard</span>
              </Link>
              
              <Link href="/documents" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <DocumentIcon />
                <span className="text-sm">Document Vault</span>
              </Link>

              <Link href="/expenses" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <ExpenseIcon />
                <span className="text-sm">Expense Tracker</span>
              </Link>

              <Link href="/trip-collab" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
                <CollabIcon />
                <span className="text-sm">Collaboration</span>
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md">
                {getInitials(userName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traveler</p>
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 md:pl-64 pt-20 md:pt-0 min-h-screen">
        <div className="px-4 py-8 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl space-y-8">
            
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 border border-violet-100 text-violet-600 shadow-inner text-xl">
                  🤝
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Trip Collaboration</p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">Collaboration Vault</h1>
                </div>
              </div>
            </div>

            {/* Selected Trip Switcher */}
            <div className="bg-white/50 border border-slate-200/50 p-5 rounded-3xl shadow-xs backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-600">Currently planning details for:</p>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{tripName}</h2>
              </div>

              {tripsList.length > 0 ? (
                <div className="relative rounded-xl border border-slate-200 bg-white px-4 py-2 focus-within:ring-2 focus-within:ring-violet-200 transition min-w-[200px]">
                  <select
                    value={selectedTripId}
                    onChange={(event) => handleTripChange(event.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-6 w-full appearance-none"
                  >
                    {tripsList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-3 text-slate-400 pointer-events-none">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500 italic">No trips created yet. Set up a trip in the dashboard.</p>
              )}
            </div>

            {/* Main 2-column workspace */}
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              
              {/* Left Column: Companions & Notes */}
              <div className="space-y-6">
                
                {/* Notes / Itinerary Clipboard */}
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Trip Board</p>
                    <h3 className="text-base font-bold text-slate-900 mt-1 tracking-tight">Itinerary & Board Notes</h3>
                  </div>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100/60 transition-all duration-200">
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-24 w-full px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 resize-y"
                      placeholder="Share details like flight tickets, address coordinates, or shared checkpoints..."
                    />
                  </div>
                </div>

                {/* Traveler list card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      Trip Companions
                      <span className="bg-violet-50 border border-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-bold shadow-xs">
                        {members.length}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Add companions and coordinate roles for splitting costs.</p>
                  </div>

                  {/* Add Companion Form */}
                  <form onSubmit={handleAddCompanion => handleAddTraveller(event)} className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/30 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Full Name</label>
                        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-200">
                          <input
                            value={travellerName}
                            onChange={(event) => setTravellerName(event.target.value)}
                            className="w-full px-4.5 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                            placeholder="e.g. Kaiser"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Role</label>
                        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-200">
                          <select
                            value={travellerRole}
                            onChange={(event) => setTravellerRole(event.target.value)}
                            className="w-full pl-4.5 pr-8 py-2.5 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                          >
                            <option value="Companion">Companion</option>
                            <option value="Co-Host">Co-Host</option>
                            <option value="Treasurer">Treasurer</option>
                            <option value="Navigator">Navigator</option>
                          </select>
                          <span className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Add Traveller
                    </button>
                  </form>

                  {message ? (
                    <p className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-3.5 py-2.5 rounded-2xl animate-fade-in">{message}</p>
                  ) : null}

                  {/* Members Directory */}
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 pt-1">
                    {members.map((member) => {
                      const isEditing = editingMemberId === member.id;

                      return (
                        <div 
                          key={member.id} 
                          className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow"
                        >
                          {isEditing ? (
                            <div className="space-y-3.5">
                              <div className="grid gap-3.5 grid-cols-2">
                                <div>
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Edit Name</label>
                                  <input
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Edit Role</label>
                                  <select
                                    value={editRole}
                                    onChange={(event) => setEditRole(event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                                  >
                                    <option value="Companion">Companion</option>
                                    <option value="Co-Host">Co-Host</option>
                                    <option value="Treasurer">Treasurer</option>
                                    <option value="Navigator">Navigator</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditMember(member.id)}
                                  className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{member.role}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="rounded-full bg-violet-50 border border-violet-100/50 px-3 py-1 text-[10px] font-bold text-violet-700">{member.share}</span>
                                {member.id !== "me" && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => startEditMember(member)}
                                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                                      title="Edit Traveller"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => triggerDeleteMember(member)}
                                      className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                      title="Delete Traveller"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Shared Expenses & split items */}
              <div className="space-y-6">
                <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-100/50 backdrop-blur-md">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Shared Expenses</p>
                    <h2 className="text-lg font-bold text-slate-900 mt-1 tracking-tight">Financial ledger</h2>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4.5 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Shared Pool</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹{totalShared.toFixed(0)}</p>
                  </div>

                  {/* Add Shared Expense Form */}
                  <form onSubmit={handleAddExpense} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4.5 space-y-4">
                    <p className="text-xs font-bold text-slate-900">Add shared expense</p>
                    
                    <div className="space-y-3.5">
                      <div className="relative">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Description</label>
                        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-200">
                          <input
                            value={expenseForm.title}
                            onChange={(event) => setExpenseForm({ ...expenseForm, title: event.target.value })}
                            className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                            placeholder="Hotel, transport, food"
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="relative">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Amount (₹)</label>
                          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-200">
                            <input
                              type="number"
                              min="0"
                              value={expenseForm.amount}
                              onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
                              className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                              placeholder="1500"
                            />
                          </div>
                        </div>
                        
                        <div className="relative">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Paid By</label>
                          <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all duration-200">
                            <select
                              value={expenseForm.paidBy}
                              onChange={(event) => setExpenseForm({ ...expenseForm, paidBy: event.target.value })}
                              className="w-full pl-4.5 pr-8 py-2.5 bg-transparent text-sm text-slate-900 outline-none appearance-none cursor-pointer"
                            >
                              {members.map((member) => (
                                <option key={member.id} value={member.name}>{member.name}</option>
                              ))}
                            </select>
                            <span className="absolute right-3 top-3.5 text-slate-400 pointer-events-none">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white shadow-md transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Save Shared Expense
                    </button>
                  </form>

                  {/* Shared expense logs checklist */}
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 pt-1">
                    {expenses.map((expense) => (
                      <div 
                        key={expense.id} 
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 shadow-xs"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">{expense.title}</p>
                          <p className="text-[10px] font-semibold text-slate-500 mt-1">
                            Paid by <strong className="text-slate-700">{expense.paidBy}</strong> · {expense.split}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                          <p className="text-sm font-black text-slate-900 tracking-tight">₹{expense.amount.toFixed(0)}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setExpenses(expenses.filter((e) => e.id !== expense.id));
                              setMessage(`Removed shared expense "${expense.title}".`);
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Custom Delete Traveller Modal */}
      {travellerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-scale-up text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-600 shadow-inner">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Remove Companion</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Are you sure you want to delete traveler <strong className="text-slate-755">"{travellerToDelete.name}"</strong>? All associated shared expenses logged under their name will also be erased permanently.
            </p>
            <div className="flex gap-3 pt-3.5">
              <button
                type="button"
                onClick={() => setTravellerToDelete(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-3 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 py-3 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
