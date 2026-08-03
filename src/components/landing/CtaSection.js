import Link from "next/link";

export default function CtaSection() {
  return (
    <section aria-labelledby="cta-heading" className="rounded-[2.5rem] border border-sky-200/20 bg-gradient-to-tr from-sky-600 to-indigo-600 p-8 sm:p-14 text-center text-white shadow-xl shadow-sky-100/50 relative overflow-hidden">
      {/* Decorative glows inside CTA banner */}
      <div className="absolute -top-12 -left-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-2xl mx-auto space-y-6">
        <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Ready to organize your next adventure?
        </h2>
        <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-semibold opacity-90">
          Plan customized itineraries, balance expense budgets, and collaborate with your travel group seamlessly using TripEZ.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/register"
            className="rounded-2xl bg-white hover:bg-slate-50 text-sky-700 font-bold px-8 py-3.5 shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Plan Your First Trip
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border border-white/40 hover:border-white hover:bg-white/10 text-white font-bold px-8 py-3.5 transition-all duration-300 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
