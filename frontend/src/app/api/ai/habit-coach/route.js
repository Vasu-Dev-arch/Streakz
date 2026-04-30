import { json, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { generateHabitCoachPlan } from '../../../../../services/ai.service.js';

export const POST = route(async (request) => {
  await authenticate(request);
  const { goal } = await request.json();
  return json(await generateHabitCoachPlan(goal));
});
