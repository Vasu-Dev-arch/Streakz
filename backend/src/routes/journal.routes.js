import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getEntry, getHistory, upsertEntry } from '../controllers/journal.controller.js';

const router = Router();

router.get('/', asyncHandler(getEntry));
router.get('/history', asyncHandler(getHistory));
router.post('/', asyncHandler(upsertEntry));

export default router;
