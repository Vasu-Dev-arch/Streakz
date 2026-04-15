import mongoose from 'mongoose';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator(v) {
          return DATE_REGEX.test(v);
        },
        message: 'date must be YYYY-MM-DD',
      },
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'content is required'],
      trim: true,
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
  },
  { timestamps: true }
);

// One entry per user per date
journalSchema.index({ userId: 1, date: 1 }, { unique: true });

journalSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.userId;
    return ret;
  },
});

export const Journal = mongoose.model('Journal', journalSchema);
