import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/.well-known/farcaster.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Content-Type", value: "application/json; charset=utf-8" },
        ],
      },
      // Explicit assets used by manifest/embeds
      {
        source: "/hero.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/splash.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/Openbands.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      // Generic patterns without capturing groups (one per extension)
      {
        source: "/:path*.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/:path*.jpeg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/:path*.gif",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      // { // @dev - This block is for preventing from the "buf.writeBigUInt64BE is not function" error, which is caused by the bb.js v0.87.0
      //   source: '/:path*',
      //   headers: [
      //     { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
      //     { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      //   ],
      // }
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      buffer: require.resolve("buffer/"), // @dev - This is for preventing from the "buf.writeBigUInt64BE is not function" error, which is caused by the bb.js v0.87.0
    };
    return config;
  }
};

export default nextConfig;
