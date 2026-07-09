"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, supabaseConfig } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Forgot password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const redirectIfSignedIn = async () => {
      if (!supabase) return;

      // If this is a password recovery link, let it route to the reset-password page
      if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/dashboard");
      }
    };

    redirectIfSignedIn();
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
  };

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    setResetSuccess(false);

    if (!supabase) {
      setResetMessage("Supabase is not configured yet.");
      setResetLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setResetMessage(error.message);
      setResetLoading(false);
      return;
    }

    setResetSuccess(true);
    setResetMessage("Password reset link sent! Check your email inbox.");
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden flex items-center justify-center px-4 py-16">
      
      {/* Immersive Travel Destination Background */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Scenic Travel Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Soft sky-gradient overlay for high readability and palette consistency */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.92)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-xs" />
      </div>

      <div className="w-full max-w-4xl flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/80 shadow-2xl backdrop-blur-md lg:flex-row relative animate-scale-up">
        
        {/* Left Welcome Panel */}
        <div className="flex-1 bg-slate-950 p-8 text-white lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[320px]">
          {/* Background glows inside panel */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-2.5 text-lg font-bold tracking-tight text-white mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950 shadow-md">
              ✈
            </div>
            <span>TripEZ</span>
          </div>

          <div className="relative space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Welcome Back</span>
            <h1 className="text-3xl font-extrabold leading-tight">Log in to coordinate your next journey.</h1>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold opacity-90">
              Access your saved plans, travel documents, budget sheets, and collaborate with your travel circle instantly.
            </p>
          </div>

          <div className="relative pt-8 text-[11px] font-semibold text-slate-400">
            TripEZ © 2026
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="relative">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Email address</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400 animate-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email); // pre-populate if they typed it
                    setResetMessage("");
                    setResetSuccess(false);
                    setShowResetModal(true);
                  }}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3.5 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message ? (
              <p className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-xs text-rose-700 animate-fade-in font-medium">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-100 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {!supabaseConfig.isConfigured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
              <p className="font-bold">Supabase setup needed</p>
              <p className="mt-1 font-medium">Copy the example env file and add your project URL and anon key.</p>
            </div>
          ) : null}

          <p className="text-xs text-slate-500 font-semibold text-center pt-2">
            New here?{' '}
            <Link href="/register" className="text-sky-700 hover:text-sky-800 transition font-bold">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestReset} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Enter your email address below and we&apos;ll send you a secure recovery link to create a new password.
              </p>

              <div>
                <label htmlFor="reset-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Email Address</label>
                <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </span>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className="w-full rounded-2xl pl-11 pr-4 py-3 bg-transparent text-sm text-slate-900 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {resetMessage ? (
                <p className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${resetSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  {resetMessage}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || resetSuccess}
                  className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 py-3 text-xs font-bold text-white transition disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                >
                  {resetLoading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

    </div>
  );
}
