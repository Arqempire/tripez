import Link from "next/link";
import styles from "./CTA.module.css";

export default function CTA() {
  return (
    <section className={`rounded-[2.5rem] border p-8 sm:p-14 text-center text-white relative overflow-hidden ${styles.ctaContainer}`}>
      {/* Decorative glows inside CTA banner */}
      <div className={styles.glowTopLeft} aria-hidden="true" />
      <div className={styles.glowBottomRight} aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to organize your next adventure?</h2>
        <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-semibold opacity-90">
          Join thousands of travelers who plan customized itineraries, balance expense budgets, and collaborate with travel groups using TripEZ.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link 
            href="/register" 
            className={`rounded-2xl bg-white hover:bg-slate-50 text-sky-700 font-bold px-8 py-3.5 shadow-lg transform ${styles.primaryBtn}`}
          >
            Plan Your First Trip
          </Link>
          <Link 
            href="/login" 
            className={`rounded-2xl border border-white/30 hover:border-white hover:bg-white/10 text-white font-bold px-8 py-3.5 transform ${styles.secondaryBtn}`}
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
