import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import PortalLayout from '../components/portal/PortalLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [ov, us] = await Promise.all([api.getAnalyticsOverview(), api.getAnalyticsUsers()]);
        setOverview(ov.data);
        setUsers(us.data || []);
      } catch {
        setOverview(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const uploadPdf = async (e) => {
    e.preventDefault();
    if (!pdfFile || !secret) return;
    try {
      const res = await api.uploadKbPdf(secret, pdfFile);
      setMsg(res.message || 'PDF indexed');
    } catch (err) {
      setMsg(err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'users', label: 'Users' },
    { id: 'kb', label: 'Knowledge base' },
    { id: 'legacy', label: 'Medicine admin' },
  ];

  return (
    <ProtectedRoute role="admin">
      <PortalLayout
        title="Admin Console"
        badge="Admin"
        badgeClass="bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200"
        tabs={tabs}
        activeTab={tab}
        onTabChange={setTab}
      >
        {loading && tab === 'overview' ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'overview' && overview && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Users" value={overview.users} />
                <StatCard label="Medicines" value={overview.medicines} />
                <StatCard label="Queries" value={overview.queries} />
                <StatCard label="KB chunks" value={overview.knowledgeBase?.chunkCount ?? 0} />
              </div>
            )}
            {tab === 'analytics' && <AnalyticsDashboard />}
            {tab === 'users' && (
              <div className="card overflow-x-auto p-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b dark:border-slate-700">
                      <th className="py-2">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2">{u.name}</td>
                        <td>{u.email}</td>
                        <td className="capitalize">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === 'kb' && (
              <form onSubmit={uploadPdf} className="card max-w-lg space-y-3 p-6">
                <h2 className="font-semibold">Upload PDF knowledge base</h2>
                <input
                  className="input w-full"
                  type="password"
                  placeholder="Admin secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
                <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0])} />
                <button type="submit" className="btn-primary">
                  Upload & index
                </button>
                {msg && <p className="text-sm text-slate-600">{msg}</p>}
              </form>
            )}
            {tab === 'legacy' && (
              <p className="text-sm">
                <Link to="/admin" className="text-medai-600 underline">
                  Open legacy medicine CRUD (admin secret)
                </Link>
              </p>
            )}
          </>
        )}
      </PortalLayout>
    </ProtectedRoute>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-medai-700 dark:text-medai-300">{value}</p>
    </div>
  );
}
