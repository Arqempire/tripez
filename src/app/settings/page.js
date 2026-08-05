"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/Sidebar";

// Inline SVG Icon components — same set used across the app
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          
          {/* Page Header */}
          <header className="pb-6 border-b border-slate-200/60">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage your personal profile and account preferences.</p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start w-full">
            {/* PROFILE SECTION */}
            <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 backdrop-blur-md space-y-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/40">
              <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 shadow-xs">
                  <UserIcon />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Profile Information</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Update your display name and contact details.</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-5 pb-2 border-b border-slate-100">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-xl font-bold text-white shadow-lg">
                    {getInitials(fullName || userName)}
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900">{fullName || userName}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{email}</p>
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 tracking-wider">Verified Traveler</span>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">Full name</label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">Phone number <span className="normal-case tracking-normal text-slate-500 font-normal">(optional)</span></label>
                    <div className="relative rounded-2xl border border-slate-300 bg-slate-100/90 hover:bg-slate-100 hover:border-slate-400 focus-within:bg-white focus-within:border-sky-600 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200 shadow-xs">
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder-slate-500"
                        placeholder="ex: +91 9797090909"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">Email address</label>
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-100/60">
                    <input
                      id="email"
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-4 py-3 bg-transparent text-sm font-semibold text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium pl-1">Email address is managed by your authentication provider.</p>
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
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-8 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-100 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                >
                  {savingProfile ? "Saving..." : "Save Profile Changes"}
                </button>
              </form>
            </section>

            {/* DANGER & ACCOUNT OVERVIEW ZONE */}
            <div className="space-y-6">
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Account Overview</h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Account Type</span>
                    <span className="font-extrabold text-slate-900">Standard Explorer</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Authentication</span>
                    <span className="font-extrabold text-slate-900">Cloud Sync Active</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Status</span>
                    <span className="font-extrabold text-emerald-600">Active</span>
                  </div>
                </div>
              </section>

              <section className="bg-white border border-rose-200/80 rounded-3xl p-6 shadow-xl shadow-rose-100/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                    <LogoutIcon />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Sign Out</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Safely terminate active browser session.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-6 py-3 text-xs font-bold text-rose-700 transition-all duration-200 cursor-pointer"
                >
                  Sign Out of TripEZ
                </button>
              </section>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
