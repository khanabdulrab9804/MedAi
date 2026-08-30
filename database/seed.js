/**
 * Seed MongoDB with sample medicine data.
 * Run from backend: npm run seed
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../backend/config/db.js';
import Medicine from '../backend/models/Medicine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  await connectDB();

  const filePath = path.join(__dirname, 'sample-medicines.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const medicines = JSON.parse(raw);

  await Medicine.deleteMany({});
  await Medicine.insertMany(medicines);

  console.log(`[MedAi] Seeded ${medicines.length} medicines`);
  await disconnectDB();
}

seed().catch((err) => {
  console.error('[MedAi] Seed failed:', err.message);
  process.exit(1);
});
