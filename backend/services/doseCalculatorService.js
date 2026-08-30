/**
 * Educational dose calculators — not for clinical decision-making without verification.
 */
export function calculateDose({ type, weightKg, doseMgPerKg, frequency, creatinine, heightCm }) {
  const w = Number(weightKg);
  if (!w || w <= 0) throw new Error('Valid weight (kg) is required');

  switch (type) {
    case 'weight_based': {
      const perDose = Number(doseMgPerKg) * w;
      return {
        type,
        result: `Estimated dose: ${perDose.toFixed(1)} mg per dose (${doseMgPerKg} mg/kg × ${w} kg). Frequency: ${frequency || 'as prescribed'}.`,
        perDoseMg: Math.round(perDose * 10) / 10,
      };
    }
    case 'bsa': {
      const h = Number(heightCm) || 170;
      const bsa = Math.sqrt((h * w) / 3600);
      const perDose = Number(doseMgPerKg) * bsa;
      return {
        type,
        bsa: Math.round(bsa * 100) / 100,
        result: `BSA ≈ ${bsa.toFixed(2)} m². Estimated dose: ${perDose.toFixed(1)} mg per dose.`,
        perDoseMg: Math.round(perDose * 10) / 10,
      };
    }
    case 'creatinine_clearance': {
      const cr = Number(creatinine) || 1;
      const ccr = ((140 - 30) * w) / (72 * cr);
      return {
        type,
        creatinineClearance: Math.round(ccr),
        result: `Estimated CrCl (Cockcroft-Gault, adult): ≈ ${Math.round(ccr)} mL/min. Adjust renally cleared drugs per guidelines.`,
      };
    }
  case 'pediatric': {
      const perDose = Number(doseMgPerKg) * w;
    return {
        type,
        result: `Pediatric estimate: ${perDose.toFixed(1)} mg per dose (${doseMgPerKg} mg/kg × ${w} kg). Always verify with pediatric references.`,
        perDoseMg: Math.round(perDose * 10) / 10,
      };
    }
    default:
      throw new Error('Unknown calculator type');
  }
}
