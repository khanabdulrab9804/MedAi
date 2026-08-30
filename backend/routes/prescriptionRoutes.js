import { Router } from 'express';
import multer from 'multer';
import Prescription from '../models/Prescription.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { extractMedicinesFromPrescription } from '../services/prescriptionOcrService.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype);
    cb(ok ? null : new Error('Only PDF or image files allowed'), ok);
  },
});

const router = Router();

router.use(authenticate, requireRole('patient', 'doctor', 'admin'));

router.get('/', async (req, res, next) => {
  try {
    const list = await Prescription.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const doc = await Prescription.create({
      userId: req.user._id,
      filename: req.file.originalname,
      status: 'pending',
      notes: 'Uploaded for review. OCR processing can be added in a future release.',
    });
    res.status(201).json({ success: true, data: doc, message: 'Prescription uploaded successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/scan', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const extracted = await extractMedicinesFromPrescription({
      filename: req.file.originalname,
      textHint: req.body.textHint || '',
    });
    const doc = await Prescription.create({
      userId: req.user._id,
      filename: req.file.originalname,
      status: 'processed',
      notes: extracted.note,
    });
    res.json({
      success: true,
      data: { prescription: doc, ...extracted },
      message: 'Prescription scanned',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
