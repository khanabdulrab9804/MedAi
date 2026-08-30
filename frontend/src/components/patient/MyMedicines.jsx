import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

export default function MyMedicines() {
  const { isAuthenticated, user } = useAuth();
  const [myList, setMyList] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [schedule, setSchedule] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadMyList = useCallback(async () => {
    const res = await api.getMyMedicines();
    setMyList(res.data || []);
  }, []);

  const loadOptions = useCallback(async () => {
    const res = await api.getAllMedicines();
    setOptions(res.data || []);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
      setLoading(false);
      setError('Please sign in as a patient to manage your medicines.');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([loadMyList(), loadOptions()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, user?.role, loadMyList, loadOptions]);

  const addMedicine = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.addMyMedicine({
        medicineId: selectedId,
        schedule: schedule.trim(),
        notes: notes.trim(),
      });
      setMessage('Medicine added to your list');
      setSelectedId('');
      setSchedule('');
      setNotes('');
      await loadMyList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMedicine = async (id) => {
    setError(null);
    try {
      await api.removeMyMedicine(id);
      setMyList((prev) => prev.filter((m) => m.id !== id));
      setMessage('Medicine removed');
    } catch (err) {
      setError(err.message);
    }
  };

  const alreadyAdded = new Set(myList.map((m) => String(m.medicineId)));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <form onSubmit={addMedicine} className="card space-y-3 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Add to my medicines</h2>

        <label className="block text-sm">
          Select medicine
          <select
            className="input mt-1 w-full"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            required
          >
            <option value="">Choose a medicine…</option>
            {options.map((m) => (
              <option key={m._id} value={m._id} disabled={alreadyAdded.has(String(m._id))}>
                {m.name}
                {m.generic_name ? ` (${m.generic_name})` : ''}
                {alreadyAdded.has(String(m._id)) ? ' — already added' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Schedule
          <input
            className="input mt-1 w-full"
            placeholder="e.g. 8:00 AM and 8:00 PM"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </label>

        <label className="block text-sm">
          Notes
          <input
            className="input mt-1 w-full"
            placeholder="e.g. Take after food, avoid alcohol"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={!selectedId || saving}>
          {saving ? 'Adding…' : 'Add medicine'}
        </button>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="card p-4">
        <h2 className="mb-3 font-semibold">My medicines ({myList.length})</h2>
        {myList.length === 0 ? (
          <p className="text-sm text-slate-500">No medicines yet. Pick one from the dropdown above.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {myList.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
              >
                <div>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{m.name}</span>
                  {m.generic_name && (
                    <span className="ml-1 text-xs text-slate-500">({m.generic_name})</span>
                  )}
                  {m.schedule && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Schedule:</span> {m.schedule}
                    </p>
                  )}
                  {m.notes && (
                    <p className="text-xs text-slate-500">
                      <span className="font-medium">Notes:</span> {m.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMedicine(m.id)}
                  className="shrink-0 text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
