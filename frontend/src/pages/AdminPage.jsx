import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

const emptyForm = {
  name: '',
  generic_name: '',
  uses: '',
  dosage: '',
  side_effects: '',
  warnings: '',
  interactions: '',
  manufacturer: '',
  storage: '',
};

function parseList(str) {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.listMedicines(secret);
      setMedicines(res.data || []);
      setAuthenticated(true);
    } catch (err) {
      setError(err.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) loadMedicines();
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    loadMedicines();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const body = {
        name: form.name,
        generic_name: form.generic_name,
        dosage: form.dosage,
        uses: parseList(form.uses),
        side_effects: parseList(form.side_effects),
        warnings: parseList(form.warnings),
        interactions: parseList(form.interactions),
        manufacturer: form.manufacturer,
        storage: form.storage,
      };
      await api.admin.createMedicine(secret, body);
      setMessage('Medicine added successfully');
      setForm(emptyForm);
      loadMedicines();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.admin.uploadJson(secret, file);
      setMessage(res.message);
      loadMedicines();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try {
      await api.admin.deleteMedicine(secret, id);
      setMessage('Medicine deleted');
      loadMedicines();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-4 inline-block text-sm text-medai-600 hover:underline">
          ← Back to chat
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">Upload and manage verified medicine data.</p>

        {!authenticated ? (
          <form onSubmit={handleLogin} className="card mt-6 space-y-4">
            <label className="block text-sm font-medium">Admin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="input-field"
              placeholder="Enter ADMIN_SECRET from .env"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            {error && (
              <p className="text-sm text-red-600">
                {error.includes('Unauthorized admin')
                  ? 'Invalid admin secret. Use ADMIN_SECRET from backend/.env, or sign in at /login/admin for the dashboard.'
                  : error}
              </p>
            )}
          </form>
        ) : (
          <>
            {message && (
              <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">
                {message}
              </p>
            )}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="card mt-6 space-y-3">
              <h2 className="font-semibold">Add Medicine</h2>
              {['name', 'generic_name', 'dosage', 'manufacturer', 'storage'].map((field) => (
                <input
                  key={field}
                  required={['name', 'generic_name', 'dosage'].includes(field)}
                  placeholder={field.replace('_', ' ')}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input-field"
                />
              ))}
              {['uses', 'side_effects', 'warnings', 'interactions'].map((field) => (
                <input
                  key={field}
                  placeholder={`${field} (comma separated)`}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="input-field"
                />
              ))}
              <button type="submit" className="btn-primary" disabled={loading}>
                Add Medicine
              </button>
            </form>

            <div className="card mt-6">
              <h2 className="mb-2 font-semibold">Bulk Upload (JSON)</h2>
              <input type="file" accept="application/json" onChange={handleUpload} />
            </div>

            <div className="card mt-6">
              <h2 className="mb-4 font-semibold">Medicines ({medicines.length})</h2>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {medicines.map((m) => (
                    <li key={m._id} className="flex items-center justify-between py-3 text-sm">
                      <span>
                        {m.name} <span className="text-slate-400">({m.generic_name})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(m._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
