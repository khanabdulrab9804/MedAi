import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

function formatLastActive(date) {
  if (!date) return 'Unknown';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

export default function DoctorPatientList({ onSelect, selectedId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getDoctorPatients()
      .then((res) => setPatients(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h2 className="font-semibold">Patients</h2>
        <p className="text-xs text-slate-500">
          {patients.length} registered patient{patients.length === 1 ? '' : 's'}
        </p>
      </div>
      {patients.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">
          No patients yet. Patients appear here after they register in the patient portal with their
          name and condition.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
          {patients.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect?.(p)}
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  selectedId === p.id ? 'bg-medai-50 dark:bg-medai-900/20' : ''
                }`}
              >
                <span className="font-medium text-slate-800 dark:text-slate-100">{p.name}</span>
                <span className="text-xs text-slate-500">
                  {p.condition} · {formatLastActive(p.lastActive)}
                </span>
                {p.medicineCount > 0 && (
                  <span className="text-xs text-medai-600 dark:text-medai-400">
                    {p.medicineCount} medicine{p.medicineCount === 1 ? '' : 's'} on file
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
