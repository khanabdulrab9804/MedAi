import { Router } from 'express';
import multer from 'multer';
import {
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllMedicines,
} from '../services/medicineService.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  adminMedicineValidation,
  medicineIdValidation,
  handleValidation,
} from '../middleware/validate.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') cb(null, true);
    else cb(new Error('Only JSON files allowed'));
  },
});

router.use(adminAuth);

/**
 * GET /api/admin/medicines
 */
router.get('/medicines', async (req, res, next) => {
  try {
    const medicines = await getAllMedicines();
    res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/medicines
 */
router.post(
  '/medicines',
  adminMedicineValidation,
  handleValidation,
  async (req, res, next) => {
    try {
      const medicine = await createMedicine(req.body);
      res.status(201).json({ success: true, data: medicine });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/admin/medicines/:id
 */
router.put(
  '/medicines/:id',
  [...medicineIdValidation, ...adminMedicineValidation],
  handleValidation,
  async (req, res, next) => {
    try {
      const medicine = await updateMedicine(req.params.id, req.body);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      res.json({ success: true, data: medicine });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/admin/medicines/:id
 */
router.delete(
  '/medicines/:id',
  medicineIdValidation,
  handleValidation,
  async (req, res, next) => {
    try {
      const medicine = await deleteMedicine(req.params.id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      res.json({ success: true, message: 'Medicine deleted' });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/medicines/upload
 * Bulk upload from JSON file.
 */
router.post('/medicines/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'JSON file required' });
    }
    const raw = req.file.buffer.toString('utf8');
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.medicines || [parsed];
    const created = [];
    for (const item of list) {
      const med = await createMedicine(item);
      created.push(med);
    }
    res.status(201).json({
      success: true,
      message: `Uploaded ${created.length} medicines`,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
