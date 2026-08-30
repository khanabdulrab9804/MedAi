/**
 * Build a grounded reply from medicine data when Gemini is unavailable.
 */
export function buildFallbackAnswer(question, medicines) {
  const m = medicines[0];
  const q = question.toLowerCase();

  const faqHit = m.faq?.find(
    (f) =>
      q.includes(f.question.toLowerCase().slice(0, 20)) ||
      f.question.toLowerCase().split(' ').some((w) => w.length > 4 && q.includes(w))
  );
  if (faqHit) return `${faqHit.answer}`;

  if (q.includes('side effect')) {
    return `${m.name} may cause: ${(m.side_effects || []).join(', ') || 'see your doctor for details'}. Follow prescribed dosage.`;
  }
  if (q.includes('warning') || q.includes('safe')) {
    return `Important warnings for ${m.name}: ${(m.warnings || []).join('; ')}.`;
  }
  if (q.includes('dosage') || q.includes('dose') || q.includes('how to take')) {
    return `${m.name}: ${m.dosage}`;
  }
  if (q.includes('store') || q.includes('storage')) {
    return `${m.name} storage: ${m.storage || 'Follow label instructions.'}`;
  }
  if (q.includes('interact')) {
    return `${m.name} may interact with: ${(m.interactions || []).join(', ') || 'ask your doctor'}.`;
  }

  const uses = (m.uses || []).join(', ');
  return `${m.name} (${m.generic_name}) is commonly associated with: ${uses}. ${m.dosage} If symptoms continue, consult a doctor.`;
}
