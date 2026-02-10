const withImages = require('next-images');

/** @type {import('next').NextConfig} */
const nextConfig = withImages({
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  images: {
    domains: ['attachments360nonprod.blob.core.windows.net'],
    unoptimized: true, // 👈 disables Next.js Image Optimization
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.(png|jpe?g|gif|svg|pdf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash].[ext]',
              outputPath: 'static/assets/',
              publicPath: '/_next/static/assets/'
            }
          }
        ]
      },
      {
        test: /\.(doc|docx)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'static/assets/',
              publicPath: '/_next/static/assets/'
            }
          }
        ]
      },
      {
        test: /\.tiff?$/i,
        use: [
          {
            loader: 'raw-loader'
          }
        ]
      }
    );

    return config;
  },
  async headers() {
    const includeHeaders = process.env.NEXT_PUBLIC_NODE_ENV;
    const headers = [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          ...(includeHeaders !== 'DEVELOPMENT'
            ? [
                {
                  key: 'Permissions-Policy',
                  value: "battery=(self),  browsing-topics=(), geolocation=()",
                },
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
                {
                  key: 'Content-Security-Policy',
                  value:
                    "default-src 'self' data:; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; script-src 'self' 'unsafe-eval' https://unpkg.com; frame-src * data: blob:;",
                },
              ]
            : []),
        ],
      },
    ];

    return headers;
  },
});

module.exports = nextConfig;
