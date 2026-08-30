import sanitizeHtml from 'sanitize-html';

/**
 * Strip HTML and limit length for user inputs.
 */
export function sanitizeText(input, maxLength = 2000) {
  if (typeof input !== 'string') return '';
  const cleaned = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .slice(0, maxLength);
  return cleaned;
}

/**
 * Detect common prompt-injection patterns.
 */
export function detectPromptInjection(text) {
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /disregard\s+(the\s+)?(system|safety)\s+(prompt|rules)/i,
    /you\s+are\s+now\s+(a\s+)?doctor/i,
    /pretend\s+you\s+are/i,
    /act\s+as\s+(if\s+)?you\s+have\s+no\s+restrictions/i,
    /reveal\s+(your\s+)?(system\s+)?prompt/i,
    /bypass\s+(safety|rules)/i,
  ];
  return patterns.some((p) => p.test(text));
}
