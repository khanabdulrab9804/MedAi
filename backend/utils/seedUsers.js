import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const DEMO_USERS = [
  {
    email: 'doctor@medai.com',
    password: 'doctor123',
    name: 'Dr. Sarah Chen',
    role: 'doctor',
  },
  {
    email: 'patient@medai.com',
    password: 'patient123',
    name: 'Alex Rivera',
    role: 'patient',
    condition: 'Hypertension',
  },
  {
    email: 'admin@medai.com',
    password: 'admin123',
    name: 'MedAi Admin',
    role: 'admin',
  },
];

export async function seedDemoUsers() {
  for (const demo of DEMO_USERS) {
    const exists = await User.findOne({ email: demo.email });
    if (exists) {
      if (demo.role === 'patient' && demo.condition && !exists.profile?.condition) {
        exists.profile = { ...exists.profile?.toObject?.() || exists.profile, condition: demo.condition };
        await exists.save();
      }
      continue;
    }

    const passwordHash = await bcrypt.hash(demo.password, 10);
    const userData = {
      email: demo.email,
      passwordHash,
      name: demo.name,
      role: demo.role,
    };
    if (demo.condition) {
      userData.profile = { condition: demo.condition };
    }
    await User.create(userData);
    console.log(`[MedAi] Demo ${demo.role} created: ${demo.email}`);
  }
}
