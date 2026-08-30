import { Router } from 'express';
import { body } from 'express-validator';
import PatientMedicine from '../models/PatientMedicine.js';
import Medicine from '../models/Medicine.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, requireRole('patient'));

function formatEntry(doc) {
  const med = doc.medicineId;
  return {
    id: String(doc._id),
    medicineId: String(med?._id || doc.medicineId),
    name: med?.name || 'Unknown',
    generic_name: med?.generic_name,
    dosage: med?.dosage,
    schedule: doc.schedule || '',
    notes: doc.notes || '',
    addedAt: doc.createdAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const list = await PatientMedicine.find({ userId: req.user._id })
      .populate('medicineId', 'name generic_name dosage')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list.map(formatEntry) });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  body('medicineId').isMongoId().withMessage('Valid medicine required'),
  body('schedule').optional().isString().isLength({ max: 120 }),
  body('notes').optional().isString().isLength({ max: 200 }),
  handleValidation,
  async (req, res, next) => {
    try {
      const medicine = await Medicine.findById(req.body.medicineId);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      const existing = await PatientMedicine.findOne({
        userId: req.user._id,
        medicineId: req.body.medicineId,
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Medicine already in your list' });
      }

      const entry = await PatientMedicine.create({
        userId: req.user._id,
        medicineId: req.body.medicineId,
        schedule: req.body.schedule?.trim() || '',
        notes: req.body.notes?.trim() || '',
      });

      const populated = await PatientMedicine.findById(entry._id)
        .populate('medicineId', 'name generic_name dosage')
        .lean();

      res.status(201).json({ success: true, data: formatEntry(populated), message: 'Medicine added' });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await PatientMedicine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Medicine not found in your list' });
    }
    res.json({ success: true, message: 'Medicine removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
