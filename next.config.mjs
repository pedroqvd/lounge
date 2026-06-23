/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Permite qualquer hostname para avatares temporariamente, otimizando todas as imagens
      },
    ],
  },
};

export default nextConfig;
