import '../index.css';
import '../themes/theme.css';
import { Providers } from '../components/Providers';

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://streakz.app'
  ),
  title: {
    default: 'Streakz — Habit Tracker',
    template: '%s | Streakz',
  },
  description:
    'Build lasting habits with Streakz. Track daily streaks, visualise progress with heatmaps, and get AI-powered habit coaching.',
  keywords: ['habit tracker', 'streak', 'daily habits', 'productivity', 'AI coach'],
  authors: [{ name: 'Streakz' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Streakz',
    title: 'Streakz — Habit Tracker',
    description:
      'Build lasting habits with Streakz. Track daily streaks, visualise progress with heatmaps, and get AI-powered habit coaching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Streakz Habit Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streakz — Habit Tracker',
    description: 'Build lasting habits with Streakz.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
