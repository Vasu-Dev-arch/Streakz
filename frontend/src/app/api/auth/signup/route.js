import { json, route } from '../../../../../lib/api-route.js';
import { setAuthCookie } from '../../../../../lib/auth.js';
import { signupUser } from '../../../../../services/auth.service.js';

export const POST = route(async (request) => {
  const payload = await signupUser(await request.json());
  return setAuthCookie(json(payload, { status: 201 }), payload.token);
});
