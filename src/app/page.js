"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import SessionLoader from "@/components/landing/SessionLoader";

import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      if (!supabase) {
        setCheckingSession(false);
        return;
      }

      // password recovery link
      if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        setCheckingSession(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session?.user) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace("/reset-password");
      } else if (session?.user) {
        // Double checking hash parameters to prevent overriding recovery redirects
        if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
          return;
        }
        router.replace("/dashboard");
      }
    }) || { data: { subscription: null } };

    return () => {
      active = false;
      subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checkingSession) {
    return <SessionLoader />;
  }

  return (
    <div className="min-h-screen relative text-slate-900 font-sans antialiased overflow-x-hidden">
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
        <div className={`absolute inset-0 ${styles.bgOverlay}`} />
      </div>

      <Navbar />

      {/* Main Container */}
      <main className="mx-auto flex max-w-7xl flex-col gap-20 px-6 pb-20 pt-10 lg:px-8 lg:pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
