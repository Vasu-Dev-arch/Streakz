import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'default',
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
  categories: {
    type: [String],
    default: ['study', 'fitness', 'work'],
  },
});

settingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export const Settings = mongoose.model('Settings', settingsSchema);
