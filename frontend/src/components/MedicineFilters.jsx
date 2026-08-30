export default function MedicineFilters({ filters, onChange }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        type="text"
        placeholder="Filter by generic name"
        value={filters.generic || ''}
        onChange={(e) => onChange({ ...filters, generic: e.target.value })}
        className="input-field text-xs"
      />
      <input
        type="text"
        placeholder="Filter by manufacturer"
        value={filters.manufacturer || ''}
        onChange={(e) => onChange({ ...filters, manufacturer: e.target.value })}
        className="input-field text-xs"
      />
    </div>
  );
}
