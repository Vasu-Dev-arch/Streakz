import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import { getSettings, updateSettings } from '../../../../services/settings.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await getSettings(user.id));
});

export const PUT = route(async (request) => {
  const user = await authenticate(request);
  return json(await updateSettings(user.id, await request.json()));
});
