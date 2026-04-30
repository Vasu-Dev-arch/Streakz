import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import { createHabit, listHabits } from '../../../../services/habits.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await listHabits(user.id));
});

export const POST = route(async (request) => {
  const user = await authenticate(request);
  return json(await createHabit(user.id, await request.json()), { status: 201 });
});
