/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Permite qualquer hostname para avatares temporariamente, otimizando todas as imagens
      },
    ],
  },
};

export default nextConfig;
