import { Router } from 'express';
import { body } from 'express-validator';
import { triageSymptomsWithGuidance } from '../services/triageService.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.post(
  '/',
  authenticate,
  body('symptoms').trim().notEmpty().isLength({ max: 1000 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const data = await triageSymptomsWithGuidance(req.body.symptoms);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
