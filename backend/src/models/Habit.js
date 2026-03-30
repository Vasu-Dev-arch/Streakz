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
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    emoji: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '#22c97a' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    frequencyType: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator(v) {
          return v.every((d) => d >= 0 && d <= 6);
        },
        message: 'daysOfWeek must contain values between 0 (Sun) and 6 (Sat)',
      },
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
    delete ret.userId;
    return ret;
  },
});

export const Habit = mongoose.model('Habit', habitSchema);