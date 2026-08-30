/**
 * Lightweight agent router (LangGraph-style intent routing without external graph runtime).
 */
const AGENTS = {
  drug_info: {
    id: 'drug_info',
    label: 'Drug Info Agent',
    hint: 'Medicine facts, uses, side effects',
  },
  interaction: {
    id: 'interaction',
    label: 'Interaction Agent',
    hint: 'Drug–drug interaction checks',
  },
  dosage: {
    id: 'dosage',
    label: 'Dosage Agent',
    hint: 'Dosing and calculators',
  },
  safety: {
    id: 'safety',
    label: 'Safety Agent',
    hint: 'Warnings, pregnancy, renal/hepatic',
  },
  triage: {
    id: 'triage',
    label: 'Triage Agent',
    hint: 'Urgency and next steps',
  },
};

export function routeAgent(message) {
  const q = message.toLowerCase();

  if (/interact|combine|together|mix|warfarin|bleed/.test(q)) return AGENTS.interaction;
  if (/dose|dosage|mg\/kg|calculat|how much|pediatric|bsa|crcl/.test(q)) return AGENTS.dosage;
  if (/safe|pregnant|liver|kidney|renal|hepatic|warning|contraind|overdose|emergency/.test(q))
    return AGENTS.safety;
  if (/symptom|pain|fever|urgent|hospital|feel/.test(q)) return AGENTS.triage;

  return AGENTS.drug_info;
}

export function agentSystemHint(agent, role = 'patient') {
  const clinical = role === 'doctor';
  const base = {
    drug_info: clinical
      ? 'Provide concise clinical monograph-style facts with mechanism where relevant.'
      : 'Explain in simple, patient-friendly language.',
    interaction: 'Focus on interaction severity, mechanism, and monitoring.',
    dosage: 'Focus on dosing principles; remind to verify with references.',
    safety: 'Prioritize safety warnings and when to seek care.',
    triage: 'Assess urgency clearly; never replace emergency services.',
  };
  return base[agent.id] || base.drug_info;
}

export { AGENTS };
