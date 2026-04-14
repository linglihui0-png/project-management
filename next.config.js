/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 忽略格式校验错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 忽略类型校验错误
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
