import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as todos from '../controllers/todos.controller.js';

const router = Router();

router.get('/',        asyncHandler(todos.listTodos));
router.post('/',       asyncHandler(todos.createTodo));
router.patch('/:id',   asyncHandler(todos.updateTodo));
router.patch('/:id/toggle', asyncHandler(todos.toggleTodo));
router.delete('/:id',  asyncHandler(todos.deleteTodo));

export default router;
