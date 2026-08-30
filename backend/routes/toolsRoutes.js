import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { checkDrugInteractions } from '../services/interactionService.js';
import { calculateDose } from '../services/doseCalculatorService.js';

const router = Router();

router.post(
  '/interactions',
  authenticate,
  requireRole('doctor', 'patient', 'admin'),
  body('drugs').isArray({ min: 2 }).withMessage('Provide at least two drug names'),
  handleValidation,
  async (req, res, next) => {
    try {
      const data = await checkDrugInteractions(req.body.drugs);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/dose-calculator',
  authenticate,
  requireRole('doctor', 'patient', 'admin'),
  body('type')
    .isIn(['weight_based', 'pediatric', 'bsa', 'creatinine_clearance'])
    .withMessage('Invalid calculator type'),
  body('weightKg').optional().isFloat({ min: 0.1 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const data = calculateDose(req.body);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

router.post('/ckd-adjustment', authenticate, requireRole('doctor', 'admin'), (req, res) => {
  const { creatinine, weightKg } = req.body;
  res.json({
    success: true,
    data: {
      message: `Review renal dosing for CrCl-based adjustment. Weight: ${weightKg || '—'} kg, Creatinine: ${creatinine || '—'} mg/dL. Use institutional guidelines.`,
    },
  });
});

router.post('/liver-adjustment', authenticate, requireRole('doctor', 'admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      message:
        'For hepatic impairment, reduce doses of hepatically metabolized drugs per product labeling and local protocols.',
    },
  });
});

export default router;
