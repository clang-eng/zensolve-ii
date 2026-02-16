/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['supabase.co', 'pewhqjsjoipjxrrrggfv.supabase.co', 'images.unsplash.com'],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
