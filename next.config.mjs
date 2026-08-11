/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Native / data-heavy packages must stay external for Next server runtime
  serverExternalPackages: ["@swisseph/node", "geo-tz"],
}

export default nextConfig
