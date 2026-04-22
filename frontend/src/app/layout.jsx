import '../index.css';
import '../themes/theme.css';
import { Providers } from '../components/Providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c6af7',
};

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://streakz.app'
  ),
  title: {
    default: 'Streakz — Habit Tracker',
    template: '%s | Streakz',
  },
  description:
    'Build lasting habits with Streakz. Track daily streaks, visualize progress with heatmaps, and get AI-powered habit coaching. Start your productivity journey today.',
  keywords: [
    'habit tracker',
    'streak',
    'daily habits',
    'productivity',
    'AI coach',
    'goal tracking',
    'self-improvement',
    'routine builder',
  ],
  authors: [{ name: 'Streakz' }],
  creator: 'Streakz',
  publisher: 'Streakz',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Streakz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://streakz.app',
    siteName: 'Streakz',
    title: 'Streakz — Habit Tracker',
    description:
      'Build lasting habits with Streakz. Track daily streaks, visualize progress with heatmaps, and get AI-powered habit coaching.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Streakz Habit Tracker - Build Daily Habits',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streakz — Habit Tracker',
    description: 'Build lasting habits with Streakz. Track daily streaks and get AI-powered coaching.',
    images: ['/og-image.png'],
    creator: '@streakz',
  },
  alternates: {
    canonical: 'https://streakz.app',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
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
        <link rel="icon" type="image/png" href="/favicon.ico" />
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Streakz" />
        <meta name="application-name" content="Streakz" />
        <meta name="msapplication-TileColor" content="#7c6af7" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
