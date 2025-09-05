/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,  // 🚫 stop React double-calling in dev
  images: {
    domains: ["res.cloudinary.com"], // 👈 allow Cloudinary images
  },
};

module.exports = nextConfig;

