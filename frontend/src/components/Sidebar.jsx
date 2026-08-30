import MedicineCard from './MedicineCard';
import SearchBar from './SearchBar';
import MedicineFilters from './MedicineFilters';
import LoadingSpinner from './LoadingSpinner';

export default function Sidebar({
  open,
  onClose,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filters,
  onFiltersChange,
  medicines,
  loading,
  selectedMedicine,
  onSelectMedicine,
  recentSearches,
  onRecentClick,
  onClearRecent,
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-full max-w-sm flex-col border-r border-slate-200 bg-white pt-14 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 lg:static lg:z-0 lg:max-w-xs lg:translate-x-0 lg:pt-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />
          <MedicineFilters filters={filters} onChange={onFiltersChange} />

          {recentSearches?.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={onClearRecent}
                  className="text-[10px] text-medai-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onRecentClick(q)}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-medai-50 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : medicines.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No medicines found.</p>
            ) : (
              <div className="space-y-3">
                {medicines.map((m) => (
                  <MedicineCard
                    key={m._id}
                    medicine={m}
                    selected={selectedMedicine?._id === m._id}
                    onSelect={onSelectMedicine}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
