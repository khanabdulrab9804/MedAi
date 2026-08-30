import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDetailedAnalytics(), api.getRagComparison()])
      .then(([det, comp]) => {
        setData(det.data);
        setComparison(comp.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-sm text-slate-500">Analytics unavailable.</p>;

  const maxQ = Math.max(...(data.queriesOverTime?.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total queries" value={data.kpis.totalQueries} />
        <Kpi label="Avg. confidence" value={`${data.kpis.avgConfidence}%`} />
        <Kpi label="Resolved by MedAi" value={data.kpis.resolvedByMedAi} />
        <Kpi label="Escalated to doctor" value={data.kpis.escalatedToDoctor} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-4 font-semibold">Queries over time</h3>
          <div className="flex h-32 items-end gap-2">
            {data.queriesOverTime?.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-medai-500"
                  style={{ height: `${(d.count / maxQ) * 100}%`, minHeight: d.count ? 4 : 0 }}
                  title={`${d.count} queries`}
                />
                <span className="text-[9px] text-slate-500">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <h3 className="mb-4 font-semibold">Top categories</h3>
          <ul className="space-y-2">
            {data.topCategories?.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-sm">
                <span className="w-24 truncate">{c.name}</span>
                <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{
                      width: `${Math.min(100, (c.count / (data.topCategories[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-semibold">RAG performance</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Retrieval success" value={`${data.ragMetrics.retrievalSuccess}%`} />
          <Metric label="Chunk hit rate" value={`${data.ragMetrics.chunkHitRate}%`} />
          <Metric label="Avg response" value={`${data.ragMetrics.avgResponseTimeSec}s`} />
          <Metric label="Hallucination rate" value={`${data.ragMetrics.hallucinationRate}%`} />
        </div>
      </div>

      {comparison && (
        <div className="card overflow-x-auto p-4">
          <h3 className="mb-3 font-semibold">With RAG vs. without RAG</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="py-2">Metric</th>
                <th>Without RAG</th>
                <th>With RAG (MedAi)</th>
              </tr>
            </thead>
            <tbody>
              <CmpRow label="Accuracy" without={`${comparison.withoutRag.accuracy}%`} withVal={`${comparison.withRag.accuracy}%`} />
              <CmpRow
                label="Hallucination"
                without={`${comparison.withoutRag.hallucinationRate}%`}
                withVal={`${comparison.withRag.hallucinationRate}%`}
              />
              <CmpRow
                label="Clinical relevance"
                without={`${comparison.withoutRag.clinicalRelevance}%`}
                withVal={`${comparison.withRag.clinicalRelevance}%`}
              />
              <CmpRow
                label="User trust"
                without={`${comparison.withoutRag.userTrust}/5`}
                withVal={`${comparison.withRag.userTrust}/5`}
              />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-medai-700 dark:text-medai-300">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function CmpRow({ label, without, withVal }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800">
      <td className="py-2">{label}</td>
      <td className="text-red-600">{without}</td>
      <td className="font-medium text-green-600">{withVal}</td>
    </tr>
  );
}
