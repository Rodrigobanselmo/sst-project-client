/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Use SWC compiler for faster builds
  compiler: {
    styledComponents: true,
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features for faster builds
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
    // Turbopack configuration for loaders
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  pageExtensions: ['page.tsx', 'controller.ts'],

  onDemandEntries: {
    // Reduce memory usage by unloading pages faster
    maxInactiveAge: 60 * 1000, // 1 minute instead of 5
    pagesBufferLength: 5, // Reduced from 100
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
    NEXT_PUBLIC_ENABLE_AI_CHAT: process.env.NEXT_PUBLIC_ENABLE_AI_CHAT,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'simplesst.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'simplesst.s3.sa-east-1.amazonaws.com' },
      { protocol: 'https', hostname: 'prod-simplesst-docs.s3.amazonaws.com' },
    ],
  },

  webpack(config, { dev, isServer }) {
    // SVG loader configuration
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

    // Performance optimizations for development
    if (dev && !isServer) {
      // Reduce bundle size in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      // Faster source maps in development
      config.devtool = 'eval-cheap-module-source-map';

      // Cache for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
