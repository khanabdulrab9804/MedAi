import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import PortalLayout from '../components/portal/PortalLayout';
import MedicineChatPage from '../components/MedicineChatPage';
import PatientReminders from '../components/patient/PatientReminders';
import PrescriptionScanner from '../components/patient/PrescriptionScanner';
import SmartTriage from '../components/patient/SmartTriage';
import HealthTips from '../components/patient/HealthTips';
import OnboardingTour from '../components/OnboardingTour';
import MyMedicines from '../components/patient/MyMedicines';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function PatientSettings() {
  const { lang, setLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const [condition, setCondition] = useState(user?.profile?.condition || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.updateProfile({ profile: { condition: condition.trim() } });
      updateUser(res.data.user);
      setMessage('Profile saved. Your doctor can see this in the Patients tab.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={saveProfile} className="card max-w-md space-y-4 p-6">
      <h2 className="font-semibold">Settings</h2>
      <label className="block text-sm">
        Your name
        <input className="input mt-1 w-full" value={user?.name || ''} readOnly disabled />
      </label>
      <label className="block text-sm">
        Condition / disease
        <input
          className="input mt-1 w-full"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="e.g. Hypertension, Type 2 diabetes"
          maxLength={200}
        />
        <span className="mt-1 block text-xs text-slate-500">
          Visible to your doctor in the doctor portal patient list.
        </span>
      </label>
      <label className="block text-sm">
        Language
        <select className="input mt-1 w-full" value={lang} onChange={(e) => setLanguage(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
        <p className="font-medium text-green-700 dark:text-green-400">HIPAA-ready practices</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Data encryption (AES-256 at rest in production)</p>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Session timeout: 7 days (JWT)</p>
      </div>
    </form>
  );
}

export default function PatientDashboardPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('chat');
  const [showTour, setShowTour] = useState(
    () => !localStorage.getItem('medai-onboarding-done')
  );

  const tabs = [
    { id: 'chat', label: t.chat },
    { id: 'medicines', label: t.medicines },
    { id: 'reminders', label: t.reminders },
    { id: 'upload', label: t.uploadRx },
    { id: 'triage', label: 'Triage' },
    { id: 'tips', label: t.healthTips },
    { id: 'settings', label: t.settings },
  ];

  const finishTour = () => {
    localStorage.setItem('medai-onboarding-done', '1');
    setShowTour(false);
  };

  return (
    <ProtectedRoute role="patient">
      <PortalLayout
        title="My Medicine Helper"
        badge="Patient"
        badgeClass="bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      >
        {tab === 'chat' ? (
          <MedicineChatPage portal="patient" hideHeader />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === 'medicines' && <MyMedicines />}
            {tab === 'reminders' && <PatientReminders />}
            {tab === 'upload' && <PrescriptionScanner />}
            {tab === 'triage' && <SmartTriage />}
            {tab === 'tips' && <HealthTips />}
            {tab === 'settings' && <PatientSettings />}
          </div>
        )}
        {showTour && <OnboardingTour onComplete={finishTour} />}
      </PortalLayout>
    </ProtectedRoute>
  );
}
