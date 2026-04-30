import { json, route } from '../../../../lib/api-route.js';
import { authenticate } from '../../../../lib/auth.js';
import { createTodo, listTodos } from '../../../../services/todos.service.js';

export const GET = route(async (request) => {
  const user = await authenticate(request);
  return json(await listTodos(user.id));
});

export const POST = route(async (request) => {
  const user = await authenticate(request);
  return json(await createTodo(user.id, await request.json()), { status: 201 });
});
