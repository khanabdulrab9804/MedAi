import { useState } from 'react';
import { api } from '../../services/api';

export default function DoseCalculator() {
  const [type, setType] = useState('weight_based');
  const [weightKg, setWeightKg] = useState('');
  const [doseMgPerKg, setDoseMgPerKg] = useState('10');
  const [frequency, setFrequency] = useState('twice daily');
  const [heightCm, setHeightCm] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const calculate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.calculateDose({
        type,
        weightKg: Number(weightKg),
        doseMgPerKg: Number(doseMgPerKg),
        frequency,
        heightCm: heightCm ? Number(heightCm) : undefined,
        creatinine: creatinine ? Number(creatinine) : undefined,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card max-w-lg space-y-4 p-6">
      <h2 className="font-semibold">Dose calculator</h2>
      <p className="text-xs text-slate-500">Educational estimates only — verify clinically.</p>
      <form onSubmit={calculate} className="space-y-3">
        <label className="block text-sm">
          Type
          <select className="input mt-1 w-full" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="weight_based">Weight-based</option>
            <option value="pediatric">Pediatric</option>
            <option value="bsa">BSA</option>
            <option value="creatinine_clearance">Creatinine clearance</option>
          </select>
        </label>
        <label className="block text-sm">
          Weight (kg)
          <input className="input mt-1 w-full" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
        </label>
        {type !== 'creatinine_clearance' && (
          <label className="block text-sm">
            Dose (mg/kg)
            <input className="input mt-1 w-full" type="number" value={doseMgPerKg} onChange={(e) => setDoseMgPerKg(e.target.value)} />
          </label>
        )}
        {type === 'bsa' && (
          <label className="block text-sm">
            Height (cm)
            <input className="input mt-1 w-full" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          </label>
        )}
        {type === 'creatinine_clearance' && (
          <label className="block text-sm">
            Serum creatinine (mg/dL)
            <input className="input mt-1 w-full" type="number" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} />
          </label>
        )}
        <label className="block text-sm">
          Frequency
          <input className="input mt-1 w-full" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary">
          Calculate
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result?.result && <p className="rounded-lg bg-medai-50 p-3 text-sm dark:bg-medai-900/30">{result.result}</p>}
    </div>
  );
}
