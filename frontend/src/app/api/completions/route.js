import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import {
  listCompletions,
  toggleCompletion,
} from '../../../../services/completions.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await listCompletions(user.id));
});

export const POST = route(async (request) => {
  const user = await authenticate(request);
  return json(await toggleCompletion(user.id, await request.json()));
});
