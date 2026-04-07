// This page is a pure client component — it reads URL search params
// that the Google OAuth redirect appends (?token=…&isFirstLogin=…).
import { Suspense } from 'react';
import { AuthCallbackHandler } from '../../../components/AuthCallbackHandler';

export const metadata = {
  title: 'Signing in…',
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            fontFamily: 'var(--sans)',
            color: 'var(--text2)',
            fontSize: '14px',
          }}
        >
          Signing you in…
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
