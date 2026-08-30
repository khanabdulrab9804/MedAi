import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Medicine from '../models/Medicine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadSampleMedicines() {
  const filePath = path.join(__dirname, '../../database/sample-medicines.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

/** Seed all sample medicines when the database is empty. */
export async function autoSeedIfEmpty() {
  const count = await Medicine.countDocuments();
  if (count > 0) return;
  const medicines = await loadSampleMedicines();
  await Medicine.insertMany(medicines);
  console.log(`[MedAi] Auto-seeded ${medicines.length} sample medicines`);
}

/** Add or update sample medicines missing from the database (dev sync). */
export async function syncSampleMedicines() {
  const medicines = await loadSampleMedicines();
  let added = 0;
  for (const med of medicines) {
    const exists = await Medicine.findOne({
      $or: [{ name: med.name }, { generic_name: med.generic_name }],
    });
    if (!exists) {
      await Medicine.create(med);
      added += 1;
    }
  }
  if (added > 0) {
    console.log(`[MedAi] Synced ${added} new sample medicine(s)`);
  }
}
