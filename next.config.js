/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'controller.ts'],
  async rewrites() {
    return [
      {
        destination: '/login',
        source: '/',
      },
    ];
  },
};
