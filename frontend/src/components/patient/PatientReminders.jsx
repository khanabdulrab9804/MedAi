import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

export default function PatientReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [note, setNote] = useState('Take as prescribed');
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getReminders();
      setReminders(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.createReminder({ medicineName: name.trim(), dosageNote: note });
    setName('');
    load();
  };

  const markTaken = async (id) => {
    await api.markReminderTaken(id);
    load();
  };

  const remove = async (id) => {
    await api.deleteReminder(id);
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="card space-y-3 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Add reminder</h2>
        <input
          className="input w-full"
          placeholder="Medicine name (e.g. Dolo 650)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input w-full"
          placeholder="Dosage note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Add reminder
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {reminders.map((r) => (
          <div key={r._id} className="card p-4">
            <p className="font-medium text-slate-800 dark:text-slate-100">{r.medicineName}</p>
            <p className="text-xs text-slate-500">{r.dosageNote}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-primary text-xs" onClick={() => markTaken(r._id)}>
                Mark as taken
              </button>
              <button type="button" className="btn-secondary text-xs" onClick={() => remove(r._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {!reminders.length && (
          <p className="text-sm text-slate-500">No reminders yet. Add your first medicine reminder above.</p>
        )}
      </div>
    </div>
  );
}
