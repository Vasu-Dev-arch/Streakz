import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as settings from '../controllers/settings.controller.js';

const router = Router();

router.get('/', asyncHandler(settings.getSettings));
router.put('/', asyncHandler(settings.updateSettings));

export default router;
