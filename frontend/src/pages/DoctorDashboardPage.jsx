import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import PortalLayout from '../components/portal/PortalLayout';
import MedicineChatPage from '../components/MedicineChatPage';
import InteractionChecker from '../components/doctor/InteractionChecker';
import DoseCalculator from '../components/doctor/DoseCalculator';
import DoctorPatientList from '../components/doctor/DoctorPatientList';
import { useLanguage } from '../context/LanguageContext';

function DoctorQuickActions({ onNavigate }) {
  const { t } = useLanguage();
  const actions = [
    { id: 'interactions', label: t.interactions },
    { id: 'dose', label: t.doseCalc },
    { id: 'ckd', label: 'CKD Adjustment' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((a) => (
        <button key={a.id} type="button" className="card p-4 text-left hover:ring-2 hover:ring-medai-400" onClick={() => onNavigate(a.id)}>
          <span className="font-medium text-medai-700 dark:text-medai-300">{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function ClinicalGuidelines() {
  return (
    <div className="card p-4 text-sm text-slate-600 dark:text-slate-400">
      <h2 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">Guideline-based recommendations</h2>
      <p>Answers in Clinical Chat mode use the PDF knowledge base when available, with fallback to structured medicine records.</p>
      <p className="mt-2">Use interaction checker and dose tools for quick clinical support — always verify with local protocols.</p>
    </div>
  );
}

export default function DoctorDashboardPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('chat');
  const [toolTab, setToolTab] = useState(null);
  const [ckdMsg, setCkdMsg] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const tabs = [
    { id: 'chat', label: t.chat },
    { id: 'patients', label: 'Patients' },
    { id: 'actions', label: t.quickActions },
    { id: 'interactions', label: t.interactions },
    { id: 'dose', label: t.doseCalc },
    { id: 'guidelines', label: 'Guidelines' },
  ];

  const runCkdAdjustment = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/tools/ckd-adjustment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('medai-auth-token')}`,
        },
        body: JSON.stringify({ weightKg: 70, creatinine: 1.2 }),
      });
      const data = await res.json();
      setCkdMsg(data.data?.message || data.message);
      setTab('actions');
    } catch (e) {
      setCkdMsg(e.message);
    }
  };

  return (
    <ProtectedRoute role="doctor">
      <PortalLayout
        title="Clinical Assistant"
        badge="Doctor"
        badgeClass="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200"
        tabs={tabs}
        activeTab={tab}
        onTabChange={(id) => {
          setTab(id);
          setToolTab(null);
        }}
      >
        {tab === 'chat' ? (
          <MedicineChatPage portal="doctor" hideHeader />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === 'patients' && (
              <div className="grid h-full min-h-[480px] gap-4 lg:grid-cols-3">
                <DoctorPatientList
                  selectedId={selectedPatient?.id}
                  onSelect={setSelectedPatient}
                />
                <div className="card overflow-y-auto p-4 lg:col-span-2">
                  {selectedPatient ? (
                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        {selectedPatient.name}
                      </h2>
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs font-medium uppercase text-slate-500">Condition</dt>
                          <dd className="text-slate-800 dark:text-slate-100">{selectedPatient.condition}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase text-slate-500">Email</dt>
                          <dd className="text-slate-800 dark:text-slate-100">{selectedPatient.email}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase text-slate-500">Medicines on file</dt>
                          <dd className="text-slate-800 dark:text-slate-100">{selectedPatient.medicineCount}</dd>
                        </div>
                      </dl>
                      <p className="text-xs text-slate-500">
                        Patient data is shared from the patient portal profile. Use Clinical Chat for
                        medicine Q&amp;A about this patient&apos;s condition.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select a patient to view their name and condition. Patients appear here after they
                      register or update their profile in the patient portal.
                    </p>
                  )}
                </div>
              </div>
            )}
            {tab === 'actions' && (
              <div className="space-y-4">
                <DoctorQuickActions
                  onNavigate={(id) => {
                    if (id === 'ckd') runCkdAdjustment();
                    else setTab(id);
                  }}
                />
                {ckdMsg && <p className="text-sm text-slate-600 dark:text-slate-400">{ckdMsg}</p>}
              </div>
            )}
            {tab === 'interactions' && <InteractionChecker />}
            {tab === 'dose' && <DoseCalculator />}
            {tab === 'guidelines' && <ClinicalGuidelines />}
          </div>
        )}
      </PortalLayout>
    </ProtectedRoute>
  );
}
