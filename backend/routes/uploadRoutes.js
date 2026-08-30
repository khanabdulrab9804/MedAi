import { Router } from 'express';
import multer from 'multer';
import { adminAuth } from '../middleware/adminAuth.js';
import { ingestPdfBuffer, getKnowledgeBaseStats } from '../services/ragService.js';

const router = Router();

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

/**
 * GET /api/upload-kb/status
 * Knowledge base ingestion status.
 */
router.get('/upload-kb/status', adminAuth, async (req, res, next) => {
  try {
    const stats = await getKnowledgeBaseStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/upload-kb
 * Upload a PDF knowledge base: chunk → embed → store in ChromaDB.
 */
router.post('/upload-kb', adminAuth, pdfUpload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file required (field name: file)',
      });
    }

    const result = await ingestPdfBuffer(
      req.file.buffer,
      req.file.originalname || 'knowledge-base.pdf'
    );

    res.status(201).json({
      success: true,
      message: `Knowledge base indexed: ${result.chunkCount} chunks from ${result.filename}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
