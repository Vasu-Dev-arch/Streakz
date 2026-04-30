import { json, noContent, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { deleteGoal, updateGoal } from '../../../../../services/goals.service.js';

export const PATCH = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  return json(await updateGoal(user.id, id, await request.json()));
});

export const DELETE = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  await deleteGoal(user.id, id);
  return noContent();
});
