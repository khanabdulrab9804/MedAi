import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Header({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-medai-600 text-sm font-bold text-white">
              M
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Med<span className="text-medai-600">Ai</span>
            </span>
          </Link>
        </div>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/login/doctor"
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 sm:px-3 sm:text-sm dark:text-teal-300 dark:hover:bg-teal-950/50"
          >
            Doctor
          </Link>
          <Link
            to="/login/patient"
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50 sm:px-3 sm:text-sm dark:text-sky-300 dark:hover:bg-sky-950/50"
          >
            Patient
          </Link>
          <Link
            to="/help"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 sm:inline dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Help
          </Link>
          <Link
            to="/login/admin"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 sm:inline dark:text-slate-300 dark:hover:bg-slate-800"
            title="Admin dashboard (email login)"
          >
            Admin
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
