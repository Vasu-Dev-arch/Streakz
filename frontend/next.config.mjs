/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the backend origin for images if ever needed
  images: {
    domains: [],
  },

  // Expose only safe public env vars to the browser bundle.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Security + PWA-friendly headers
  async headers() {
    return [
      {
        // Service worker must be served without a Cache-Control max-age
        // so the browser always checks for updates.
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
