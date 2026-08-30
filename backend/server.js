import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import triageRoutes from './routes/triageRoutes.js';
import patientMedicineRoutes from './routes/patientMedicineRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { autoSeedIfEmpty, syncSampleMedicines } from './utils/autoSeed.js';
import { seedDemoUsers } from './utils/seedUsers.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// CORS — allow localhost and 127.0.0.1 (browser may use either)
const corsOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Rate limiting (relaxed in development — React Strict Mode + search debounce burn quota fast)
const isProduction = process.env.NODE_ENV === 'production';
const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== 'false' && isProduction;

if (rateLimitEnabled) {
  const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: false, message: 'Chat rate limit exceeded. Please wait a moment.' },
  });
  app.use('/api/chat', chatLimiter);
} else {
  console.log('[MedAi] API rate limiting disabled (development mode)');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'MedAi API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/my-medicines', patientMedicineRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api', uploadRoutes);

app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    await syncSampleMedicines();
    await seedDemoUsers();
    app.listen(PORT, () => {
      console.log(`[MedAi] Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[MedAi] Failed to start:', err.message);
    process.exit(1);
  }
}

start();
