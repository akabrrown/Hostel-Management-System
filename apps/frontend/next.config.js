/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'educareguide.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async redirects() {
    return [
      {
        source: '/hostels',
        destination: '/about-hostel',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/login',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Handle node: protocol imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
      ...(isServer ? {} : { net: false, tls: false }),
    }

    // Handle node: prefix in imports
    config.externals = config.externals || []
    config.externals.push({
      'node:crypto': 'crypto',
      'node:stream': 'stream',
      'node:buffer': 'buffer',
      'node:net': 'net',
      'node:tls': 'tls',
      'node:fs': 'fs',
      'node:path': 'path',
      'node:timers': 'timers',
      'node:timers/promises': 'timers/promises',
      'node:url': 'url',
      'node:events': 'events',
      'node:os': 'os',
      'node:util': 'util',
      'node:assert': 'assert',
      'node:diagnostics_channel': 'diagnostics_channel',
    })

    return config
  },
}

module.exports = nextConfig
