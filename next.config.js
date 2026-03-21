/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  experimental: {
    // pdf-parse nicht bundlen (Testcode im Paket sonst problematisch)
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;

