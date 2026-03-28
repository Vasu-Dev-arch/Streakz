import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as completions from '../controllers/completions.controller.js';

const router = Router();

router.get('/', asyncHandler(completions.listCompletions));
router.post('/', asyncHandler(completions.toggleCompletion));

export default router;
