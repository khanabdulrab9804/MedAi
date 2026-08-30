/**
 * Score how well a medicine matches user query text.
 */
export function scoreMedicineMatch(medicine, query) {
  const q = query.toLowerCase();
  const name = medicine.name.toLowerCase();
  const generic = medicine.generic_name.toLowerCase();

  let score = 0;
  if (q.includes(name) || name.includes(q)) score += 10;
  if (q.includes(generic) || generic.includes(q)) score += 8;

  // Match full generic/name substrings in longer questions (e.g. "uses of aceclofenac")
  if (generic.length > 4 && q.includes(generic)) score += 12;
  if (name.length > 4 && q.includes(name)) score += 10;

  const tokens = q.split(/\s+/).filter((t) => t.length > 1);
  for (const token of tokens) {
    if (name.includes(token)) score += 3;
    if (generic.includes(token)) score += 2;
    for (const use of medicine.uses || []) {
      if (use.toLowerCase().includes(token)) score += 1;
    }
  }
  return score;
}

export function pickBestMedicines(medicines, query, limit = 3) {
  return medicines
    .map((m) => ({ medicine: m, score: scoreMedicineMatch(m, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.medicine);
}
