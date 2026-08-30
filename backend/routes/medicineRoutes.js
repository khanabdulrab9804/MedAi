import { Router } from 'express';
import {
  searchMedicines,
  getMedicineById,
  getAllMedicines,
} from '../services/medicineService.js';
import { sanitizeText } from '../utils/sanitize.js';
import {
  medicineSearchValidation,
  medicineIdValidation,
  handleValidation,
} from '../middleware/validate.js';

const router = Router();

/**
 * GET /api/medicines
 * Search medicines with optional filters.
 */
router.get(
  '/',
  medicineSearchValidation,
  handleValidation,
  async (req, res, next) => {
    try {
      const q = sanitizeText(req.query.q || '', 200);
      const filters = {
        manufacturer: req.query.manufacturer
          ? sanitizeText(req.query.manufacturer, 100)
          : undefined,
        generic: req.query.generic ? sanitizeText(req.query.generic, 100) : undefined,
      };
      const medicines = await searchMedicines(q, filters);
      res.json({ success: true, data: medicines });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/medicines/all
 */
router.get('/all', async (req, res, next) => {
  try {
    const medicines = await getAllMedicines();
    res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/medicines/:id
 */
router.get(
  '/:id',
  medicineIdValidation,
  handleValidation,
  async (req, res, next) => {
    try {
      const medicine = await getMedicineById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      res.json({ success: true, data: medicine });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
