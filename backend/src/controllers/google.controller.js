import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../middleware/AppError.js';

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

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
  if (!res.ok) throw new AppError(data.error_description || 'Failed to exchange Google code', 502);
  return data;
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) throw new AppError('Failed to fetch Google profile', 502);
  return data;
}

export function redirectToGoogle(_req, res) {
  res.redirect(getGoogleAuthUrl());
}

export async function handleGoogleCallback(req, res) {
  const frontendUrl = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
  const failureRedirect = (msg) =>
    res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(msg)}`);

  const { code, error } = req.query;
  if (error || !code) return failureRedirect('Google sign-in was cancelled');

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleProfile(tokens.access_token);
    const { id: googleId, email, name } = profile;

    if (!email) return failureRedirect('Google account has no email address');

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

    const jwtToken = signToken(user._id.toString());
    // Pass isFirstLogin so frontend can route to /welcome or /onboarding
    const firstLogin = isNewUser || user.isFirstLogin;

    res.redirect(
      `${frontendUrl}/auth/callback?token=${jwtToken}&isFirstLogin=${firstLogin}`
    );
  } catch (err) {
    console.error('[Google OAuth]', err);
    failureRedirect(err.message || 'Google sign-in failed');
  }
}
