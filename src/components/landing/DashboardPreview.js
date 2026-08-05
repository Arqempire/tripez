import styles from "./DashboardPreview.module.css";

export default function DashboardPreview() {
  return (
    <div className={`relative rounded-[2.25rem] border border-slate-200 p-5 ${styles.mockupFrame}`}>
      
      {/* App Frame Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 px-2">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-slate-200" />
          <span className="h-3 w-3 rounded-full bg-slate-200" />
          <span className="h-3 w-3 rounded-full bg-slate-200" />
        </div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 rounded-full px-3 py-1">
          http://tripezz.netlify.app/
        </div>
        <span className="w-8" aria-hidden="true" />
      </div>

      {/* Central Mockup Workspace */}
      <div className="relative bg-slate-950 rounded-[1.5rem] p-5 text-white overflow-hidden shadow-inner min-h-[290px] flex flex-col justify-between">
        
        {/* Background Glows */}
        <div className={`absolute -top-12 -left-12 w-36 h-36 rounded-full pointer-events-none ${styles.glowSky}`} aria-hidden="true" />
        <div className={`absolute -bottom-12 -right-12 w-36 h-36 rounded-full pointer-events-none ${styles.glowIndigo}`} aria-hidden="true" />

        {/* Mockup Trip Info Header */}
        <div className="relative flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-white/5 pb-2.5">
          <span className="flex items-center gap-1.5 text-slate-200">
            <svg className="h-3.5 w-3.5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
            </svg>
            Srinagar, Kashmir
          </span>
          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-semibold text-[9px]">
            3 Days Draft Plan
          </span>
        </div>

        {/* Day slots timeline */}
        <div className="relative mt-3 space-y-2">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 1: Historic Dal Lake</p>
            <p className="text-[11px] text-slate-300 line-clamp-1">Historic shikara ride, walks beside Dal Lake, and a mountain sunset view.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 2: Gondola Snow Adventure</p>
            <p className="text-[11px] text-slate-300 line-clamp-1">Ride the high Gondola, ski in snowy meadows, and snap alpine photos.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Day 3: Scenic Valley Trek</p>
            <p className="text-[11px] text-slate-300 line-clamp-1">Explore Betaab Valley, hike pines of Aru, and visit saffron farms.</p>
          </div>
        </div>
      </div>

      {/* Floating Widget 1: Expense breakdown */}
      <div className={`p-4 rounded-2xl shadow-xl w-48 hidden sm:block ${styles.floatingWidgetExpense}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner shrink-0">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 3h12" />
              <path d="M6 8h12" />
              <path d="m6 13 8.5 8" />
              <path d="M6 13h3a4 4 0 0 0 0-8" />
            </svg>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Expenses</p>
            <p className="text-xs font-bold text-slate-900">Remaining Budget</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
            <span>Spent: ₹32,400</span>
            <span className="text-emerald-600">₹12,600 Left</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-amber-500 rounded-full ${styles.progressSpent}`} />
          </div>
        </div>
      </div>

      {/* Floating Widget 2: Collaborators */}
      <div className={`p-4 rounded-2xl shadow-xl w-52 hidden sm:block ${styles.floatingWidgetCollab}`}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-inner shrink-0">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Collab Status</p>
            <p className="text-xs font-bold text-slate-900">Trip Members</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            <div className="h-6 w-6 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
              AR
            </div>
            <div className="h-6 w-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
              KS
            </div>
            <div className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-xs">
              JD
            </div>
          </div>
          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Sync Active
          </span>
        </div>
      </div>

    </div>
  );
}
