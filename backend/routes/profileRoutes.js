import { Router } from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    preferences: user.preferences,
    profile: user.profile,
  };
}

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

router.patch(
  '/me',
  authenticate,
  body('name').optional().trim().isLength({ max: 120 }),
  body('preferences.language').optional().isIn(['en', 'hi', 'pa', 'kn']),
  body('preferences.theme').optional().isIn(['light', 'dark', 'system']),
  body('preferences.onboardingComplete').optional().isBoolean(),
  body('profile.phone').optional().isString(),
  body('profile.specialty').optional().isString(),
  body('profile.condition').optional().trim().isLength({ max: 200 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.preferences) {
        updates.preferences = { ...req.user.preferences?.toObject?.() || req.user.preferences, ...req.body.preferences };
      }
      if (req.body.profile) {
        updates.profile = { ...req.user.profile?.toObject?.() || req.user.profile, ...req.body.profile };
      }
      const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
      res.json({ success: true, data: { user: publicUser(user) } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
