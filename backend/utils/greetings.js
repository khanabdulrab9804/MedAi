const GREETING_PATTERNS = [
  /^(hi|hello|hey|hola|howdy|greetings|namaste|sup)[\s!.?,]*$/i,
  /^(hi|hello|hey)[\s,]+(there|medai|everyone|friend)?[\s!.?,]*$/i,
  /^good\s+(morning|afternoon|evening|night)[\s!.?,]*$/i,
  /^what'?s\s+up[\s!.?,]*$/i,
];

const HELP_PATTERNS = [
  /^help[\s!.?,]*$/i,
  /^what\s+can\s+you\s+do[\s!.?,]*$/i,
  /^how\s+(do\s+you\s+work|does\s+this\s+work)[\s!.?,]*$/i,
];

const THANKS_PATTERNS = [
  /^(thanks|thank\s+you|thx|ty)[\s!.?,]*$/i,
];

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isGreeting(text) {
  const t = normalize(text);
  if (!t || t.length > 60) return false;
  return GREETING_PATTERNS.some((p) => p.test(t));
}

export function isHelpRequest(text) {
  const t = normalize(text);
  return HELP_PATTERNS.some((p) => p.test(t));
}

export function isThanks(text) {
  const t = normalize(text);
  return THANKS_PATTERNS.some((p) => p.test(t));
}

export function getGreetingReply() {
  return `Hi! I'm **MedAi Assistant**. I'm here to help you with educational information about medicines from our verified database.

You can ask about a medicine by name (for example, *Dolo 650*), or pick one from the search panel. I can share uses, dosage notes, side effects, warnings, interactions, and storage — **only from the data we provide**.

How can I help you today?`;
}

export function getHelpReply() {
  return `I'm **MedAi Assistant**. I answer questions about medicines listed in our database, such as:

- Uses and common purposes  
- Dosage information (as documented)  
- Side effects and warnings  
- Drug interactions and storage  

Try asking: *"Can I use Dolo 650 for fever?"* or search a medicine on the left.`;
}

export function getThanksReply() {
  return `You're welcome! Ask anytime if you have more questions about medicines in our database.`;
}

/**
 * Reply for messages that are not medicine-related (no DB match).
 */
export function getGeneralReply(text) {
  if (isGreeting(text)) return getGreetingReply();
  if (isHelpRequest(text)) return getHelpReply();
  if (isThanks(text)) return getThanksReply();
  return null;
}
