import { Link } from 'react-router-dom';
import Header from '../components/Header';

const INTEGRATIONS = [
  { name: 'EHR / HIS', status: 'Coming soon', desc: 'Connect hospital information systems' },
  { name: 'Lab systems', status: 'Coming soon', desc: 'Import lab results for explanations' },
  { name: 'Pharmacy', status: 'Coming soon', desc: 'Refill and inventory sync' },
  { name: 'Wearables', status: 'Coming soon', desc: 'Heart rate, activity, and vitals' },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">Integrations (future)</h1>
        <p className="mt-2 text-sm text-slate-500">Planned connectors for enterprise deployments.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((item) => (
            <div key={item.name} className="card flex flex-col p-4">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">{item.desc}</p>
              <button type="button" disabled className="btn-secondary mt-4 text-xs opacity-60">
                Connect — {item.status}
              </button>
            </div>
          ))}
        </div>
        <Link to="/" className="mt-8 inline-block text-medai-600 hover:underline">
          ← Back
        </Link>
      </main>
    </div>
  );
}
