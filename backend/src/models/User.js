import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional — Google users have no password
    password: {
      type: String,
      minlength: 6,
      default: null,
    },
    // Optional — email/password users have no googleId
    googleId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before save (only when it is set and modified)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain password against hash
userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    delete ret.googleId; // internal field — not needed on client
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
