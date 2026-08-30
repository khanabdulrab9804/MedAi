import { Link } from 'react-router-dom';
import Header from '../components/Header';

const LAYERS = [
  {
    title: 'Entry points',
    items: ['Patient portal', 'Doctor portal', 'Admin panel', 'Voice input'],
  },
  {
    title: 'API layer',
    items: ['REST API', 'JWT + RBAC', 'Rate limiting'],
  },
  {
    title: 'Services',
    items: ['Auth', 'Chat + multi-agent router', 'RAG retrieve & rerank', 'File ingest + OCR stub'],
  },
  {
    title: 'AI',
    items: ['Agent router', 'Google Gemini', 'Embeddings', 'Safety guardrails'],
  },
  {
    title: 'Data',
    items: ['MongoDB — users, chats, audit', 'ChromaDB — vectors', 'PDF knowledge base'],
  },
];

const RAG_FLOW = ['PDF', 'Chunking', 'Embedding', 'ChromaDB', 'Retrieve', 'Rerank', 'LLM', 'Answer'];

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">MedAi system architecture</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Advanced AI assistant for doctors & patients — educational deployment.
        </p>

        <div className="mt-8 space-y-4">
          {LAYERS.map((layer) => (
            <div key={layer.title} className="card p-4">
              <h2 className="text-sm font-semibold text-medai-600">{layer.title}</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-6 p-4">
          <h2 className="font-semibold">RAG pipeline</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {RAG_FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded bg-medai-100 px-2 py-1 font-medium text-medai-800 dark:bg-medai-900/50 dark:text-medai-200">
                  {step}
                </span>
                {i < RAG_FLOW.length - 1 && <span className="text-slate-400">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="card mt-6 p-4">
          <h2 className="font-semibold">Multi-agent flow</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            User question → Agent router → Drug info / Interaction / Dosage / Safety / Triage → RAG
            (ChromaDB) → Gemini → Explainable answer with sources
          </p>
        </div>

        <div className="card mt-6 p-4">
          <h2 className="font-semibold">Security & compliance</h2>
          <ul className="mt-2 grid gap-1 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2">
            <li>HIPAA-aware practices</li>
            <li>AES-256 encryption (production)</li>
            <li>RBAC — patient / doctor / admin</li>
            <li>Audit logs & session JWT</li>
            <li>Input sanitization</li>
            <li>Rate limiting (production)</li>
          </ul>
        </div>

        <Link to="/" className="mt-8 inline-block text-medai-600 hover:underline">
          ← Back to app
        </Link>
      </main>
    </div>
  );
}
