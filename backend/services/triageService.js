import { GoogleGenerativeAI } from '@google/generative-ai';
import { findRelevantMedicines } from './medicineService.js';

const URGENT_PATTERNS = [
  'chest pain',
  'heart attack',
  'cannot breathe',
  "can't breathe",
  'difficulty breathing',
  'unconscious',
  'severe bleeding',
  'stroke',
  'suicide',
  'overdose',
  'anaphylaxis',
  'seizure',
];

const ROUTINE_PATTERNS = ['mild', 'headache', 'runny nose', 'common cold', 'slight fever', 'cough', 'fever'];

function getUrgencyLevel(text) {
  const q = text.toLowerCase().trim();

  for (const p of URGENT_PATTERNS) {
    if (q.includes(p)) {
      return {
        level: 'urgent',
        label: 'Urgent',
        color: 'red',
        action: 'Seek emergency care now',
      };
    }
  }

  if (ROUTINE_PATTERNS.some((p) => q.includes(p))) {
    return {
      level: 'routine',
      label: 'Routine',
      color: 'green',
      action: 'Monitor at home; use suggested OTC options only if appropriate',
    };
  }

  return {
    level: 'moderate',
    label: 'Moderate',
    color: 'amber',
    action: 'See a doctor if symptoms persist or worsen',
  };
}

function formatMedsForPrompt(medicines) {
  if (!medicines?.length) return 'NO_MATCHING_MEDICINES_IN_DATABASE';
  return medicines
    .map((m) =>
      JSON.stringify({
        name: m.name,
        generic_name: m.generic_name,
        uses: m.uses,
        dosage: m.dosage,
        warnings: m.warnings,
        side_effects: m.side_effects,
      })
    )
    .join('\n');
}

async function generateTriageGuidance(symptoms, medicines, urgency) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return buildFallbackGuidance(symptoms, medicines, urgency);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
    });

    const prompt = `You are MedAi triage assistant (educational only, NOT a doctor).

USER SYMPTOMS:
${symptoms}

URGENCY LEVEL (pre-assessed): ${urgency.label}

MEDICINES IN OUR DATABASE (ONLY suggest from this list; if none match, say so):
${formatMedsForPrompt(medicines)}

Respond in plain language for a patient. Structure your answer as JSON only (no markdown fences):
{
  "summary": "2-3 sentences: what these symptoms might relate to in simple terms (possibilities, not a diagnosis)",
  "possibleCauses": ["cause 1", "cause 2"],
  "whatToDo": ["step 1", "step 2", "step 3"],
  "medicineAdvice": "Which tablet from the database may help (name + why), or say none in database / see a doctor first. Never invent drug names.",
  "whenToSeeDoctor": "One sentence on when to seek care"
}

RULES:
- Do NOT diagnose definitively. Use "may", "could", "might".
- For urgent symptoms, tell them to call emergency services; do not recommend self-medication.
- Only mention medicines listed in the database section.
- Include disclaimer that this is not medical advice.`;

    const result = await model.generateContent(prompt);
    const text = result.response?.text()?.trim() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : [],
        whatToDo: Array.isArray(parsed.whatToDo) ? parsed.whatToDo : [],
        medicineAdvice: parsed.medicineAdvice || '',
        whenToSeeDoctor: parsed.whenToSeeDoctor || '',
      };
    }
  } catch (err) {
    console.warn('[MedAi] Triage AI failed:', err.message?.slice(0, 80));
  }

  return buildFallbackGuidance(symptoms, medicines, urgency);
}

function buildFallbackGuidance(symptoms, medicines, urgency) {
  const medNames = medicines.map((m) => m.name).join(', ');
  return {
    summary: `Based on "${symptoms.slice(0, 80)}", this appears ${urgency.label.toLowerCase()} priority. We cannot diagnose online — consider what usually causes these symptoms (infection, strain, allergy, etc.).`,
    possibleCauses: [
      'Common cold or viral infection',
      'Tension or dehydration (for headaches)',
      'Mild inflammation',
    ],
    whatToDo: [
      'Rest and drink fluids',
      'Monitor temperature and symptoms for 24–48 hours',
      urgency.level === 'urgent'
        ? 'Call emergency services — do not wait'
        : 'Consult a pharmacist or doctor if unsure',
    ],
    medicineAdvice: medNames
      ? `From our database, you may ask about: ${medNames}. Verify dose in Chat or with a pharmacist.`
      : 'No exact match in our medicine list — use the Chat tab to search a medicine name, or see a doctor.',
    whenToSeeDoctor: 'See a doctor if pain is severe, sudden, or lasts more than 3 days.',
  };
}

/**
 * Full triage: urgency + AI guidance + medicine suggestions from DB.
 */
export async function triageSymptomsWithGuidance(symptoms) {
  const urgency = getUrgencyLevel(symptoms);
  const medicines =
    urgency.level === 'urgent' ? [] : await findRelevantMedicines(symptoms);

  let guidance;
  if (urgency.level === 'urgent') {
    guidance = {
      summary:
        'Your description may indicate a medical emergency. Do not rely on online advice or self-medicate.',
      possibleCauses: [],
      whatToDo: [
        'Call your local emergency number immediately',
        'Do not drive yourself if you feel very unwell',
        'Tell someone nearby and wait for help',
      ],
      medicineAdvice:
        'Do not take new medicines without emergency care guidance. Follow instructions from paramedics or ER staff.',
      whenToSeeDoctor: 'You need emergency care now — not a routine appointment.',
    };
  } else {
    guidance = await generateTriageGuidance(symptoms, medicines, urgency);
  }

  return {
    level: urgency.level,
    label: urgency.label,
    color: urgency.color,
    action: urgency.action,
    message: guidance.summary,
    ...guidance,
    suggestedMedicines: medicines.map((m) => ({
      id: m._id,
      name: m.name,
      generic_name: m.generic_name,
      dosage: m.dosage,
      uses: m.uses?.slice(0, 2) || [],
    })),
    disclaimer:
      'Educational information only — not a diagnosis or prescription. Always confirm with a qualified healthcare provider before taking any medicine.',
  };
}

/** @deprecated Use triageSymptomsWithGuidance */
export function triageSymptoms(text) {
  const u = getUrgencyLevel(text);
  return {
    level: u.level,
    label: u.label,
    message: u.action,
    action: u.action,
    color: u.color,
  };
}
