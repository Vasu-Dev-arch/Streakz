import { json, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { updateCurrentUserProfile } from '../../../../../services/auth.service.js';

export const PATCH = route(async (request) => {
  const user = await authenticate(request);
  return json(await updateCurrentUserProfile(user.id, await request.json()));
});
