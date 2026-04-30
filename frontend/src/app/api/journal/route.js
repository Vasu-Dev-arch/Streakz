import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import {
  getJournalEntry,
  upsertJournalEntry,
} from '../../../../services/journal.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  const { searchParams } = new URL(request.url);
  return json(await getJournalEntry(user.id, searchParams.get('date')));
});

export const POST = route(async (request) => {
  const user = await authenticate(request);
  return json(await upsertJournalEntry(user.id, await request.json()));
});
