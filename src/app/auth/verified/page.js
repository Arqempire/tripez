"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifiedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden flex items-center justify-center px-4 py-16">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Scenic Travel Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.92)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-xs" />
      </div>

      <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-white/85 p-8 shadow-2xl backdrop-blur-md text-center space-y-6 animate-scale-up">
        {/* Success Check Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-md shadow-emerald-100/50">
          <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Email Verified Successfully!</h1>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Your account has been confirmed. You now have full access to plan trips, upload documents, and track expenses.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Redirecting to dashboard in <span className="font-extrabold text-emerald-900 text-sm">{countdown}s</span>...
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Go to Dashboard Now
          </Link>
          <Link
            href="/login"
            className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 text-xs font-bold text-slate-700 transition"
          >
            Log in again
          </Link>
        </div>
      </div>
    </div>
  );
}
