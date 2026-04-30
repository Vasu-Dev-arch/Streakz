import { json, route } from '../../../../../lib/api-route.js';
import { setAuthCookie } from '../../../../../lib/auth.js';
import { loginUser } from '../../../../../services/auth.service.js';

export const POST = route(async (request) => {
  const payload = await loginUser(await request.json());
  return setAuthCookie(json(payload), payload.token);
});
