import mongoose from 'mongoose';

const patientMedicineSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    schedule: { type: String, default: '', trim: true, maxlength: 120 },
    notes: { type: String, default: '', trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

patientMedicineSchema.index({ userId: 1, medicineId: 1 }, { unique: true });

export default mongoose.model('PatientMedicine', patientMedicineSchema);
