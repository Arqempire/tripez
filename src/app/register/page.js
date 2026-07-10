"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, supabaseConfig } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const redirectIfSignedIn = async () => {
      if (!supabase) return;
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

    if (password !== confirmPassword) {
      setMessage("Passwords do not match. Please confirm your password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      const message = error.message || "Unable to create your account right now.";
      const isDuplicate = /already registered|already exists|user already/i.test(message);
      setMessage(
        isDuplicate
          ? "An account with this email already exists. Please sign in instead."
          : message
      );
      setLoading(false);
      return;
    }

    if (data?.user && !data.session) {
      if (data.user.email_confirmed_at) {
        setMessage("An account with this email already exists. Please sign in instead.");
      } else {
        setMessage("Check your email to confirm your account before signing in.");
      }
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
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
              <svg className="h-5.5 w-5.5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
              </svg>
            </div>
            <span>TripEZ</span>
          </div>

          <div className="relative space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Start Your Journey</span>
            <h1 className="text-3xl font-extrabold leading-tight">Create your account to start planning.</h1>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold opacity-90">
              Save stunning destinations, build day-by-day itineraries, track your budget, and collaborate with companions all in one workspace.
            </p>
          </div>

          <div className="relative pt-8 text-[11px] font-semibold text-slate-400">
            TripEZ © 2026
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Full name</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-2xl pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="relative">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Email address</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3 text-slate-400">
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
                  className="w-full rounded-2xl pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Password</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Confirm password</label>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100/60 transition-all duration-200">
                <span className="absolute left-4 top-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-2xl pl-11 pr-4 py-2.5 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            {message ? (
              <p className="rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-xs text-sky-700 animate-fade-in font-semibold">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {!supabaseConfig.isConfigured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
              <p className="font-bold">Supabase setup needed</p>
              <p className="mt-1 font-medium">Copy the example env file and add your project URL and anon key.</p>
            </div>
          ) : null}

          <p className="text-xs text-slate-500 font-semibold text-center pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-sky-700 hover:text-sky-800 transition font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
