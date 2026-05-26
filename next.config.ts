import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["@prisma/client", "prisma"],
}

export default nextConfig
