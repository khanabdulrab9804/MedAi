import { useState } from 'react';
import { api } from '../../services/api';

const SEVERITY_CLASS = {
  major: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  minor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function InteractionChecker() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    const drugs = input.split(',').map((s) => s.trim()).filter(Boolean);
    if (drugs.length < 2) return;
    setLoading(true);
    try {
      const res = await api.checkInteractions(drugs);
      setResult(res.data);
    } catch (err) {
      setResult({ message: err.message, interactions: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl space-y-4 p-6">
      <h2 className="font-semibold">Drug interaction checker</h2>
      <p className="text-sm text-slate-500">Enter two or more medicine names separated by commas.</p>
      <form onSubmit={check} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Dolo 650, Warfarin"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          Check
        </button>
      </form>
      {result && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">{result.message}</p>
          {result.interactions?.map((ix, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 text-sm ${SEVERITY_CLASS[ix.severity] || SEVERITY_CLASS.moderate}`}
            >
              <p className="font-semibold capitalize">
                {ix.severity} — {ix.drugA} + {ix.drugB}
              </p>
              <p className="mt-1">{ix.description}</p>
              <p className="mt-1 text-xs opacity-80">{ix.management}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
