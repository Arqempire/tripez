import Link from "next/link";
import styles from "./Hero.module.css";
import DashboardPreview from "./DashboardPreview";

export default function Hero() {
  return (
    <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="max-w-2xl space-y-6">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold text-sky-700 shadow-xs ${styles.badge}`}>
          <span className="animate-pulse">✈</span> AI-Powered Travel Assistant
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
          Plan smoother trips with <span className={styles.gradientText}>less stress</span> and more joy.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-slate-600 font-medium">
          TripEZ helps you craft beautiful travel plans around your budget, pace, and interests. Generate custom itineraries, manage expenses, and collaborate with your group in real-time.
        </p>
        
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/register"
            className={`rounded-2xl text-white font-bold px-8 py-3.5 text-center transform ${styles.primaryBtn}`}
          >
            Start Planning Free
          </Link>
          <Link
            href="/login"
            className={`rounded-2xl border border-slate-300 hover:border-sky-300 bg-white text-slate-700 hover:text-sky-700 font-bold px-8 py-3.5 shadow-xs text-center transform ${styles.secondaryBtn}`}
          >
            Log In
          </Link>
        </div>
        
        <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 shadow-xs ${styles.pillTag}`}>
            ✨ Live AI Itineraries
          </span>
          <span className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 shadow-xs ${styles.pillTag}`}>
              Expense Analytics
          </span>
          <span className={`flex items-center gap-1.5 border rounded-full px-3 py-1.5 shadow-xs ${styles.pillTag}`}>
              Group Syncing
          </span>
        </div>
      </div>

      {/* Hero Right Mockup Panel */}
      <DashboardPreview />
    </section>
  );
}
