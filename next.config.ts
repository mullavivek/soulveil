import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        MONGO_URI: process.env.MONGO_URI as string,
    },
};

export default nextConfig;
