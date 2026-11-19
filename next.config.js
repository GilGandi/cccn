/** @type {import('next').NextConfig} */

// O domínio público do R2 é definido antes do build para CSP e next/image.
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
let r2Origin = ''
let r2Pattern = null
try {
  if (r2PublicUrl) {
    const parsed = new URL(r2PublicUrl)
    if (parsed.protocol === 'https:') {
      r2Origin = parsed.origin
      const pathname = parsed.pathname.replace(/\/+$/, '')
      r2Pattern = {
        protocol: 'https',
        hostname: parsed.hostname,
        pathname: `${pathname || ''}/**`,
      }
    }
  }
} catch {
  // A validação definitiva é feita pelas rotas de upload e pela inicialização do app.
}

const mediaOrigins = ['https://res.cloudinary.com', ...(r2Origin ? [r2Origin] : [])]
const imageSources = ["'self'", 'data:', 'blob:', ...mediaOrigins, 'https://i.ytimg.com'].join(' ')
const mediaSources = ["'self'", ...mediaOrigins].join(' ')
const connectSources = ["'self'", ...mediaOrigins].join(' ')

const nextConfig = {
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src ${imageSources}`,
      `media-src ${mediaSources}`,
      `connect-src ${connectSources}`,
      "frame-src https://www.google.com https://open.spotify.com https://www.youtube.com https://youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security',    value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options',       value: 'nosniff' },
          { key: 'X-Frame-Options',              value: 'DENY' },
          { key: 'Referrer-Policy',              value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',           value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()' },
          { key: 'X-DNS-Prefetch-Control',       value: 'on' },
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
          { key: 'Content-Security-Policy',      value: csp },
        ],
      },
      {
        source: '/(.*)\\.(woff2?|ttf|otf|png|jpg|jpeg|svg|ico|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/api/auth/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'Pragma',        value: 'no-cache' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag',  value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}
module.exports = nextConfig
