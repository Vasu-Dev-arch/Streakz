import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', asyncHandler(auth.signup));
router.post('/login', asyncHandler(auth.login));
router.get('/me', authenticate, asyncHandler(auth.me));

export default router;
