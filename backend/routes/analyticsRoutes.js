import { Router } from 'express';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getSystemOverview,
  getDetailedAnalytics,
  getRagComparison,
} from '../services/analyticsService.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/overview', async (req, res, next) => {
  try {
    const data = await getSystemOverview();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/detailed', async (req, res, next) => {
  try {
    const data = await getDetailedAnalytics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/rag-comparison', (req, res) => {
  res.json({ success: true, data: getRagComparison() });
});

router.get('/agents', (req, res) => {
  res.json({
    success: true,
    data: {
      flow: 'User Question → Agent Router → Specialized Agent → RAG (ChromaDB) → LLM (Gemini) → Answer',
      agents: [
        'Drug Info Agent',
        'Interaction Agent',
        'Dosage Agent',
        'Safety Agent',
        'Triage Agent',
      ],
    },
  });
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
