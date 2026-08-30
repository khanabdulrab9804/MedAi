import { body, param, query, validationResult } from 'express-validator';

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
}

export const chatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message too long'),
  body('sessionId').optional({ values: 'falsy' }).isString().isLength({ max: 80 }),
  body('medicineId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid medicine id'),
];

export const medicineSearchValidation = [
  query('q').optional().isString().isLength({ max: 200 }),
  query('manufacturer').optional().isString().isLength({ max: 100 }),
  query('generic').optional().isString().isLength({ max: 100 }),
];

export const medicineIdValidation = [param('id').isMongoId()];

export const adminMedicineValidation = [
  body('name').trim().notEmpty().isLength({ max: 200 }),
  body('generic_name').trim().notEmpty().isLength({ max: 200 }),
  body('dosage').trim().notEmpty().isLength({ max: 500 }),
  body('uses').optional().isArray(),
  body('side_effects').optional().isArray(),
  body('warnings').optional().isArray(),
  body('interactions').optional().isArray(),
  body('manufacturer').optional().isString(),
  body('storage').optional().isString(),
  body('faq').optional().isArray(),
];

export const registerValidation = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().isLength({ max: 120 }).withMessage('Name is required'),
  body('role').isIn(['doctor', 'patient']).withMessage('Role must be doctor or patient'),
  body('condition')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Condition must be 200 characters or less'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['doctor', 'patient', 'admin']),
];

