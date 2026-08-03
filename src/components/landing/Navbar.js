import Link from "next/link";

export default function Navbar() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-sky-600 focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/85 border-b border-slate-200/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg font-bold tracking-tight text-slate-900">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-sky-100">
              <svg className="h-5 w-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.5 12c-2-1.5-4.5-2-6.5-2L10 2H8.5l2 8H5L3.5 8H2.5L4 12l-1.5 4h1L5 14h5.5l-2 8H10l5-8c2 0 4.5-.5 6.5-2z" />
              </svg>
            </div>
            <span>TripEZ</span>
          </div>

          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
            <a
              href="#features"
              className="hover:text-sky-700 transition hidden sm:inline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md px-1 py-0.5"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-sky-700 transition hidden md:inline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md px-1 py-0.5"
            >
              How it works
            </a>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 px-3.5 sm:px-5 py-2 text-slate-800 font-bold transition shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 sm:px-5 py-2 font-bold shadow-xs transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
