export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  );
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET || '';
}

export function getGoogleCallbackUrl() {
  return process.env.GOOGLE_CALLBACK_URL || `${getAppUrl()}/api/auth/google/callback`;
}
