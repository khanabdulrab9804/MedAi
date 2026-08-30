import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { loginValidation, registerValidation, handleValidation } from '../middleware/validate.js';

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

/**
 * POST /api/auth/register
 */
router.post('/register', registerValidation, handleValidation, async (req, res, next) => {
  try {
    const { email, password, name, role, condition } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userData = {
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
      role,
    };
    if (role === 'patient' && condition?.trim()) {
      userData.profile = { condition: condition.trim() };
    }

    const user = await User.create(userData);

    const token = signToken(user);
    res.status(201).json({
      success: true,
      data: { user: publicUser(user), token },
      message: 'Account created successfully.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', loginValidation, handleValidation, async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}, not a ${role}`,
      });
    }

    const token = signToken(user);
    res.json({
      success: true,
      data: { user: publicUser(user), token },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

export default router;
