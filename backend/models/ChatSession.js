import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    medicineRef: { type: String, default: null },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export default mongoose.model('ChatSession', chatSessionSchema);
