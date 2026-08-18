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
  // Keep native .node binaries out of .next tracing (load from node_modules on IIS)
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@swisseph/**",
      "node_modules/@swisseph/node/prebuilds/**",
      ".next/cache/**",
    ],
  },
}

export default nextConfig
