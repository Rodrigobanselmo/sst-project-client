/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
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
};
