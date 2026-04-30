import { json, route } from '../../../../../../lib/api-route.js';
import { authenticate } from '../../../../../../lib/auth.js';
import { toggleTodo } from '../../../../../../services/todos.service.js';

export const PATCH = route(async (request, { params }) => {
  const user = await authenticate(request);
  const { id } = await params;
  return json(await toggleTodo(user.id, id));
});
