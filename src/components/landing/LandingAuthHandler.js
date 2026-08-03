"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LandingAuthHandler() {
  const router = useRouter();

  // Initialize checking state synchronously to prevent synchronous setState inside useEffect
  const [checking, setChecking] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!checking) return;

    let isMounted = true;

    const checkSession = async () => {
      if (!supabase) {
        if (isMounted) setChecking(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          router.replace("/dashboard");
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Auth session check error:", err);
        if (isMounted) setChecking(false);
      }
    };

    checkSession();

    const authListener = supabase?.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY") {
        router.replace("/reset-password");
        return;
      }

      if (session?.user) {
        if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
          return;
        }
        router.replace("/dashboard");
      }
    });

    const subscription = authListener?.data?.subscription;

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [checking, router]);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/90 backdrop-blur-sm text-slate-900 transition-opacity duration-300">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Checking session...</p>
      </div>
    </div>
  );
}
