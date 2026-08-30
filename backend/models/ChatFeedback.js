import mongoose from 'mongoose';

const chatFeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sessionId: String,
    messageIndex: Number,
    rating: { type: String, enum: ['up', 'down'], required: true },
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model('ChatFeedback', chatFeedbackSchema);
