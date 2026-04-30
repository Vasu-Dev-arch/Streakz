import { connectDB } from '../lib/db.js';
import { AppError, signAuthToken } from '../lib/auth.js';
import { getAppUrl, getGoogleCallbackUrl, getGoogleClientSecret } from '../lib/env.js';
import { User } from '../models/User.js';

export function getGoogleAuthUrl() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google sign-in is not configured', 503);
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function exchangeCodeForTokens(code) {
  if (!process.env.GOOGLE_CLIENT_ID || !getGoogleClientSecret()) {
    throw new AppError('Google sign-in is not configured', 503);
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: 'authorization_code',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.error_description || 'Failed to exchange Google code', 502);
  }

  return data;
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError('Failed to fetch Google profile', 502);
  }

  return data;
}

export async function handleGoogleSignIn(code) {
  await connectDB();

  const tokens = await exchangeCodeForTokens(code);
  const profile = await fetchGoogleProfile(tokens.access_token);
  const { id: googleId, email, name } = profile;

  if (!email) {
    throw new AppError('Google account has no email address', 400);
  }

  let user = await User.findOne({ email });
  let isNewUser = false;

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    user = await User.create({ name, email, googleId });
    isNewUser = true;
  }

  const token = signAuthToken(user._id.toString());

  return {
    token,
    redirectUrl:
      `${getAppUrl()}/auth/callback?token=${encodeURIComponent(token)}` +
      `&isFirstLogin=${isNewUser || user.isFirstLogin}` +
      `&name=${encodeURIComponent(user.name || '')}` +
      `&firstHabitPromptShown=${user.firstHabitPromptShown ?? false}`,
  };
}
