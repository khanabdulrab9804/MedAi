import { Router } from 'express';
import { body } from 'express-validator';
import ChatFeedback from '../models/ChatFeedback.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.post(
  '/',
  authenticate,
  body('rating').isIn(['up', 'down']),
  body('sessionId').optional().isString(),
  body('messageIndex').optional().isInt(),
  body('comment').optional().isString().isLength({ max: 500 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const feedback = await ChatFeedback.create({
        userId: req.user._id,
        sessionId: req.body.sessionId,
        messageIndex: req.body.messageIndex,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      res.status(201).json({ success: true, data: feedback, message: 'Thank you for your feedback' });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const items = await ChatFeedback.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name email role')
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
});

export default router;
