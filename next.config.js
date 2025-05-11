/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  pageExtensions: ['page.tsx', 'controller.ts'],
  onDemandEntries: {
    maxInactiveAge: 5 * 60 * 1000,
    pagesBufferLength: 100,
  },
  async rewrites() {
    return [
      {
        destination: '/login',
        source: '/',
      },
      {
        destination: '/onboard/usuario',
        source: '/onboard',
      },
    ];
  },
  env: {
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    NEXT_PUBLIC_STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    NEXT_PUBLIC_MESSAGING: process.env.NEXT_PUBLIC_MESSAGING,
    NEXT_PUBLIC_APP_ID: process.env.NEXT_PUBLIC_APP_ID,
    NEXT_PUBLIC_BASE_URL_API: process.env.NEXT_PUBLIC_BASE_URL_API,
    NEXT_PUBLIC_MEASUREMENT_ID: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
  },
  images: {
    domains: [
      'simplesst.s3.amazonaws.com',
      'simplesst.s3.sa-east-1.amazonaws.com',
      'prod-simplesst-docs.s3.amazonaws.com',
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: false,
            titleProp: true,
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
