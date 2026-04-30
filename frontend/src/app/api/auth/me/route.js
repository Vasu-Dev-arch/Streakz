import { json, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { getCurrentUserProfile } from '../../../../../services/auth.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await getCurrentUserProfile(user.id));
});
