"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

// Local helper to avoid importing next/link as dynamic imports might fail depending on project structure
// Wait, we can import Link from "next/link" directly, it is already working in previous pages!
// Ah, in line 3: import Link from "next/import" is a typo! It should be "next/link". Let's correct it!

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        setCheckingSession(false);
        return;
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
      } else {
        // Fallback: listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session) {
              setIsAuthenticated(true);
            }
          }
        );
        return () => subscription.unsubscribe();
      }
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setMessage("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage("Password updated successfully! Redirecting to dashboard...");
    setLoading(false);

    setTimeout(() => {
      router.replace("/dashboard");
    }, 2500);
  };

  // Background and overlay rendering helper
  const renderBackground = () => (
    <div className="absolute inset-0 -z-20 w-full h-full">
      <Image
        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
        alt="Scenic Travel Background"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.92)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-xs" />
    </div>
  );

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] text-slate-900 font-sans">
        <div className="relative flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase tracking-widest animate-pulse">Verifying secure link...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated (i.e. accessed direct link without magic recovery token)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden flex items-center justify-center px-4 py-16">
        {renderBackground()}

        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-2xl backdrop-blur-md text-center animate-scale-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl text-rose-600 shadow-inner">
            ⚠️
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Invalid or Expired Link</h1>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed font-semibold">
            The recovery link you clicked is invalid, expired, or has already been used. Please request a new link from the login page.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 text-xs font-bold text-white transition shadow-md"
            >
              Back to Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden flex items-center justify-center px-4 py-16">
      {renderBackground()}

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl backdrop-blur-md p-8 lg:p-10 animate-scale-up">
        
        <div className="flex items-center justify-center gap-2 text-lg font-bold tracking-tight text-slate-950 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md text-sm">
            ✈
          </div>
          <span>TripEZ</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create New Password</h1>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">
            Set your secure new login password below.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <label htmlFor="new-pass" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">New Password</label>
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="new-pass"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                placeholder="Min 6 characters"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirm-pass" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Confirm New Password</label>
            <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="confirm-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {message ? (
            <p className={`rounded-2xl px-4 py-3 text-xs font-semibold border ${success ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
          >
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
