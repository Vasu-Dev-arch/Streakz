import mongoose from 'mongoose';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const completionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
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

completionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
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
