"use client";

import Link from "next/link";
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
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:flex-row">
        <div className="flex-1 bg-slate-950 p-8 text-white lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Start your journey</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Create your TripEZ account and start planning.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Save destinations, build itineraries, and keep every trip organized in one place.
          </p>
        </div>

        <div className="flex-1 p-8 lg:p-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="Re-enter your password"
              />
            </div>

            {message ? (
              <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">{message}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {!supabaseConfig.isConfigured ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Supabase setup needed</p>
              <p className="mt-1">Copy the example env file and add your project URL and anon key.</p>
            </div>
          ) : null}

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
