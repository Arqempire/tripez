import { LANDING_STEPS } from "@/lib/landingData";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="rounded-3xl border border-sky-100 bg-sky-50/50 p-8 sm:p-12 shadow-sm space-y-12 scroll-mt-24" aria-labelledby="how-it-works-heading">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Simple workflow</p>
        <h2 id="how-it-works-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          From draft idea to itinerary in 3 steps.
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Our automated generator builds customized dashboards based on quick parameters.
        </p>
      </div>

      <div className="relative mt-8 grid gap-8 md:grid-cols-3">
        {/* Timeline connector line */}
        <div className="absolute top-10 left-10 right-10 h-0.5 bg-sky-200/50 -z-10 hidden md:block" aria-hidden="true" />

        {LANDING_STEPS.map((step, index) => (
          <div
            key={`step-${index + 1}`}
            className="bg-white/80 border border-slate-200/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-md shadow-sky-100 select-none">
              0{index + 1}
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
