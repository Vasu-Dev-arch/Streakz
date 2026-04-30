import { NextResponse } from 'next/server';
import { route } from '../../../../../../lib/api-route.js';
import { setAuthCookie } from '../../../../../../lib/auth.js';
import { getAppUrl } from '../../../../../../lib/env.js';
import { handleGoogleSignIn } from '../../../../../../services/google.service.js';

export const GET = route(async (request) => {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const failureRedirect = (message) =>
    NextResponse.redirect(`${getAppUrl()}/auth/callback?error=${encodeURIComponent(message)}`);

  if (error || !code) {
    return failureRedirect('Google sign-in was cancelled');
  }

  try {
    const result = await handleGoogleSignIn(code);
    return setAuthCookie(NextResponse.redirect(result.redirectUrl), result.token);
  } catch (err) {
    console.error('[Google OAuth]', err);
    return failureRedirect(err.message || 'Google sign-in failed');
  }
});
