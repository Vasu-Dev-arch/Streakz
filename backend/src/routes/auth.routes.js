import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';
import { redirectToGoogle, handleGoogleCallback } from '../controllers/google.controller.js';

const router = Router();

// ── Email / password ──────────────────────────────────────────────────────────
router.post('/signup', asyncHandler(auth.signup));
router.post('/login', asyncHandler(auth.login));
router.get('/me', authenticate, asyncHandler(auth.me));
router.patch('/profile', authenticate, asyncHandler(auth.updateProfile));

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', redirectToGoogle);
router.get('/google/callback', asyncHandler(handleGoogleCallback));

export default router;
