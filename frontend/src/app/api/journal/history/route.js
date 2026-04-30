import { json, route } from '../../../../../lib/api-route.js';
import { authenticate } from '../../../../../lib/auth.js';
import { listJournalHistory } from '../../../../../services/journal.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await listJournalHistory(user.id));
});
