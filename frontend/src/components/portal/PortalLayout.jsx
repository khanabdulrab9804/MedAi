import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LANGUAGES, useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../ThemeToggle';

export default function PortalLayout({
  title,
  badge,
  badgeClass,
  tabs,
  activeTab,
  onTabChange,
  children,
}) {
  const { user, logout } = useAuth();
  const { lang, setLanguage, t } = useLanguage();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-bold text-medai-600">
              MedAi
            </Link>
            <span className="text-slate-400">|</span>
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h1>
            {badge && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
                {badge}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lang}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
              aria-label="Language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <ThemeToggle />
            <span className="hidden text-xs text-slate-500 sm:inline">{user?.name}</span>
            <button type="button" onClick={logout} className="btn-secondary text-xs">
              Sign out
            </button>
          </div>
        </div>
        {tabs?.length > 0 && (
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-medai-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
        <p className="mx-auto max-w-7xl px-4 pb-2 text-[10px] text-slate-500">{t.compliance}</p>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col min-h-0 overflow-hidden px-4 py-3">
        {children}
      </main>
    </div>
  );
}
