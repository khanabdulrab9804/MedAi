import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: {
      type: String,
      required: true,
      enum: ['doctor', 'patient', 'admin'],
      index: true,
    },
    preferences: {
      language: { type: String, default: 'en' },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      onboardingComplete: { type: Boolean, default: false },
    },
    profile: {
      phone: String,
      specialty: String,
      condition: { type: String, trim: true, maxlength: 200 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
