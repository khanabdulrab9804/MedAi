import { Router } from 'express';
import { body } from 'express-validator';
import InAppReminder from '../models/InAppReminder.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, requireRole('patient', 'doctor', 'admin'));

router.get('/', async (req, res, next) => {
  try {
    const reminders = await InAppReminder.find({ userId: req.user._id, active: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reminders });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  body('medicineName').trim().notEmpty(),
  body('dosageNote').optional().isString(),
  body('times').optional().isArray(),
  handleValidation,
  async (req, res, next) => {
    try {
      const reminder = await InAppReminder.create({
        userId: req.user._id,
        medicineName: req.body.medicineName,
        dosageNote: req.body.dosageNote || 'Take as prescribed',
        times: req.body.times || [{ hour: 9, minute: 0 }],
      });
      res.status(201).json({ success: true, data: reminder });
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id/taken', async (req, res, next) => {
  try {
    const reminder = await InAppReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: { lastTakenAt: new Date() } },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.json({ success: true, data: reminder, message: 'Marked as taken' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await InAppReminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { active: false }
    );
    res.json({ success: true, message: 'Reminder removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
