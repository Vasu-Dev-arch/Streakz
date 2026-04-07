/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the backend origin for images if ever needed
  images: {
    domains: [],
  },

  // Expose only safe public env vars to the browser bundle.
  // NEXT_PUBLIC_* vars are automatically inlined by Next.js;
  // listing them here is optional but makes the contract explicit.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
