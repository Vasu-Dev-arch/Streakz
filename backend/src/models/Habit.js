import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: { type: String, default: '' },
    color: { type: String, default: '#22c97a' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
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
    delete ret.userId; // not needed on the client
    return ret;
  },
});

export const Habit = mongoose.model('Habit', habitSchema);
