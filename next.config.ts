import type { NextConfig } from "next";

// Cache Components is off on purpose: nearly every page reads the session,
// so per-request rendering is simpler and loses nothing here.
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb"],
  // Evidence photos are up to 10 MB (Server Actions default to 1 MB).
  experimental: { serverActions: { bodySizeLimit: "11mb" } },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
