import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
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
      maxlength: [300, 'title cannot exceed 300 characters'],
    },
    category: {
      type: String,
      default: '',
      trim: true,
      maxlength: [50, 'category cannot exceed 50 characters'],
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: String, // stored as YYYY-MM-DD string — no timezone drift
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

todoSchema.index({ userId: 1, completed: 1, order: 1, createdAt: 1 });

todoSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.userId;
    return ret;
  },
});

export const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
