"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Inline SVG Icon components — same set used across the app
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

const MenuIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: "", type: "" });

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" });

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

      const user = session.user;
      const profileName = user.user_metadata?.full_name || user.email || "your account";
      setUserName(profileName);
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
      setPhone(user.user_metadata?.phone || "");
      setLoading(false);
    };

    loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ text: "", type: "" });

    if (!fullName.trim()) {
      setProfileMessage({ text: "Full name cannot be empty.", type: "error" });
      setSavingProfile(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      if (error) throw error;

      setUserName(fullName.trim());
      setProfileMessage({ text: "Profile updated successfully!", type: "success" });
    } catch (error) {
      setProfileMessage({ text: error.message || "Failed to update profile.", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage({ text: "", type: "" });

    if (newPassword.length < 6) {
      setPasswordMessage({ text: "Password must be at least 6 characters.", type: "error" });
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match.", type: "error" });
      setSavingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ text: "Password changed successfully!", type: "success" });
    } catch (error) {
      setPasswordMessage({ text: error.message || "Failed to change password.", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Loading your settings...</p>
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

            <Link href="/trip-collab" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
              <CollabIcon />
              <span className="text-sm">Collaboration</span>
            </Link>

            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
              <SettingsIcon />
              <span className="text-sm">Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Card at bottom of Sidebar */}
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
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

              <Link href="/trip-collab" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200">
                <CollabIcon />
                <span className="text-sm">Collaboration</span>
              </Link>

              <Link href="/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-sky-50 text-sky-700 font-semibold border border-sky-100/50 transition-all duration-200">
                <SettingsIcon />
                <span className="text-sm">Settings</span>
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:pl-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-8 sm:py-10 space-y-8">
          
          {/* Page Header */}
          <header className="pb-6 border-b border-slate-200/60">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage your profile and account preferences.</p>
          </header>

          {/* PROFILE SECTION */}
          <section className="bg-white/80 border border-slate-200/60 rounded-3xl shadow-xs backdrop-blur-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Profile Information</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Update your name and contact details.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
              {/* Avatar Preview */}
              <div className="flex items-center gap-5 pb-2">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-xl font-bold text-white shadow-lg">
                  {getInitials(fullName || userName)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{fullName || userName}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{email}</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Full name</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Email address</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-100/60">
                  <input
                    id="email"
                    type="email"
                    readOnly
                    value={email}
                    className="w-full rounded-2xl px-4 py-3 bg-transparent text-sm text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium pl-1">Email cannot be changed for security reasons.</p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Phone number <span className="normal-case tracking-normal text-slate-400">(optional)</span></label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Profile Message */}
              {profileMessage.text ? (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                  profileMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                  {profileMessage.type === "success" ? <CheckIcon /> : null}
                  {profileMessage.text}
                </div>
              ) : null}

              {/* Save Profile Button */}
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-sky-100 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          {/* SECURITY SECTION */}
          <section className="bg-white/80 border border-slate-200/60 rounded-3xl shadow-xs backdrop-blur-md overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <ShieldIcon />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Security</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Change your password to keep your account safe.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">New password</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Confirm new password</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {/* Password Message */}
              {passwordMessage.text ? (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold flex items-center gap-2 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-700"
                }`}>
                  {passwordMessage.type === "success" ? <CheckIcon /> : null}
                  {passwordMessage.text}
                </div>
              ) : null}

              {/* Change Password Button */}
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-100 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              >
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>

          {/* DANGER ZONE */}
          <section className="bg-white/80 border border-slate-200/60 rounded-3xl shadow-xs backdrop-blur-md overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <LogoutIcon />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sign Out</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">End your current session on this device.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-6 py-2.5 text-sm font-bold text-rose-700 transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
