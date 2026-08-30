export default function SourcePanel({ sources, confidence, agent, usedRag }) {
  if (!sources?.length && confidence == null) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700">
      {confidence != null && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Confidence</span>
          <div className="h-2 max-w-[140px] flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-medai-500 transition-all"
              style={{ width: `${Math.min(100, confidence)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-medai-600">{confidence}%</span>
        </div>
      )}
      {agent && (
        <p className="text-[10px] text-slate-500">
          Agent: <span className="font-medium text-medai-600">{agent.label}</span>
          {usedRag && ' · RAG + rerank'}
        </p>
      )}
      {sources?.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-400">
            Sources ({sources.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {sources.map((s, i) => (
              <li key={i} className="rounded-lg bg-amber-50/80 p-2 dark:bg-amber-950/20">
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {s.source}
                  {s.page && <span className="text-slate-500"> · {s.page}</span>}
                  {s.relevance != null && (
                    <span className="ml-1 text-medai-600">({s.relevance}% match)</span>
                  )}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{s.excerpt}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
