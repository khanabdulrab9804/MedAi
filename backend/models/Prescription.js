import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    filename: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processed'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);
