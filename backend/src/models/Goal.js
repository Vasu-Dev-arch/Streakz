import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [200, 'title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'description cannot exceed 1000 characters'],
    },
    deadline: {
      type: String, // YYYY-MM-DD stored as string, consistent with rest of codebase
      required: [true, 'deadline is required'],
      validate: {
        validator: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: 'deadline must be YYYY-MM-DD',
      },
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    progressType: {
      type: String,
      enum: ['count', 'percentage'],
      required: [true, 'progressType is required'],
    },
    // count-based fields
    targetValue: {
      type: Number,
      default: null,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    // percentage-based field
    progress: {
      type: Number,
      min: [0, 'progress cannot be less than 0'],
      max: [100, 'progress cannot exceed 100'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'overdue'],
      default: 'active',
    },
  },
  { timestamps: true }
);

goalSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.userId;
    return ret;
  },
});

export const Goal = mongoose.model('Goal', goalSchema);
