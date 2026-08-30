import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    generic_name: { type: String, required: true, trim: true, index: true },
    uses: [{ type: String, trim: true }],
    dosage: { type: String, required: true, trim: true },
    side_effects: [{ type: String, trim: true }],
    warnings: [{ type: String, trim: true }],
    interactions: [{ type: String, trim: true }],
    manufacturer: { type: String, trim: true },
    storage: { type: String, trim: true },
    faq: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', generic_name: 'text' });

export default mongoose.model('Medicine', medicineSchema);
