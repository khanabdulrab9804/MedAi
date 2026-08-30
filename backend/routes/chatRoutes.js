import { Router } from 'express';
import { randomUUID } from 'crypto';
import ChatSession from '../models/ChatSession.js';
import Medicine from '../models/Medicine.js';
import { generateMedicineAnswerStructured } from '../services/geminiService.js';
import { findRelevantMedicines } from '../services/medicineService.js';
import { buildFallbackAnswer } from '../utils/fallbackAnswer.js';
import { getGeneralReply } from '../utils/greetings.js';
import { sanitizeText, detectPromptInjection } from '../utils/sanitize.js';
import { chatValidation, handleValidation } from '../middleware/validate.js';

const router = Router();

async function getUserRole(req) {
  try {
    const { default: jwt } = await import('jsonwebtoken');
    const { default: User } = await import('../models/User.js');
    const token = req.headers.authorization?.slice(7);
    if (!token || !process.env.JWT_SECRET) return 'patient';
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('role');
    return user?.role || 'patient';
  } catch {
    return 'patient';
  }
}

function createSessionId() {
  return `sess_${randomUUID()}`;
}

/**
 * POST /api/chat
 * Grounded medicine Q&A with Gemini.
 */
router.post('/', chatValidation, handleValidation, async (req, res, next) => {
  try {
    let { message, sessionId, medicineId } = req.body;
    message = sanitizeText(message);

    if (detectPromptInjection(message)) {
      return res.status(400).json({
        success: false,
        message:
          'Your message could not be processed. Please ask about medicines in our database only.',
      });
    }

    if (!sessionId) sessionId = createSessionId();

    // Greetings & small talk — no medicine lookup or AI needed
    const smallTalkReply = !medicineId ? getGeneralReply(message) : null;
    if (smallTalkReply) {
      let session = await ChatSession.findOne({ sessionId });
      if (!session) session = new ChatSession({ sessionId, messages: [] });
      session.messages.push(
        { role: 'user', content: message },
        { role: 'assistant', content: smallTalkReply }
      );
      await session.save();
      return res.json({
        success: true,
        data: { reply: smallTalkReply, sessionId, medicines: [] },
      });
    }

    let medicines = [];
    if (medicineId) {
      const specific = await Medicine.findById(medicineId).lean();
      if (specific) medicines = [specific];
    }
    if (!medicines.length) {
      medicines = await findRelevantMedicines(message);
    }

    let reply;
    let agent = null;
    let sources = [];
    let confidence = 40;
    let usedRag = false;
    const userRole = req.headers.authorization ? await getUserRole(req) : 'patient';

    if (!medicines.length) {
      reply =
        'I do not have verified information about this medicine. Try searching a medicine name from our database (for example, Dolo 650).';
    } else {
      try {
        const structured = await generateMedicineAnswerStructured(message, medicines, {
          role: userRole,
        });
        reply = structured.reply;
        agent = structured.agent;
        sources = structured.sources;
        confidence = structured.confidence;
        usedRag = structured.usedRag;
      } catch (aiErr) {
        console.warn('[MedAi] Gemini unavailable, using data fallback:', aiErr.message?.slice(0, 80));
        reply = buildFallbackAnswer(message, medicines);
        sources = medicines.map((m) => ({
          source: 'MedAi Medicine Database',
          page: m.name,
          excerpt: m.dosage || '',
          relevance: 80,
        }));
        confidence = 78;
      }
    }

    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = new ChatSession({ sessionId, messages: [] });
    }
    session.messages.push(
      { role: 'user', content: message, medicineRef: medicines[0]?.name || null },
      { role: 'assistant', content: reply, medicineRef: medicines[0]?.name || null }
    );
    await session.save();

    if (!agent && medicines.length) {
      confidence =
        medicines.length > 0 && !/do not have verified information/i.test(reply)
          ? reply.length > 80
            ? 92
            : 85
          : 60;
    }
    const suggestedFollowUps = medicines.length
      ? [
          `What are the side effects of ${medicines[0].name}?`,
          `Can I take ${medicines[0].name} on an empty stomach?`,
          `What should I avoid while taking ${medicines[0].name}?`,
        ]
      : ['Search for a medicine in our database', 'How do I use MedAi safely?'];

    res.json({
      success: true,
      data: {
        reply,
        sessionId,
        confidence,
        suggestedFollowUps,
        agent,
        usedRag,
        sources,
        citations: medicines.map((m) => ({ source: 'MedAi Medicine Database', name: m.name })),
        medicines: medicines.map((m) => ({
          id: m._id,
          name: m.name,
          generic_name: m.generic_name,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/history/:sessionId
 */
router.get('/history/:sessionId', async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId }).lean();
    if (!session) {
      return res.json({ success: true, data: { messages: [] } });
    }
    res.json({ success: true, data: { messages: session.messages } });
  } catch (err) {
    next(err);
  }
});

export default router;
