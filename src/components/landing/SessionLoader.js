import styles from "./SessionLoader.module.css";

export default function SessionLoader() {
  return (
    <div className={`flex min-h-screen flex-col items-center justify-center text-slate-900 ${styles.loaderContainer}`}>
      <div className="relative flex flex-col items-center gap-4">
        <svg className="animate-spin h-8 w-8 text-sky-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase animate-pulse">Checking session...</p>
      </div>
    </div>
  );
}
