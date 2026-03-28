import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as habits from '../controllers/habits.controller.js';

const router = Router();

router.get('/', asyncHandler(habits.listHabits));
router.post('/', asyncHandler(habits.createHabit));
router.put('/:id', asyncHandler(habits.updateHabit));
router.delete('/:id', asyncHandler(habits.deleteHabit));

export default router;
