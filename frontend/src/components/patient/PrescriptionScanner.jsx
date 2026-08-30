import { useState } from 'react';
import { api } from '../../services/api';

export default function PrescriptionScanner() {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const scan = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scanPrescription(file);
      setExtracted(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={scan} className="card space-y-4 p-6">
        <h2 className="font-semibold">Upload prescription</h2>
        <p className="text-xs text-slate-500">PDF or image up to 10MB. We scan and list medicines found in your prescription.</p>
        <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button type="submit" className="btn-primary" disabled={!file || loading}>
          {loading ? 'Processing…' : 'Upload & scan'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
      <div className="card p-6">
        <h3 className="font-semibold">Extracted medicines</h3>
        {!extracted ? (
          <p className="mt-4 text-sm text-slate-500">Results appear here after scan.</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-slate-500">{extracted.note}</p>
            <ul className="mt-4 space-y-2">
              {extracted.medicines?.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.dosageNote}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary mt-4 text-xs">
              Add to my list
            </button>
          </>
        )}
      </div>
    </div>
  );
}
