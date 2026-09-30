import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // keep the Firebase Admin SDK as a plain Node dependency in serverless functions
  serverExternalPackages: ["firebase-admin", "nodemailer"],
};

export default nextConfig;
