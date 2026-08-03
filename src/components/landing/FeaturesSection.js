import { LANDING_FEATURES } from "@/lib/landingData";

function FeatureIcon({ type }) {
  if (type === "sparkles") {
    return (
      <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l1.912 3.874 4.276.622-3.094 3.016.73 4.258L12 14.758l-3.824 2.012.73-4.258-3.094-3.016 4.276-.622z" />
      </svg>
    );
  }
  if (type === "wallet") {
    return (
      <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 11h8v4h-8z" />
        <path d="M22 10a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="space-y-10 scroll-mt-24" aria-labelledby="features-heading">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Explore Capabilities</p>
        <h2 id="features-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Everything you need for perfect journeys.
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          TripEZ coordinates all aspects of your travel planning inside one visual board.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {LANDING_FEATURES.map((feature) => (
          <article
            key={feature.id}
            className="group rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.colorClass} shadow-inner group-hover:scale-105 transition-transform`}>
                <FeatureIcon type={feature.iconType} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
