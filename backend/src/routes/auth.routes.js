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

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: redirect browser to Google consent screen
router.get('/google', redirectToGoogle);

// Step 2: Google redirects back here with ?code=...
router.get('/google/callback', asyncHandler(handleGoogleCallback));

export default router;
