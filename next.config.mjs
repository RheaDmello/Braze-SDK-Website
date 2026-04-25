const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src * data: blob:",
      `script-src 'self' 'unsafe-inline' https://js.appboycdn.com ${isDev ? "'unsafe-eval'" : ""}`,
      "connect-src 'self' https://*.braze.com https://*.braze.eu https://*.appboy.com wss://*.braze.eu wss://*.appboy.com",
      "style-src 'self' 'unsafe-inline' https://use.fontawesome.com",
      "font-src 'self' https://use.fontawesome.com",
      "frame-src 'self' https://*.braze.eu https://*.appboy.com",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;