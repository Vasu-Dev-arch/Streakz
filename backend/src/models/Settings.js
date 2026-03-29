import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one settings doc per user
  },
  dailyGoal: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 3,
  },
  reminderTime: {
    type: String,
    default: null,
  },
});

settingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.userId;
    return ret;
  },
});

export const Settings = mongoose.model('Settings', settingsSchema);
