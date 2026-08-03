"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message") || "The verification link is invalid, expired, or has already been used.";

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/85 p-8 shadow-2xl backdrop-blur-md text-center space-y-6 animate-scale-up">
      {/* Warning Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verification Error</h1>
        <p className="text-sm text-rose-700 font-semibold rounded-2xl bg-rose-50/80 border border-rose-100 p-3.5 leading-relaxed">
          {errorMessage}
        </p>
      </div>

      <div className="pt-2 flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Return to Login
        </Link>
        <Link
          href="/register"
          className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden flex items-center justify-center px-4 py-16">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 -z-20 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Scenic Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.15),_transparent_40%),linear-gradient(135deg,_rgba(248,251,255,0.92)_0%,_rgba(238,246,255,0.95)_50%,_rgba(255,255,255,0.97)_100%)] backdrop-blur-xs" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white/80 p-8 rounded-[2.5rem] text-center font-semibold text-slate-600">
          Loading...
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
