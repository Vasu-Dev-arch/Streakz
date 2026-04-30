import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import { createGoal, listGoals } from '../../../../services/goals.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await listGoals(user.id));
});

export const POST = route(async (request) => {
  const user = await authenticate(request);
  return json(await createGoal(user.id, await request.json()), { status: 201 });
});
