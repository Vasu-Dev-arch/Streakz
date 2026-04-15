import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  listGoals,
  createGoal,
  updateGoal,
  updateProgress,
  deleteGoal,
} from '../controllers/goals.controller.js';

const router = Router();

router.get('/', asyncHandler(listGoals));
router.post('/', asyncHandler(createGoal));
router.patch('/:id', asyncHandler(updateGoal));
router.patch('/:id/progress', asyncHandler(updateProgress));
router.delete('/:id', asyncHandler(deleteGoal));

export default router;
