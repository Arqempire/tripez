import styles from "./HowItWorks.module.css";

const steps = [
  "Share your destination and trip dates",
  "Customize your vibe, travelers count, and budget limit",
  "Acquire a polished, collaborative AI travel dashboard",
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={`rounded-3xl border p-8 sm:p-12 shadow-xs space-y-12 scroll-mt-24 ${styles.sectionContainer}`}>
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Simple workflow</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          From draft idea to itinerary in 3 steps.
        </h2>
        <p className="text-sm text-slate-500">
          Our automated generator builds customized dashboards based on quick parameters.
        </p>
      </div>

      <div className="relative mt-8 grid gap-8 md:grid-cols-3">
        {/* Timeline connector line */}
        <div className={`hidden md:block ${styles.timelineConnector}`} aria-hidden="true" />

        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`border p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative flex flex-col gap-4 ${styles.stepCard}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${styles.stepBadge}`}>
              0{index + 1}
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
