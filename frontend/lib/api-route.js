import { NextResponse } from 'next/server';
import { handleError } from './auth.js';

export function json(data, init) {
  return NextResponse.json(data, init);
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function route(handler) {
  return async function wrappedHandler(request, context) {
    try {
      return await handler(request, context);
    } catch (err) {
      return handleError(err);
    }
  };
}
