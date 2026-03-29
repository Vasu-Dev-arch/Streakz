import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/AppError.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/** Build the Google OAuth authorization URL */
function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/** Exchange authorization code for tokens */
async function exchangeCodeForTokens(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.error_description || 'Failed to exchange Google code', 502);
  }
  return data; // { access_token, id_token, ... }
}

/** Fetch the authenticated user's profile from Google */
async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError('Failed to fetch Google profile', 502);
  }
  return data; // { id, email, name, picture, ... }
}

// ── Route handlers ────────────────────────────────────────────────────────────

/**
 * GET /api/auth/google
 * Redirects the browser to Google's OAuth consent screen.
 */
export function redirectToGoogle(_req, res) {
  res.redirect(getGoogleAuthUrl());
}

/**
 * GET /api/auth/google/callback
 * Google redirects here after the user grants (or denies) access.
 * On success:  redirect to frontend /auth/callback?token=JWT
 * On failure:  redirect to frontend /auth/callback?error=message
 */
export async function handleGoogleCallback(req, res) {
  const frontendUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const failureRedirect = (msg) =>
    res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(msg)}`);

  const { code, error } = req.query;

  // User denied access
  if (error || !code) {
    return failureRedirect('Google sign-in was cancelled');
  }

  try {
    // 1. Exchange code → access token
    const tokens = await exchangeCodeForTokens(code);

    // 2. Fetch Google profile
    const profile = await fetchGoogleProfile(tokens.access_token);
    const { id: googleId, email, name } = profile;

    if (!email) {
      return failureRedirect('Google account has no email address');
    }

    // 3. Find existing user or create a new one
    let user = await User.findOne({ email });

    if (user) {
      // Link googleId if this account was created via email/password
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Brand new user via Google — no password
      user = await User.create({ name, email, googleId });
    }

    // 4. Issue JWT (same as email/password login)
    const jwtToken = signToken(user._id.toString());

    // 5. Send token to frontend via redirect query param
    res.redirect(`${frontendUrl}/auth/callback?token=${jwtToken}`);
  } catch (err) {
    console.error('[Google OAuth]', err);
    failureRedirect(err.message || 'Google sign-in failed');
  }
}
