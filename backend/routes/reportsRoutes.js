import { Router } from 'express';
import ChatSession from '../models/ChatSession.js';
import Medicine from '../models/Medicine.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/chat/:sessionId', authenticate, async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const format = req.query.format || 'json';
    if (format === 'csv') {
      const rows = ['role,content,medicineRef'];
      for (const m of session.messages || []) {
        const content = `"${(m.content || '').replace(/"/g, '""')}"`;
        rows.push(`${m.role},${content},${m.medicineRef || ''}`);
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="medai-chat-${session.sessionId}.csv"`);
      return res.send(rows.join('\n'));
    }
    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        exportedAt: new Date().toISOString(),
        messages: session.messages,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/medicines', authenticate, async (req, res, next) => {
  try {
    const medicines = await Medicine.find().select('name generic_name dosage manufacturer').lean();
    res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
});

export default router;
