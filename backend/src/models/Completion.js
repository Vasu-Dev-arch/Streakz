import mongoose from 'mongoose';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const completionSchema = new mongoose.Schema(
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
    habitIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit',
      },
    ],
  },
  { timestamps: true }
);

// Each user can have at most one completion document per date
completionSchema.index({ userId: 1, date: 1 }, { unique: true });

completionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.userId;
    if (Array.isArray(ret.habitIds)) {
      ret.habitIds = ret.habitIds.map((id) =>
        typeof id === 'object' && id !== null ? id.toString() : String(id)
      );
    }
    return ret;
  },
});

export const Completion = mongoose.model('Completion', completionSchema);
export { DATE_REGEX };
