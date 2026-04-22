const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      img-src * data:;
      script-src 'self' 'unsafe-inline' https://js.appboycdn.com ${isDev ? "'unsafe-eval'" : ""};
      connect-src 'self' https://*.braze.com https://*.appboy.com;
      style-src 'self' 'unsafe-inline';
    `.replace(/\n/g, " "),
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