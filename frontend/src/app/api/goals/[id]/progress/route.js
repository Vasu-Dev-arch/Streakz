import { json, route } from '../../../../../../lib/api-route.js';
import { authenticate } from '../../../../../../lib/auth.js';
import { updateGoalProgress } from '../../../../../../services/goals.service.js';

export const PATCH = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  return json(await updateGoalProgress(user.id, id, await request.json()));
});
