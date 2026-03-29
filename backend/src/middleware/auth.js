import jwt from 'jsonwebtoken';
import { AppError } from './AppError.js';
import { User } from '../models/User.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.sub).lean();
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = { id: user._id.toString() };
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    // jwt errors (TokenExpiredError, JsonWebTokenError, etc.)
    next(new AppError('Invalid or expired token', 401));
  }
}
