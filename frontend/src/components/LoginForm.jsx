import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const ROLE_CONFIG = {
  doctor: {
    title: 'Doctor sign in',
    subtitle: 'Clinical medicine assistant for healthcare professionals',
    badge: 'Clinical portal',
    accent: 'from-teal-600 to-emerald-700',
    ring: 'ring-teal-500/30',
    demoEmail: 'doctor@medai.com',
    demoPassword: 'doctor123',
    dashboard: '/doctor',
    otherRole: { label: 'Patient', path: '/login/patient' },
  },
  patient: {
    title: 'Patient sign in',
    subtitle: 'Ask questions about your medicines in plain language',
    badge: 'Patient portal',
    accent: 'from-sky-600 to-medai-600',
    ring: 'ring-sky-500/30',
    demoEmail: 'patient@medai.com',
    demoPassword: 'patient123',
    dashboard: '/patient',
    otherRole: { label: 'Doctor', path: '/login/doctor' },
  },
  admin: {
    title: 'Admin sign in',
    subtitle: 'System analytics, users, and knowledge base management',
    badge: 'Admin console',
    accent: 'from-violet-600 to-purple-700',
    ring: 'ring-violet-500/30',
    demoEmail: 'admin@medai.com',
    demoPassword: 'admin123',
    dashboard: '/admin/dashboard',
    otherRole: { label: 'Home', path: '/' },
  },
};

export default function LoginForm({ role, title, subtitle, redirectTo }) {
  const base = ROLE_CONFIG[role] || ROLE_CONFIG.patient;
  const config = {
    ...base,
    title: title || base.title,
    subtitle: subtitle || base.subtitle,
    dashboard: redirectTo || base.dashboard,
  };
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password, role);
      } else {
        await register(email, password, name, role, role === 'patient' ? condition : undefined);
      }
      navigate(config.dashboard, { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail(config.demoEmail);
    setPassword(config.demoPassword);
    setMode('login');
  };

  return (
    <div className="flex min-h-screen">
      <div
        className={`hidden w-1/2 flex-col justify-between bg-gradient-to-br ${config.accent} p-10 text-white lg:flex`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">
            M
          </span>
          <span className="text-xl font-semibold">MedAi</span>
        </Link>
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/80">
            {config.badge}
          </p>
          <h1 className="text-3xl font-bold leading-tight">{config.title}</h1>
          <p className="mt-3 max-w-md text-white/90">{config.subtitle}</p>
        </div>
        <p className="text-sm text-white/70">Educational use only — not for emergency care.</p>
      </div>

      <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12">
          <div className={`card w-full max-w-md ring-4 ${config.ring}`}>
            <div className="mb-6 lg:hidden">
              <span className="rounded-full bg-medai-100 px-3 py-1 text-xs font-medium text-medai-800 dark:bg-medai-900/50 dark:text-medai-200">
                {config.badge}
              </span>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                {config.title}
              </h2>
            </div>

            <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Full name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </div>
              )}

              {mode === 'register' && role === 'patient' && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Condition / disease
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="e.g. Hypertension, Type 2 diabetes"
                    maxLength={200}
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <button
              type="button"
              onClick={fillDemo}
              className="mt-4 w-full text-center text-xs text-medai-600 hover:underline dark:text-medai-400"
            >
              Use demo account ({config.demoEmail})
            </button>

            {role !== 'admin' && (
              <p className="mt-6 text-center text-sm text-slate-500">
                {role === 'doctor' ? 'Not a doctor?' : 'Are you a doctor?'}{' '}
                <Link to={config.otherRole.path} className="font-medium text-medai-600 hover:underline">
                  {config.otherRole.label} login
                </Link>
              </p>
            )}
            <p className="mt-2 text-center text-sm text-slate-500">
              <Link to="/" className="hover:text-medai-600">
                ← Back to public chat
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
