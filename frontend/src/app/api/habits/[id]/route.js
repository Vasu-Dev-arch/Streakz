import { json, noContent, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { deleteHabit, updateHabit } from '../../../../../services/habits.service.js';

export const PUT = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  return json(await updateHabit(user.id, id, await request.json()));
});

export const DELETE = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  await deleteHabit(user.id, id);
  return noContent();
});
