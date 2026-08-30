export default function MedicineCard({ medicine, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(medicine)}
      className={`card w-full text-left transition hover:border-medai-300 hover:shadow-md dark:hover:border-medai-700 ${
        selected ? 'ring-2 ring-medai-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{medicine.name}</h3>
          <p className="text-xs text-medai-600 dark:text-medai-400">{medicine.generic_name}</p>
        </div>
        {medicine.manufacturer && (
          <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
            {medicine.manufacturer}
          </span>
        )}
      </div>
      {medicine.uses?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {medicine.uses.slice(0, 3).map((use) => (
            <span
              key={use}
              className="rounded-md bg-medai-50 px-2 py-0.5 text-[11px] text-medai-700 dark:bg-medai-900/40 dark:text-medai-300"
            >
              {use}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
