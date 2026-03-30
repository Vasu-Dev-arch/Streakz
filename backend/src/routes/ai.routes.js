import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { habitCoach } from '../controllers/ai.controller.js';

const router = Router();

// POST /api/ai/habit-coach — protected by authenticate middleware in app.js
router.post('/habit-coach', asyncHandler(habitCoach));

export default router;
