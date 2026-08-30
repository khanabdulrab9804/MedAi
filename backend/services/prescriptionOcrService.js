import Medicine from '../models/Medicine.js';

const COMMON_PATTERNS = [
  /dolo\s*650/gi,
  /paracetamol/gi,
  /azithral/gi,
  /azithromycin/gi,
  /pan\s*40/gi,
  /omeprazole/gi,
  /metformin/gi,
  /amoxicillin/gi,
];

/**
 * Educational OCR stub — extracts medicine names from filename/text hints.
 * Production: replace with Tesseract / Gemini Vision.
 */
export async function extractMedicinesFromPrescription({ filename, textHint = '' }) {
  const blob = `${filename} ${textHint}`.toLowerCase();
  const found = new Set();

  for (const re of COMMON_PATTERNS) {
    const m = blob.match(re);
    if (m) found.add(m[0].replace(/\s+/g, ' ').trim());
  }

  const all = await Medicine.find().select('name generic_name').lean();
  for (const med of all) {
    const n = med.name.toLowerCase();
    const g = med.generic_name?.toLowerCase() || '';
    if ((n && blob.includes(n)) || (g && blob.includes(g))) {
      found.add(med.name);
    }
  }

  const medicines =
    found.size > 0
      ? [...found].map((name) => ({ name, dosageNote: 'Verify dose with your prescription' }))
      : [
          { name: 'Dolo 650', dosageNote: '1 tablet — morning & night (demo)' },
          { name: 'Azithral 500', dosageNote: '1 tablet — once daily × 3 days (demo)' },
        ];

  return {
    status: 'processed',
    medicines,
    note: 'Demo extraction — upload a PDF/image with medicine names in the filename for better matching.',
  };
}
