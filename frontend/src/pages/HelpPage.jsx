import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & onboarding</h1>
        <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400">
          <li className="card p-4">
            <strong>1. Search medicines</strong> — Use the sidebar or type a medicine name in chat.
          </li>
          <li className="card p-4">
            <strong>2. Patient portal</strong> —{' '}
            <Link to="/login/patient" className="text-medai-600 underline">
              Sign in
            </Link>{' '}
            for reminders, prescription upload, and health tips.
          </li>
          <li className="card p-4">
            <strong>3. Doctor portal</strong> — Clinical tools, interaction checker, and dose calculator.
          </li>
          <li className="card p-4">
            <strong>Shortcuts</strong> — Voice input in chat; dark mode in header; export chat when signed in.
          </li>
        </ul>
        <Link to="/" className="mt-6 inline-block text-medai-600 hover:underline">
          ← Back to chat
        </Link>
      </main>
    </div>
  );
}
