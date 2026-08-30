import mongoose from 'mongoose';

const inAppReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    medicineName: { type: String, required: true, trim: true },
    dosageNote: { type: String, default: 'Take as prescribed' },
    times: [{ hour: Number, minute: Number }],
    active: { type: Boolean, default: true },
    lastTakenAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('InAppReminder', inAppReminderSchema);
