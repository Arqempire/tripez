"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

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

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <p className="text-sm font-semibold">Verifying secure link...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated (i.e. accessed direct link without magic recovery token)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl text-center">
          <span className="text-4xl" aria-hidden="true">🔑</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-950">Invalid or Expired Link</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            The recovery link you clicked is invalid, expired, or has already been used. Please request a new link.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-full bg-sky-600 py-3 font-semibold text-white hover:bg-sky-700 transition"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef6ff_50%,_#ffffff_100%)] px-6 py-16 text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 p-8 lg:p-10">
        <div className="text-center mb-6">
          <span className="text-3xl" aria-hidden="true">🔒</span>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">Create New Password</h1>
          <p className="mt-2 text-sm text-slate-600">
            Set your new login password below.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="new-pass" className="mb-2 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="new-pass"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm-pass" className="mb-2 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>
            <input
              id="confirm-pass"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder="Re-enter password"
            />
          </div>

          {message ? (
            <p className={`rounded-2xl px-4 py-3 text-sm border ${success ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-full bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
