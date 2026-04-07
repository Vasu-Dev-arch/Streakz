// Root page — immediately redirect to /dashboard.
// The dashboard layout handles the auth guard; unauthenticated
// users are bounced to /auth from there.
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
}
