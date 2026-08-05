import styles from "./Features.module.css";

const SparklesIcon = () => (
  <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.912 3.874 4.276.622-3.094 3.016.73 4.258L12 14.758l-3.824 2.012.73-4.258-3.094-3.016 4.276-.622z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M12 11h8v4h-8z" />
    <path d="M22 10a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2" />
  </svg>
);

const UsersCollabIcon = () => (
  <svg className="h-6 w-6 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const features = [
  {
    title: "Smart AI Itineraries",
    description:
      "Turn a rough destination idea into a curated day-by-day plan with stay, dining, and scenic recommendations.",
    icon: <SparklesIcon />,
    colorClass: "bg-sky-50 text-sky-600 border-sky-100/50"
  },
  {
    title: "Budget-Aware Tracking",
    description:
      "Keep your expenses organized. Log spending, view statistical breakdowns, and split costs to stay on budget.",
    icon: <WalletIcon />,
    colorClass: "bg-amber-50 text-amber-600 border-amber-100/50"
  },
  {
    title: "Real-Time Collaboration",
    description:
      "Coordinate with friends easily. Invite collaborators to plan dates, delegate vault files, and vote on activities.",
    icon: <UsersCollabIcon />,
    colorClass: "bg-violet-50 text-violet-600 border-violet-100/50"
  },
];

export default function Features() {
  return (
    <section id="features" className="space-y-10 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Explore Capabilities</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Everything you need for perfect journeys.
        </h2>
        <p className="text-sm text-slate-500">
          TripEZ coordinates all aspects of your travel planning inside one visual board.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article 
            key={feature.title} 
            className={`group rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between ${styles.featureCard}`}
          >
            <div className="space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.colorClass} shadow-inner group-hover:scale-105 transition-transform`}>
                {feature.icon}
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
