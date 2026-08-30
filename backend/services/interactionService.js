import Medicine from '../models/Medicine.js';

const SEVERITY = { minor: 1, moderate: 2, major: 3 };

function normalize(name) {
  return name.toLowerCase().trim();
}

function findMedicineByName(name, medicines) {
  const q = normalize(name);
  return medicines.find(
    (m) =>
      normalize(m.name).includes(q) ||
      q.includes(normalize(m.name)) ||
      normalize(m.generic_name).includes(q)
  );
}

export async function checkDrugInteractions(drugNames) {
  const names = [...new Set(drugNames.map((n) => n.trim()).filter(Boolean))];
  if (names.length < 2) {
    return { drugs: names, interactions: [], message: 'Enter at least two medicines to check interactions.' };
  }

  const all = await Medicine.find().lean();
  const matched = names.map((n) => findMedicineByName(n, all)).filter(Boolean);

  if (matched.length < 2) {
    return {
      drugs: names,
      interactions: [],
      message: 'Could not match at least two medicines in the database.',
    };
  }

  const interactions = [];
  for (let i = 0; i < matched.length; i++) {
    for (let j = i + 1; j < matched.length; j++) {
      const a = matched[i];
      const b = matched[j];
      const hit = findInteractionBetween(a, b);
      if (hit) {
        interactions.push({
          drugA: a.name,
          drugB: b.name,
          severity: hit.severity,
          description: hit.description,
          management: hit.management,
        });
      }
    }
  }

  interactions.sort((x, y) => (SEVERITY[y.severity] || 0) - (SEVERITY[x.severity] || 0));

  return {
    drugs: matched.map((m) => m.name),
    interactions,
    message: interactions.length
      ? `Found ${interactions.length} potential interaction(s). Verify with clinical references.`
      : 'No known interactions found in our database for this pair.',
  };
}

function findInteractionBetween(a, b) {
  const aInts = a.interactions || [];
  const bInts = b.interactions || [];
  const blob = `${aInts.join(' ')} ${bInts.join(' ')} ${a.name} ${b.name} ${a.generic_name} ${b.generic_name}`.toLowerCase();

  const mentionsB =
    blob.includes(b.name.toLowerCase()) || blob.includes(b.generic_name.toLowerCase());
  const mentionsA =
    blob.includes(a.name.toLowerCase()) || blob.includes(a.generic_name.toLowerCase());

  if (!mentionsA && !mentionsB) return null;

  const combined = [...aInts, ...bInts].join(' ').toLowerCase();
  let severity = 'moderate';
  if (
    combined.includes('warfarin') ||
    combined.includes('bleed') ||
    combined.includes('major') ||
    combined.includes('contraindicated')
  ) {
    severity = 'major';
  } else if (combined.includes('minor') || combined.includes('mild')) {
    severity = 'minor';
  }

  return {
    severity,
    description: `Potential interaction between ${a.name} and ${b.name} based on stored interaction data.`,
    management: 'Review prescribing information and monitor the patient as clinically indicated.',
  };
}
