import mongoose from 'mongoose';

const CATEGORIES = ['DSA', 'Aptitude', 'Core', 'Projects'];

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: { type: String, default: '' },
    color: { type: String, default: '#22c97a' },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
  },
  { timestamps: true }
);

habitSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Habit = mongoose.model('Habit', habitSchema);
export { CATEGORIES };
