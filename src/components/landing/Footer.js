import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`px-6 py-10 text-center text-xs font-semibold text-slate-500 ${styles.footer}`}>
      <p>TripEZ © 2026 — Crafted with ❤️ by ArQ & Kaiser for travel enthusiasts seeking fewer surprises.</p>
    </footer>
  );
}
