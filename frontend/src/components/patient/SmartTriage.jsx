import { useState } from 'react';
import { api } from '../../services/api';

const LEVEL_CLASS = {
  urgent: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  moderate: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40',
  routine: 'border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/40',
};

export default function SmartTriage() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.runTriage(symptoms.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={run} className="card space-y-3 p-6">
        <h2 className="font-semibold">Smart triage</h2>
        <p className="text-xs text-slate-500">
          Describe what you feel (pain, fever, cough, etc.). You will get guidance and medicine options from
          our database — not a diagnosis.
        </p>
        <textarea
          className="input min-h-[120px] w-full"
          placeholder="e.g. I have headache and mild fever for 2 days, body aches"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing…' : 'Get guidance'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <div className={`card space-y-4 border-2 p-6 ${LEVEL_CLASS[result.level] || LEVEL_CLASS.moderate}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Priority: {result.label}</p>
            <p className="mt-2 text-sm leading-relaxed">{result.message || result.summary}</p>
          </div>

          {result.possibleCauses?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                What might be going on
              </h3>
              <ul className="mt-1 list-inside list-disc text-sm">
                {result.possibleCauses.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}

          {result.whatToDo?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                What you should do
              </h3>
              <ul className="mt-1 list-inside list-decimal text-sm">
                {result.whatToDo.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </section>
          )}

          {result.medicineAdvice && (
            <section className="rounded-lg bg-white/60 p-3 dark:bg-slate-900/40">
              <h3 className="text-xs font-semibold uppercase text-medai-700 dark:text-medai-300">
                Medicine guidance
              </h3>
              <p className="mt-1 text-sm">{result.medicineAdvice}</p>
            </section>
          )}

          {result.suggestedMedicines?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                From our medicine database
              </h3>
              <ul className="mt-2 space-y-2">
                {result.suggestedMedicines.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-lg bg-white/70 px-3 py-2 text-sm dark:bg-slate-900/50"
                  >
                    <span className="font-medium">{m.name}</span>
                    {m.generic_name && (
                      <span className="text-slate-500"> ({m.generic_name})</span>
                    )}
                    <p className="text-xs text-slate-600 dark:text-slate-400">{m.dosage}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.whenToSeeDoctor && (
            <p className="text-xs font-medium">{result.whenToSeeDoctor}</p>
          )}

          <p className="border-t border-slate-200/50 pt-3 text-[10px] leading-snug opacity-80 dark:border-slate-700">
            {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
