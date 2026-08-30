import { Router } from 'express';
import User from '../models/User.js';
import PatientMedicine from '../models/PatientMedicine.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('doctor'));

/**
 * GET /api/doctor/patients
 * List registered patients for the doctor portal.
 */
router.get('/patients', async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('name email profile updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    const patientIds = patients.map((p) => p._id);
    const medicineCounts = patientIds.length
      ? await PatientMedicine.aggregate([
          { $match: { userId: { $in: patientIds } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ])
      : [];

    const countMap = Object.fromEntries(
      medicineCounts.map((m) => [m._id.toString(), m.count])
    );

    res.json({
      success: true,
      data: patients.map((p) => ({
        id: p._id,
        name: p.name,
        email: p.email,
        condition: p.profile?.condition || 'Not specified',
        medicineCount: countMap[p._id.toString()] || 0,
        lastActive: p.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
